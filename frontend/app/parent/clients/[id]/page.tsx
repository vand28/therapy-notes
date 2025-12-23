'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { Client, Session } from '@/lib/types';

export default function ParentClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientData, sessionsData] = await Promise.all([
        apiClient.getClient(clientId),
        apiClient.getSessions(clientId)
      ]);
      setClient(clientData);
      setSessions(sessionsData.filter(s => s.sharedWithParents));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error || 'Client not found'}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/parent')}
        className="mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
      >
        ← Back to Children
      </button>

      {/* Client Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-transparent dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            {client.dateOfBirth && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Born: {new Date(client.dateOfBirth).toLocaleDateString()}
              </p>
            )}
            {client.diagnosis.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {client.diagnosis.map((d, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-5xl">👤</div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Therapy Goals</h2>
        {client.goals.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No goals set yet</p>
        ) : (
          <div className="space-y-4">
            {client.goals.map((goal) => (
              <div key={goal.goalId} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{goal.description}</h3>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {goal.currentLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
                    style={{ width: `${goal.currentLevel}%` }}
                  />
                </div>
                {goal.targetDate && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shared Session Notes</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No sessions shared yet</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/parent/clients/${clientId}/sessions/${session.id}`}
                className="block border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:border-purple-400 dark:hover:border-purple-500 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.durationMinutes} minutes
                      {session.template && ` • ${session.template}`}
                    </div>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400">View →</span>
                </div>
                {session.homeActivities.length > 0 && (
                  <div className="mt-2 flex items-center text-sm text-purple-600 dark:text-purple-400">
                    ✓ {session.homeActivities.length} home activities
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

