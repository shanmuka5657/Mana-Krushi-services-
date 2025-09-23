'use server';
/**
 * @fileOverview An AI flow to convert an image URL to a base64 data URI for PWA icons.
 *
 * - createPwaIcon - A function that fetches an image and returns it as a data URI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreatePwaIconInputSchema = z.object({
  imageUrl: z.string().url().describe('The public URL of the image to convert.'),
});
export type CreatePwaIconInput = z.infer<typeof CreatePwaIconInputSchema>;

const CreatePwaIconOutputSchema = z.object({
    iconDataUri: z.string().describe('The image as a PNG data URI.')
});
export type CreatePwaIconOutput = z.infer<typeof CreatePwaIconOutputSchema>;


export async function createPwaIcon(
  input: CreatePwaIconInput
): Promise<CreatePwaIconOutput> {
  return createPwaIconFlow(input);
}

const createPwaIconFlow = ai.defineFlow(
  {
    name: 'createPwaIconFlow',
    inputSchema: CreatePwaIconInputSchema,
    outputSchema: CreatePwaIconOutputSchema,
  },
  async (input) => {
    // This is a simplified flow that fetches an image and base64 encodes it.
    // In a real scenario, this could involve more complex image processing.
    const response = await fetch(input.imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${input.imageUrl}`);
    }
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    
    // Forcing to PNG for consistency
    const dataUri = `data:image/png;base64,${base64}`;

    return { iconDataUri: dataUri };
  }
);
