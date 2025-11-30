import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/facilities - Get all facility types
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('facility_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      message: 'Facility types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching facility types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility types' },
      { status: 500 }
    );
  }
}
