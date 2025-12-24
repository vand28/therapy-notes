'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { AccessRequest } from '@/lib/types';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyAccessRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Access Requests</h1>
        <Link
          href="/parent/request-access"
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
        >
          New Request
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-transparent dark:border-gray-700">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No access requests yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Submit a request to view your child's therapy progress notes.
          </p>
          <Link
            href="/parent/request-access"
            className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
          >
            Submit Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {request.childFirstName} {request.childLastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Therapist: {request.therapistEmail}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Date of Birth</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(request.childDateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Submitted</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {request.status === 'approved' && request.linkedClientId && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/parent/clients/${request.linkedClientId}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    View Progress Notes →
                  </Link>
                </div>
              )}

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Rejection Reason</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{request.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

