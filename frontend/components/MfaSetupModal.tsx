'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { MfaSetupResponse } from '@/lib/types';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MfaSetupModal({ isOpen, onClose, onSuccess }: MfaSetupModalProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initiateSetup();
    }
  }, [isOpen]);

  const initiateSetup = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.setupMfa();
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!savedBackupCodes) {
      setError('Please save your backup codes before continuing');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await apiClient.verifyMfaSetup(verificationCode);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!setupData) return;

    const content = `TherapyNotes - MFA Backup Codes\n\nThese codes can be used to access your account if you lose access to your authenticator app.\nEach code can only be used once.\n\n${setupData.backupCodes.join('\n')}\n\nKeep these codes in a safe place!`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'therapynotes-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSavedBackupCodes(true);
  };

  const handleClose = () => {
    setStep('setup');
    setSetupData(null);
    setVerificationCode('');
    setError('');
    setSavedBackupCodes(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Enable Two-Factor Authentication
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && !setupData ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Setting up MFA...</p>
          </div>
        ) : step === 'setup' && setupData ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
              </p>
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img
                  src={`data:image/png;base64,${setupData.qrCodeImage}`}
                  alt="MFA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter this code manually:
              </p>
              <code className="block bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded text-sm font-mono break-all">
                {setupData.secret}
              </code>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Codes
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-3 max-h-32 overflow-y-auto">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm text-gray-800 dark:text-gray-200">
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={handleDownloadBackupCodes}
                className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium"
              >
                {savedBackupCodes ? '✓ Backup Codes Saved' : 'Download Backup Codes'}
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('verify')}
                disabled={!savedBackupCodes}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        ) : step === 'verify' && setupData ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app to verify the setup:
            </p>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('setup')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

