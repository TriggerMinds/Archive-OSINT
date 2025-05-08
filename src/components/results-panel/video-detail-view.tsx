"use client";

import type { SearchResultItem } from "@/types/archive";
import { VideoPlayer } from "./video-player";
import { AiMetadataDisplay } from "./ai-metadata-display";
import { AnnotationTagging } from "./annotation-tagging";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Download, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface VideoDetailViewProps {
  item: SearchResultItem;
  onClose: () => void;
  onSaveItem: (item: SearchResultItem) => void; // For saving to project
}

export function VideoDetailView({ item, onClose, onSaveItem }: VideoDetailViewProps) {
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
          
          <div className="flex flex-wrap gap-2">
            {archiveLink && (
              <Button variant="outline" size="sm" asChild>
                <a href={archiveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View on Archive.org
                </a>
              </Button>
            )}
             {/* Placeholder for Download */}
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" /> Download (N/A)
            </Button>
          </div>

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
