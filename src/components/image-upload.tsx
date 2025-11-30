'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: string[], coverIndex?: number) => void;
  existingImages?: string[];
  existingCoverIndex?: number;
  maxImages?: number;
  acceptedFormats?: string[];
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

interface ImagePreview {
  file: File;
  preview: string;
  base64: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export default function ImageUpload({
  onImagesChange,
  existingImages = [],
  existingCoverIndex = 0,
  maxImages = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  compressionQuality = 0.8,
  maxWidth = 1200,
  maxHeight = 1200
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, options: CompressionOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > options.maxWidth || height > options.maxHeight) {
          const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', options.quality);
        
        // Log compression results
        const originalSize = file.size;
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4); // Approximate size
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`Image compressed: ${file.name}`);
        console.log(`Original: ${(originalSize / 1024).toFixed(1)}KB → Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    if (compressing) return; // Prevent multiple compressions
    
    const newImages: ImagePreview[] = [];
    setCompressing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCompressionProgress(`Processing image ${i + 1} of ${files.length}: ${file.name}`);
      
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        alert(`File ${file.name} is not a supported image format`);
        continue;
      }
      
      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 10MB`);
        continue;
      }
      
      try {
        // Compress image before converting to base64
        const compressedBase64 = await compressImage(file, {
          quality: compressionQuality,
          maxWidth,
          maxHeight
        });
        
        // Calculate compression ratio
        const originalSize = file.size;
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);
        
        // Log compression results
        console.log(`Image compressed: ${file.name}`);
        console.log(`Original: ${(originalSize / 1024).toFixed(1)}KB → Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio.toFixed(1)}% reduction)`);
        
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          file,
          preview,
          base64: compressedBase64,
          originalSize,
          compressedSize,
          compressionRatio
        });
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file ${file.name}`);
      }
    }

    if (images.length + newImages.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    
    // Send base64 strings to parent
    const base64Images = updatedImages.map(img => img.base64);
    onImagesChange(base64Images, coverIndex);
    
    setCompressing(false);
    setCompressionProgress('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    
    // Adjust cover index if necessary
    let newCoverIndex = coverIndex;
    if (index === coverIndex && updatedImages.length > 0) {
      newCoverIndex = 0;
    } else if (index < coverIndex) {
      newCoverIndex = coverIndex - 1;
    } else if (coverIndex >= updatedImages.length) {
      newCoverIndex = Math.max(0, updatedImages.length - 1);
    }
    
    setCoverIndex(newCoverIndex);
    
    const base64Images = updatedImages.map(img => img.base64);
    onImagesChange(base64Images, newCoverIndex);
  };

  const setCover = (index: number) => {
    setCoverIndex(index);
    const base64Images = images.map(img => img.base64);
    onImagesChange(base64Images, index);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : compressing
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${compressing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !compressing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {compressing ? 'Compressing Images...' : 'Upload Kos Images'}
        </h3>
        {compressing ? (
          <p className="text-orange-600 mb-4 font-medium">
            {compressionProgress}
          </p>
        ) : (
          <p className="text-gray-600 mb-4">
            Drag and drop images here, or click to select files
          </p>
        )}
        <p className="text-sm text-gray-500">
          Supported formats: JPEG, PNG, WebP • Max size: 5MB each • Max {maxImages} images<br/>
          Images will be automatically compressed for optimal storage
        </p>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {index === existingCoverIndex && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              New Images ({images.length}/{maxImages})
            </h4>
            {images.length > 0 && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Space saved: {(images.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0) / 1024).toFixed(1)}KB
                ({(images.reduce((acc, img) => acc + img.compressionRatio, 0) / images.length).toFixed(1)}% avg)
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Cover badge */}
                {index === coverIndex && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Cover
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                  {index !== coverIndex && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCover(index);
                      }}
                      className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600 block w-full"
                      title="Set as cover"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload more button when we have images */}
      {images.length > 0 && images.length < maxImages && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add More Images ({maxImages - images.length} remaining)
        </button>
      )}
    </div>
  );
}