
"use server";

import { findDestinations } from "@/ai/flows/smart-destination-finder";
import { calculateDistance as calculateDistanceFlow } from "@/ai/flows/distance-calculator";
import { z } from "zod";
import { CalculateDistanceInputSchema } from "@/lib/types";


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
