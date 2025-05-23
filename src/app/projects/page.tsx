
"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types/archive";
import { ProjectListItem } from "@/components/projects/project-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { getProjects, createProject as apiCreateProject } from "@/services/firebaseService";
import { useToast } from "@/hooks/use-toast";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        toast({
          title: "Error Loading Projects",
          description: error instanceof Error ? error.message : "Could not fetch projects.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [toast]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }
    setIsCreatingProject(true);
    try {
      const newProjectData = {
        name: newProjectName,
        description: newProjectDescription,
      };
      const newProject = await apiCreateProject(newProjectData);
      setProjects(prevProjects => [newProject, ...prevProjects]);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Project Created",
        description: `Project "${newProject.name}" has been successfully created.`,
      });
    } catch (error) {
      toast({
        title: "Error Creating Project",
        description: error instanceof Error ? error.message : "Could not create project.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8 sm:w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new investigation by giving your project a name and description.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="col-span-3"
                    placeholder="Project Title"
                    disabled={isCreatingProject}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Briefly describe your project (optional)"
                    disabled={isCreatingProject}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreatingProject}>Cancel</Button>
                <Button type="submit" onClick={handleCreateProject} disabled={isCreatingProject}>
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6 mt-1"></div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-9 bg-muted rounded w-1/4"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-muted-foreground">No projects found.</h2>
          <p className="text-muted-foreground mt-2">
            {searchTerm ? "Try adjusting your search term." : "Create your first project to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}
