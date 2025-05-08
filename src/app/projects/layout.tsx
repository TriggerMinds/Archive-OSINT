import { MainHeader } from "@/components/main-header";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you might fetch project details here to pass to MainHeader
  // For now, MainHeader will handle projectName contextually if provided by the page
  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainHeader />
      <main className="flex flex-1 flex-col bg-muted/40">
        {children}
      </main>
    </div>
  );
}
