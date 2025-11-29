import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import { ensureUserExists } from '@/lib/supabase/sync-user';

export default async function BoardPage() {
  // Ensure user is authenticated
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Ensure user exists in Supabase (fallback for webhook failures)
  await ensureUserExists();

  return (
    <main>
      <KanbanBoard />
    </main>
  );
}
