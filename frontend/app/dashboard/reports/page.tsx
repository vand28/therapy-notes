'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Client } from '@/lib/types';

export default function ReportsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await apiClient.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (clientId: string, clientName: string) => {
    try {
      setGenerating(clientId);
      
      // Calculate date range (last 3 months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/client/${clientId}/progress?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName}-Progress-Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      setGenerating('csv');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/export-csv`,
        {
          headers: {
            'Authorization': `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TherapyNotes-Export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Exports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate progress reports and export your data
        </p>
      </div>

      {/* Export All Data */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Export All Data</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Export all client information to CSV format for backup or analysis
        </p>
        <button
          onClick={handleExportCSV}
          disabled={generating === 'csv'}
          className="px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium disabled:opacity-50"
        >
          {generating === 'csv' ? 'Exporting...' : '📊 Export to CSV'}
        </button>
      </div>

      {/* Client Progress Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Client Progress Reports</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Generate PDF progress reports for individual clients (last 3 months)
        </p>

        {clients.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No clients yet. Add clients to generate reports.
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {client.goals.length} goals • Created {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport(client.id, client.name)}
                  disabled={generating === client.id}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:opacity-50"
                >
                  {generating === client.id ? 'Generating...' : '📄 Generate Report'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">About Progress Reports</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Reports include client information, goals, and session summaries</li>
          <li>• Default date range is the last 3 months</li>
          <li>• Perfect for insurance documentation or parent meetings</li>
          <li>• All reports are in PDF format for easy sharing</li>
        </ul>
      </div>
    </div>
  );
}

