"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { QueryBuilderPanel } from '@/components/query-builder/query-builder-panel';
import { ResultsPanel } from '@/components/results-panel/results-panel';
import type { Project, SearchResultItem, QueryField, QueryDateRange } from "@/types/archive";
import { MainHeader } from '@/components/main-header'; 
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast';

// Mock project data fetching
const fetchProjectDetails = async (projectId: string): Promise<Project | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  const mockProjects: Project[] = [
    { id: "project-alpha", name: "JFK Assassination Archive Dive", description: "Investigating obscure newsreels and eyewitness footage related to the JFK assassination.", createdAt: "2023-01-15T10:00:00Z", lastModified: "2024-07-26T14:30:00Z" },
    { id: "project-beta", name: "Cold War Propaganda Analysis", description: "Analyzing propaganda films from the Cold War era from various national archives.", createdAt: "2023-03-22T11:00:00Z", lastModified: "2024-07-20T09:15:00Z" },
    { id: "project-gamma", name: "Lost Media Search: Early Animation", description: "Attempting to uncover lost animated shorts from the early 20th century.", createdAt: "2023-05-10T12:00:00Z", lastModified: "2024-06-10T18:45:00Z" },
  ];
  return mockProjects.find(p => p.id === projectId) || null;
};

// Mock search function
const mockSearch = async (query: string, fields: QueryField[], dateRange: QueryDateRange): Promise<SearchResultItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  console.log("Searching with:", { query, fields, dateRange });

  // Generate some mock results based on the query
  const baseResults: SearchResultItem[] = [
    { 
      id: "vid1_test_footage_1963", 
      title: "Test Footage from Dallas, 1963 (Obscure Angle)", 
      descriptionSnippet: "Recently surfaced 8mm film showing crowds near Dealey Plaza. Contains previously unseen individuals.", 
      thumbnailUrl: "https://picsum.photos/seed/vid1/400/225", 
      videoUrl: "https://archive.org/details/Nearly_Complete_Record_of_connus_Zapruder_Film_Locations", // Example valid IA link
      metadata: { identifier: "Nearly_Complete_Record_of_connus_Zapruder_Film_Locations", title: "Test Footage from Dallas, 1963 (Obscure Angle)", description: "Full description of the Dallas footage...", subjects: ["JFK", "Dallas", "1963", "assassination"], datePublished: "1963-11-22", creator: "Unknown Amateur" }
    },
    { 
      id: "vid2_news_report_mystery", 
      title: "Unidentified News Report Snippet (Cold War Era)", 
      descriptionSnippet: "Short, unlabeled news segment possibly related to Cold War activities. Audio is distorted. Potential propaganda material.", 
      thumbnailUrl: "https://picsum.photos/seed/vid2/400/225",
      videoUrl: "https://archive.org/details/FromTheVault-SovietNewsreels", // Example valid IA link
      metadata: { identifier: "FromTheVault-SovietNewsreels", title: "Unidentified News Report Snippet (Cold War Era)", description: "Detailed analysis of the news report snippet...", subjects: ["Cold War", "news", "propaganda", "unidentified", "Soviet"], collection: "Cold War Archives" }
    },
    { 
      id: "vid3_animation_fragment_rare", 
      title: "Fragment of 'Captain Giggles' (Lost Animation)", 
      descriptionSnippet: "A few seconds of a believed-to-be-lost animated short from the 1930s. Poor quality. Features distinctive character design.", 
      thumbnailUrl: "https://picsum.photos/seed/vid3/400/225",
      videoUrl: "https://archive.org/details/BettyBoopCartoons", // Example valid IA link
      metadata: { identifier: "BettyBoopCartoons", title: "Fragment of 'Captain Giggles' (Lost Animation)", description: "Context for the Captain Giggles fragment...", subjects: ["animation", "lost media", "1930s", "cartoon"], creator: "Van Beuren Studios (attr.)" }
    },
     { 
      id: "vid4_home_movie_event", 
      title: "Home Movie: Local Town Festival 1955", 
      descriptionSnippet: "Amateur footage of a small town festival. Clear shots of attendees, local businesses, and period vehicles. Good for local history research.", 
      thumbnailUrl: "https://picsum.photos/seed/vid4/400/225",
      videoUrl: "https://archive.org/details/HomeMovieDay", // Example valid IA link
      metadata: { identifier: "HomeMovieDay", title: "Home Movie: Local Town Festival 1955", description: "Detailed log of the festival home movie...", subjects: ["home movie", "1950s", "festival", "Americana", "local history"], datePublished: "1955-07-04" }
    },
  ];
  
  // Simple filter based on main query string for demonstration
  const normalizedQuery = query.toLowerCase();
  return baseResults.filter(item => 
    item.title.toLowerCase().includes(normalizedQuery) ||
    item.descriptionSnippet.toLowerCase().includes(normalizedQuery) ||
    item.metadata.subjects.some(s => s.toLowerCase().includes(normalizedQuery))
  ).map(item => ({...item, annotations: "", tags: [], isSaved: false })); // Initialize project-specific fields
};


export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter(); // For navigation
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
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
          router.push('/projects'); // Redirect if project not found
        }
      }).finally(() => setPageLoading(false));
    } else {
       setPageLoading(false); // No projectId, stop loading
    }
  }, [projectId, toast, router]);

  const handleSearch = async (query: string, fields: QueryField[], dateRange: QueryDateRange) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await mockSearch(query, fields, dateRange);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      toast({ title: "Search Error", description: "Failed to fetch search results.", variant: "destructive" });
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
    // In a real app, this would also persist the saved item/annotations/tags to backend storage for the project.
    toast({
      title: itemToSave.isSaved ? "Item Saved" : "Item Unsaved",
      description: `${itemToSave.title} has been ${itemToSave.isSaved ? 'saved to' : 'removed from'} your project.`,
    });
  };

  if (pageLoading) {
     return (
      // This uses the ProjectsLayout's MainHeader
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
      {/* MainHeader is part of ProjectsLayout. If project name needs to be updated there, context/zustand or more complex prop drilling would be needed. */}
      {/* For now, project name is static in header after initial load. Can update the MainHeader directly in ProjectsLayout or pass a callback. */}
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
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
