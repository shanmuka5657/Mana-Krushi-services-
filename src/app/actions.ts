
"use server";

import { findDestinations } from "@/ai/flows/smart-destination-finder";
import { calculateDistance as calculateDistanceFlow } from "@/ai/flows/distance-calculator";
import { calculateToll as calculateTollFlow } from "@/ai/flows/toll-calculator";
import { findMovie as findMovieFlow } from "@/ai/flows/movie-finder";
import { cropLogo as cropLogoFlow } from "@/ai/flows/crop-logo-flow";
import { z } from "zod";
import { CalculateDistanceInputSchema, TollCalculatorInputSchema } from "@/lib/types";
import { getProfile, saveProfile, getCurrentUser, savePwaScreenshots as savePwaScreenshotsToDb } from "@/lib/storage";
import fs from 'fs';
import path from 'path';


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

const ScreenshotSchema = z.object({
  src: z.string(),
  sizes: z.string(),
  type: z.string(),
  form_factor: z.string(),
});

const UploadScreenshotsInput = z.object({
  screenshots: z.array(ScreenshotSchema),
});

export async function uploadPwaScreenshots(input: { screenshots: z.infer<typeof ScreenshotSchema>[] }): Promise<{ success: boolean; error?: string }> {
  const validatedInput = UploadScreenshotsInput.safeParse(input);
  if (!validatedInput.success) {
    return { success: false, error: 'Invalid input. ' + validatedInput.error.flatten().fieldErrors };
  }
  
  const screenshots = validatedInput.data.screenshots;

  try {
    // 1. Save to DB for client-side retrieval if needed
    await savePwaScreenshotsToDb(screenshots);

    // 2. Write to physical manifest.json file
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    try {
        const manifestData = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestData);
        manifest.screenshots = screenshots;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (error) {
        // manifest.json might not exist, create it
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            const newManifest = {
                "theme_color": "#1E88E5",
                "background_color": "#FFFFFF",
                "display": "standalone",
                "scope": "/",
                "start_url": "/",
                "name": "Mana Krushi Services",
                "short_name": "MK Services",
                "description": "Your partner in shared travel. Find or offer a ride with ease.",
                "icons": [], // This will be populated by another process or should be pre-filled
                "screenshots": screenshots,
            };
            fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
        } else {
            console.error("Error writing to manifest.json:", error);
            throw error; // Re-throw to be caught by outer catch
        }
    }

    return { success: true };
  } catch (e) {
    console.error('Error processing PWA screenshots:', e);
    return { success: false, error: 'An unexpected error occurred while saving screenshots.' };
  }
}
