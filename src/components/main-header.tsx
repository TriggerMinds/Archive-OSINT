import Link from "next/link";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MainHeaderProps {
  projectName?: string;
}

export function MainHeader({ projectName }: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Logo className="h-8 w-auto" />
          <span className="sr-only">Archive Sleuth</span>
        </Link>
        {projectName && (
          <>
            <span className="text-muted-foreground hidden md:inline">/</span>
            <span className="font-semibold text-foreground">{projectName}</span>
          </>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Logo className="h-8 w-auto" />
              <span className="sr-only">Archive Sleuth</span>
            </Link>
            {projectName && (
                <span className="font-semibold text-foreground">{projectName}</span>
            )}
             <Link href="/projects" className="text-muted-foreground hover:text-foreground">
              All Projects
            </Link>
            {/* Add more mobile nav links if needed */}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <ThemeToggle />
        {/* Placeholder for User Profile Dropdown */}
        {/* <UserNav /> */}
      </div>
    </header>
  );
}
