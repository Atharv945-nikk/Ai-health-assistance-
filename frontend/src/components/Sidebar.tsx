import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  FileText,
  Image,
  Pill,
  User,
  Brain,
  Settings,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, language } = useAuth();
  const t = translations[language];

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/chat', label: t.nav.chat, icon: MessageSquare },
    { to: '/symptoms', label: t.nav.symptoms, icon: Activity },
    { to: '/reports', label: t.nav.reports, icon: FileText },
    { to: '/images', label: t.nav.images, icon: Image },
    { to: '/medicines', label: t.nav.medicines, icon: Pill },
    { to: '/profile', label: t.nav.profile, icon: User },
    { to: '/memory', label: t.nav.memory, icon: Brain },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: t.nav.admin, icon: Shield });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex">
      <div className="space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Clinical Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-100">
        <NavLink
          to="/emergency"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors mb-2"
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>Emergency Information</span>
        </NavLink>
        <NavLink
          to="/help"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Clinical FAQ</span>
        </NavLink>
      </div>
    </aside>
  );
};
