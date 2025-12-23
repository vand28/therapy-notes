'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import InviteParentModal from '@/components/InviteParentModal';
import type { Client, Session } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientData, sessionsData] = await Promise.all([
        apiClient.getClient(clientId),
        apiClient.getSessions(clientId),
      ]);
      setClient(clientData);
      setSessions(sessionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Client not found'}
      </div>
    );
  }

  return (
    <div>
      {showInviteModal && client && (
        <InviteParentModal
          clientId={clientId}
          clientName={client.name}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          {client.dateOfBirth && (
            <p className="text-gray-600 mt-1">
              Born: {new Date(client.dateOfBirth).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            👨‍👩‍👧 Invite Parent
          </button>
          <Link
            href={`/dashboard/clients/${clientId}/session/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Session
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Goals</h3>
          <p className="text-3xl font-bold text-gray-900">{client.goals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Linked Parents</h3>
          <p className="text-3xl font-bold text-gray-900">{client.parentUserIds?.length || 0}</p>
        </div>
      </div>

      {/* Linked Parents Section */}
      {client.parentUserIds && client.parentUserIds.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Linked Parents</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {client.parentUserIds.map((parentId, index) => (
                <span key={parentId} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  👨‍👩‍👧 Parent {index + 1}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              These parents have access to view progress and shared sessions.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Goals</h2>
        </div>
        <div className="p-6">
          {client.goals.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No goals set yet</p>
          ) : (
            <div className="space-y-4">
              {client.goals.map((goal) => (
                <div key={goal.goalId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{goal.description}</h3>
                    <span className="text-sm font-semibold text-blue-600">{goal.currentLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${goal.currentLevel}%` }}
                    />
                  </div>
                  {goal.targetDate && (
                    <p className="text-sm text-gray-500">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No sessions documented yet</p>
              <Link
                href={`/dashboard/clients/${clientId}/session/new`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Document First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{session.durationMinutes} minutes</p>
                      {session.template && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {session.template}
                        </span>
                      )}
                    </div>
                    <span className="text-blue-600 text-sm font-medium">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

