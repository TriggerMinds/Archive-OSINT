export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  subjects: string[]; // Changed from string to string[] for better representation
  identifier: string; // Internet Archive identifier
  datePublished?: string;
  creator?: string;
  collection?: string;
  // Add other relevant metadata fields
}

export interface EnrichedVideoMetadata extends VideoMetadata {
  aiEntities?: string[];
  aiThemes?: string[];
  aiSentiment?: string;
}

export interface SearchResultItem {
  id: string; // Could be Internet Archive identifier
  title: string;
  descriptionSnippet: string;
  thumbnailUrl?: string;
  videoUrl?: string; // Direct link if available, or link to IA page
  metadata: VideoMetadata; // Basic metadata available from search
  isSaved?: boolean; // For project workspace
  annotations?: string;
  tags?: string[];
}

export interface QueryField {
  id: string;
  term: string;
  operator: 'AND' | 'OR' | 'NOT' | ''; // Boolean operator for this term relative to previous
  targetField: string; // e.g., 'title', 'creator', 'description', 'any'
  isPhrase: boolean; // For exact phrase matching
  useWildcard: boolean; // For wildcard usage
}

export interface QueryDateRange {
  startDate?: Date;
  endDate?: Date;
}
