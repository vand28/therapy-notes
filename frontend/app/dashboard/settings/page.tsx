'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

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

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {user?.role === 'therapist' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Current Plan</label>
              <p className="font-medium text-gray-900 capitalize text-lg">
                {subscription?.tier || 'Free'}
                {subscription?.tier === 'professional' && ' ($24/month)'}
                {subscription?.tier === 'premium' && ' ($49/month)'}
              </p>
            </div>

            {subscription?.hasPaymentMethod && subscription?.currentPeriodEnd && (
              <div>
                <label className="text-sm text-gray-600">Next Billing Date</label>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Your subscription will cancel on this date
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 space-y-3">
              {subscription?.tier === 'free' ? (
                <a
                  href="/dashboard/upgrade"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Upgrade Plan
                </a>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  disabled={redirecting}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                >
                  {redirecting ? 'Redirecting...' : 'Manage Subscription'}
                </button>
              )}
              <p className="text-sm text-gray-600">
                {subscription?.tier === 'free' 
                  ? 'Upgrade to unlock unlimited clients, sessions, and advanced features'
                  : 'Update payment method, view invoices, or cancel your subscription'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

