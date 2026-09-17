import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import { HeartPulse, Globe, AlertTriangle, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { LanguageCode } from '../types/index.js';

export const Navbar: React.FC = () => {
  const { user, profile, language, setLanguage, logout } = useAuth();
  const t = translations[language];
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                AI HealthCare <span className="text-teal-600 font-medium">Assistant</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-600">
                Personalized • RAG-Powered
              </span>
            </div>
          </Link>

          {/* Emergency Alert Hotline Callout */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/emergency"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Emergency Help: Call 911 / 112</span>
            </Link>
          </div>

          {/* Controls: Language Selector, User Profile, Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent border-none outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-teal-600" />
                  <span>{profile?.fullName || user.email}</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t.nav.logout}
                  aria-label={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-teal-600 px-3 py-2 rounded-lg transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-700 text-sm font-semibold"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Emergency Guidelines (911 / 112)</span>
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.chat}
              </Link>
              <Link
                to="/symptoms"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.symptoms}
              </Link>
              <Link
                to="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.reports}
              </Link>
              <Link
                to="/images"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.images}
              </Link>
              <Link
                to="/medicines"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.medicines}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.profile}
              </Link>
              <Link
                to="/memory"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.memory}
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t.nav.settings}
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded"
                >
                  {t.nav.admin}
                </Link>
              )}
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
