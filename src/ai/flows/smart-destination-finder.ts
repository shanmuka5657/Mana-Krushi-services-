'use server';

/**
 * @fileOverview Smart Destination Finder AI agent.
 *
 * - findDestinations - A function that suggests destinations based on client preferences and budget.
 * - FindDestinationsInput - The input type for the findDestinations function.
 * - FindDestinationsOutput - The return type for the findDestinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindDestinationsInputSchema = z.object({
  preferences: z
    .string()
    .describe('The client\u0027s preferences for the destination.'),
  budget: z.number().describe('The client\u0027s budget for the trip.'),
});
export type FindDestinationsInput = z.infer<typeof FindDestinationsInputSchema>;

const FindDestinationsOutputSchema = z.object({
  destinations: z
    .array(z.string())
    .describe('An array of suggested destinations based on the client\u0027s preferences and budget.'),
});
export type FindDestinationsOutput = z.infer<typeof FindDestinationsOutputSchema>;

export async function findDestinations(
  input: FindDestinationsInput
): Promise<FindDestinationsOutput> {
  return findDestinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findDestinationsPrompt',
  input: {schema: FindDestinationsInputSchema},
  output: {schema: FindDestinationsOutputSchema},
  prompt: `You are a travel expert. A client is looking for destination suggestions.

  Based on the following preferences and budget, suggest a few destinations:

  Preferences: {{{preferences}}}
  Budget: {{{budget}}}

  Return an array of destinations.`,
});

const findDestinationsFlow = ai.defineFlow(
  {
    name: 'findDestinationsFlow',
    inputSchema: FindDestinationsInputSchema,
    outputSchema: FindDestinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
