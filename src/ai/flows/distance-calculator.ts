'use server';

/**
 * @fileOverview An AI flow to calculate the distance between two locations.
 *
 * - calculateDistance - A function that calculates the driving distance.
 * - CalculateDistanceInput - The input type for the calculateDistance function.
 * - CalculateDistanceOutput - The return type for the calculateDistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CalculateDistanceInputSchema = z.object({
    from: z.string().describe('The starting location.'),
    to: z.string().describe('The destination location.'),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;

export const CalculateDistanceOutputSchema = z.object({
    distance: z.number().describe('The approximate driving distance in kilometers.'),
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;


export async function calculateDistance(input: CalculateDistanceInput): Promise<CalculateDistanceOutput> {
    return calculateDistanceFlow(input);
}

const prompt = ai.definePrompt({
    name: 'calculateDistancePrompt',
    input: { schema: CalculateDistanceInputSchema },
    output: { schema: CalculateDistanceOutputSchema },
    prompt: `Calculate the approximate driving distance in kilometers between the following two locations. Return only the number of kilometers.

From: {{{from}}}
To: {{{to}}}

Return just the numeric distance in kilometers.`,
});

const calculateDistanceFlow = ai.defineFlow(
    {
        name: 'calculateDistanceFlow',
        inputSchema: CalculateDistanceInputSchema,
        outputSchema: CalculateDistanceOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
