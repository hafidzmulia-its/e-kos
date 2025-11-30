import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_bytes?: number;
  compression_ratio?: string;
}

export interface CompressionOptions {
  quality?: string | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
}

export class CloudinaryService {
  static async uploadImage(
    base64Image: string,
    folder: string = 'kos-images',
    compressionOptions: CompressionOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        quality = 'auto:good',
        format = 'auto',
        maxWidth = 1200,
        maxHeight = 1200
      } = compressionOptions;

      // Calculate original size for compression tracking
      const originalBytes = Math.round((base64Image.length * 3) / 4);

      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        quality,
        fetch_format: format,
        transformation: [
          {
            width: maxWidth,
            height: maxHeight,
            crop: 'limit', // Don't upscale, only downscale if needed
            quality
          },
          {
            f_auto: true, // Automatic format selection
            q_auto: true  // Automatic quality optimization
          }
        ]
      };

      const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

      // Calculate compression ratio
      const compressionRatio = originalBytes > 0 
        ? ((originalBytes - result.bytes) / originalBytes * 100).toFixed(1) + '%'
        : 'Unknown';

      console.log(`Cloudinary compression: ${(originalBytes / 1024).toFixed(1)}KB → ${(result.bytes / 1024).toFixed(1)}KB (${compressionRatio} reduction)`);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        original_bytes: originalBytes,
        compression_ratio: compressionRatio
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  static async uploadMultipleImages(
    base64Images: string[],
    folder: string = 'kos-images',
    compressionOptions: CompressionOptions = {}
  ): Promise<UploadResult[]> {
    try {
      console.log(`Starting batch upload of ${base64Images.length} images with compression...`);
      
      const uploadPromises = base64Images.map((image, index) => 
        this.uploadImage(image, folder, compressionOptions)
      );
      
      const results = await Promise.all(uploadPromises);
      
      // Log total compression stats
      const totalOriginal = results.reduce((sum, r) => sum + (r.original_bytes || 0), 0);
      const totalCompressed = results.reduce((sum, r) => sum + r.bytes, 0);
      const overallRatio = totalOriginal > 0 
        ? ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1)
        : '0';
      
      console.log(`Batch compression complete: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalCompressed / 1024).toFixed(1)}KB (${overallRatio}% total reduction)`);
      
      return results;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw new Error('Failed to upload multiple images');
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error for delete failures to prevent blocking operations
    }
  }

  static async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      const deletePromises = publicIds.map(id => this.deleteImage(id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Multiple delete error:', error);
    }
  }

  // Generate optimized URLs for different use cases
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
    } = {}
  ): string {
    const {
      width = 800,
      height = 600,
      crop = 'fill',
      quality = 'auto'
    } = options;

    return cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality,
      fetch_format: 'auto'
    });
  }

  // Get thumbnail URL
  static getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 80
    });
  }

  // Get cover image URL
  static getCoverImageUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto'
    });
  }
}

export default CloudinaryService;