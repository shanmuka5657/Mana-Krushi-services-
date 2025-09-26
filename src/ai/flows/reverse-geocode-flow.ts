'use server';

/**
 * @fileOverview An AI flow to convert geographic coordinates into a human-readable address.
 *
 * - reverseGeocode - A function that returns an address for a given latitude and longitude.
 * - ReverseGeocodeInput - The input type for the reverseGeocode function.
 * - ReverseGeocodeOutput - The return type for the reverseGeocode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReverseGeocodeInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type ReverseGeocodeInput = z.infer<typeof ReverseGeocodeInputSchema>;

const ReverseGeocodeOutputSchema = z.object({
  address: z.string().describe('The formatted address string, including street, city, state, and postal code.'),
});
export type ReverseGeocodeOutput = z.infer<typeof ReverseGeocodeOutputSchema>;

export async function reverseGeocode(
  input: ReverseGeocodeInput
): Promise<ReverseGeocodeOutput> {
  return reverseGeocodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reverseGeocodePrompt',
  input: {schema: ReverseGeocodeInputSchema},
  output: {schema: ReverseGeocodeOutputSchema},
  prompt: `You are a reverse geocoding expert. Given the following latitude and longitude, provide the corresponding full street address.

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  Return the address as a single formatted string. For example: "123 Main St, Anytown, State, 12345, Country".`,
});

const reverseGeocodeFlow = ai.defineFlow(
  {
    name: 'reverseGeocodeFlow',
    inputSchema: ReverseGeocodeInputSchema,
    outputSchema: ReverseGeocodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
