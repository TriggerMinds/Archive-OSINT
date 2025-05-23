
// src/services/archive.ts

import type { SearchResultItem, VideoMetadata, ArchiveFileMetadata } from '@/types/archive';

const API_BASE_URL = 'https://archive.org/advancedsearch.php';
const METADATA_API_BASE_URL = 'https://archive.org/metadata';
const DEFAULT_FIELDS = [
  'identifier', 'title', 'description', 'date', 'publicdate', 
  'creator', 'subject', 'collection', 'mediatype', 'year', 'type', 'avg_rating', 'num_reviews'
];
const ROWS_PER_PAGE = 50; // Number of results per page

// Helper to normalize API fields that can be string or string[] into string[]
function normalizeToArray(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string') as string[];
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
}

// Helper to create a snippet from text
function createSnippet(text: string | undefined | null, maxLength: number = 200): string {
  if (!text) return "No description available.";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}


export async function searchInternetArchive(queryStringWithParams: string): Promise<SearchResultItem[]> {
  const params = new URLSearchParams(queryStringWithParams);
  let currentQuery = params.get('q') || '';

  const videoMediaTypes = '(mediatype:movies OR mediatype:video OR mediatype:film OR mediatype:television OR mediatype:webcast OR mediatype:vlog)';
  
  if (!currentQuery.toLowerCase().includes('mediatype:')) {
    if (currentQuery.trim()) {
      currentQuery = `(${currentQuery}) AND ${videoMediaTypes}`;
    } else {
      currentQuery = videoMediaTypes;
    }
  }
  params.set('q', currentQuery);
  
  params.delete('fl[]'); 
  DEFAULT_FIELDS.forEach(field => params.append('fl[]', field));
  params.set('rows', ROWS_PER_PAGE.toString());
  params.set('output', 'json');

  const fullUrl = `${API_BASE_URL}?${params.toString()}`;
  console.log("Requesting IA URL:", fullUrl);

  try {
    const response = await fetch(fullUrl, { method: 'GET' });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("IA API Error Response:", errorText);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.response || !Array.isArray(data.response.docs)) {
      console.warn('IA API response format unexpected or no docs found:', data);
      return [];
    }
    
    const results: SearchResultItem[] = data.response.docs.map((doc: any): SearchResultItem => {
      const identifier = doc.identifier || `unknown-${Math.random().toString(36).substring(7)}`;
      const title = (Array.isArray(doc.title) ? doc.title[0] : doc.title) || "Untitled";
      
      let rawDescription = doc.description;
      if (Array.isArray(rawDescription)) {
        rawDescription = rawDescription.join('\n\n');
      }
      const descriptionString = typeof rawDescription === 'string' ? rawDescription : '';

      const metadata: VideoMetadata = {
        identifier: identifier,
        title: title,
        description: descriptionString,
        subjects: normalizeToArray(doc.subject),
        datePublished: String(doc.publicdate || doc.date || doc.year || ''), 
        creator: Array.isArray(doc.creator) ? doc.creator.join(', ') : (typeof doc.creator === 'string' ? doc.creator : undefined),
        collection: normalizeToArray(doc.collection),
      };

      return {
        id: identifier,
        title: title,
        descriptionSnippet: createSnippet(descriptionString, 150),
        thumbnailUrl: `https://archive.org/services/img/${identifier}`,
        videoUrl: `https://archive.org/details/${identifier}`, 
        metadata: metadata,
        isSaved: false, 
        annotations: '',
        tags: [],
      };
    });

    return results;

  } catch (error) {
    console.error('Failed to fetch from Internet Archive:', error);
    // Ensure an array is returned even on error to prevent downstream issues.
    // The error is thrown so the caller can handle it (e.g., show a toast).
    // If a Promise<SearchResultItem[] | []> signature is preferred, return [] here instead of re-throwing.
    throw error; 
  }
}


export async function fetchItemFilesMetadata(identifier: string): Promise<ArchiveFileMetadata[]> {
  const url = `${METADATA_API_BASE_URL}/${identifier}/files`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("IA Metadata API Error Response for files:", errorText);
      throw new Error(`Failed to fetch file metadata for ${identifier}: ${response.statusText}`);
    }
    const filesData: ArchiveFileMetadata[] = await response.json();
    // Filter out directories or non-downloadable files if necessary, here we assume all are files
    // Add full download URL
    return filesData.map(file => ({
      ...file,
      downloadUrl: `https://archive.org/download/${identifier}${file.name.startsWith('.') ? file.name.substring(1) : file.name}`
    }));
  } catch (error) {
    console.error(`Error fetching files metadata for ${identifier}:`, error);
    return []; // Return empty array on error
  }
}
