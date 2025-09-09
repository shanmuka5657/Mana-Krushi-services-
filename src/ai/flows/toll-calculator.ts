
'use server';

/**
 * @fileOverview An AI flow to estimate toll costs for a given route in India.
 *
 * - calculateToll - A function that estimates the number of tolls and total cost.
 * - TollCalculatorInput - The input type for the calculateToll function.
 * - TollCalculatorOutput - The return type for the calculateToll function.
 */

import { ai } from '@/ai/genkit';
import { TollCalculatorInputSchema, TollCalculatorOutputSchema, type TollCalculatorInput, type TollCalculatorOutput } from '@/lib/types';


export async function calculateToll(input: TollCalculatorInput): Promise<TollCalculatorOutput> {
    return calculateTollFlow(input);
}

const prompt = ai.definePrompt({
    name: 'tollCalculatorPrompt',
    input: { schema: TollCalculatorInputSchema },
    output: { schema: TollCalculatorOutputSchema },
    prompt: `You are a travel cost estimation expert for routes within India. Based on the provided start and end locations, estimate the toll costs for a standard car.

From: {{{from}}}
To: {{{to}}}

Provide the total estimated toll cost in Indian Rupees (INR) and the approximate number of toll plazas on this route.`,
});

const calculateTollFlow = ai.defineFlow(
    {
        name: 'calculateTollFlow',
        inputSchema: TollCalculatorInputSchema,
        outputSchema: TollCalculatorOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
