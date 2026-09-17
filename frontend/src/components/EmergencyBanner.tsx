import React from 'react';
import { AlertOctagon, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmergencyBannerProps {
  title?: string;
  actions?: string[];
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  title = 'CRITICAL CLINICAL RED FLAG DETECTED',
  actions = [
    'Call Emergency Services (911 / 112) immediately.',
    'Do not wait or attempt to self-treat high-risk acute symptoms.',
  ],
}) => {
  return (
    <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg border border-red-700 my-4 animate-pulse-slow">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-red-700/80 shrink-0">
          <AlertOctagon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-lg tracking-wide uppercase">{title}</h3>
            <Link
              to="/emergency"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Hotline Protocol</span>
            </Link>
          </div>
          <p className="mt-1 text-sm text-red-100 font-medium">
            The symptoms entered indicate potential high-risk medical urgency. Do not delay emergency medical intervention.
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-red-50 bg-red-700/50 p-3 rounded-xl">
            {actions.map((act, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-200 shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
