
"use server";

import { findDestinations } from "@/ai/flows/smart-destination-finder";
import { calculateDistance as calculateDistanceFlow } from "@/ai/flows/distance-calculator";
import { calculateToll as calculateTollFlow } from "@/ai/flows/toll-calculator";
import { findMovie as findMovieFlow } from "@/ai/flows/movie-finder";
import { cropLogo as cropLogoFlow } from "@/ai/flows/crop-logo-flow";
import { z } from "zod";
import { CalculateDistanceInputSchema, TollCalculatorInputSchema } from "@/lib/types";
import { getProfile, saveProfile, getCurrentUser } from "@/lib/storage";


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
  // const validatedInput = SuggestDestinationsInput.safeParse(input);

  // if (!validatedInput.success) {
  //   return { error: "Invalid input. " + validatedInput.error.flatten().fieldErrors };
  // }

  // try {
  //   const result = await findDestinations(validatedInput.data);
  //   if (!result || !result.destinations || result.destinations.length === 0) {
  //     return {
  //       suggestions: [],
  //       message: "Could not find any destinations. Try different preferences.",
  //     };
  //   }
  //   return { suggestions: result.destinations };
  // } catch (e) {
  //   console.error(e);
  //   return { error: "An unexpected error occurred. Please try again later." };
  // }
  return { error: "AI features are temporarily disabled." };
}

export async function calculateDistance(input: { from: string, to: string }) {
    // const validatedInput = CalculateDistanceInputSchema.safeParse(input);
    // if(!validatedInput.success) {
    //     return { error: "Invalid input. " + validatedInput.error.flatten().fieldErrors };
    // }

    // try {
    //     const result = await calculateDistanceFlow(validatedInput.data);
    //     if(!result || !result.distance) {
    //          return { error: "Could not calculate distance." };
    //     }
    //     return { distance: result.distance };
    // } catch (e) {
    //     console.error(e);
    //     return { error: "An unexpected error occurred while calculating the distance." };
    // }
    return { error: "AI features are temporarily disabled." };
}

export async function calculateToll(input: { from: string; to: string }) {
//   const validatedInput = TollCalculatorInputSchema.safeParse(input);
//   if (!validatedInput.success) {
//     return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
//   }

//   try {
//     const result = await calculateTollFlow(validatedInput.data);
//     if (!result) {
//       return { error: 'Could not calculate toll.' };
//     }
//     return {
//       estimatedTollCost: result.estimatedTollCost,
//     };
//   } catch (e) {
//     console.error(e);
//     return { error: 'An unexpected error occurred while calculating the toll.' };
//   }
    return { error: "AI features are temporarily disabled." };
}

const FindMovieInput = z.object({
  movieName: z.string().min(1, "Please enter a movie name."),
});

export async function findMovie(input: { movieName: string }) {
//   const validatedInput = FindMovieInput.safeParse(input);
//   if (!validatedInput.success) {
//     return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
//   }

//   try {
//     const result = await findMovieFlow(validatedInput.data);
//     return { sites: result.sites };
//   } catch (e) {
//     console.error(e);
//     return { error: 'An unexpected error occurred while searching for the movie.' };
//   }
    return { error: "AI features are temporarily disabled." };
}

const CropLogoInput = z.object({
    photoDataUri: z.string(),
});

export async function cropLogo(input: { photoDataUri: string }): Promise<{ croppedLogoUrl?: string, error?: string }> {
    // const validatedInput = CropLogoInput.safeParse(input);
    // if (!validatedInput.success) {
    //     return { error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
    // }

    // try {
    //     const result = await cropLogoFlow(validatedInput.data);
    //     return { croppedLogoUrl: result.croppedPhotoDataUri };
    // } catch (e) {
    //     console.error('Error cropping logo:', e);
    //     return { error: 'An unexpected error occurred while cropping the logo.' };
    // }
    return { croppedLogoUrl: input.photoDataUri }; // Return original image
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
    const clientId = process.env.MAPMYINDIA_CLIENT_ID;
    const clientSecret = process.env.MAPMYINDIA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("MapmyIndia Client ID or Secret is not configured on the server.");
        return null;
    }
    
    try {
        const response = await fetch("https://outpost.mapmyindia.com/api/security/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!response.ok) {
            console.error("Failed to get MapmyIndia token. Status:", response.status, await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;

    } catch (error) {
        console.error("Error fetching MapmyIndia token:", error);
        return null;
    }
}


export async function getMapSuggestions(query: string): Promise<{ suggestions?: any[], error?: string }> {
    if (!query || query.length < 2) {
        return { suggestions: [] };
    }

    const token = await getMapmyIndiaToken();

    if (!token) {
        return { error: "Location search is temporarily unavailable." };
    }

    try {
        const url = `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("MapmyIndia API request failed with status:", response.status, await response.text());
            return { error: "Failed to fetch location suggestions." };
        }

        const data = await response.json();
        return { suggestions: data.suggestedLocations || data.suggested_locations || [] }; // API uses both casings
    } catch (error) {
        console.error("Error fetching location suggestions from server action:", error);
        return { error: "An error occurred while fetching location suggestions." };
    }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ address?: string, error?: string }> {
    const token = await getMapmyIndiaToken();

    if (!token) {
        return { error: "Location service is temporarily unavailable." };
    }

    try {
        const url = `https://atlas.mapmyindia.com/api/places/rev_geocode?lat=${lat}&lng=${lon}&region=IND`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("MapmyIndia Reverse Geocode API request failed with status:", response.status, await response.text());
            return { error: "Failed to fetch address for the location." };
        }

        const data = await response.json();

        // The API returns an array of results, we'll take the first one.
        if (data.results && data.results.length > 0) {
            return { address: data.results[0].formatted_address };
        } else {
            return { error: "No address found for this location." };
        }

    } catch (error) {
        console.error("Error reverse geocoding from server action:", error);
        return { error: "An error occurred while fetching the address." };
    }
}
    

    