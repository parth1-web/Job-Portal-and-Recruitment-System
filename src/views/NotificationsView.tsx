import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase 
} from 'lucide-react';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`, {
        headers: { 'x-user-id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.items || []);
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'x-user-id': user.id }
      });
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { 
        method: 'PUT',
        headers: user ? { 'x-user-id': user.id } : {}
      });
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-violet-500" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'application':
        return <Send className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding your applications, interview invitations, and status changes.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No notifications</h3>
          <p className="text-xs text-slate-500 mt-1">You're all caught up! New application milestones will notify you here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-xs">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
