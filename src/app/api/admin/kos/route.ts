import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { KosModel } from '@/lib/models/kos';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get all kos listings with owner information
    const kosListings = await KosModel.getAllKosForAdmin();

    return NextResponse.json({
      data: kosListings,
      message: 'Kos listings retrieved successfully'
    });

  } catch (error) {
    console.error('Admin kos fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}