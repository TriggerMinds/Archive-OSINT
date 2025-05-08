"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import type { VideoMetadata } from "@/types/archive";
import { extractVideoMetadata, ExtractVideoMetadataInput } from '@/ai/flows/extract-video-metadata';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface AiMetadataDisplayProps {
  videoMetadata: VideoMetadata; // Original metadata
}

interface EnrichedData {
  entities: string[];
  themes: string[];
  sentiment: string;
}

export function AiMetadataDisplay({ videoMetadata }: AiMetadataDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);
  const { toast } = useToast();

  const handleEnrichMetadata = async () => {
    setIsLoading(true);
    try {
      const input: ExtractVideoMetadataInput = {
        title: videoMetadata.title,
        description: videoMetadata.description,
        subjects: Array.isArray(videoMetadata.subjects) ? videoMetadata.subjects.join(', ') : (videoMetadata.subjects || ''),
      };
      const result = await extractVideoMetadata(input);
      if (result) {
        setEnrichedData(result);
      } else {
        throw new Error("Invalid response from AI metadata extraction");
      }
    } catch (error) {
      console.error("Error enriching metadata:", error);
      toast({
        title: "Error",
        description: "Failed to enrich metadata. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
    if (sentiment?.toLowerCase() === 'positive') return <ThumbsUp className="h-5 w-5 text-green-500" />;
    if (sentiment?.toLowerCase() === 'negative') return <ThumbsDown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <Card className="mt-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          AI Metadata Analysis
        </CardTitle>
        <CardDescription>
          Automated insights from video metadata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!enrichedData && !isLoading && (
          <Button onClick={handleEnrichMetadata} className="w-full">
            Enrich Metadata with AI
          </Button>
        )}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
            </div>
            <Skeleton className="h-6 w-1/3 mt-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-24 rounded-full" />)}
            </div>
             <Skeleton className="h-6 w-1/5 mt-2" />
             <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        )}
        {enrichedData && (
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Key Entities:</h4>
              {enrichedData.entities?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {enrichedData.entities.map((entity, i) => <Badge key={i} variant="secondary">{entity}</Badge>)}
                </div>
              ) : <p className="text-muted-foreground">No entities identified.</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-1">Dominant Themes:</h4>
              {enrichedData.themes?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {enrichedData.themes.map((theme, i) => <Badge key={i} variant="outline">{theme}</Badge>)}
                </div>
              ) : <p className="text-muted-foreground">No themes identified.</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sentiment:</h4>
              <div className="flex items-center gap-2">
                <SentimentIcon sentiment={enrichedData.sentiment} />
                <span className="capitalize">{enrichedData.sentiment || 'Neutral'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
