import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('kos_listings')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Database test error:', testError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }

    // Try to get actual kos data
    const { data: kosData, error: kosError } = await supabase
      .from('kos_listings')
      .select('*')
      .limit(5);

    if (kosError) {
      console.error('Kos data error:', kosError);
      return NextResponse.json({
        error: 'Failed to fetch kos data',
        details: kosError.message,
        code: kosError.code
      }, { status: 500 });
    }

    // Check if tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_table_info');

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        kosCount: kosData?.length || 0,
        kosData: kosData || [],
        tablesError: tablesError?.message || null,
        tablesData: tablesData || null
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}