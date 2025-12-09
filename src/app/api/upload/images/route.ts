import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import VercelBlobService from '@/lib/vercel-blob';

interface UploadRequest {
  images: Array<{ base64: string; filename: string }>; // base64 encoded images with filenames
  folder?: string;
  maxSizeMB?: number;
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

    const { 
      images, 
      folder = 'kos-images',
      maxSizeMB = 10
    }: UploadRequest = await request.json();

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

    console.log(`Uploading ${images.length} images to Vercel Blob...`);

    // Upload images to Vercel Blob
    const uploadedImages = await VercelBlobService.uploadMultipleImages(
      images,
      {
        folder,
        maxSizeMB
      }
    );

    return NextResponse.json({
      message: 'Images uploaded successfully to Vercel Blob',
      data: uploadedImages
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    const urls = searchParams.get('urls')?.split(',') || [];

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No image URLs provided' },
        { status: 400 }
      );
    }

    console.log(`Deleting ${urls.length} images from Vercel Blob...`);

    // Delete images from Vercel Blob
    await VercelBlobService.deleteMultipleImages(urls);

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