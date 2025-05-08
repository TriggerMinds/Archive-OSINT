// src/services/archive.ts
'use server';

import type { SearchResultItem, VideoMetadata } from "@/types/archive";

// Helper to safely get a string from a potentially array/single string field
const getStringValue = (field: string | string[] | undefined): string => {
  if (Array.isArray(field)) {
    return field[0] || "";
  }
  return field || "";
};

// Helper to safely get an array of strings from a potentially array/single string field
const getArrayOfStrings = (field: string | string[] | undefined): string[] => {
  if (Array.isArray(field)) {
    return field.filter(s => typeof s === 'string');
  }
  if (typeof field === 'string') {
    return [field];
  }
  return [];
}

interface InternetArchiveDoc {
  identifier: string;
  title?: string | string[];
  description?: string | string[];
  subject?: string | string[];
  creator?: string | string[];
  date?: string | string[];
  publicdate?: string | string[];
  collection?: string | string[];
  mediatype?: string;
}

interface InternetArchiveResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: {
      query: string;
      fl: string[]; // Changed to string[]
      rows: string;
      page: string; // Changed from start
      wt: string;
    };
  };
  response: {
    numFound: number;
    start: number;
    docs: InternetArchiveDoc[];
  };
}

export async function searchInternetArchive(
  query: string,
  rowsPerPage: number = 24,
  page: number = 1
): Promise<SearchResultItem[]> {
  const baseUrl = "https://archive.org/advancedsearch.php";
  const fieldsToReturn = [
    "identifier", "title", "description", "subject",
    "creator", "date", "publicdate", "collection", "mediatype"
  ];

  const params = new URLSearchParams({
    q: query,
    rows: rowsPerPage.toString(),
    page: page.toString(),
    output: "json",
  });

  fieldsToReturn.forEach(field => params.append("fl[]", field));
  // Example: params.append("sort[]", "publicdate desc"); // Add sorting if needed

  const url = `${baseUrl}?${params.toString()}`;
  console.log("Requesting URL:", url); // For debugging

  try {
    const response = await fetch(url, { cache: 'no-store' }); // Prevent caching for dynamic results
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Internet Archive API Error:", response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data: InternetArchiveResponse = await response.json();

    if (!data.response || !data.response.docs) {
      console.warn("No docs found in API response:", data);
      return [];
    }
    
    return data.response.docs.map((doc): SearchResultItem => {
      const title = getStringValue(doc.title);
      const description = getStringValue(doc.description);
      
      const metadata: VideoMetadata = {
        identifier: doc.identifier,
        title: title,
        description: description,
        subjects: getArrayOfStrings(doc.subject),
        datePublished: getStringValue(doc.publicdate || doc.date),
        creator: getStringValue(doc.creator),
        collection: getArrayOfStrings(doc.collection),
      };

      return {
        id: doc.identifier,
        title: title,
        descriptionSnippet: description.substring(0, 200) + (description.length > 200 ? "..." : ""),
        thumbnailUrl: `https://archive.org/services/img/${doc.identifier}`,
        videoUrl: `https://archive.org/details/${doc.identifier}`,
        metadata: metadata,
        annotations: "",
        tags: [],
        isSaved: false
      };
    });

  } catch (error) {
    console.error("Failed to search Internet Archive:", error);
    throw error; 
  }
}
