"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface MainQueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

export function MainQueryInput({ query, onQueryChange, onSearch, isSearching }: MainQueryInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        type="search"
        placeholder="Enter your main search query..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="flex-grow"
        aria-label="Main search query"
      />
      <Button onClick={onSearch} disabled={isSearching || !query.trim()}>
        <Search className="mr-2 h-4 w-4" />
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}
