// src/components/query-builder/query-builder-panel.tsx
"use client";

import React, { useState } from 'react';
import { MainQueryInput } from "./main-query-input";
import { AdvancedOperators } from "./advanced-operators";
import { AiQuerySuggester } from "./ai-query-suggester";
import type { QueryField, QueryDateRange } from "@/types/archive";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface QueryBuilderPanelProps {
  onSearch: (query: string) => void; // Signature changed
  isSearching: boolean;
}

const initialQueryFields: QueryField[] = [];
const initialDateRange: QueryDateRange = {};

export function QueryBuilderPanel({ onSearch, isSearching }: QueryBuilderPanelProps) {
  const [mainQuery, setMainQuery] = useState<string>("");
  const [queryFields, setQueryFields] = useState<QueryField[]>(initialQueryFields);
  const [dateRange, setDateRange] = useState<QueryDateRange>(initialDateRange);

  const handleSearch = () => {
    const queryParts: string[] = [];

    if (mainQuery.trim()) {
      queryParts.push(mainQuery.trim());
    }

    queryFields.forEach((field, i) => {
      if (field.term.trim()) {
        let termSegment = field.isPhrase ? `"${field.term.trim()}"` : field.term.trim();
        if (field.useWildcard && !field.isPhrase && !termSegment.endsWith('*')) {
          termSegment += '*';
        }
        
        const targetPrefix = field.targetField !== 'any' ? `${field.targetField}:` : '';
        let currentClause = `${targetPrefix}${termSegment}`;

        // Determine operator logic
        const isFirstActualTerm = queryParts.length === 0;
        
        if (field.operator) { // AND, OR, NOT
            if (!isFirstActualTerm || field.operator === 'NOT') { // Add operator if not the very first part, or if it's a leading NOT
                queryParts.push(field.operator);
            }
        } else if (!isFirstActualTerm) { // No explicit operator, and not the first term, so default to AND
          queryParts.push('AND');
        }
        queryParts.push(currentClause);
      }
    });

    let combinedQuery = queryParts.join(' ');

    if (dateRange.startDate || dateRange.endDate) {
      let dateQueryFilter = "";
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      if (dateRange.startDate && dateRange.endDate) {
        dateQueryFilter = `date:[${formatDate(dateRange.startDate)} TO ${formatDate(dateRange.endDate)}]`;
      } else if (dateRange.startDate) {
        dateQueryFilter = `date:[${formatDate(dateRange.startDate)} TO *]`;
      } else if (dateRange.endDate) {
        dateQueryFilter = `date:[* TO ${formatDate(dateRange.endDate)}]`;
      }
      
      if (dateQueryFilter) {
        if (combinedQuery) {
          combinedQuery += ` AND ${dateQueryFilter}`;
        } else {
          combinedQuery = dateQueryFilter;
        }
      }
    }
    
    // Ensure mediatype is for videos, if not already specified by user.
    const mediaTypeFilter = "mediatype:(movies OR video)";
    if (combinedQuery) {
        if (!combinedQuery.toLowerCase().includes("mediatype:")) {
            combinedQuery += ` AND ${mediaTypeFilter}`;
        }
    } else {
        combinedQuery = mediaTypeFilter; // Default to searching all videos if query is otherwise empty
    }

    if (combinedQuery.trim()) {
       onSearch(combinedQuery.trim());
    } else {
        // This case should ideally be covered by the mediaTypeFilter default
        console.warn("Search query is empty after construction, this shouldn't happen if mediatype default is applied.");
        // Fallback, though the logic above tries to ensure combinedQuery is not empty if it reaches here
        onSearch(mediaTypeFilter); 
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMainQuery(suggestion);
  };

  const resetQueryBuilder = () => {
    setMainQuery("");
    setQueryFields(initialQueryFields);
    setDateRange(initialDateRange);
  };

  return (
    <div className="h-full flex flex-col border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Query Builder</h2>
          <Button variant="ghost" size="sm" onClick={resetQueryBuilder} title="Reset Query Builder">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
        <MainQueryInput
          query={mainQuery}
          onQueryChange={setMainQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-6">
          <AdvancedOperators
            queryFields={queryFields}
            onQueryFieldsChange={setQueryFields}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <AiQuerySuggester
            originalQuery={mainQuery}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
