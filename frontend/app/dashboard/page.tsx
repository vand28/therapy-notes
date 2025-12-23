'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { Client } from '@/lib/types';
import UsageMeter from '@/components/UsageMeter';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <UsageMeter />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{clients.length} active clients</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
        >
          + Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No clients yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first client</p>
          <Link
            href="/dashboard/clients/new"
            className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
          >
            Add First Client
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-transparent dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                  {client.dateOfBirth && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(client.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-2xl">👤</div>
              </div>
              
              {client.diagnosis.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {client.diagnosis.map((d, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{client.goals.length} goals</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

