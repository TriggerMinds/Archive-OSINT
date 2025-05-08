"use client";

import type { SearchResultItem as SearchResultItemType } from "@/types/archive";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Eye, Bookmark, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchResultItemProps {
  item: SearchResultItemType;
  onViewDetails: (item: SearchResultItemType) => void;
}

export function SearchResultItem({ item, onViewDetails }: SearchResultItemProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-150 flex flex-col">
      <CardHeader className="p-4">
        {item.thumbnailUrl && (
          <div className="relative aspect-video mb-2 rounded overflow-hidden bg-muted">
            <Image 
              src={item.thumbnailUrl} 
              alt={`Thumbnail for ${item.title}`} 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="video thumbnail"
            />
          </div>
        )}
        <CardTitle className="text-base font-semibold leading-tight line-clamp-2 h-[2.5em]" title={item.title}>
          {item.title}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-3 h-[3.375em] mt-1"> {/* approx 3 lines * 1.125em line-height */}
          {item.descriptionSnippet || "No description snippet available."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs flex-grow">
        <div className="flex flex-wrap gap-1 mb-2">
          {item.metadata.subjects?.slice(0, 3).map((subject, i) => (
            <Badge key={i} variant="outline" className="text-xs">{subject}</Badge>
          ))}
        </div>
         {item.isSaved && (
          <div className="flex items-center text-primary text-xs mb-1">
            <Bookmark className="h-3 w-3 mr-1 fill-primary" /> Saved to project
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
           <div className="flex items-center text-muted-foreground text-xs line-clamp-1">
            <Tag className="h-3 w-3 mr-1" /> {item.tags.join(', ')}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="default" size="sm" className="w-full" onClick={() => onViewDetails(item)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
