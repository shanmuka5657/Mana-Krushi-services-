
'use server';

/**
 * @fileOverview An AI flow to suggest locations based on a search query.
 *
 * - suggestLocations - A function that returns a list of location suggestions.
 * - SuggestLocationsInput - The input type for the suggestLocations function.
 * - SuggestLocationsOutput - The return type for the suggestLocations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocationSuggestionSchema = z.object({
  placeName: z.string().describe('The name of the suggested place, like a neighborhood or landmark.'),
  placeAddress: z.string().describe('A brief description or address of the place, including the city and state.'),
});

const SuggestLocationsInputSchema = z.object({
  query: z.string().describe('The user\'s search query, e.g., "Kurnool".'),
});
export type SuggestLocationsInput = z.infer<typeof SuggestLocationsInputSchema>;

const SuggestLocationsOutputSchema = z.object({
  suggestions: z.array(LocationSuggestionSchema).describe("An array of location suggestions based on the user's query."),
});
export type SuggestLocationsOutput = z.infer<typeof SuggestLocationsOutputSchema>;

export async function suggestLocations(
  input: SuggestLocationsInput
): Promise<SuggestLocationsOutput> {
  return suggestLocationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLocationsPrompt',
  input: {schema: SuggestLocationsInputSchema},
  output: {schema: SuggestLocationsOutputSchema},
  prompt: `You are an expert location suggestion system for India. A user is typing a location and needs relevant suggestions.

  Based on the query "{{query}}", provide a list of 5-7 relevant and popular areas, landmarks, or neighborhoods.
  
  For each suggestion, provide a 'placeName' and a 'placeAddress'. The address should be concise and helpful.
  
  Example:
  Query: "Kurnool"
  Suggestions:
  - placeName: "Bellary Chowrasta", placeAddress: "Major intersection, Kurnool, Andhra Pradesh"
  - placeName: "Nandyal Checkpost", placeAddress: "Gateway to Nandyal, Kurnool, Andhra Pradesh"
  - placeName: "Raj Vihar", placeAddress: "Shopping and commercial area, Kurnool, Andhra Pradesh"

  Return an empty array for the suggestions if the query is nonsensical or no locations can be found.`,
});

const suggestLocationsFlow = ai.defineFlow(
  {
    name: 'suggestLocationsFlow',
    inputSchema: SuggestLocationsInputSchema,
    outputSchema: SuggestLocationsOutputSchema,
    model: 'googleai/gemini-2.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
