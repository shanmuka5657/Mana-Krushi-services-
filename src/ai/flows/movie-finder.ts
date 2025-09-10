
'use server';

/**
 * @fileOverview An AI flow to find where a movie can be streamed for free.
 *
 * - findMovie - A function that returns a list of sites to watch a movie for free.
 * - MovieFinderInput - The input type for the findMovie function.
 * - MovieFinderOutput - The return type for the findMovie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieSiteSchema = z.object({
    name: z.string().describe("The name of the streaming service or website."),
    link: z.string().url().describe("The direct URL to the movie on the streaming service."),
});

const MovieFinderInputSchema = z.object({
  movieName: z.string().describe('The name of the movie to search for.'),
});
export type MovieFinderInput = z.infer<typeof MovieFinderInputSchema>;

const MovieFinderOutputSchema = z.object({
  sites: z.array(MovieSiteSchema).describe("An array of websites where the movie can be watched for free legally."),
});
export type MovieFinderOutput = z.infer<typeof MovieFinderOutputSchema>;

export async function findMovie(
  input: MovieFinderInput
): Promise<MovieFinderOutput> {
  return movieFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieFinderPrompt',
  input: {schema: MovieFinderInputSchema},
  output: {schema: MovieFinderOutputSchema},
  prompt: `You are an expert movie database. A user is asking where they can watch a specific movie for free.

  Find where the movie "{{movieName}}" can be streamed for free on legal platforms. 
  
  Only include services that offer the movie for free with ads or in a free tier. Do not include sites that require a subscription, rental, or purchase. Do not include illegal sites.
  
  Specifically check if the movie is available for free on YouTube (with ads) and include it in the results if it is.

  If you cannot find any free, legal streaming options, return an empty array for the sites.`,
});

const movieFinderFlow = ai.defineFlow(
  {
    name: 'movieFinderFlow',
    inputSchema: MovieFinderInputSchema,
    outputSchema: MovieFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
