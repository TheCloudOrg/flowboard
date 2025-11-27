import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import LandingPage from './landing/page';

export default async function Home() {
  // Check if user is authenticated
  const user = await currentUser();

  // If authenticated, redirect to board
  if (user) {
    redirect('/board');
  }

  // Otherwise, show landing page
  return <LandingPage />;
}
