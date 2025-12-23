'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    try {
      setLoading(tier);
      const { url } = await apiClient.createCheckoutSession(tier);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h1>
        <p className="text-xl text-gray-600">
          Unlock unlimited clients, sessions, and advanced features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
            <p className="text-gray-600">Forever</p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">3 active clients</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">15 sessions per month</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">250MB storage</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Basic templates</span>
            </li>
          </ul>
          <button
            disabled
            className="w-full py-3 px-4 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Professional Plan */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              MOST POPULAR
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">$24</div>
            <p className="text-gray-600">per month</p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Unlimited clients</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Unlimited sessions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">5GB storage</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">All templates</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Progress charts</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Priority support</span>
            </li>
          </ul>
          <button
            onClick={() => handleUpgrade('professional')}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading === 'professional' ? 'Redirecting...' : 'Upgrade to Professional'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-purple-500">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">$49</div>
            <p className="text-gray-600">per month</p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Everything in Professional</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">20GB storage</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Voice-to-text notes</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Custom branding</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">API access</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Phone support</span>
            </li>
          </ul>
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading === 'premium' ? 'Redirecting...' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p className="mb-2">🔒 Secure payment processing via Stripe</p>
        <p>Cancel anytime. No long-term contracts.</p>
      </div>
    </div>
  );
}

