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
    setZoom((z) => Math.min(z + 0.5, 3));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex, photos.length, onClose]);

  if (!open || photos.length === 0) return null;

  // Check if rotated sideways (90 or 270 degrees)
  const isSideways = rotation === 90 || rotation === 270;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Close button - top right, always visible */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/50 text-white active:bg-black/70"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Photo counter - top left */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 z-30 px-3 py-2 rounded-full bg-black/50 text-white text-sm font-medium">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Main photo area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {/* Navigation arrows - left/right edges */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 z-20 p-2 rounded-full bg-black/40 text-white active:bg-black/60"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 z-20 p-2 rounded-full bg-black/40 text-white active:bg-black/60"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        {/* Photo with transform */}
        <div
          className="relative transition-transform duration-200"
          style={{
            width: isSideways ? "70vh" : "100vw",
            height: isSideways ? "100vw" : "70vh",
            maxWidth: isSideways ? "70vh" : "100vw",
            maxHeight: isSideways ? "100vw" : "70vh",
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

      {/* Bottom controls bar - always at bottom, easy thumb access */}
      <div className="bg-black/80 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-center gap-3">
          {/* Zoom out */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-3 rounded-full bg-white/10 text-white active:bg-white/20 disabled:opacity-40"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          {/* Zoom indicator */}
          <span className="text-white text-sm font-medium min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom in */}
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-3 rounded-full bg-white/10 text-white active:bg-white/20 disabled:opacity-40"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-3 rounded-full bg-white/10 text-white active:bg-white/20"
          >
            <RotateCw className="h-5 w-5" />
          </button>

          {/* Delete */}
          {onDelete && (
            <>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 rounded-full bg-red-500/80 text-white active:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
