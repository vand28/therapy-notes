'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { Client, Session } from '@/lib/types';

export default function CalendarPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const clientsData = await apiClient.getClients();
      setClients(clientsData);

      const sessionsPromises = clientsData.map(c => apiClient.getSessions(c.id));
      const sessionsArrays = await Promise.all(sessionsPromises);
      setAllSessions(sessionsArrays.flat());
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return allSessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
          <button
            onClick={() => navigateMonth('next')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const sessions = getSessionsForDate(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg ${
                    day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {sessions.slice(0, 3).map(session => {
                          const client = clients.find(c => c.id === session.clientId);
                          return (
                            <Link
                              key={session.id}
                              href={`/dashboard/clients/${session.clientId}`}
                              className="block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate hover:bg-blue-200"
                              title={client?.name}
                            >
                              {client?.name || 'Unknown'}
                            </Link>
                          );
                        })}
                        {sessions.length > 3 && (
                          <div className="text-xs text-gray-600 px-2">
                            +{sessions.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      {allSessions.filter(s => isToday(new Date(s.sessionDate))).length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Sessions</h2>
          <div className="space-y-3">
            {allSessions.filter(s => isToday(new Date(s.sessionDate))).map(session => {
              const client = clients.find(c => c.id === session.clientId);
              return (
                <Link
                  key={session.id}
                  href={`/dashboard/clients/${session.clientId}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{client?.name}</div>
                      <div className="text-sm text-gray-600">
                        {session.durationMinutes} minutes
                        {session.template && ` • ${session.template}`}
                      </div>
                    </div>
                    <span className="text-blue-600">View →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

