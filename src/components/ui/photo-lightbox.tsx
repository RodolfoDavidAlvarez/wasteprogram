"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, RotateCw, ZoomIn, ZoomOut, Trash2, Loader2 } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (photoUrl: string) => void;
  deleting?: boolean;
}

export function PhotoLightbox({
  photos,
  initialIndex = 0,
  open,
  onClose,
  onDelete,
  deleting = false,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [rotations, setRotations] = useState<Record<string, number>>({});

  // Load saved rotations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("photoRotations");
    if (saved) {
      setRotations(JSON.parse(saved));
    }
  }, []);

  // Reset zoom and set rotation when photo changes
  useEffect(() => {
    setZoom(1);
    const currentPhoto = photos[currentIndex];
    setRotation(rotations[currentPhoto] || 0);
  }, [currentIndex, photos, rotations]);

  // Update index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const saveRotation = useCallback((photoUrl: string, newRotation: number) => {
    const newRotations = { ...rotations, [photoUrl]: newRotation };
    setRotations(newRotations);
    localStorage.setItem("photoRotations", JSON.stringify(newRotations));
  }, [rotations]);

  const handleRotate = () => {
    const currentPhoto = photos[currentIndex];
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    saveRotation(currentPhoto, newRotation);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.5, 0.5));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(photos[currentIndex]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, photos.length, onClose]);

  if (!open || photos.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar with controls */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        {/* Photo counter */}
        <div className="flex items-center gap-2">
          {photos.length > 1 && (
            <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 rounded-full backdrop-blur-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 text-white hover:bg-white/20 rounded-l-full transition-colors"
              title="Zoom out (-)"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-white text-xs font-medium min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 text-white hover:bg-white/20 rounded-r-full transition-colors"
              title="Zoom in (+)"
              disabled={zoom >= 4}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Rotate button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRotate();
            }}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
            title="Rotate (R)"
          >
            <RotateCw className="h-5 w-5" />
          </button>

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm transition-colors"
              title="Delete photo"
            >
              {deleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main photo area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </>
        )}

        {/* Photo container with proper overflow handling */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 sm:p-8">
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{
              // When rotated 90/270 degrees, swap width and height constraints
              width: rotation === 90 || rotation === 270 ? '70vh' : '90vw',
              height: rotation === 90 || rotation === 270 ? '90vw' : '70vh',
              maxWidth: rotation === 90 || rotation === 270 ? '70vh' : '100%',
              maxHeight: rotation === 90 || rotation === 270 ? '90vw' : '100%',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <Image
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-center py-3 text-white/50 text-xs sm:text-sm">
        <span className="hidden sm:inline">
          Use arrow keys to navigate · +/- to zoom · R to rotate · Esc to close
        </span>
        <span className="sm:hidden">Tap outside to close</span>
      </div>
    </div>
  );
}
