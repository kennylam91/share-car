import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export default async function Home() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !profile.role) {
    redirect('/onboarding');
  }

  // Redirect to appropriate dashboard based on role
  if (profile.role === 'driver') {
    redirect('/driver');
  } else {
    redirect('/passenger');
  }
}
