// src/app/notification/page.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  X, UserPlus, Mail, Users, BookOpen, CheckCircle2,
  Briefcase, Heart, MessageSquare, ChevronRight, Check
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { NOTIFICATIONS, NotificationCategory, Notification } from '@/lib/data/notifications'
import { useLanguage } from '@/lib/context/LanguageContext'

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  practical: <Briefcase size={16} className="text-brand-orange" />,
  peers: <Users size={16} className="text-brand-teal" />,
  community: <MessageSquare size={16} className="text-blue-500" />,
}

export default function NotificationPage() {
  const { lang, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all')
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS)

  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))
  
  const accept = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    )
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const clearAll = () => setNotifications([])

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeTab)

  const counts = {
    all: notifications.length,
    practical: notifications.filter(n => n.category === 'practical').length,
    peers: notifications.filter(n => n.category === 'peers').length,
    community: notifications.filter(n => n.category === 'community').length,
  }

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

          {/* 3 Distinct Category Tabs */}
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'practical' ? 'bg-white/20' : 'bg-orange-100 text-brand-orange'}`}>
                {counts.practical}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('peers')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'peers'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand-teal'
              }`}
            >
              <Users size={13} />
              <span>{t('notifications.peersTab')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'peers' ? 'bg-white/20' : 'bg-teal-100 text-teal-700'}`}>
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'community' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                {counts.community}
              </span>
            </button>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-5xl mb-4">🔔</p>
              <h3 className="font-bold text-base text-text-primary mb-1">
                {t('notifications.allCaughtUp')}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {lang === 'ar'
                  ? 'مفيش إشعارات في القسم ده حالياً. أي نشاط جديد هيظهرلك هنا على طول.'
                  : 'No active notifications in this section right now. New activity will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(n => {
                const messageText = (lang === 'ar' && n.messageAr) ? n.messageAr : n.message
                const timeText = (lang === 'ar' && n.timeAgoAr) ? n.timeAgoAr : n.timeAgo

                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3.5 bg-white rounded-2xl p-4 shadow-sm border transition-all relative group ${
                      n.unread ? 'border-brand-orange/40 bg-orange-50/20' : 'border-gray-100'
                    }`}
                  >
                    {/* Avatar with Category Badge */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={n.sender} avatarType={n.avatarType} size="md" />
                      <span className="absolute -bottom-1 -end-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        {CATEGORY_ICONS[n.category]}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text-primary">{n.sender}</p>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            n.category === 'practical' ? 'bg-orange-100 text-brand-orange' :
                            n.category === 'peers' ? 'bg-teal-100 text-teal-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t(`notifications.${n.category}Tab` as any)}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">{timeText}</span>
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
                          onClick={() => accept(n.id)}
                          className="text-xs font-semibold text-text-primary hover:text-brand-orange transition-colors"
                        >
                          {t('notifications.accept')}
                        </button>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="text-xs text-text-muted hover:text-red-500 transition-colors"
                        >
                          {t('notifications.dismiss')}
                        </button>
                      </div>
                    </div>

                    {/* Close / Dismiss */}
                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-gray-300 hover:text-gray-500 transition-colors p-1"
                      aria-label="Dismiss notification"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
