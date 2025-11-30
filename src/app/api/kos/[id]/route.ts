import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KosModel } from '@/lib/models/kos';
import { UpdateKosRequest } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/kos/[id] - Get specific kos listing by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const kosId = parseInt(resolvedParams.id);
    
    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // For now, we'll get by ID, but in real implementation you might want to get by slug
    const kos = await KosModel.getKosDetails(kosId.toString()); // This needs to be updated to handle ID vs slug
    
    if (!kos) {
      return NextResponse.json(
        { error: 'Kos not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: kos,
      message: 'Kos details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching kos details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kos details' },
      { status: 500 }
    );
  }
}

// PUT /api/kos/[id] - Update kos listing (requires ownership or admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.appUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const kosId = parseInt(resolvedParams.id);
    
    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const body: Partial<UpdateKosRequest> = await request.json();
    const updateData: UpdateKosRequest = { ...body, id: kosId };

    const updatedKos = await KosModel.updateKos(
      updateData, 
      session.user.appUserId, 
      session.user.role
    );

    return NextResponse.json({
      data: updatedKos,
      message: 'Kos listing updated successfully'
    });
  } catch (error) {
    console.error('Error updating kos listing:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update kos listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/kos/[id] - Delete kos listing (requires ownership or admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.appUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const kosId = parseInt(resolvedParams.id);
    
    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    await KosModel.deleteKos(kosId, session.user.appUserId, session.user.role);

    return NextResponse.json({
      message: 'Kos listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kos listing:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete kos listing' },
      { status: 500 }
    );
  }
}