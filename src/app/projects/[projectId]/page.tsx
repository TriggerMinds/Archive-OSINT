"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QueryBuilderPanel } from '@/components/query-builder/query-builder-panel';
import { ResultsPanel } from '@/components/results-panel/results-panel';
import type { Project, SearchResultItem } from "@/types/archive"; // QueryField, QueryDateRange removed as they are handled by QueryBuilderPanel
import { MainHeader } from '@/components/main-header'; 
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast';
import { searchInternetArchive } from '@/services/archive'; // Import the new service

// Mock project data fetching
const fetchProjectDetails = async (projectId: string): Promise<Project | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const mockProjects: Project[] = [
    { id: "project-alpha", name: "JFK Assassination Archive Dive", description: "Investigating obscure newsreels and eyewitness footage related to the JFK assassination.", createdAt: "2023-01-15T10:00:00Z", lastModified: "2024-07-26T14:30:00Z" },
    { id: "project-beta", name: "Cold War Propaganda Analysis", description: "Analyzing propaganda films from the Cold War era from various national archives.", createdAt: "2023-03-22T11:00:00Z", lastModified: "2024-07-20T09:15:00Z" },
    { id: "project-gamma", name: "Lost Media Search: Early Animation", description: "Attempting to uncover lost animated shorts from the early 20th century.", createdAt: "2023-05-10T12:00:00Z", lastModified: "2024-06-10T18:45:00Z" },
  ];
  return mockProjects.find(p => p.id === projectId) || null;
};

// mockSearch function is removed.

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter(); 
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);


  useEffect(() => {
    if (projectId) {
      setPageLoading(true);
      fetchProjectDetails(projectId).then(data => {
        if (data) {
          setProject(data);
        } else {
          toast({ title: "Error", description: "Project not found.", variant: "destructive" });
          router.push('/projects'); 
        }
      }).finally(() => setPageLoading(false));
    } else {
       setPageLoading(false); 
    }
  }, [projectId, toast, router]);

  const handleSearch = async (queryString: string) => { // Signature changed
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]); // Clear previous results
    try {
      const results = await searchInternetArchive(queryString);
      setSearchResults(results);
      if (results.length === 0 && queryString.trim() !== "mediatype:(movies OR video)") { // Don't toast for default "all videos" query if it yields nothing
        toast({
            title: "No Results",
            description: "Your search did not return any results. Try a different query or use the AI Query Enhancer.",
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({ title: "Search Error", description: `Failed to fetch search results: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveItemToProject = (itemToSave: SearchResultItem) => {
    setSearchResults(prevResults => 
      prevResults.map(item => 
        item.id === itemToSave.id ? { ...item, ...itemToSave } : item
      )
    );
    toast({
      title: itemToSave.isSaved ? "Item Saved" : "Item Unsaved",
      description: `${itemToSave.title} has been ${itemToSave.isSaved ? 'saved to' : 'removed from'} your project.`,
    });
  };

  if (pageLoading) {
     return (
      <div className="flex items-center justify-center flex-1 h-full">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
     return (
      <div className="flex items-center justify-center flex-1 h-full">
        <p>Project not found or could not be loaded.</p>
      </div>
    );
  }


  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border-0">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <QueryBuilderPanel onSearch={handleSearch} isSearching={isSearching} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={50}>
            <ResultsPanel results={searchResults} isLoading={isSearching} hasSearched={hasSearched} onSaveItemToProject={handleSaveItemToProject} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
