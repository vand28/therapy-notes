'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import VoiceRecorder from '@/components/VoiceRecorder';
import type { Template, Client } from '@/lib/types';

export default function NewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [activities, setActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState('');
  const [observations, setObservations] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [sharedWithParents, setSharedWithParents] = useState(true);
  
  // Goal tracking state
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [goalProgress, setGoalProgress] = useState<{ [goalId: string]: { notes: string; levelUpdate: number } }>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      const [clientData, templatesData] = await Promise.all([
        apiClient.getClient(clientId),
        apiClient.getTemplates(),
      ]);
      setClient(clientData);
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActivities(template.activities);
  };

  const toggleActivity = (activity: string) => {
    setActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const addCustomActivity = () => {
    if (customActivity.trim()) {
      setActivities((prev) => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const toggleGoal = (goalId: string, currentLevel: number) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
      const newProgress = { ...goalProgress };
      delete newProgress[goalId];
      setGoalProgress(newProgress);
    } else {
      newSelected.add(goalId);
      setGoalProgress({
        ...goalProgress,
        [goalId]: {
          notes: '',
          levelUpdate: currentLevel // Start with current level
        }
      });
    }
    setSelectedGoals(newSelected);
  };

  const updateGoalProgressNotes = (goalId: string, notes: string) => {
    setGoalProgress({
      ...goalProgress,
      [goalId]: { ...goalProgress[goalId], notes }
    });
  };

  const updateGoalProgressLevel = (goalId: string, level: number) => {
    setGoalProgress({
      ...goalProgress,
      [goalId]: { ...goalProgress[goalId], levelUpdate: level }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Build goals worked on array
      const goalsWorkedOn = Array.from(selectedGoals).map(goalId => ({
        goalId,
        progressNotes: goalProgress[goalId]?.notes || '',
        levelUpdate: goalProgress[goalId]?.levelUpdate || 0
      }));

      await apiClient.createSession({
        clientId,
        sessionDate: new Date(sessionDate).toISOString(),
        durationMinutes: parseInt(durationMinutes),
        template: selectedTemplate?.name,
        activitiesDone: activities,
        goalsWorkedOn: goalsWorkedOn.length > 0 ? goalsWorkedOn : undefined,
        observations,
        nextSteps,
        sharedWithParents,
      });

      router.push(`/dashboard/clients/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (!client) {
    return <div className="text-red-600 dark:text-red-400">Client not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Session for {client.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Document today's therapy session</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Template (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 inline-block">
                  {template.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Activities</h2>
          
          {selectedTemplate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Common activities for this template:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.activities.map((activity, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activities.includes(activity)
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="Add custom activity..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomActivity())}
            />
            <button
              type="button"
              onClick={addCustomActivity}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Add
            </button>
          </div>

          {activities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected activities:</p>
              <div className="flex flex-wrap gap-2">
                {activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm flex items-center gap-2"
                  >
                    {activity}
                    <button
                      type="button"
                      onClick={() => toggleActivity(activity)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Goals Worked On */}
        {client.goals && client.goals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Goals Worked On</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the goals you worked on during this session and track progress
            </p>
            
            <div className="space-y-4">
              {client.goals.map((goal) => (
                <div key={goal.goalId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGoals.has(goal.goalId)}
                      onChange={() => toggleGoal(goal.goalId, goal.currentLevel)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900 dark:text-white">{goal.description}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Currently: {goal.currentLevel}%</span>
                      </div>
                      
                      {selectedGoals.has(goal.goalId) && (
                        <div className="mt-4 space-y-3 pl-0">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Progress Notes
                            </label>
                            <textarea
                              value={goalProgress[goal.goalId]?.notes || ''}
                              onChange={(e) => updateGoalProgressNotes(goal.goalId, e.target.value)}
                              rows={2}
                              placeholder="What progress was made on this goal?"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Updated Progress Level: {goalProgress[goal.goalId]?.levelUpdate || goal.currentLevel}%
                            </label>
                            <input
                              type="range"
                              min={goal.currentLevel}
                              max="100"
                              value={goalProgress[goal.goalId]?.levelUpdate || goal.currentLevel}
                              onChange={(e) => updateGoalProgressLevel(goal.goalId, parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>Previous: {goal.currentLevel}%</span>
                              <span>Target: 100%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observations
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What did you observe during the session?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Next Steps
              </label>
              <textarea
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Plans for next session..."
              />
            </div>
          </div>
        </div>

        {/* Parent Sharing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={sharedWithParents}
              onChange={(e) => setSharedWithParents(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share this session with parents
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}

