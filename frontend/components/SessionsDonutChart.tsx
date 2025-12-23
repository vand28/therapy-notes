'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SessionsDonutChartProps {
  sessions: { template: string; count: number }[];
}

export default function SessionsDonutChart({ sessions }: SessionsDonutChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No session data yet
      </div>
    );
  }

  const colors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(249, 115, 22)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
    'rgb(234, 179, 8)',
  ];

  const data = {
    labels: sessions.map(s => s.template || 'General'),
    datasets: [
      {
        data: sessions.map(s => s.count),
        backgroundColor: colors.slice(0, sessions.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} sessions (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}

