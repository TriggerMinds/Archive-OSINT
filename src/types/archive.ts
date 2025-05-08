
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // Should be ISO string from Firestore Timestamp
  lastModified: string; // Should be ISO string
}

export interface VideoMetadata {
  title: string;
  description: string;
  subjects: string[]; 
  identifier: string; // Internet Archive identifier
  datePublished?: string;
  creator?: string;
  collection?: string[]; 
}

export interface EnrichedVideoMetadata extends VideoMetadata {
  aiEntities?: string[];
  aiThemes?: string[];
  aiSentiment?: string;
}

export interface SearchResultItem {
  id: string; 
  title: string;
  descriptionSnippet: string;
  thumbnailUrl?: string;
  videoUrl?: string; 
  metadata: VideoMetadata; 
  isSaved?: boolean; 
  annotations?: string;
  tags?: string[];
}

export interface QueryField {
  id: string;
  term: string;
  operator: 'AND' | 'OR' | 'NOT' | ''; 
  targetField: string; 
  isPhrase: boolean; 
  useWildcard: boolean; 
}

export interface QueryDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface ArchiveFileMetadata {
  name: string;          // e.g., "./video.mp4"
  source: 'original' | 'derivative' | string; // "original" or "derivative" common
  format?: string;       // e.g., "MPEG4", "Ogg Video", "JSON"
  md5?: string;
  sha1?: string;
  crc32?: string;
  btih?: string;         // BitTorrent Info Hash
  size?: string;         // File size in bytes as a string
  length?: string;       // Video/audio duration as string (e.g., "123.45")
  height?: string;       // Video height
  width?: string;        // Video width
  // Other fields might exist depending on the file type
  downloadUrl?: string;  // To be constructed: https://archive.org/download/{identifier}{name}
}
