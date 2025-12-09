'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
  coverImageUrl?: string;
}

export default function ImageGallery({ images, title, coverImageUrl }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Images ({images.length})
        </h2>
        
        {/* Main Image Display */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
          <img
            src={images[selectedIndex]}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsFullscreen(true)}
            loading={selectedIndex === 0 ? 'eager' : 'lazy'}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
          
          {/* Cover Badge */}
          {images[selectedIndex] === coverImageUrl && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Cover Photo
            </div>
          )}
        </div>
        
        {/* Thumbnail Carousel */}
        {images.length > 1 && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {images.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {imageUrl === coverImageUrl && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-end justify-center pb-1">
                      <span className="text-[10px] text-white font-bold bg-blue-500 px-1 rounded">
                        Cover
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Fullscreen Image */}
          {/* Fullscreen Image */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
              <img
                src={images[selectedIndex]}
                alt={`${title} - Image ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                loading="eager"
              />
            </div>
            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Counter in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Strip in Fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {images.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThumbnailClick(index);
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedIndex
                        ? 'border-white ring-2 ring-white/50'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
