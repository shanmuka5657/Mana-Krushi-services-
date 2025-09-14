
"use server";

import { findDestinations } from "@/ai/flows/smart-destination-finder";
import { calculateDistance as calculateDistanceFlow } from "@/ai/flows/distance-calculator";
import { calculateToll as calculateTollFlow } from "@/ai/flows/toll-calculator";
import { findMovie as findMovieFlow } from "@/ai/flows/movie-finder";
import { z } from "zod";
import { CalculateDistanceInputSchema, TollCalculatorInputSchema } from "@/lib/types";
import { getProfile, saveProfile, getCurrentUser, updateLocation as updateLocationInDb, stopTracking as stopTrackingInDb } from "@/lib/storage";


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

export async function updateLocation(bookingId: string, location: { latitude: number, longitude: number }) {
  await updateLocationInDb(bookingId, location);
}

export async function stopTracking(bookingId: string) {
  await stopTrackingInDb(bookingId);
}
