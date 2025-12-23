'use client';

import { useState } from 'react';

interface InviteParentModalProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteParentModal({ clientId, clientName, onClose, onSuccess }: InviteParentModalProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTempPassword('');
    setShowSuccess(false);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/invite-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          clientId,
          parentName,
          parentEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to invite parent');
      }

      console.log('Invite response:', data); // Debug log

      setShowSuccess(true);
      
      // Show temp password if present (check both possible field names)
      const password = data.TemporaryPassword || data.temporaryPassword;
      if (password) {
        console.log('Setting temp password:', password); // Debug log
        setTempPassword(password);
      } else {
        console.log('No password in response'); // Debug log
      }

      // Only auto-close if there's no password to show
      if (!password) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Invite error:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Failed to invite parent');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Parent</h2>
        <p className="text-gray-600 mb-6">
          Invite a parent to access {clientName}'s progress and session notes
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showSuccess && !tempPassword && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✓ Parent successfully linked to client!
          </div>
        )}

        {tempPassword && (
          <div className="mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <span className="text-2xl mr-2">🔑</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Temporary Password Created</h3>
                <p className="text-sm text-blue-700">Share this password securely with the parent</p>
              </div>
            </div>
            <div className="bg-white border border-blue-300 rounded p-3 mb-3">
              <div className="text-xs text-gray-600 mb-1">Parent Email:</div>
              <div className="font-mono text-sm text-gray-900 mb-3">{parentEmail}</div>
              <div className="text-xs text-gray-600 mb-1">Temporary Password:</div>
              <div className="font-mono text-2xl font-bold text-blue-600 select-all">{tempPassword}</div>
            </div>
            <p className="text-xs text-blue-600">
              ⚠️ Save this password now. Parent should change it after first login.
            </p>
            <button
              onClick={handleClose}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Done
            </button>
          </div>
        )}

        {!showSuccess && !tempPassword && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Name
              </label>
              <input
                type="text"
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Email
              </label>
              <input
                type="email"
                id="parentEmail"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="parent@example.com"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

