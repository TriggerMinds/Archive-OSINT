// Use server directive is required for Genkit flows.
'use server';

/**
 * @fileOverview A flow that suggests alternative search queries for finding obscure video footage.
 *
 * - suggestAlternativeQueries - A function that suggests alternative search queries.
 * - SuggestAlternativeQueriesInput - The input type for the suggestAlternativeQueries function.
 * - SuggestAlternativeQueriesOutput - The return type for the suggestAlternativeQueries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeQueriesInputSchema = z.object({
  originalQuery: z
    .string()
    .describe('The original search query entered by the user.'),
});
export type SuggestAlternativeQueriesInput = z.infer<typeof SuggestAlternativeQueriesInputSchema>;

const SuggestAlternativeQueriesOutputSchema = z.object({
  alternativeQueries: z
    .array(z.string())
    .describe(
      'An array of alternative search queries suggested by the AI to find obscure video footage.'
    ),
});
export type SuggestAlternativeQueriesOutput = z.infer<typeof SuggestAlternativeQueriesOutputSchema>;

export async function suggestAlternativeQueries(
  input: SuggestAlternativeQueriesInput
): Promise<SuggestAlternativeQueriesOutput> {
  return suggestAlternativeQueriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeQueriesPrompt',
  input: {schema: SuggestAlternativeQueriesInputSchema},
  output: {schema: SuggestAlternativeQueriesOutputSchema},
  prompt: `You are an expert in crafting search queries for the Internet Archive, specifically for uncovering hard-to-find or obscure video footage. Given an initial search query, your task is to suggest alternative search queries that might yield better results.

Original Query: {{{originalQuery}}}

Consider the following strategies when generating alternative queries:

*   **Boolean Logic:** Incorporate AND, OR, and NOT operators to refine the search.
*   **Wildcards:** Use wildcards (*) to broaden the search and account for variations in keywords.
*   **Phrase Matching:** Employ precise phrase matching (using quotes \") to find exact matches.
*   **Field-Specific Targeting:** Target specific fields like creator, title, or subject to narrow the search.
*   **Numerical/Date Ranges:** Use numerical or date ranges to filter results based on specific timeframes.

Provide at least 3 alternative search queries that utilize a combination of these strategies. The goal is to help the user uncover footage that might be missed with a basic keyword search.

Output the result as a json array of strings. Example: [ \"alternative query 1\", \"alternative query 2\", \"alternative query 3\" ]`,
});

const suggestAlternativeQueriesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeQueriesFlow',
    inputSchema: SuggestAlternativeQueriesInputSchema,
    outputSchema: SuggestAlternativeQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
