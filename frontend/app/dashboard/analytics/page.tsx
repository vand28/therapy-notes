'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Client, Session } from '@/lib/types';
import SessionsDonutChart from '@/components/SessionsDonutChart';
import GoalProgressChart from '@/components/GoalProgressChart';

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const clientsData = await apiClient.getClients();
      setClients(clientsData);

      // Load sessions for all clients
      const sessionsPromises = clientsData.map(c => apiClient.getSessions(c.id));
      const sessionsArrays = await Promise.all(sessionsPromises);
      const flatSessions = sessionsArrays.flat();
      setAllSessions(flatSessions);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading analytics...</div>;
  }

  // Calculate statistics
  const totalClients = clients.length;
  const totalSessions = allSessions.length;
  const totalGoals = clients.reduce((sum, c) => sum + c.goals.length, 0);
  const avgGoalProgress = totalGoals > 0
    ? clients.reduce((sum, c) => 
        sum + c.goals.reduce((gSum, g) => gSum + g.currentLevel, 0), 0) / totalGoals
    : 0;

  // Sessions by template
  const sessionsByTemplate = allSessions.reduce((acc, session) => {
    const template = session.template || 'General';
    acc[template] = (acc[template] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const templateData = Object.entries(sessionsByTemplate).map(([template, count]) => ({
    template,
    count,
  }));

  // Recent sessions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = allSessions.filter(s => 
    new Date(s.sessionDate) >= thirtyDaysAgo
  ).length;

  // Get most active client
  const clientSessionCounts = clients.map(client => ({
    client,
    sessionCount: allSessions.filter(s => s.clientId === client.id).length
  }));
  const mostActiveClient = clientSessionCounts.sort((a, b) => b.sessionCount - a.sessionCount)[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your practice performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalClients}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalSessions}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Goals</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalGoals}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Goal Progress</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{avgGoalProgress.toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sessions by Template */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sessions by Type</h2>
          <SessionsDonutChart sessions={templateData} />
        </div>

        {/* Activity Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Activity Summary</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions (Last 30 Days)</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{recentSessions}</div>
            </div>
            {mostActiveClient && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Most Active Client</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{mostActiveClient.client.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{mostActiveClient.sessionCount} sessions</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Most Used Template</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {templateData[0]?.template || 'None'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{templateData[0]?.count || 0} times</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress Charts */}
      {clients.filter(c => c.goals.length > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Goal Progress Trends</h2>
          <div className="space-y-8">
            {clients.slice(0, 3).map(client => 
              client.goals.slice(0, 2).map(goal => {
                // Mock progress data - in real app, track historical progress
                const mockData = [
                  { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), level: Math.max(0, goal.currentLevel - 30) },
                  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), level: Math.max(0, goal.currentLevel - 20) },
                  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), level: Math.max(0, goal.currentLevel - 10) },
                  { date: new Date().toISOString(), level: goal.currentLevel },
                ];

                return (
                  <div key={goal.goalId} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0">
                    <div className="mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</div>
                    </div>
                    <GoalProgressChart goalDescription={goal.description} dataPoints={mockData} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

