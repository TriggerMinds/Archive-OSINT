"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Tag, Edit2, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface AnnotationTaggingProps {
  itemId: string; // ID of the item being annotated/tagged
  initialAnnotations?: string;
  initialTags?: string[];
  onSave: (itemId: string, annotations: string, tags: string[]) => void; // Callback to save data
}

export function AnnotationTagging({ itemId, initialAnnotations = "", initialTags = [], onSave }: AnnotationTaggingProps) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [currentTag, setCurrentTag] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setAnnotations(initialAnnotations);
    setTags(initialTags);
  }, [itemId, initialAnnotations, initialTags]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave(itemId, annotations, tags);
    toast({
      title: "Saved",
      description: "Annotations and tags have been saved.",
    });
  };

  return (
    <Card className="mt-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Edit2 className="mr-2 h-5 w-5 text-primary" />
          Notes & Tags
        </CardTitle>
        <CardDescription>Add your personal context and organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`annotations-${itemId}`} className="font-semibold">Annotations</Label>
          <Textarea
            id={`annotations-${itemId}`}
            value={annotations}
            onChange={(e) => setAnnotations(e.target.value)}
            placeholder="Add your notes, observations, and insights here..."
            rows={5}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`tags-input-${itemId}`} className="font-semibold">Tags</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id={`tags-input-${itemId}`}
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag (e.g., 'key evidence')"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag} variant="outline" size="icon" aria-label="Add tag">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    aria-label={`Remove tag ${tag}`}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleSave} className="w-full mt-2">
          <Save className="mr-2 h-4 w-4" /> Save Notes & Tags
        </Button>
      </CardContent>
    </Card>
  );
}
