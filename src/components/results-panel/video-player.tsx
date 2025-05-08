"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  // Basic video player. For Internet Archive, an iframe to the embed URL is common.
  // This example uses a simple <video> tag for generic URLs.
  // Replace with IA specific embed logic if needed.
  // Example IA embed: <iframe src="https://archive.org/embed/IDENTIFIER" width="640" height="480" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>

  const isArchiveUrl = videoUrl.includes("archive.org/details/");
  const isPicsumUrl = videoUrl.includes("picsum.photos"); // Check if it's a picsum URL

  let embedUrl = videoUrl;
  if (isArchiveUrl) {
     embedUrl = videoUrl.replace("/details/", "/embed/");
  }


  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        {isArchiveUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            // height="480" // Removed fixed height for aspect-video
            className="border-0 aspect-video"
            allowFullScreen
            title={`Embedded video player for ${title}`}
            data-ai-hint="video player"
          ></iframe>
        ) : isPicsumUrl ? ( // If it's a picsum URL, use Next/Image
           <div className="relative w-full aspect-video">
            <Image 
              src={videoUrl} 
              alt={title} 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="placeholder image"
            />
          </div>
        ) : ( // Fallback for other video URLs
          <video controls src={videoUrl} className="w-full aspect-video bg-black" title={title} data-ai-hint="video player">
            Your browser does not support the video tag.
          </video>
        )}
      </CardContent>
    </Card>
  );
}
