// src/ai/flows/extract-video-metadata.ts
'use server';

/**
 * @fileOverview Extracts key entities, themes, and sentiment from video metadata.
 *
 * - extractVideoMetadata - A function that handles the extraction of metadata from video data.
 * - ExtractVideoMetadataInput - The input type for the extractVideoMetadata function.
 * - ExtractVideoMetadataOutput - The return type for the extractVideoMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractVideoMetadataInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('The description of the video.'),
  subjects: z.string().describe('The subjects or keywords associated with the video.'),
});

export type ExtractVideoMetadataInput = z.infer<typeof ExtractVideoMetadataInputSchema>;

const ExtractVideoMetadataOutputSchema = z.object({
  entities: z
    .array(z.string())
    .describe('Key entities (people, organizations, locations) identified in the metadata.'),
  themes: z.array(z.string()).describe('Dominant themes extracted from the metadata.'),
  sentiment: z
    .string()
    .describe('Overall sentiment (positive, negative, neutral) expressed in the metadata.'),
});

export type ExtractVideoMetadataOutput = z.infer<typeof ExtractVideoMetadataOutputSchema>;

export async function extractVideoMetadata(input: ExtractVideoMetadataInput): Promise<ExtractVideoMetadataOutput> {
  return extractVideoMetadataFlow(input);
}

const extractVideoMetadataPrompt = ai.definePrompt({
  name: 'extractVideoMetadataPrompt',
  input: {schema: ExtractVideoMetadataInputSchema},
  output: {schema: ExtractVideoMetadataOutputSchema},
  prompt: `Analyze the following video metadata to identify key entities, dominant themes, and overall sentiment.

Title: {{{title}}}
Description: {{{description}}}
Subjects: {{{subjects}}}

Extract key entities (people, organizations, locations), dominant themes, and overall sentiment.`,
});

const extractVideoMetadataFlow = ai.defineFlow(
  {
    name: 'extractVideoMetadataFlow',
    inputSchema: ExtractVideoMetadataInputSchema,
    outputSchema: ExtractVideoMetadataOutputSchema,
  },
  async input => {
    const {output} = await extractVideoMetadataPrompt(input);
    return output!;
  }
);
