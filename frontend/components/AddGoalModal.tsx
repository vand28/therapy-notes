'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface AddGoalModalProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface GoalEntry {
  description: string;
  targetDate: string;
}

export default function AddGoalModal({ clientId, clientName, onClose, onSuccess }: AddGoalModalProps) {
  const [goals, setGoals] = useState<GoalEntry[]>([{ description: '', targetDate: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addGoalRow = () => {
    setGoals([...goals, { description: '', targetDate: '' }]);
  };

  const removeGoalRow = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, field: 'description' | 'targetDate', value: string) => {
    const updated = [...goals];
    updated[index][field] = value;
    setGoals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one goal has description
    const validGoals = goals.filter(g => g.description.trim());
    if (validGoals.length === 0) {
      setError('At least one goal description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add all goals sequentially
      for (const goal of validGoals) {
        await apiClient.addGoal(
          clientId,
          goal.description.trim(),
          goal.targetDate || undefined
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Goal</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {goals.map((goal, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal {index + 1}</h3>
                  {goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoalRow(index)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={goal.description}
                      onChange={(e) => updateGoal(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="e.g., Improve fine motor skills"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={goal.targetDate}
                      onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addGoalRow}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
            disabled={loading}
          >
            + Add Another Goal
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'Adding...' : `Add Goal${goals.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

