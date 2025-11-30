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

    // Check if user has admin role
    // You can customize this check based on your user model
    // For now, we'll assume the user's role is stored in the session
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all kos listings for admin
    const kosListings = await KosModel.getAllKosListings();
    
    return NextResponse.json({
      data: kosListings,
      message: 'Admin kos listings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching admin kos listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kos listings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: id and is_active are required' },
        { status: 400 }
      );
    }

    await KosModel.updateKosStatus(id, is_active);
    
    return NextResponse.json({
      message: 'Kos status updated successfully'
    });
  } catch (error) {
    console.error('Error updating kos status:', error);
    return NextResponse.json(
      { error: 'Failed to update kos status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const kosId = searchParams.get('id');

    if (!kosId) {
      return NextResponse.json(
        { error: 'Kos ID is required' },
        { status: 400 }
      );
    }

    await KosModel.deleteKos(parseInt(kosId), session.user.email, 'ADMIN');
    
    return NextResponse.json({
      message: 'Kos deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kos:', error);
    return NextResponse.json(
      { error: 'Failed to delete kos' },
      { status: 500 }
    );
  }
}
