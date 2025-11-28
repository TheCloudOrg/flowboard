import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    // Create Supabase admin client (bypasses RLS for public waitlist)
    const supabase = createAdminClient();

    // Check if email already exists (database has unique constraint on email only)
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('id, plan_interest')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected
      console.error('Error checking existing waitlist entry:', checkError);
      return NextResponse.json({ error: 'Failed to process waitlist request' }, { status: 500 });
    }

    // If already on waitlist, check if they're signing up for a different plan
    if (existingEntry) {
      const currentPlan = existingEntry.plan_interest;

      // If they're already signed up for this exact plan, return success
      if (currentPlan === plan) {
        return NextResponse.json({
          success: true,
          message: 'You are already on the waitlist for this plan',
        });
      }

      // If signing up for a different plan, update their preference
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({
          plan_interest: plan,
          created_at: new Date().toISOString(), // Update timestamp
        })
        .eq('id', existingEntry.id);

      if (updateError) {
        console.error('Error updating waitlist entry:', updateError);
        return NextResponse.json({ error: 'Failed to update waitlist' }, { status: 500 });
      }

      const planName = plan === 'pro' ? 'Pro' : 'Business';
      const oldPlanName = currentPlan === 'pro' ? 'Pro' : 'Business';

      return NextResponse.json({
        success: true,
        message: `Updated! You're now on the waitlist for the ${planName} plan (changed from ${oldPlanName})`,
      });
    }

    // Insert new waitlist entry
    const { error: insertError } = await supabase.from('waitlist').insert({
      email: email.toLowerCase(),
      plan_interest: plan,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      // Handle duplicate key error gracefully (in case of race condition)
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You are already on the waitlist',
        });
      }
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
