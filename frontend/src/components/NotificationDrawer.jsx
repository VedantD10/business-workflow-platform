import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, refreshNotifications } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await api.markNotificationRead(notif.id);
      refreshNotifications();
    }
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    refreshNotifications();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Read All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending notifications right now.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  n.is_read ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-blue-50/50 hover:bg-blue-50 border-l-4 border-indigo-600'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
