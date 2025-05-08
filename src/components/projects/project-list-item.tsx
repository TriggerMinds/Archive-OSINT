import Link from "next/link";
import type { Project } from "@/types/archive";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface ProjectListItemProps {
  project: Project;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl">{project.name}</CardTitle>
        <CardDescription className="truncate h-12">
          {project.description || "No description available."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          <span>Last modified: {format(parseISO(project.lastModified), "MMM d, yyyy")}</span>
        </div>
        <Button asChild variant="default" size="sm">
          <Link href={`/projects/${project.id}`}>
            Open Project <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
