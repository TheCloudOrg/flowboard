import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, plan } = await request.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = await createClient();

    // Check if email already exists for this plan
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('plan', plan)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected
      console.error('Error checking existing waitlist entry:', checkError);
      return NextResponse.json({ error: 'Failed to process waitlist request' }, { status: 500 });
    }

    // If already on waitlist for this plan, return success (don't error out)
    if (existingEntry) {
      return NextResponse.json({
        success: true,
        message: 'You are already on the waitlist for this plan',
      });
    }

    // Insert new waitlist entry
    const { error: insertError } = await supabase.from('waitlist').insert({
      email: email.toLowerCase(),
      plan,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist',
    });
  } catch (error: any) {
    console.error('Error processing waitlist request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
