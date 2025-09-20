'use server';
/**
 * @fileOverview An AI flow to intelligently crop a logo.
 *
 * - cropLogo - A function that crops an image to the circular "MK" logo.
 * - CropLogoInput - The input type for the cropLogo function.
 * - CropLogoOutput - The return type for the cropLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropLogoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a logo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CropLogoInput = z.infer<typeof CropLogoInputSchema>;

const CropLogoOutputSchema = z.object({
  croppedPhotoDataUri: z
    .string()
    .describe(
      'The cropped logo image as a data URI.'
    ),
});
export type CropLogoOutput = z.infer<typeof CropLogoOutputSchema>;

export async function cropLogo(
  input: CropLogoInput
): Promise<CropLogoOutput> {
  return cropLogoFlow(input);
}


const cropLogoFlow = ai.defineFlow(
  {
    name: 'cropLogoFlow',
    inputSchema: CropLogoInputSchema,
    outputSchema: CropLogoOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Crop this image to tightly fit the circular logo containing the letters "MK". Make the area outside the circle transparent.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("The AI failed to return a cropped image.");
    }

    return { croppedPhotoDataUri: media.url };
  }
);
