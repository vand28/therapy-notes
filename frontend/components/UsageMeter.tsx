'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { UsageSummary } from '@/lib/types';

export default function UsageMeter() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const data = await apiClient.getUsageSummary();
      setUsage(data);
    } catch (err) {
      console.error('Failed to load usage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) return null;

  // Don't show for paid plans
  if (usage.subscriptionTier !== 'free') return null;

  const clientPercentage = (usage.current.clientCount / usage.limits.clientCount) * 100;
  const sessionPercentage = (usage.current.sessionsThisMonth / usage.limits.sessionsThisMonth) * 100;
  const storagePercentage = (usage.current.storageUsedMB / usage.limits.storageUsedMB) * 100;

  const isNearLimit = clientPercentage > 80 || sessionPercentage > 80 || storagePercentage > 80;

  return (
    <div className={`bg-white rounded-lg shadow p-6 mb-6 ${isNearLimit ? 'border-2 border-orange-400' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage (Free Plan)</h3>
        <Link
          href="/dashboard/upgrade"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Upgrade Plan
        </Link>
      </div>

      {isNearLimit && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            ⚠️ You're approaching your plan limits. Upgrade to continue without interruption.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Clients */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Clients</span>
            <span className="font-medium text-gray-900">
              {usage.current.clientCount} / {usage.limits.clientCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                clientPercentage >= 100 ? 'bg-red-500' : clientPercentage > 80 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(clientPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Sessions this month */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Sessions this month</span>
            <span className="font-medium text-gray-900">
              {usage.current.sessionsThisMonth} / {usage.limits.sessionsThisMonth}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                sessionPercentage >= 100 ? 'bg-red-500' : sessionPercentage > 80 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(sessionPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Storage</span>
            <span className="font-medium text-gray-900">
              {usage.current.storageUsedMB.toFixed(1)} MB / {usage.limits.storageUsedMB} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                storagePercentage >= 100 ? 'bg-red-500' : storagePercentage > 80 ? 'bg-orange-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

