"use client";

import { useState } from 'react';
import type { SearchResultItem as SearchResultItemType } from "@/types/archive";
import { SearchResultsList } from "./search-results-list";
import { VideoDetailView } from "./video-detail-view";

interface ResultsPanelProps {
  results: SearchResultItemType[];
  isLoading: boolean;
  hasSearched: boolean;
  onSaveItemToProject: (item: SearchResultItemType) => void; // New prop
}

export function ResultsPanel({ results, isLoading, hasSearched, onSaveItemToProject }: ResultsPanelProps) {
  const [selectedItem, setSelectedItem] = useState<SearchResultItemType | null>(null);

  const handleViewDetails = (item: SearchResultItemType) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };
  
  // This function will be passed to VideoDetailView and then to AnnotationTagging
  // It ensures the main list of results is updated if an item is saved/annotated from detail view
  const handleItemUpdate = (updatedItem: SearchResultItemType) => {
     onSaveItemToProject(updatedItem); // Call the prop to update the main state
     if (selectedItem && selectedItem.id === updatedItem.id) {
       setSelectedItem(updatedItem); // Update the selected item view if it's the one being modified
     }
  };


  if (selectedItem) {
    return <VideoDetailView item={selectedItem} onClose={handleCloseDetails} onSaveItem={handleItemUpdate} />;
  }

  return <SearchResultsList results={results} onViewDetails={handleViewDetails} isLoading={isLoading} hasSearched={hasSearched} />;
}
