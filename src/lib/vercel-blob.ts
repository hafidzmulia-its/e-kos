import { put, del, list } from '@vercel/blob';

/**
 * Vercel Blob Storage Service
 * 
 * This service handles image uploads to Vercel Blob Storage.
 * Images are stored with automatic CDN distribution and presigned URLs.
 * 
 * Benefits over Cloudinary:
 * - Native Vercel integration
 * - Simpler setup (no external service)
 * - Automatic CDN
 * - Better pricing for small-medium projects
 * - Built-in security with tokens
 */

export interface UploadResult {
  url: string;          // Public CDN URL
  pathname: string;     // Blob pathname (for deletion)
  contentType: string;  // MIME type
  size: number;         // File size in bytes
}

export interface UploadOptions {
  folder?: string;      // Virtual folder path
  maxSizeMB?: number;   // Max file size in MB
  allowedTypes?: string[]; // Allowed MIME types
}

export class VercelBlobService {
  /**
   * Upload a single image from base64 string
   */
  static async uploadImage(
    base64Image: string,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'kos-images',
        maxSizeMB = 10,
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      } = options;

      // Extract data URL parts
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }

      const contentType = matches[1];
      const base64Data = matches[2];

      // Validate content type
      if (!allowedTypes.includes(contentType)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      const sizeInMB = buffer.length / (1024 * 1024);

      // Validate file size
      if (sizeInMB > maxSizeMB) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
      }

      // Create pathname with folder structure
      const timestamp = Date.now();
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const pathname = `${folder}/${timestamp}-${sanitizedFilename}`;

      console.log(`Uploading image to Vercel Blob: ${pathname} (${sizeInMB.toFixed(2)}MB)`);

      // Upload to Vercel Blob
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType,
        addRandomSuffix: false, // We already have timestamp
      });

      console.log(`Upload successful: ${blob.url}`);

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || contentType,
        size: buffer.length,
      };

    } catch (error) {
      console.error('Vercel Blob upload error:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    images: Array<{ base64: string; filename: string }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      console.log(`Starting batch upload of ${images.length} images...`);

      const uploadPromises = images.map((img, index) => 
        this.uploadImage(img.base64, img.filename || `image-${index}.jpg`, options)
      );

      const results = await Promise.all(uploadPromises);
      
      console.log(`Batch upload completed: ${results.length} images uploaded`);
      
      return results;

    } catch (error) {
      console.error('Batch upload error:', error);
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a single image by URL or pathname
   */
  static async deleteImage(urlOrPathname: string): Promise<void> {
    try {
      console.log(`Deleting image from Vercel Blob: ${urlOrPathname}`);
      
      await del(urlOrPathname);
      
      console.log(`Delete successful: ${urlOrPathname}`);
    } catch (error) {
      console.error('Vercel Blob delete error:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple images
   */
  static async deleteMultipleImages(urlsOrPathnames: string[]): Promise<void> {
    try {
      if (urlsOrPathnames.length === 0) return;

      console.log(`Deleting ${urlsOrPathnames.length} images from Vercel Blob...`);

      const deletePromises = urlsOrPathnames.map(url => this.deleteImage(url));
      await Promise.all(deletePromises);

      console.log(`Batch delete completed: ${urlsOrPathnames.length} images deleted`);
    } catch (error) {
      console.error('Batch delete error:', error);
      throw new Error(`Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all blobs in a folder (useful for admin/cleanup)
   */
  static async listImages(folder: string = 'kos-images', limit: number = 100) {
    try {
      const { blobs } = await list({
        prefix: folder,
        limit,
      });

      return blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }));
    } catch (error) {
      console.error('Vercel Blob list error:', error);
      throw new Error(`Failed to list images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage statistics (for admin dashboard)
   */
  static async getStorageStats(folder: string = 'kos-images'): Promise<{
    totalFiles: number;
    totalSize: number;
    totalSizeMB: number;
  }> {
    try {
      const images = await this.listImages(folder, 1000);
      
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      const totalSizeMB = totalSize / (1024 * 1024);

      return {
        totalFiles: images.length,
        totalSize,
        totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
      };
    } catch (error) {
      console.error('Storage stats error:', error);
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default VercelBlobService;
