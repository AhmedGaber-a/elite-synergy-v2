// src/app/notification/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X, UserPlus, Mail, Users, BookOpen, CheckCircle2,
  Briefcase, Heart, MessageSquare, ChevronRight, Check, Bell
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

export interface NotificationItem {
  id: string;
  userId: string;
  senderId?: string | null;
  sender: string;
  senderFullName?: string;
  avatar?: string;
  avatarType?: 'male' | 'female';
  category: 'community' | 'peers' | 'practical';
  title: string;
  message: string;
  messageAr?: string;
  actionUrl?: string | null;
  unread: boolean;
  timeAgo: string;
  timeAgoAr: string;
  exactDate: string;
  createdAt: string;
}

const CATEGORY_ICONS: Record<'practical' | 'peers' | 'community', React.ReactNode> = {
  practical: <Briefcase size={16} className="text-brand-orange" />,
  peers: <Users size={16} className="text-teal-600" />,
  community: <MessageSquare size={16} className="text-blue-500" />,
};

export default function NotificationPage() {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'practical' | 'peers' | 'community'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Smart polling every 8s for live notifications
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const dismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await fetch('/api/notifications?all=true', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const filteredNotifications =
    activeTab === 'all'
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const counts = {
    all: notifications.length,
    practical: notifications.filter((n) => n.category === 'practical').length,
    peers: notifications.filter((n) => n.category === 'peers').length,
    community: notifications.filter((n) => n.category === 'community').length,
  };

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-10 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
                {t('notifications.title')}
              </h1>
              <p className="text-xs text-text-muted mt-1">
                {lang === 'ar'
                  ? 'تابع كل جديد في شغلك العملي، زمايلك، ومجتمع الكلية'
                  : 'Stay up to date with your practical work, peers, and college community'}
              </p>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  className="text-xs text-text-muted hover:text-brand-orange transition-colors font-medium"
                  onClick={markAllRead}
                >
                  {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </button>
                <span className="text-gray-300">·</span>
                <button
                  className="text-xs text-brand-orange hover:underline font-semibold"
                  onClick={clearAll}
                >
                  {t('notifications.clearAll')}
                </button>
              </div>
            )}
          </div>

          {/* 4 Distinct Category Tabs (All, Practical, Peers, Community) */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand-navy'
              }`}
            >
              <span>{t('common.all')}</span>
              <span className="text-[10px] opacity-75 bg-white/20 px-1.5 py-0.2 rounded-full">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('practical')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'practical'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand-orange'
              }`}
            >
              <Briefcase size={13} />
              <span>{t('notifications.practicalTab')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'practical' ? 'bg-white/20' : 'bg-orange-100 text-brand-orange font-bold'}`}>
                {counts.practical}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('peers')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'peers'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-teal-600'
              }`}
            >
              <Users size={13} />
              <span>{t('notifications.peersTab')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'peers' ? 'bg-white/20' : 'bg-teal-100 text-teal-700 font-bold'}`}>
                {counts.peers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-blue-600'
              }`}
            >
              <MessageSquare size={13} />
              <span>{t('notifications.communityTab')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'community' ? 'bg-white/20' : 'bg-blue-100 text-blue-700 font-bold'}`}>
                {counts.community}
              </span>
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-text-muted">جاري تحميل الإشعارات من قاعدة البيانات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔔
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">
                {t('notifications.allCaughtUp')}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {lang === 'ar'
                  ? 'لا توجد إشعارات في هذا القسم حالياً. أي نشاط جديد من زملائك أو أساتذتك سيظهر هنا فوراً.'
                  : 'No active notifications in this section right now. New activity will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => {
                const messageText = (lang === 'ar' && n.messageAr) ? n.messageAr : n.message;
                const timeText = (lang === 'ar' && n.timeAgoAr) ? n.timeAgoAr : n.timeAgo;

                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3.5 bg-white rounded-2xl p-4 shadow-sm border transition-all relative group ${
                      n.unread ? 'border-brand-orange/40 bg-orange-50/20' : 'border-gray-100'
                    }`}
                  >
                    {/* Live Sender Avatar with Category Badge */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={n.sender} avatarType={n.avatarType} src={n.avatar} size="md" />
                      <span className="absolute -bottom-1 -end-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        {CATEGORY_ICONS[n.category]}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-text-primary">{n.senderFullName || n.sender}</p>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            n.category === 'practical' ? 'bg-orange-100 text-brand-orange' :
                            n.category === 'peers' ? 'bg-teal-100 text-teal-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t(`notifications.${n.category}Tab` as any)}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted whitespace-nowrap" title={n.exactDate}>
                          {timeText}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-text-body mt-1 leading-relaxed">
                        {messageText}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {n.actionUrl && (
                          <Link
                            href={n.actionUrl}
                            className="text-xs font-bold text-brand-orange hover:text-brand-orange-dark transition-colors flex items-center gap-1"
                          >
                            <span>{t('notifications.viewAction')}</span>
                            <ChevronRight size={13} className="rtl:rotate-180" />
                          </Link>
                        )}
                        <button
                          onClick={() => dismiss(n.id)}
                          className="text-xs text-text-muted hover:text-red-500 transition-colors"
                        >
                          {t('notifications.dismiss')}
                        </button>
                      </div>
                    </div>

                    {/* Close / Dismiss button */}
                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-gray-300 hover:text-gray-500 transition-colors p-1"
                      aria-label="Dismiss notification"
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
