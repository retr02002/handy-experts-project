import React from 'react';
import { ClientIcon } from './ClientIcon';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  iconBgColor = 'bg-slate-100 dark:bg-slate-800', 
  iconColor = 'text-slate-600 dark:text-slate-400' 
}: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}>
        <ClientIcon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
