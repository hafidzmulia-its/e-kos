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
}

export class CloudinaryService {
  static async uploadImage(
    base64Image: string,
    folder: string = 'kos-images',
    transformation?: any
  ): Promise<UploadResult> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (transformation) {
        uploadOptions.transformation = transformation;
      }

      const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  static async uploadMultipleImages(
    base64Images: string[],
    folder: string = 'kos-images'
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = base64Images.map(image => 
        this.uploadImage(image, folder)
      );
      return await Promise.all(uploadPromises);
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