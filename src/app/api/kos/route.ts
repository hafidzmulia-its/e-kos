import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KosModel } from '@/lib/models/kos';
import { CreateKosRequest, KosFilters } from '@/types/database';

// GET /api/kos - Get all kos listings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: KosFilters = {
      gender: (searchParams.get('gender') as any) || undefined,
      min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
      max_distance: searchParams.get('max_distance') ? parseFloat(searchParams.get('max_distance')!) : undefined,
      available_only: searchParams.get('available_only') === 'true',
    };

    const kosMarkers = await KosModel.getKosMarkers(filters);

    return NextResponse.json({
      data: kosMarkers,
      message: 'Kos listings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching kos listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kos listings' },
      { status: 500 }
    );
  }
}

// POST /api/kos - Create new kos listing (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.appUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.address || !body.gender || !body.monthly_price || 
        typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newKos = await KosModel.createKos(body, session.user.appUserId);

    return NextResponse.json({
      data: newKos,
      message: 'Kos listing created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating kos listing:', error);
    return NextResponse.json(
      { error: 'Failed to create kos listing' },
      { status: 500 }
    );
  }
}