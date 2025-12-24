'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface MfaVerifyModalProps {
  isOpen: boolean;
  tempToken: string;
  onSuccess: (token: string, userId: string, role: string) => void;
  onCancel: () => void;
}

export default function MfaVerifyModal({ isOpen, tempToken, onSuccess, onCancel }: MfaVerifyModalProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || (useBackupCode && code.length < 8) || (!useBackupCode && code.length !== 6)) {
      setError(useBackupCode ? 'Please enter a valid backup code' : 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await apiClient.verifyMfa(tempToken, code, useBackupCode);
      onSuccess(response.token, response.userId, response.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Two-Factor Authentication
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {useBackupCode
            ? 'Enter one of your backup codes to access your account.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = useBackupCode 
                ? e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                : e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            onKeyPress={handleKeyPress}
            placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={useBackupCode ? 9 : 6}
            autoFocus
          />
        </div>

        <button
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setCode('');
            setError('');
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
        >
          {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || !code || (useBackupCode && code.length < 8) || (!useBackupCode && code.length !== 6)}
            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

