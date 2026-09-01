import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Bell, LogOut, Shield, User, ChevronDown, Workflow } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { user, logout, switchDemoUser, unreadCount } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center">
                FLOW<span className="text-indigo-400">SYNC</span>
                <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  Enterprise
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Business Operations Engine</p>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Persona Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                title="Switch Persona Role for Demonstration"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">{user?.full_name}</span>
                <span className="text-[10px] bg-slate-700 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                  {user?.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 text-xs animate-in fade-in zoom-in duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                    <p className="font-bold text-slate-700">Quick Persona Switcher</p>
                    <p className="text-[10px] text-slate-400">Test different RBAC permissions</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {DEMO_ACCOUNTS.map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          switchDemoUser(acc.email);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors flex items-center justify-between ${
                          user?.email === acc.email ? 'bg-indigo-50/70 text-indigo-700 font-bold' : ''
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{acc.label}</p>
                          <p className="text-[10px] text-slate-400">{acc.email}</p>
                        </div>
                        <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {acc.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-ping"></span>
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
