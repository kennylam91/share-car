'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        router.push('/auth/login');
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!selectedRole || !userId) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email,
          avatar_url: session.user.user_metadata.avatar_url,
          role: selectedRole,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to save your role. Please try again.');
      } else {
        // Redirect based on role
        if (selectedRole === 'driver') {
          router.push('/driver');
        } else {
          router.push('/passenger');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome! 👋</h1>
          <p className="text-gray-600">How would you like to use Share Car?</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setSelectedRole('passenger')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === 'passenger'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧑‍🦱</div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Passenger</h3>
                <p className="text-sm text-gray-600">Find rides to your destination</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('driver')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === 'driver'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🚗</div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Driver</h3>
                <p className="text-sm text-gray-600">Offer rides and earn money</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
