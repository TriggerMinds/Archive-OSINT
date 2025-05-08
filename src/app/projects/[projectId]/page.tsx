
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QueryBuilderPanel } from '@/components/query-builder/query-builder-panel';
import { ResultsPanel } from '@/components/results-panel/results-panel';
import type { Project, SearchResultItem } from "@/types/archive";
import { MainHeader } from '@/components/main-header'; 
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast';
import { searchInternetArchive } from '@/services/archive';
import { getProjectDetails, saveItemToProject as apiSaveItemToProject, removeItemFromProject as apiRemoveItemFromProject, getSavedItemsForProject } from '@/services/firebaseService';

type SavedItemsMap = Map<string, Pick<SearchResultItem, 'annotations' | 'tags'>>;

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter(); 
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [savedItemsMap, setSavedItemsMap] = useState<SavedItemsMap>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);


  const fetchProjectData = useCallback(async () => {
    if (projectId) {
      setPageLoading(true);
      try {
        const projectData = await getProjectDetails(projectId);
        if (projectData) {
          setProject(projectData);
          const itemsMap = await getSavedItemsForProject(projectId);
          setSavedItemsMap(itemsMap);
        } else {
          toast({ title: "Error", description: "Project not found.", variant: "destructive" });
          router.push('/projects'); 
        }
      } catch (error) {
        toast({ title: "Error Loading Project", description: error instanceof Error ? error.message : "Could not load project details.", variant: "destructive" });
        router.push('/projects');
      } finally {
        setPageLoading(false);
      }
    } else {
       setPageLoading(false); 
    }
  }, [projectId, toast, router]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleSearch = async (queryString: string) => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]); 
    try {
      const rawResults = await searchInternetArchive(queryString);
      // Enrich results with saved data
      const enrichedResults = rawResults.map(item => {
        if (savedItemsMap.has(item.id)) {
          const savedData = savedItemsMap.get(item.id);
          return {
            ...item,
            isSaved: true,
            annotations: savedData?.annotations,
            tags: savedData?.tags,
          };
        }
        return item;
      });
      setSearchResults(enrichedResults);

      if (enrichedResults.length === 0 && queryString.trim() !== "mediatype:(movies OR video)") {
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

  const handleSaveItemToProject = async (itemToSave: SearchResultItem) => {
    if (!project) return;

    try {
      if (itemToSave.isSaved) {
        await apiSaveItemToProject(project.id, itemToSave);
        setSavedItemsMap(prevMap => new Map(prevMap).set(itemToSave.id, { annotations: itemToSave.annotations, tags: itemToSave.tags }));
        toast({
          title: "Item Saved",
          description: `${itemToSave.title} has been saved to your project.`,
        });
      } else {
        // If isSaved is false, it means we are "unsaving" or removing it
        await apiRemoveItemFromProject(project.id, itemToSave.id);
        setSavedItemsMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(itemToSave.id);
          return newMap;
        });
        toast({
          title: "Item Unsaved",
          description: `${itemToSave.title} has been removed from your project.`,
        });
      }
      // Update local search results for immediate UI feedback
      setSearchResults(prevResults => 
        prevResults.map(item => 
          item.id === itemToSave.id ? { ...item, ...itemToSave } : item 
        )
      );
    } catch (error) {
      toast({
        title: "Error Updating Item",
        description: `Could not update ${itemToSave.title}. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
       // Optionally revert local state change if Firebase update failed
       // For simplicity, current local state update remains optimistic
    }
  };


  if (pageLoading) {
     return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
     return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found or could not be loaded.</p>
      </div>
    );
  }


  return (
    <>
      {/* MainHeader is now in the layout, project name can be passed via context or fetched in layout if needed */}
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
