import React, { useEffect, useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';

interface Notification {
  _id: string;
  eventType: string;
  message: string;
  channel: string;
  status: string;
  read: boolean;
  createdAt: string;
}

export const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  const fetchNotifications = async () => {
    try {
      const response = await workflowApi.getNotifications(token);
      setNotifications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await workflowApi.markNotificationAsRead(id, token);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await markAsRead(n._id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-on-surface">Notification Center</h1>
          <p className="text-on-surface-variant text-sm">Review your workflow alerts and system messages.</p>
        </div>
        <div className="flex gap-4 items-center">
          {unreadCount > 0 && (
            <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">
              {unreadCount} Unread
            </span>
          )}
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-lg">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-50">notifications_off</span>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-6 transition-colors hover:bg-surface-container-highest ${!notif.read ? 'bg-primary/5' : ''}`}
                onClick={() => !notif.read && markAsRead(notif._id)}
              >
                <div className="flex gap-4">
                  <div className="pt-1">
                    {!notif.read ? (
                      <span className="flex h-3 w-3 relative mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline text-sm mt-0.5">drafts</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium ${!notif.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {notif.eventType.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-xs text-outline whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.read ? 'text-on-surface/90' : 'text-outline'} leading-relaxed`}>
                      {notif.message}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-outline-variant bg-surface-container-highest px-2 py-0.5 rounded border border-outline-variant/10">
                        {notif.channel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
