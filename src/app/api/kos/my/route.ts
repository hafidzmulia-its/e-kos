import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KosModel } from '@/lib/models/kos';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const kosListings = await KosModel.getKosListingsByOwner(session.user.email);
    
    return NextResponse.json({
      data: kosListings,
      message: 'Kos listings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user kos listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kos listings' },
      { status: 500 }
    );
  }
}