"use client";

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import type { QueryField, QueryDateRange } from "@/types/archive";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdvancedOperatorsProps {
  queryFields: QueryField[];
  onQueryFieldsChange: (fields: QueryField[]) => void;
  dateRange: QueryDateRange;
  onDateRangeChange: (dateRange: QueryDateRange) => void;
}

const availableTargetFields = [
  { value: 'any', label: 'Any Field' },
  { value: 'title', label: 'Title' },
  { value: 'creator', label: 'Creator' },
  { value: 'description', label: 'Description' },
  { value: 'subject', label: 'Subject' },
  { value: 'collection', label: 'Collection' },
  { value: 'identifier', label: 'Identifier' },
  // Add more IA specific fields
];

export function AdvancedOperators({ queryFields, onQueryFieldsChange, dateRange, onDateRangeChange }: AdvancedOperatorsProps) {
  const [nextFieldId, setNextFieldId] = useState(1);

  const addQueryField = () => {
    onQueryFieldsChange([
      ...queryFields,
      { id: `field-${nextFieldId}`, term: '', operator: queryFields.length > 0 ? 'AND' : '', targetField: 'any', isPhrase: false, useWildcard: false }
    ]);
    setNextFieldId(prev => prev + 1);
  };

  const updateQueryField = (id: string, updates: Partial<QueryField>) => {
    onQueryFieldsChange(
      queryFields.map(field => field.id === id ? { ...field, ...updates } : field)
    );
  };

  const removeQueryField = (id: string) => {
    onQueryFieldsChange(queryFields.filter(field => field.id !== id));
  };
  
  return (
    <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-base font-semibold">Field-Specific Search & Boolean</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {queryFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md shadow-sm bg-background space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-2 items-center">
                {index > 0 && (
                  <Select
                    value={field.operator}
                    onValueChange={(value: 'AND' | 'OR' | 'NOT') => updateQueryField(field.id, { operator: value })}
                  >
                    <SelectTrigger className="w-full md:w-[80px]">
                      <SelectValue placeholder="Op" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                      <SelectItem value="NOT">NOT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                 <Input
                  placeholder="Term (e.g., 'apollo 11')"
                  value={field.term}
                  onChange={(e) => updateQueryField(field.id, { term: e.target.value })}
                  className={index === 0 ? "md:col-span-2" : ""}
                  aria-label={`Search term for field ${index + 1}`}
                />
                <Select
                  value={field.targetField}
                  onValueChange={(value) => updateQueryField(field.id, { targetField: value })}
                >
                  <SelectTrigger className="w-full md:w-[120px]">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargetFields.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`phrase-${field.id}`}
                    checked={field.isPhrase}
                    onCheckedChange={(checked) => updateQueryField(field.id, { isPhrase: !!checked })}
                  />
                  <Label htmlFor={`phrase-${field.id}`} className="text-sm font-normal">Exact Phrase ("")</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`wildcard-${field.id}`}
                    checked={field.useWildcard}
                    onCheckedChange={(checked) => updateQueryField(field.id, { useWildcard: !!checked })}
                  />
                  <Label htmlFor={`wildcard-${field.id}`} className="text-sm font-normal">Use Wildcard (*)</Label>
                </div>
                {queryFields.length > 0 && (
                   <Button variant="ghost" size="icon" onClick={() => removeQueryField(field.id)} className="ml-auto text-destructive hover:text-destructive" aria-label="Remove field">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addQueryField} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Field
          </Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger className="text-base font-semibold">Date Range</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.startDate ? format(dateRange.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.startDate}
                    onSelect={(date) => onDateRangeChange({ ...dateRange, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.endDate ? format(dateRange.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.endDate}
                    onSelect={(date) => onDateRangeChange({ ...dateRange, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
           <Button variant="outline" size="sm" onClick={() => onDateRangeChange({})} className="text-muted-foreground">
            Clear Dates
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
