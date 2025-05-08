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
  onSearch: (query: string, fields: QueryField[], dateRange: QueryDateRange) => void;
  isSearching: boolean;
}

const initialQueryFields: QueryField[] = [];
const initialDateRange: QueryDateRange = {};

export function QueryBuilderPanel({ onSearch, isSearching }: QueryBuilderPanelProps) {
  const [mainQuery, setMainQuery] = useState<string>("");
  const [queryFields, setQueryFields] = useState<QueryField[]>(initialQueryFields);
  const [dateRange, setDateRange] = useState<QueryDateRange>(initialDateRange);

  const handleSearch = () => {
    // In a real app, you'd combine mainQuery with queryFields and dateRange
    // into a single Internet Archive compatible query string.
    // For this mock, we'll pass them separately.
    let combinedQuery = mainQuery;
    // Basic combination logic (can be much more sophisticated)
    queryFields.forEach(field => {
      if (field.term.trim()) {
        const operator = field.operator ? ` ${field.operator} ` : ' ';
        const term = field.isPhrase ? `"${field.term}"` : field.term;
        const target = field.targetField !== 'any' ? `${field.targetField}:` : '';
        combinedQuery += `${operator}${target}${term}`;
      }
    });
    if (dateRange.startDate || dateRange.endDate) {
      // This is a simplified representation; IA uses specific date formats in queries
      const start = dateRange.startDate ? `date:[${dateRange.startDate.toISOString().split('T')[0]}` : 'date:[';
      const end = dateRange.endDate ? ` TO ${dateRange.endDate.toISOString().split('T')[0]}]` : ']';
      if (dateRange.startDate || dateRange.endDate) {
         let dateQueryPart = dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : '';
        if (dateRange.startDate && dateRange.endDate) {
          dateQueryPart += ` TO ${dateRange.endDate.toISOString().split('T')[0]}`;
        } else if (dateRange.endDate) {
          dateQueryPart = dateRange.endDate.toISOString().split('T')[0];
        }
        combinedQuery += ` date:[${dateQueryPart}]`;
      }
    }
    
    onSearch(combinedQuery.trim(), queryFields, dateRange);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMainQuery(suggestion); // Replace main query, or could append/modify
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
