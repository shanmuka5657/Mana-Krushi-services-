
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
import { MAPMYINDIA_CLIENT_ID, MAPMYINDIA_CLIENT_SECRET } from "@/lib/map-config";


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

async function getMapmyIndiaToken(): Promise<string | null> {
    try {
        const response = await fetch("https://outpost.mapmyindia.com/api/security/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': MAPMYINDIA_CLIENT_ID,
                'client_secret': MAPMYINDIA_CLIENT_SECRET,
            }),
        });
        
        if (!response.ok) {
            console.error("MapmyIndia token error response:", await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to fetch MapmyIndia token:", error);
        return null;
    }
}


export async function getMapSuggestions(query: string): Promise<{ suggestions?: any[], error?: string }> {
    if (!query || query.trim().length < 2) {
        return { suggestions: [] };
    }

    const queryKey = query.toLowerCase().trim();

    // 1. Check cache first
    const cachedSuggestions = await getLocationCache(queryKey);
    if (cachedSuggestions) {
        return { suggestions: cachedSuggestions };
    }

    // 2. If not in cache, call the API
    const token = await getMapmyIndiaToken();
    if (!token) {
        return { error: "Failed to authenticate with map service." };
    }

    try {
        const url = `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}&location=21.1458,79.0882&hyperlocal=true`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("MapmyIndia suggest error response:", await response.text());
            return { error: "Failed to fetch map suggestions." };
        }

        const data = await response.json();

        const formattedSuggestions = data.suggestedLocations?.map((item: any) => ({
          placeName: item.placeName,
          placeAddress: item.placeAddress
        })) || [];
        
        // 3. Save to cache if we got results
        if(formattedSuggestions.length > 0) {
            await setLocationCache(queryKey, formattedSuggestions);
        }

        return { suggestions: formattedSuggestions };

    } catch (e) {
        console.error("MapmyIndia suggestion API failed:", e);
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
