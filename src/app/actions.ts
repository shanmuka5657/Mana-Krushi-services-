
"use server";

import { findDestinations } from "@/ai/flows/smart-destination-finder";
import { calculateDistance as calculateDistanceFlow } from "@/ai/flows/distance-calculator";
import { calculateToll as calculateTollFlow } from "@/ai/flows/toll-calculator";
import { findMovie as findMovieFlow } from "@/ai/flows/movie-finder";
import { cropLogo as cropLogoFlow } from "@/ai/flows/crop-logo-flow";
import { suggestLocations as suggestLocationsFlow } from "@/ai/flows/location-suggester";
import { reverseGeocode as reverseGeocodeFlow } from "@/ai/flows/reverse-geocode-flow";
import { z } from "zod";
import { CalculateDistanceInputSchema, TollCalculatorInputSchema } from "@/lib/types";
import { getProfile, saveProfile, getCurrentUser, getLocationCache, setLocationCache } from "@/lib/storage";
import locations from '@/lib/locations.json';


const SuggestDestinationsInput = z.object({
  preferences: z
    .string()
    .min(10, "Please describe your preferences in more detail."),
  budget: z.number().positive("Budget must be a positive number."),
});

export async function suggestDestinations(input: {
  preferences: string;
  budget: number;
}) {
  const validatedInput = SuggestDestinationsInput.safeParse(input);

  if (!validatedInput.success) {
    return { error: "Invalid input. " + validatedInput.error.flatten().fieldErrors };
  }

  try {
    const result = await findDestinations(validatedInput.data);
    if (!result || !result.destinations || result.destinations.length === 0) {
      return {
        suggestions: [],
        message: "Could not find any destinations. Try different preferences.",
      };
    }
    return { suggestions: result.destinations };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function calculateDistance(input: { from: string, to: string }) {
    const validatedInput = CalculateDistanceInputSchema.safeParse(input);
    if(!validatedInput.success) {
        return { error: "Invalid input. " + validatedInput.error.flatten().fieldErrors };
    }

    try {
        const result = await calculateDistanceFlow(validatedInput.data);
        if(!result || !result.distance) {
             return { error: "Could not calculate distance." };
        }
        return { distance: result.distance };
    } catch (e) {
        console.error(e);
        return { error: "An unexpected error occurred while calculating the distance." };
    }
}

export async function calculateToll(input: { from: string; to: string }) {
  const validatedInput = TollCalculatorInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
  }

  try {
    const result = await calculateTollFlow(validatedInput.data);
    if (!result) {
      return { error: 'Could not calculate toll.' };
    }
    return {
      estimatedTollCost: result.estimatedTollCost,
    };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while calculating the toll.' };
  }
}

const FindMovieInput = z.object({
  movieName: z.string().min(1, "Please enter a movie name."),
});

export async function findMovie(input: { movieName: string }) {
  const validatedInput = FindMovieInput.safeParse(input);
  if (!validatedInput.success) {
    return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
  }

  try {
    const result = await findMovieFlow(validatedInput.data);
    return { sites: result.sites };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while searching for the movie.' };
  }
}

const CropLogoInput = z.object({
    photoDataUri: z.string(),
});

export async function cropLogo(input: { photoDataUri: string }): Promise<{ croppedLogoUrl?: string, error?: string }> {
    const validatedInput = CropLogoInput.safeParse(input);
    if (!validatedInput.success) {
        return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
    }

    try {
        const result = await cropLogoFlow(validatedInput.data);
        return { croppedLogoUrl: result.croppedPhotoDataUri };
    } catch (e) {
        console.error('Error cropping logo:', e);
        return { error: 'An unexpected error occurred while cropping the logo.' };
    }
}

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const userEmail = getCurrentUser();
    if (!userEmail) {
      return { success: false, error: 'User not logged in.' };
    }

    const profile = await getProfile(userEmail);
    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    await saveProfile({ ...profile, status: 'deleted' });

    return { success: true };
  } catch (e) {
    console.error('Error deleting account:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function getMapSuggestions(query: string): Promise<{ suggestions?: any[], error?: string }> {
    if (!query || query.trim().length < 2) {
        return { suggestions: [] };
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API Key is not configured.");
        return { error: "Map service is not configured." };
    }
    
    const queryKey = query.toLowerCase().trim();

    // Check our local `locations.json` first for major cities
    const locationData = locations as Record<string, string[]>;
    const matchingCity = Object.keys(locationData).find(city => city.toLowerCase() === queryKey);

    if (matchingCity && locationData[matchingCity]) {
        const subLocations = locationData[matchingCity];
        const formattedSuggestions = subLocations.map(sub => ({
            placeName: sub,
            placeAddress: `${matchingCity}, India`, // Simplified address
        }));
        return { suggestions: formattedSuggestions };
    }

    const cachedSuggestions = await getLocationCache(queryKey);
    if (cachedSuggestions) {
        return { suggestions: cachedSuggestions };
    }

    try {
        // Using a proxy is recommended for production to hide the API key,
        // but for simplicity in this context, we call it directly.
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:IN`;

        const response = await fetch(url);
        
        if (!response.ok) {
            console.error("Google Maps suggest error response:", await response.text());
            return { error: "Failed to fetch map suggestions." };
        }

        const data = await response.json();
        
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
             console.error("Google Maps API error:", data.error_message || data.status);
             return { error: `Map service error: ${data.status}` };
        }

        // We need another call to get lat/lng for each prediction
        const detailsPromises = data.predictions.map(async (prediction: any) => {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${apiKey}&fields=name,formatted_address,geometry,types`;
            const detailsResponse = await fetch(detailsUrl);
            if (!detailsResponse.ok) return null;
            const detailsData = await detailsResponse.json();
            if (detailsData.status !== 'OK') return null;
            return detailsData.result;
        });

        const detailedResults = await Promise.all(detailsPromises);

        const formattedSuggestions = detailedResults
            .filter(item => item) // Filter out any null results from failed calls
            .map((item: any) => ({
              placeName: item.name,
              placeAddress: item.formatted_address,
              lat: item.geometry.location.lat,
              lng: item.geometry.location.lng,
              eLoc: item.place_id, // Using Google's place_id as eLoc
              type: item.types?.[0] || 'point_of_interest', // Use the first type as the category
            }));
        
        if(formattedSuggestions.length > 0) {
            await setLocationCache(queryKey, formattedSuggestions);
        }

        return { suggestions: formattedSuggestions };

    } catch (e) {
        console.error("Google Maps suggestion API failed:", e);
        return { error: "Failed to get suggestions from map service." };
    }
}


export async function reverseGeocode(lat: number, lon: number): Promise<{ address?: string, error?: string }> {
    try {
        const result = await reverseGeocodeFlow({ latitude: lat, longitude: lon });
        if (result.address) {
            return { address: result.address };
        }
        return { error: "Could not determine address from coordinates." };
    } catch (e) {
        console.error("AI reverse geocode failed:", e);
        return { error: "Failed to get address from AI." };
    }
}

const BroadcastNotificationInput = z.object({
  title: z.string().min(1, "Title is required."),
  message: z.string().min(1, "Message is required."),
});

export async function sendBroadcastNotification(input: { title: string; message: string }): Promise<{ success: boolean; error?: string }> {
  const validatedInput = BroadcastNotificationInput.safeParse(input);
  if (!validatedInput.success) {
    return { success: false, error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
  }
  
  // This is a placeholder for a server-side function that would send the notification to all users.
  // In a real app, you would have a backend that queries all user FCM tokens from Firestore
  // and sends a multicast message.
  console.log("Simulating sending push notification to all users...");
  console.log("Title:", validatedInput.data.title);
  console.log("Message:", validatedInput.data.message);
  
  return { success: true };
}
