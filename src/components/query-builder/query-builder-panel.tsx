
"use client";

import { useState } from 'react';
import type { QueryField, QueryDateRange } from '@/types/archive';
import { MainQueryInput } from './main-query-input';
import { AdvancedOperators } from './advanced-operators';
import { AiQuerySuggester } from './ai-query-suggester';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

interface QueryBuilderPanelProps {
  onSearch: (queryString: string) => void;
  isSearching: boolean;
}

export function QueryBuilderPanel({ onSearch, isSearching }: QueryBuilderPanelProps) {
  const [mainQuery, setMainQuery] = useState<string>("");
  const [queryFields, setQueryFields] = useState<QueryField[]>([]);
  const [dateRange, setDateRange] = useState<QueryDateRange>({});

  const handleMainQueryChange = (query: string) => {
    setMainQuery(query);
  };

  const handleQueryFieldsChange = (fields: QueryField[]) => {
    setQueryFields(fields);
  };

  const handleDateRangeChange = (newDateRange: QueryDateRange) => {
    setDateRange(newDateRange);
  };

  const handleAiSuggestionClick = (suggestion: string) => {
    // The AI suggestion is a query string (the 'q' part value).
    // We'll use it to perform a search.
    // We also update the UI to reflect this search.
    const params = new URLSearchParams();
    params.set('q', suggestion);
    onSearch(params.toString());

    setMainQuery(suggestion); // Update main input to show the AI query
    setQueryFields([]);      // Clear advanced fields
    setDateRange({});        // Clear date range
  };

  const constructIAQueryString = (): string => {
    let qParts: string[] = [];

    // Main query term
    if (mainQuery.trim()) {
      qParts.push(mainQuery.trim());
    }

    // Process advanced fields
    queryFields.forEach((field) => {
      if (!field.term.trim()) return;

      let termPart = field.term.trim();
      if (field.isPhrase) {
        termPart = `"${termPart}"`;
      }
      // Wildcards are handled by IA if present in termPart. 
      // If useWildcard is true and no '*' is in term, IA usually doesn't infer it unless API has specific syntax.
      // We assume user adds '*' if needed, or IA handles it by default for some fields.

      let fieldSearch = "";
      if (field.targetField !== 'any' && field.targetField) {
        fieldSearch = `${field.targetField}:(${termPart})`;
      } else {
        fieldSearch = termPart;
      }

      if (qParts.length > 0 && field.operator) { // Ensure operator only if there's a preceding part
        qParts.push(field.operator);
        qParts.push(fieldSearch);
      } else if (qParts.length === 0 && field.operator === 'NOT'){ // NOT can be a leading operator
        qParts.push(field.operator);
        qParts.push(fieldSearch);
      } else {
         // If no operator or it's the first significant term part
         // If there was a mainQuery, this new term implicitly ANDs (space-separated)
         // If this is the very first term, it stands alone.
        if(qParts.length > 0 && field.operator === '') { // Default to AND if operator is empty and not first term
            qParts.push('AND');
        }
        qParts.push(fieldSearch);
      }
    });
    
    // Process date range
    if (dateRange.startDate || dateRange.endDate) {
      const start = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '*';
      const end = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : '*';
      
      if (qParts.length > 0) {
         qParts.push('AND'); // Ensure date range is ANDed if other query parts exist
      }
      qParts.push(`date:[${start} TO ${end}]`);
    }
    
    let finalQuery = qParts.join(' ');

    // The searchInternetArchive service adds mediatype if not present.
    // So, if finalQuery is empty, the service will use its default.
    // If finalQuery has content, the service will AND mediatype.

    const params = new URLSearchParams();
    if (finalQuery.trim()) {
        params.set('q', finalQuery.trim());
    }
    // If finalQuery is empty, params will be empty, searchInternetArchive service will handle default.
    
    return params.toString(); // returns "q=..." or ""
  };

  const handleSearchClick = () => {
    const queryString = constructIAQueryString();
    // Pass empty string if no query, service handles default
    onSearch(queryString || "q=mediatype:(movies OR video)"); 
  };
  
  const builtQueryForAIContext = () => {
    // Provides a simplified query string for AI suggestion context
    let qParts: string[] = [];
    if (mainQuery.trim()) qParts.push(mainQuery.trim());
    queryFields.forEach(field => {
      if (field.term.trim()) {
        let part = field.term.trim();
        if (field.isPhrase) part = `"${part}"`;
        if (field.targetField !== 'any' && field.targetField) part = `${field.targetField}:${part}`;
        
        if (qParts.length > 0 && field.operator) qParts.push(field.operator);
        else if (qParts.length > 0 && field.operator === '') qParts.push('AND');
        else if (qParts.length === 0 && field.operator === 'NOT') qParts.push(field.operator);

        qParts.push(part);
      }
    });
    if (dateRange.startDate || dateRange.endDate) {
      const start = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '*';
      const end = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : '*';
      if (qParts.length > 0) qParts.push('AND');
      qParts.push(`date:[${start} TO ${end}]`);
    }
    return qParts.join(' ').trim() || "general video search"; // Give some context if empty
  }

  return (
    <div className="p-4 bg-card h-full flex flex-col border-r">
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Query Builder</h2>
            <MainQueryInput
              query={mainQuery}
              onQueryChange={handleMainQueryChange}
              onSearch={handleSearchClick}
              isSearching={isSearching}
            />
          </div>

          <AdvancedOperators
            queryFields={queryFields}
            onQueryFieldsChange={handleQueryFieldsChange}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          
          <AiQuerySuggester
            originalQuery={builtQueryForAIContext()}
            onSuggestionClick={handleAiSuggestionClick}
          />
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 border-t">
        <Button 
          onClick={handleSearchClick} 
          disabled={isSearching} 
          className="w-full text-lg py-3"
          aria-label="Search Internet Archive"
        >
          <Search className="mr-2 h-5 w-5" />
          {isSearching ? "Searching..." : "Search Internet Archive"}
        </Button>
      </div>
    </div>
  );
}
