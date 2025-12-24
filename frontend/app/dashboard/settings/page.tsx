'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import MfaSetupModal from '@/components/MfaSetupModal';
import type { AccessRequest, Client } from '@/lib/types';

export default function SettingsPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    loadSubscription();
    if (user?.role === 'therapist') {
      loadAccessRequests();
      loadClients();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const data = await apiClient.getSubscriptionStatus();
      setSubscription(data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const data = await apiClient.getPendingAccessRequests();
      setAccessRequests(data);
    } catch (err) {
      console.error('Failed to load access requests:', err);
    }
  };

  const loadClients = async () => {
    try {
      const data = await apiClient.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setRedirecting(true);
      const { url } = await apiClient.createPortalSession();
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to open billing portal');
      setRedirecting(false);
    }
  };

  const handleMfaSetupSuccess = () => {
    setMfaEnabled(true);
    alert('Two-factor authentication has been enabled successfully!');
  };

  const handleDisableMfa = async () => {
    const password = prompt('Enter your password to disable MFA:');
    if (!password) return;

    try {
      setDisablingMfa(true);
      await apiClient.disableMfa(password);
      setMfaEnabled(false);
      alert('Two-factor authentication has been disabled.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setDisablingMfa(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!selectedClientId) {
      alert('Please select a client to link with this parent.');
      return;
    }

    try {
      await apiClient.approveAccessRequest(requestId, selectedClientId);
      alert('Access request approved successfully!');
      setSelectedRequestId(null);
      setSelectedClientId('');
      loadAccessRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Optional: Enter a reason for rejection:');
    
    try {
      await apiClient.rejectAccessRequest(requestId, reason || undefined);
      alert('Access request rejected.');
      loadAccessRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
            <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Role</label>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* MFA Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Two-Factor Authentication</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
              Add an extra layer of security to your account with TOTP authenticator apps.
            </p>
            
            {mfaEnabled ? (
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  ✓ Enabled
                </span>
                <button
                  onClick={handleDisableMfa}
                  disabled={disablingMfa}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                >
                  {disablingMfa ? 'Disabling...' : 'Disable MFA'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  Not enabled
                </span>
                <button
                  onClick={() => setShowMfaSetup(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Enable MFA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Requests Section (Therapists only) */}
      {user?.role === 'therapist' && accessRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pending Access Requests ({accessRequests.length})
          </h2>
          
          <div className="space-y-4">
            {accessRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {request.parentName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.parentEmail}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                    Pending
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <p>Requesting access for: <strong>{request.childFirstName} {request.childLastName}</strong></p>
                  <p>Date of Birth: {new Date(request.childDateOfBirth).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {selectedRequestId === request.id ? (
                  <div className="space-y-3">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm"
                    >
                      <option value="">Select a client to link...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                          {client.dateOfBirth && ` (DOB: ${new Date(client.dateOfBirth).toLocaleDateString()})`}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={!selectedClientId}
                        className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Approval
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequestId(null);
                          setSelectedClientId('');
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequestId(request.id)}
                      className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Info */}
      {user?.role === 'therapist' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subscription</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Current Plan</label>
              <p className="font-medium text-gray-900 dark:text-white capitalize text-lg">
                {subscription?.tier || 'Free'}
                {subscription?.tier === 'professional' && ' ($24/month)'}
                {subscription?.tier === 'premium' && ' ($49/month)'}
              </p>
            </div>

            {subscription?.hasPaymentMethod && subscription?.currentPeriodEnd && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    ⚠️ Your subscription will cancel on this date
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 space-y-3">
              {subscription?.tier === 'free' ? (
                <a
                  href="/dashboard/upgrade"
                  className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
                >
                  Upgrade Plan
                </a>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  disabled={redirecting}
                  className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 font-medium disabled:opacity-50"
                >
                  {redirecting ? 'Redirecting...' : 'Manage Subscription'}
                </button>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subscription?.tier === 'free' 
                  ? 'Upgrade to unlock unlimited clients, sessions, and advanced features'
                  : 'Update payment method, view invoices, or cancel your subscription'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MFA Setup Modal */}
      <MfaSetupModal
        isOpen={showMfaSetup}
        onClose={() => setShowMfaSetup(false)}
        onSuccess={handleMfaSetupSuccess}
      />
    </div>
  );
}

