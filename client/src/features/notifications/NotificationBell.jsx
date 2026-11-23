import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api.js';
import { io } from 'socket.io-client';
import {
  Bell,
  CheckCheck,
  RotateCw,
  X,
  FileText,
  Briefcase,
  Users,
  AlertCircle,
  Clock
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';

export default function NotificationBell({ onNavigateTab }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      // Quiet fail if session is expired or network is offline
    }
  };

  // Fetch full list of notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      // Also sync unread count
      const unread = (res.data.data.notifications || []).filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll unread count every 30 seconds & setup Socket.IO real-time notification listener
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const token = localStorage.getItem('drivair_token');
    let s = null;
    if (token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      s = io(socketUrl, { auth: { token } });
      s.on('notification_received', (newNotif) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [newNotif, ...prev]);
      });
    }

    return () => {
      clearInterval(interval);
      if (s) s.disconnect();
    };
  }, []);

  // When dropdown opens, fetch list
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Notification click handler with tab navigation support
  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }
    setIsOpen(false);

    if (onNavigateTab) {
      if (n.type === 'bidReceived' || n.type === 'bidAccepted' || n.type === 'bidRejected') {
        onNavigateTab('posts');
      } else if (n.type === 'contractCreated') {
        onNavigateTab('contracts');
      } else if (n.type === 'offerReceived' || n.type === 'offerAccepted') {
        onNavigateTab('offers');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bidReceived':
      case 'bidAccepted':
      case 'bidRejected':
        return <Briefcase size={14} className="text-[#FDE047]" />;
      case 'contractCreated':
        return <FileText size={14} className="text-emerald-400" />;
      case 'offerReceived':
      case 'offerAccepted':
        return <Users size={14} className="text-blue-400" />;
      default:
        return <AlertCircle size={14} className="text-yellow-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-[#171717] border border-white/10 text-[#B8B8B8] hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDE047]/50"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FDE047] text-[#0A0A0A] text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#171717] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#1F1F1F]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#FDE047]/15 text-[#FDE047] border border-[#FDE047]/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#B8B8B8] hover:text-[#FDE047] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#858585] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-[#858585] space-y-2">
                <RotateCw size={18} className="animate-spin text-[#FDE047]" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-[#858585] space-y-1">
                <Bell size={24} className="mx-auto opacity-30 mb-2" />
                <p className="text-xs font-semibold text-white">No notifications yet</p>
                <p className="text-[11px]">You will be notified when tenders, bids, or contracts update.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 transition flex gap-3 items-start cursor-pointer hover:bg-white/5 ${
                    !n.isRead ? 'bg-[#FDE047]/5 border-l-2 border-[#FDE047]' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-white' : 'text-[#B8B8B8]'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FDE047] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#B8B8B8] mt-0.5 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-[#858585] mt-1.5 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
