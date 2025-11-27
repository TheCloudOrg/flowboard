'use server';

import { createClient } from '@/lib/supabase/server';
import { OnboardingStatus, OnboardingStepData } from '@/types';

/**
 * Get onboarding status for a user
 * @param userId - Clerk user ID
 * @returns OnboardingStatus object or null if not found
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no record exists, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching onboarding status:', error);
      return null;
    }

    return data as OnboardingStatus;
  } catch (error) {
    console.error('Error in getOnboardingStatus:', error);
    return null;
  }
}

/**
 * Create initial onboarding record for a new user
 * @param userId - Clerk user ID
 * @returns OnboardingStatus object or null on error
 */
export async function createOnboardingRecord(userId: string): Promise<OnboardingStatus | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_onboarding')
      .insert({
        user_id: userId,
        completed: false,
        current_step: 0,
        skipped: false,
        first_board_created: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating onboarding record:', error);
      return null;
    }

    return data as OnboardingStatus;
  } catch (error) {
    console.error('Error in createOnboardingRecord:', error);
    return null;
  }
}

/**
 * Update onboarding progress for a user
 * @param userId - Clerk user ID
 * @param step - Current step number (0-5)
 * @param data - Additional data to save (theme preference, etc.)
 * @returns Success boolean
 */
export async function updateOnboardingProgress(
  userId: string,
  step: number,
  data?: OnboardingStepData
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Build update object
    const updateData: any = {
      current_step: step,
    };

    // Add optional fields if provided
    if (data?.theme_preference) {
      updateData.theme_preference = data.theme_preference;
    }
    if (data?.first_board_created !== undefined) {
      updateData.first_board_created = data.first_board_created;
    }

    // Check if record exists
    const existing = await getOnboardingStatus(userId);

    if (!existing) {
      // Create new record if it doesn't exist
      const newRecord = await createOnboardingRecord(userId);
      if (!newRecord) {
        return false;
      }

      // Update with the step and data
      const { error } = await supabase
        .from('user_onboarding')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating new onboarding record:', error);
        return false;
      }
      return true;
    }

    // Update existing record
    const { error } = await supabase
      .from('user_onboarding')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating onboarding progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateOnboardingProgress:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed for a user
 * @param userId - Clerk user ID
 * @returns Success boolean
 */
export async function completeOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if record exists
    const existing = await getOnboardingStatus(userId);

    if (!existing) {
      // Create new record and mark as completed
      const { error } = await supabase.from('user_onboarding').insert({
        user_id: userId,
        completed: true,
        current_step: 6, // All steps completed
        completed_at: new Date().toISOString(),
        skipped: false,
      });

      if (error) {
        console.error('Error creating completed onboarding record:', error);
        return false;
      }
      return true;
    }

    // Update existing record
    const { error } = await supabase
      .from('user_onboarding')
      .update({
        completed: true,
        current_step: 6, // All steps completed
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    return false;
  }
}

/**
 * Mark onboarding as skipped for a user
 * @param userId - Clerk user ID
 * @returns Success boolean
 */
export async function skipOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if record exists
    const existing = await getOnboardingStatus(userId);

    if (!existing) {
      // Create new record and mark as skipped
      const { error } = await supabase.from('user_onboarding').insert({
        user_id: userId,
        completed: true,
        skipped: true,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating skipped onboarding record:', error);
        return false;
      }
      return true;
    }

    // Update existing record
    const { error } = await supabase
      .from('user_onboarding')
      .update({
        completed: true,
        skipped: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error skipping onboarding:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in skipOnboarding:', error);
    return false;
  }
}

/**
 * Check if user needs onboarding (new user or incomplete onboarding)
 * @param userId - Clerk user ID
 * @returns Boolean indicating if user should be redirected to onboarding
 */
export async function shouldShowOnboarding(userId: string): Promise<boolean> {
  try {
    const status = await getOnboardingStatus(userId);

    // If no record exists, user is new and needs onboarding
    if (!status) {
      return true;
    }

    // If onboarding is completed or skipped, don't show
    if (status.completed || status.skipped) {
      return false;
    }

    // Otherwise, user has incomplete onboarding
    return true;
  } catch (error) {
    console.error('Error in shouldShowOnboarding:', error);
    // On error, don't force onboarding
    return false;
  }
}
