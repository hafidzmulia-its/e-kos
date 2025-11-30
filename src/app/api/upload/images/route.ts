import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CloudinaryService from '@/lib/cloudinary';

interface UploadRequest {
  images: string[]; // base64 encoded images
  folder?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { images, folder = 'kos-images' }: UploadRequest = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadedImages = await CloudinaryService.uploadMultipleImages(
      images,
      folder
    );

    return NextResponse.json({
      message: 'Images uploaded successfully',
      data: uploadedImages
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicIds = searchParams.get('publicIds')?.split(',') || [];

    if (publicIds.length === 0) {
      return NextResponse.json(
        { error: 'No public IDs provided' },
        { status: 400 }
      );
    }

    // Delete images from Cloudinary
    await CloudinaryService.deleteMultipleImages(publicIds);

    return NextResponse.json({
      message: 'Images deleted successfully'
    });

  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}