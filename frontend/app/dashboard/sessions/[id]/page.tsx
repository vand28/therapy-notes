'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { Session } from '@/lib/types';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="mb-8">
        <Link
          href={`/dashboard/clients/${session.clientId}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
        >
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
        <p className="text-gray-600 mt-1">
          {new Date(session.sessionDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Duration</h3>
          <p className="text-2xl font-bold text-gray-900">{session.durationMinutes} min</p>
        </div>
        
        {session.template && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Template Used</h3>
            <p className="text-lg font-semibold text-gray-900">{session.template}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Shared with Parents</h3>
          <p className="text-lg font-semibold text-gray-900">
            {session.sharedWithParents ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-gray-400">✗ No</span>
            )}
          </p>
        </div>
      </div>

      {/* Activities Done */}
      {session.activitiesDone && session.activitiesDone.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Activities Done</h2>
          </div>
          <div className="p-6">
            <ul className="list-disc list-inside space-y-2">
              {session.activitiesDone.map((activity, index) => (
                <li key={index} className="text-gray-700">{activity}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Goals Worked On */}
      {session.goalsWorkedOn && session.goalsWorkedOn.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Goals Progress</h2>
          </div>
          <div className="p-6 space-y-4">
            {session.goalsWorkedOn.map((goal, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">Goal #{index + 1}</h3>
                  <span className="text-sm font-semibold text-blue-600">
                    Level: {goal.levelUpdate}%
                  </span>
                </div>
                {goal.progressNotes && (
                  <p className="text-gray-700 text-sm mt-2">{goal.progressNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations */}
      {session.observations && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Observations</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 whitespace-pre-line">{session.observations}</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      {session.nextSteps && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Next Steps</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 whitespace-pre-line">{session.nextSteps}</p>
          </div>
        </div>
      )}

      {/* Home Activities */}
      {session.homeActivities && session.homeActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Home Activities for Parents</h2>
          </div>
          <div className="p-6 space-y-4">
            {session.homeActivities.map((activity, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  activity.completedByParent ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{activity.activity}</h3>
                  {activity.completedByParent && (
                    <span className="text-green-600 text-sm font-semibold">✓ Completed</span>
                  )}
                </div>
                {activity.instructions && (
                  <p className="text-gray-700 text-sm mb-2">{activity.instructions}</p>
                )}
                {activity.parentNotes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Parent Notes:</p>
                    <p className="text-gray-700 text-sm italic">{activity.parentNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Attachments */}
      {session.mediaAttachments && session.mediaAttachments.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Media Attachments</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {session.mediaAttachments.map((media, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-4xl mb-2 text-center">
                    {media.fileType.startsWith('image/') ? '🖼️' :
                     media.fileType.startsWith('video/') ? '🎥' :
                     media.fileType.startsWith('audio/') ? '🎵' : '📄'}
                  </div>
                  <p className="text-sm text-gray-700 truncate" title={media.fileName}>
                    {media.fileName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(media.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <a
                    href={`/api/media/download/${media.fileKey}`}
                    className="block mt-2 text-xs text-blue-600 hover:text-blue-700"
                    download
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Metadata */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
        {session.updatedAt !== session.createdAt && (
          <p>Last updated: {new Date(session.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

