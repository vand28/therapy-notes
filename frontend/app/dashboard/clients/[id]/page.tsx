'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import InviteParentModal from '@/components/InviteParentModal';
import AddGoalModal from '@/components/AddGoalModal';
import EditGoalModal from '@/components/EditGoalModal';
import QuickEntryModal from '@/components/QuickEntryModal';
import type { Client, Session, ClientGoal, Template } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showQuickEntryModal, setShowQuickEntryModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<ClientGoal | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [expandedGoalHistory, setExpandedGoalHistory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientData, sessionsData, templatesData] = await Promise.all([
        apiClient.getClient(clientId),
        apiClient.getSessions(clientId),
        apiClient.getTemplates(),
      ]);
      setClient(clientData);
      setSessions(sessionsData);
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEntrySubmit = async (data: {
    sessionDate: string;
    durationMinutes: number;
    template?: string;
    activitiesDone: string[];
    observations: string;
    nextSteps: string;
    sharedWithParents: boolean;
    photoFile?: File;
  }) => {
    // Create session first
    const session = await apiClient.createSession({
      clientId,
      sessionDate: new Date(data.sessionDate).toISOString(),
      durationMinutes: data.durationMinutes,
      template: data.template,
      activitiesDone: data.activitiesDone,
      observations: data.observations,
      nextSteps: data.nextSteps,
      sharedWithParents: data.sharedWithParents,
    });

    // Upload photo if provided
    if (data.photoFile) {
      await apiClient.uploadMedia(data.photoFile, session.id);
    }

    // Reload data to show new session
    await loadData();
  };

  const handleEditGoal = (goal: ClientGoal) => {
    setSelectedGoal(goal);
    setShowEditGoalModal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteGoal(clientId, goalId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (goalId: string, newLevel: number) => {
    try {
      await apiClient.updateGoalProgress(clientId, goalId, newLevel);
      await loadData();
      setEditingProgress(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update progress');
    }
  };

  const getGoalStatus = (goal: ClientGoal) => {
    // Achieved if 100%
    if (goal.currentLevel >= 100) {
      return { label: 'Achieved', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', icon: '✓' };
    }
    
    // At Risk if target date is approaching or passed
    if (goal.targetDate) {
      const daysUntilTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilTarget < 0) {
        return { label: 'Overdue', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400', icon: '⚠️' };
      }
      if (daysUntilTarget <= 30 && goal.currentLevel < 75) {
        return { label: 'At Risk', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400', icon: '⚡' };
      }
    }
    
    // Active otherwise
    return { label: 'Active', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400', icon: '◉' };
  };

  const getGoalHistory = (goalId: string) => {
    // Get sessions where this goal was worked on, sorted by date
    return sessions
      .filter(session => session.goalsWorkedOn?.some(g => g.goalId === goalId))
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .map(session => {
        const goalProgress = session.goalsWorkedOn?.find(g => g.goalId === goalId);
        return {
          date: session.sessionDate,
          progressNotes: goalProgress?.progressNotes || '',
          levelUpdate: goalProgress?.levelUpdate || 0
        };
      });
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error || 'Client not found'}
      </div>
    );
  }

  return (
    <div>
      {showInviteModal && client && (
        <InviteParentModal
          clientId={clientId}
          clientName={client.name}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showAddGoalModal && client && (
        <AddGoalModal
          clientId={clientId}
          clientName={client.name}
          onClose={() => setShowAddGoalModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showEditGoalModal && selectedGoal && (
        <EditGoalModal
          clientId={clientId}
          goal={selectedGoal}
          onClose={() => {
            setShowEditGoalModal(false);
            setSelectedGoal(null);
          }}
          onSuccess={() => loadData()}
        />
      )}

      {showQuickEntryModal && client && (
        <QuickEntryModal
          client={client}
          templates={templates}
          isOpen={showQuickEntryModal}
          onClose={() => setShowQuickEntryModal(false)}
          onSubmit={handleQuickEntrySubmit}
        />
      )}

      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
          {client.dateOfBirth && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Born: {new Date(client.dateOfBirth).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            👨‍👩‍👧 Invite Parent
          </button>
          <button
            onClick={() => setShowQuickEntryModal(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium"
          >
            ⚡ Quick Entry
          </button>
          <Link
            href={`/dashboard/clients/${clientId}/session/new`}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
          >
            + New Session
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Goals</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{client.goals.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Linked Parents</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{client.parentUserIds?.length || 0}</p>
        </div>
      </div>

      {/* Linked Parents Section */}
      {client.parentUserIds && client.parentUserIds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 border border-transparent dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Linked Parents</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {client.parentUserIds.map((parentId, index) => (
                <span key={parentId} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm rounded-full">
                  👨‍👩‍👧 Parent {index + 1}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              These parents have access to view progress and shared sessions.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-transparent dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goals</h2>
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium text-sm"
          >
            + Add Goal
          </button>
        </div>
        <div className="p-6">
          {client.goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No goals set yet</p>
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="inline-block px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
              >
                Add First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {client.goals.map((goal) => {
                const status = getGoalStatus(goal);
                return (
                <div key={goal.goalId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{goal.description}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{goal.currentLevel}%</span>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                        title="Edit goal"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.goalId)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm"
                        title="Delete goal"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.currentLevel}%` }}
                    />
                  </div>
                  
                  {editingProgress === goal.goalId ? (
                    <div className="mt-3 space-y-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Manual Progress Adjustment</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={goal.currentLevel}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        onMouseUp={(e) => handleUpdateProgress(goal.goalId, parseInt((e.target as HTMLInputElement).value))}
                        onTouchEnd={(e) => handleUpdateProgress(goal.goalId, parseInt((e.target as HTMLInputElement).value))}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Drag slider to adjust progress</span>
                        <button
                          onClick={() => setEditingProgress(null)}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        {goal.targetDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        )}
                        <button
                          onClick={() => setEditingProgress(goal.goalId)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-auto"
                        >
                          Adjust Progress
                        </button>
                      </div>
                      
                      {/* Goal History Timeline */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => setExpandedGoalHistory(expandedGoalHistory === goal.goalId ? null : goal.goalId)}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                        >
                          <span>{expandedGoalHistory === goal.goalId ? '▼' : '▶'}</span>
                          View Progress History ({getGoalHistory(goal.goalId).length} sessions)
                        </button>
                        
                        {expandedGoalHistory === goal.goalId && (
                          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            {getGoalHistory(goal.goalId).length === 0 ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">No progress tracked yet</p>
                            ) : (
                              getGoalHistory(goal.goalId).map((history, idx) => (
                                <div key={idx} className="pl-3 border-l-2 border-blue-200 dark:border-blue-800 py-2">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {new Date(history.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                      {history.levelUpdate}%
                                    </span>
                                  </div>
                                  {history.progressNotes && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{history.progressNotes}</p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6 border border-transparent dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No sessions documented yet</p>
              <Link
                href={`/dashboard/clients/${clientId}/session/new`}
                className="inline-block px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
              >
                Document First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{session.durationMinutes} minutes</p>
                      {session.template && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-gray-700">
                          {session.template}
                        </span>
                      )}
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

