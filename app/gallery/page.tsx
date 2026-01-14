"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// List of images in the pics folder
const galleryImages = [
  "/pics/02bf785f-460c-434e-b791-a130472d94fe.jpeg",
  "/pics/2b8b02d2-ef7e-4051-b415-216f1fcf8d56.jpeg",
  "/pics/4bc60c44-10b8-45bd-9a7a-0c3fae1d4f3e.jpeg",
  "/pics/6791d0da-3950-43cf-9111-f656304b4b3d.jpeg",
  "/pics/9b13e026-4067-46de-8683-7055db338456.jpeg",
  "/pics/b899bc4b-ed8a-4d48-b18e-c2ec31e6b92a.jpeg",
  "/pics/bd449063-99c6-45c0-a7e3-d937e096d922.jpeg",
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openLightbox = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset"; // Restore scrolling
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = galleryImages.indexOf(selectedImage);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % galleryImages.length;
    } else {
      newIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    }
    setSelectedImage(galleryImages[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="border-b bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Photo Gallery
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              A glimpse into life at Math Academy - where learning meets excellence
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((imageSrc, index) => (
            <div
              key={imageSrc}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              onClick={() => openLightbox(imageSrc)}
            >
              <Image
                src={imageSrc}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </div>
          ))}
        </div>

        {galleryImages.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No photos available at the moment. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="relative max-h-full max-w-5xl w-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Image */}
            <div
              className="relative aspect-auto max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Gallery image"
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>

            {/* Image Counter */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white">
              <p className="text-sm">
                {galleryImages.indexOf(selectedImage) + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
