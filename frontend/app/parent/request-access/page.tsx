'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function RequestAccessPage() {
  const router = useRouter();
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childDateOfBirth, setChildDateOfBirth] = useState('');
  const [therapistEmail, setTherapistEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.requestAccess({
        childFirstName,
        childLastName,
        childDateOfBirth,
        therapistEmail,
      });
      
      alert('Access request submitted successfully! You will be notified when the therapist responds.');
      router.push('/parent/my-requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit access request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-transparent dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Request Access to Therapy Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Submit a request to view your child's therapy progress notes.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="childFirstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's First Name *
                </label>
                <input
                  id="childFirstName"
                  type="text"
                  value={childFirstName}
                  onChange={(e) => setChildFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="childLastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's Last Name *
                </label>
                <input
                  id="childLastName"
                  type="text"
                  value={childLastName}
                  onChange={(e) => setChildLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="childDateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Child's Date of Birth *
              </label>
              <input
                id="childDateOfBirth"
                type="date"
                value={childDateOfBirth}
                onChange={(e) => setChildDateOfBirth(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="therapistEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Therapist's Email Address *
              </label>
              <input
                id="therapistEmail"
                type="email"
                value={therapistEmail}
                onChange={(e) => setTherapistEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="therapist@example.com"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Note:</strong> The therapist will receive your request and can approve or reject it.
                If approved, you'll be able to view your child's therapy progress notes and goals.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

