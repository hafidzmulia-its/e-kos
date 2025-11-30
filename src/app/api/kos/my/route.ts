import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KosModel } from '@/lib/models/kos';

// GET /api/kos/my - Get current user's kos listings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.appUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const kosListings = await KosModel.getUserKosListings(session.user.appUserId);

    return NextResponse.json({
      data: kosListings,
      message: 'User kos listings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user kos listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kos listings' },
      { status: 500 }
    );
  }
}