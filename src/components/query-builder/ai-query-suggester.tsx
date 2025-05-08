"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { suggestAlternativeQueries, SuggestAlternativeQueriesInput } from '@/ai/flows/suggest-alternative-queries';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AiQuerySuggesterProps {
  originalQuery: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function AiQuerySuggester({ originalQuery, onSuggestionClick }: AiQuerySuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!originalQuery.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an original query to get suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    try {
      const input: SuggestAlternativeQueriesInput = { originalQuery };
      const result = await suggestAlternativeQueries(input);
      if (result && result.alternativeQueries) {
        setSuggestions(result.alternativeQueries);
         if (result.alternativeQueries.length === 0) {
          toast({
            title: "No Suggestions Found",
            description: "The AI couldn't find alternative queries for this input. Try a different query.",
          });
        }
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4 shadow-sm border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          AI Query Enhancer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Get AI-powered suggestions to uncover hard-to-find footage.
        </p>
        <Button onClick={handleGetSuggestions} disabled={isLoading || !originalQuery.trim()} className="w-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          {isLoading ? "Generating Suggestions..." : "Suggest Alternative Queries"}
        </Button>

        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm">Suggested Queries:</h4>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors p-2 text-xs w-full text-left justify-start"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
