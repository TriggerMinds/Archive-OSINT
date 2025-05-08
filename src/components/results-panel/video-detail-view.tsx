
"use client";

import React, { useState, useEffect } from 'react';
import type { SearchResultItem, ArchiveFileMetadata } from "@/types/archive";
import { VideoPlayer } from "./video-player";
import { AiMetadataDisplay } from "./ai-metadata-display";
import { AnnotationTagging } from "./annotation-tagging";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Download, Bookmark, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { fetchItemFilesMetadata } from '@/services/archive';
import { useToast } from '@/hooks/use-toast';

interface VideoDetailViewProps {
  item: SearchResultItem;
  onClose: () => void;
  onSaveItem: (item: SearchResultItem) => void; 
}

export function VideoDetailView({ item, onClose, onSaveItem }: VideoDetailViewProps) {
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isFetchingDownload, setIsFetchingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getDownloadLink = async () => {
      if (!item.metadata.identifier) return;

      setIsFetchingDownload(true);
      setDownloadError(null);
      setDownloadLink(null);

      try {
        const files = await fetchItemFilesMetadata(item.metadata.identifier);
        // Prioritize common video formats from original source
        const preferredFormats = ["MPEG4", "H.264", "Matroska"];
        let bestFile: ArchiveFileMetadata | undefined;

        // Try to find original high-quality video files
        bestFile = files.find(f => 
          f.source === 'original' && 
          f.format && 
          preferredFormats.some(pf => f.format?.includes(pf)) &&
          (f.name.endsWith('.mp4') || f.name.endsWith('.mkv') || f.name.endsWith('.avi'))
        );

        // Fallback: any file with MPEG4 format
        if (!bestFile) {
          bestFile = files.find(f => f.format === "MPEG4" && f.name.endsWith('.mp4'));
        }
        // Fallback: any file with a common video extension (could be a derivative)
        if (!bestFile) {
          bestFile = files.find(f => f.name.endsWith('.mp4') || f.name.endsWith('.mkv'));
        }
        
        if (bestFile && bestFile.downloadUrl) {
          setDownloadLink(bestFile.downloadUrl);
        } else if (files.length > 0) {
          // Fallback to the first file if no preferred one is found (less ideal)
          // setDownloadLink(files[0].downloadUrl); 
          setDownloadError("Could not find a suitable video download format.");
        } else {
          setDownloadError("No downloadable files found for this item.");
        }
      } catch (error) {
        console.error("Error fetching download link:", error);
        setDownloadError(error instanceof Error ? error.message : "Failed to get download information.");
        toast({
          title: "Download Error",
          description: "Could not retrieve download information for this item.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingDownload(false);
      }
    };

    getDownloadLink();
  }, [item.metadata.identifier, toast]);

  const handleSaveAnnotations = (itemId: string, annotations: string, tags: string[]) => {
    onSaveItem({ ...item, annotations, tags, isSaved: true });
  };

  const archiveLink = item.metadata.identifier ? `https://archive.org/details/${item.metadata.identifier}` : item.videoUrl;

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to results">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold truncate flex-1" title={item.title}>{item.title}</h3>
        <Button variant="outline" size="sm" onClick={() => onSaveItem({ ...item, isSaved: !item.isSaved })}>
          <Bookmark className={`mr-2 h-4 w-4 ${item.isSaved ? 'fill-primary text-primary' : ''}`} />
          {item.isSaved ? "Saved" : "Save to Project"}
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          {item.videoUrl && <VideoPlayer videoUrl={item.videoUrl} title={item.title} />}
          
          <div className="flex flex-wrap gap-2 items-center">
            {archiveLink && (
              <Button variant="outline" size="sm" asChild>
                <a href={archiveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View on Archive.org
                </a>
              </Button>
            )}
            {isFetchingDownload && (
              <Button variant="outline" size="sm" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking for downloads...
              </Button>
            )}
            {!isFetchingDownload && downloadLink && (
               <Button variant="outline" size="sm" asChild>
                <a href={downloadLink} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" /> Download Video
                </a>
              </Button>
            )}
            {!isFetchingDownload && !downloadLink && (
              <Button variant="outline" size="sm" disabled title={downloadError || "No download available"}>
                <Download className="mr-2 h-4 w-4" /> 
                {downloadError ? "Download N/A" : "No Download"}
              </Button>
            )}
          </div>
          {downloadError && !isFetchingDownload && (
            <p className="text-xs text-destructive flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> {downloadError}</p>
          )}


          <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">Video Details</AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pt-1">
                <p><strong>Identifier:</strong> {item.metadata.identifier || "N/A"}</p>
                <p><strong>Description:</strong> {item.metadata.description || "No description available."}</p>
                {item.metadata.datePublished && <p><strong>Published:</strong> {item.metadata.datePublished}</p>}
                {item.metadata.creator && <p><strong>Creator:</strong> {item.metadata.creator}</p>}
                {item.metadata.collection && item.metadata.collection.length > 0 && (
                  <p><strong>Collection:</strong> {item.metadata.collection.join(', ')}</p>
                )}
                {item.metadata.subjects && item.metadata.subjects.length > 0 && (
                  <div>
                    <strong>Subjects:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.metadata.subjects.map((subject, i) => <Badge key={i} variant="secondary">{subject}</Badge>)}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-medium">AI Analysis</AccordionTrigger>
              <AccordionContent>
                <AiMetadataDisplay videoMetadata={item.metadata} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-medium">Your Notes & Tags</AccordionTrigger>
              <AccordionContent>
                 <AnnotationTagging
                    itemId={item.id}
                    initialAnnotations={item.annotations}
                    initialTags={item.tags}
                    onSave={handleSaveAnnotations}
                  />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </ScrollArea>
    </div>
  );
}
