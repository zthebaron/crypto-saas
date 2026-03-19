import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';

export function NotificationBell() {
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) fetch();
    const interval = setInterval(() => { if (isAuthenticated) fetch(); }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-gray-200 transition-colors relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-indigo-600/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
