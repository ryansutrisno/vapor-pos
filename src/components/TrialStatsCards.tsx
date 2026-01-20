import { useState } from 'react';

interface TrialUser {
  id: string;
  email: string;
  name: string;
  store_id: string;
  subscription_plan: string;
  trial_started_at: string;
  trial_expires_at: string;
  is_active: boolean;
  is_trial_user: boolean;
  days_left: number;
  trial_status: 'active' | 'expiring' | 'expired';
  created_at: string;
}

interface TrialStatsCardsProps {
  stats: {
    active_trials: number;
    expiring_soon: number;
    expired: number;
    converted_this_month: number;
  };
}

export function TrialStatsCards({ stats }: TrialStatsCardsProps) {
  const cards = [
    {
      label: 'Trial Aktif',
      value: stats.active_trials,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Segaran Expired',
      value: stats.expiring_soon,
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Sudah Expired',
      value: stats.expired,
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Berubah Bulan Ini',
      value: stats.converted_this_month,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-800', iconBg: 'bg-green-100 text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-800', iconBg: 'bg-yellow-100 text-yellow-600' },
    red: { bg: 'bg-red-50', text: 'text-red-800', iconBg: 'bg-red-100 text-red-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-800', iconBg: 'bg-blue-100 text-blue-600' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const colors = colorClasses[card.color];
        return (
          <div key={card.label} className={`${colors.bg} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colors.text}`}>{card.label}</p>
                <p className={`text-2xl font-bold ${colors.text} mt-1`}>{card.value}</p>
              </div>
              <div className={`${colors.iconBg} p-3 rounded-full`}>
                {card.icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
