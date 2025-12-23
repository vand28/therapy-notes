'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role === 'parent') {
      // Redirect parents to parent portal
      router.push('/parent');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                TherapyNotes
              </button>
              <div className="hidden md:flex items-center space-x-1">
                <NavLink href="/dashboard" icon="👥">Clients</NavLink>
                <NavLink href="/dashboard/analytics" icon="📊">Analytics</NavLink>
                <NavLink href="/dashboard/calendar" icon="📅">Calendar</NavLink>
                <NavLink href="/dashboard/reports" icon="📄">Reports</NavLink>
                <NavLink href="/dashboard/settings" icon="⚙️">Settings</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                {user.name} <span className="text-gray-400">({user.subscriptionTier})</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <button
      onClick={() => router.push(href)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="mr-1">{icon}</span>
      {children}
    </button>
  );
}

