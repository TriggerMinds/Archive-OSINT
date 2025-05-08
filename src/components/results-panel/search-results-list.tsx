"use client";

import type { SearchResultItem as SearchResultItemType } from "@/types/archive";
import { SearchResultItem } from "./search-result-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileText } from "lucide-react";

interface SearchResultsListProps {
  results: SearchResultItemType[];
  onViewDetails: (item: SearchResultItemType) => void;
  isLoading: boolean;
  hasSearched: boolean; // To distinguish initial state from no results after search
}

export function SearchResultsList({ results, onViewDetails, isLoading, hasSearched }: SearchResultsListProps) {
  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!hasSearched) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground">Ready to Investigate?</h3>
        <p className="text-muted-foreground">Use the Query Builder to start your search.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold">No Results Found</h3>
        <p className="text-muted-foreground">Try refining your search query or use the AI Query Enhancer for suggestions.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((item) => (
          <SearchResultItem key={item.id} item={item} onViewDetails={onViewDetails} />
        ))}
      </div>
    </ScrollArea>
  );
}

const CardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3 bg-card">
    <Skeleton className="h-32 w-full rounded bg-muted" />
    <Skeleton className="h-5 w-3/4 rounded bg-muted" />
    <Skeleton className="h-4 w-full rounded bg-muted" />
    <Skeleton className="h-4 w-5/6 rounded bg-muted" />
    <Skeleton className="h-9 w-full rounded bg-muted mt-2" />
  </div>
);
