'use client';

import { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import CameraCapture from './CameraCapture';
import type { Template, Client } from '@/lib/types';

interface QuickEntryModalProps {
  client: Client;
  templates: Template[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sessionDate: string;
    durationMinutes: number;
    template?: string;
    activitiesDone: string[];
    observations: string;
    nextSteps: string;
    sharedWithParents: boolean;
    photoFile?: File;
  }) => Promise<void>;
}

export default function QuickEntryModal({
  client,
  templates,
  isOpen,
  onClose,
  onSubmit,
}: QuickEntryModalProps) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [sharedWithParents, setSharedWithParents] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load last used template from localStorage
  useEffect(() => {
    if (isOpen && templates.length > 0) {
      const lastTemplateId = localStorage.getItem(`lastTemplate_${client.id}`);
      if (lastTemplateId) {
        const template = templates.find((t) => t.id === lastTemplateId);
        if (template) {
          setSelectedTemplate(template);
          setActivities(template.activities || []);
        }
      }
    }
  }, [isOpen, templates, client.id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSessionDate(new Date().toISOString().split('T')[0]);
      setDurationMinutes('60');
      setSelectedTemplate(null);
      setActivities([]);
      setObservations('');
      setNextSteps('');
      setSharedWithParents(true);
      setPhotoFile(null);
      setError('');
    }
  }, [isOpen]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActivities(template.activities || []);
    // Save to localStorage
    localStorage.setItem(`lastTemplate_${client.id}`, template.id);
  };

  const toggleActivity = (activity: string) => {
    setActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handleVoiceTranscript = (text: string) => {
    // Append to observations if empty, otherwise add with newline
    setObservations((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const handlePhotoCapture = (file: File) => {
    setPhotoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({
        sessionDate,
        durationMinutes: parseInt(durationMinutes),
        template: selectedTemplate?.name,
        activitiesDone: activities,
        observations,
        nextSteps,
        sharedWithParents,
        photoFile: photoFile || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Entry</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{client.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Template Quick Select */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template (Optional)
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {templates.slice(0, 5).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`flex-shrink-0 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activities - Quick Chips */}
          {selectedTemplate && selectedTemplate.activities && selectedTemplate.activities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activities
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.activities.map((activity, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
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

          {/* Observations with Voice Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observations
            </label>
            <VoiceInput onTranscript={handleVoiceTranscript} />
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What did you observe? Use voice input or type..."
            />
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Next Steps (Optional)
            </label>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Plans for next session..."
            />
          </div>

          {/* Photo Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo (Optional)
            </label>
            <CameraCapture onCapture={handlePhotoCapture} />
          </div>

          {/* Share with Parents */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="checkbox"
              id="share-parents"
              checked={sharedWithParents}
              onChange={(e) => setSharedWithParents(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="share-parents" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share with parents
            </label>
          </div>
        </form>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

