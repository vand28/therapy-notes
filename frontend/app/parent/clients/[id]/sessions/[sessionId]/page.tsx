'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Session } from '@/lib/types';

export default function ParentSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivity = async (index: number, completed: boolean, notes: string) => {
    try {
      setUpdating(index);
      await apiClient.updateHomeActivity(sessionId, index, completed, notes);
      await loadSession();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update activity');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !session) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Session not found'}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/parent/clients/${clientId}`)}
        className="mb-6 text-purple-600 hover:text-purple-700 flex items-center"
      >
        ← Back to Child Profile
      </button>

      {/* Session Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Session: {new Date(session.sessionDate).toLocaleDateString()}
            </h1>
            <p className="text-gray-600 mt-1">
              {session.durationMinutes} minutes
              {session.template && ` • ${session.template}`}
            </p>
          </div>
        </div>

        {session.observations && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Therapist Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{session.observations}</p>
          </div>
        )}

        {session.activitiesDone.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Activities Completed</h3>
            <div className="flex flex-wrap gap-2">
              {session.activitiesDone.map((activity, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {session.goalsWorkedOn.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Goals Worked On</h3>
            <div className="space-y-2">
              {session.goalsWorkedOn.map((goal, i) => (
                <div key={i} className="text-sm">
                  <p className="text-gray-700">{goal.progressNotes}</p>
                  <p className="text-gray-600">Progress: {goal.levelUpdate}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Home Activities */}
      {session.homeActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Home Activities for You
          </h2>
          <p className="text-gray-600 mb-4">
            Complete these activities at home to help reinforce therapy progress
          </p>
          <div className="space-y-4">
            {session.homeActivities.map((activity, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  activity.completedByParent ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.activity}</h3>
                    {activity.instructions && (
                      <p className="text-sm text-gray-600 mt-1">{activity.instructions}</p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      handleToggleActivity(
                        index,
                        !activity.completedByParent,
                        activity.parentNotes
                      )
                    }
                    disabled={updating === index}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium text-sm ${
                      activity.completedByParent
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    } disabled:opacity-50`}
                  >
                    {updating === index
                      ? 'Updating...'
                      : activity.completedByParent
                      ? '✓ Completed'
                      : 'Mark Complete'}
                  </button>
                </div>

                {activity.completedByParent && activity.parentNotes && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Your notes:</span> {activity.parentNotes}
                    </p>
                  </div>
                )}

                {activity.completedByParent && !activity.parentNotes && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const notes = prompt('Add notes about this activity:');
                        if (notes !== null) {
                          handleToggleActivity(index, true, notes);
                        }
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      + Add notes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

