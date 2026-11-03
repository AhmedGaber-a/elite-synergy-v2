// src/app/practical/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, User, ArrowRight, Clock, BookOpen, Shield, ChevronRight, Zap, FolderGit2, Sparkles, Paperclip, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export interface PracticalProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'TEAM' | 'SOLO';
  source?: 'INTERNAL' | 'ERP' | string;
  erpReferenceId?: string;
  professorName?: string;
  courseCode?: string;
  deadline?: string;
  attachments?: string[];
  maxTeamSize?: number;
  maxTeams: number;
  teamsCount: number;
  availableTeamsCount: number;
  domain: string;
  forStudents?: string;
  level: number;
  doctor?: string;
  score: number;
  completionTime: string;
  maxSlots: number;
  isMega: boolean;
  phases: string[];
  category: string;
  createdAt?: string;
  updatedAt?: string;
  teams?: Array<{
    id: string;
    name: string;
    emoji: string;
    slots: number;
    maxSlots: number;
    membersCount: number;
  }>;
  submissionsCount?: number;
}

function formatDeadlineCountdown(deadlineStr?: string | null): {
  text: string;
  isExpired: boolean;
  days: number;
  hours: number;
} | null {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr).getTime();
  if (isNaN(deadline)) return null;
  const now = Date.now();
  const diff = deadline - now;
  if (diff <= 0) {
    return { text: 'انتهى موعد التسليم', isExpired: true, days: 0, hours: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) {
    return { text: `متبقي ${days} يوم و ${hours} ساعة`, isExpired: false, days, hours };
  }
  return { text: `متبقي ${hours} ساعة و ${minutes} دقيقة`, isExpired: false, days, hours };
}

export default function PracticalPage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'TEAM' | 'SOLO'>('TEAM');
  const [projects, setProjects] = useState<PracticalProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects from DB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const erpProjects = projects.filter((p) => p.source === 'ERP');
  const filteredProjects = projects.filter((p) => (p.source !== 'ERP' ? p.type === activeTab : false));

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen pb-20">
        {/* Academic Hub Hero */}
        <div className="relative bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white overflow-hidden py-14 md:py-18">
          <div className="section-container relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-white/10 shadow-sm">
              <Zap size={14} /> {lang === 'ar' ? 'المشاريع التطبيقية والعملية المعتمدة' : 'Official Academic Practical Projects'}
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              {lang === 'ar' ? 'مشاريع الدكاترة والأساتذة' : 'Faculty Approved Projects'}
            </h1>
            <p className="text-blue-200 text-sm md:text-base leading-relaxed">
              {lang === 'ar'
                ? 'استكشف التحديات والمشاريع التطبيقية المطروحة من أساتذة الكلية. اختر بين العمل الجماعي ضمن فرق معتمدة أو المشاريع الفردية المستقلة.'
                : 'Browse challenges and capstones assigned by department faculty. Choose between collaborative team endeavors or independent solo projects.'}
            </p>

            {/* Academic Tabs Switcher (TEAM vs. SOLO) */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setActiveTab('TEAM')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md ${
                  activeTab === 'TEAM'
                    ? 'bg-brand-orange text-white ring-2 ring-white/20 scale-105'
                    : 'bg-white/15 text-white/80 hover:bg-white/25 hover:text-white'
                }`}
              >
                <Users size={18} />
                <span>{lang === 'ar' ? 'مشاريع الفرق (Team Projects)' : 'Team Projects'}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">
                  {projects.filter((p) => (p.source !== 'ERP' ? p.type === 'TEAM' : false)).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('SOLO')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md ${
                  activeTab === 'SOLO'
                    ? 'bg-brand-orange text-white ring-2 ring-white/20 scale-105'
                    : 'bg-white/15 text-white/80 hover:bg-white/25 hover:text-white'
                }`}
              >
                <User size={18} />
                <span>{lang === 'ar' ? 'المشاريع الفردية (Solo Projects)' : 'Solo Projects'}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">
                  {projects.filter((p) => (p.source !== 'ERP' ? p.type === 'SOLO' : false)).length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="section-container py-10">
          {/* Conditional ERP Projects Section: Strictly rendered ONLY when source === "ERP" projects exist in database */}
          {erpProjects.length > 0 && (
            <div className="mb-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gradient-to-r from-brand-navy via-brand-blue to-indigo-900 p-6 rounded-3xl text-white shadow-md border border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-brand-orange/30">
                    <Sparkles size={13} />
                    <span>{lang === 'ar' ? 'ربط مباشر مع نظام الـ ERP الأكاديمي' : 'Live Sync with Academic ERP'}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black">
                    {lang === 'ar' ? 'مشاريع الـ ERP والتكليفات الأكاديمية الرسمية' : 'Official Faculty ERP Projects'}
                  </h2>
                  <p className="text-xs md:text-sm text-blue-200 mt-1">
                    {lang === 'ar'
                      ? 'مشاريع عملية معتمدة تم إرسالها وتكليفها مباشرة من أساتذة الكلية عبر نظام الـ ERP. تتضمن متطلبات وتكليفات رسمية ومواعيد تسليم نهائية محددة.'
                      : 'Accredited coursework pushed directly by department professors via ERP. Includes deliverables & strict deadlines.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-white/10 px-4 py-2 rounded-2xl border border-white/20 whitespace-nowrap">
                    {erpProjects.length} {lang === 'ar' ? 'مشاريع ERP نشطة' : 'Active ERP Projects'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {erpProjects.map((project) => {
                  const countdown = formatDeadlineCountdown(project.deadline);
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-orange via-blue-500 to-brand-navy" />

                      <div>
                        {/* Header badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {project.courseCode && (
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                                {project.courseCode}
                              </span>
                            )}
                            <Badge variant="navy" className="text-xs bg-blue-50 text-brand-navy border-none font-bold">
                              {project.category || project.domain}
                            </Badge>
                          </div>

                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-brand-orange border border-orange-200/50">
                            {project.type === 'TEAM'
                              ? (lang === 'ar' ? 'مشروع جماعي' : 'Team')
                              : (lang === 'ar' ? 'تسليم فردي' : 'Solo')}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-lg text-text-primary mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-xs text-text-body mb-4 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Metadata Box */}
                        <div className="bg-slate-50/80 rounded-2xl p-3.5 mb-4 space-y-2 text-xs border border-gray-100">
                          {project.professorName && (
                            <div className="flex items-center justify-between text-text-muted">
                              <span className="flex items-center gap-1">
                                <Shield size={12} className="text-brand-orange" /> الأستاذ المشرف:
                              </span>
                              <span className="font-bold text-text-primary">{project.professorName}</span>
                            </div>
                          )}

                          {project.erpReferenceId && (
                            <div className="flex items-center justify-between text-text-muted">
                              <span>معرف الـ ERP:</span>
                              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 font-semibold text-text-primary">
                                {project.erpReferenceId}
                              </span>
                            </div>
                          )}

                          {countdown && (
                            <div className="flex items-center justify-between text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={12} className={countdown.isExpired ? 'text-red-500' : 'text-green-600'} /> الموعد النهائي:
                              </span>
                              <span
                                className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                                  countdown.isExpired
                                    ? 'bg-red-50 text-red-600'
                                    : countdown.days < 3
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {countdown.text}
                              </span>
                            </div>
                          )}

                          {project.type === 'TEAM' && (
                            <div className="flex items-center justify-between text-text-muted pt-1 border-t border-gray-200/50">
                              <span>حالة فرق العمل:</span>
                              <span className="font-bold text-text-primary">
                                {project.teamsCount} من {project.maxTeams} فرق (حد الفريق {project.maxTeamSize || project.maxSlots || 5} طلاب)
                              </span>
                            </div>
                          )}

                          {project.attachments && project.attachments.length > 0 && (
                            <div className="flex items-center justify-between text-text-muted pt-1 border-t border-gray-200/50">
                              <span className="flex items-center gap-1">
                                <Paperclip size={12} /> مرفقات المقرر:
                              </span>
                              <span className="font-semibold text-text-primary">
                                {project.attachments.length} ملفات رسمية
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Link */}
                      <div className="pt-3 border-t border-gray-100">
                        <Link href={`/practical/${project.slug || project.id}`}>
                          <Button
                            variant="primary"
                            fullWidth
                            className="rounded-xl py-3 font-bold text-xs flex items-center justify-center gap-2 group-hover:shadow-md transition-all bg-gradient-to-r from-brand-orange to-amber-600"
                          >
                            <span>
                              {project.type === 'TEAM'
                                ? (lang === 'ar' ? 'عرض تفاصيل الـ ERP وفرق العمل' : 'View ERP Project & Teams')
                                : (lang === 'ar' ? 'عرض تفاصيل الـ ERP ومساحة التسليم' : 'View ERP Project & Submit')}
                            </span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-text-primary">
                {activeTab === 'TEAM'
                  ? (lang === 'ar' ? 'قائمة مشاريع فرق العمل الأكاديمية' : 'Academic Team Projects')
                  : (lang === 'ar' ? 'قائمة المشاريع الأكاديمية الفردية' : 'Solo Practical Projects')}
              </h2>
              <p className="text-xs md:text-sm text-text-muted mt-0.5">
                {activeTab === 'TEAM'
                  ? (lang === 'ar' ? 'اختر مشروعاً للانضمام لفريق أو تأسيس فريق جديد ضمن الحد المسموح' : 'Select a project to join or form a team within the quota limit')
                  : (lang === 'ar' ? 'مشاريع يتم إنجازها وتسليم مخرجاتها بشكل فردي ومباشر لأستاذ المادة' : 'Individual assignments submitted directly to your professor')}
              </p>
            </div>

            <span className="text-xs font-bold text-text-muted bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs">
              {filteredProjects.length} {lang === 'ar' ? 'مشاريع متاحة' : 'Available'}
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-text-muted">جاري تحميل المشاريع من قاعدة البيانات...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            /* Clean Zero State */
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
              <div className="w-20 h-20 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {activeTab === 'TEAM' ? '🤝' : '🎯'}
              </div>
              <h3 className="text-xl font-black text-text-primary mb-2">
                {activeTab === 'TEAM'
                  ? 'لا توجد مشاريع فرق عمل متاحة حالياً (0 Projects)'
                  : 'لا توجد مشاريع فردية متاحة حالياً (0 Projects)'}
              </h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                {lang === 'ar'
                  ? 'المشاريع العملية والتطبيقية يتم اعتمادها ورفعها مباشرة من قبل أساتذة المواد والدكاترة. ستظهر المشاريع فور إضافتها في النظام الأكاديمي.'
                  : 'Practical projects are uploaded and approved directly by faculty professors. They will appear here once published.'}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <Shield size={14} className="text-brand-orange" />
                <span>بانتظار اعتماد مشاريع الفصل الدراسي من مجلس الكلية</span>
              </div>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="navy" className="text-xs bg-blue-50 text-brand-navy border-none font-bold">
                          {project.category || project.domain}
                        </Badge>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-text-muted">
                          Level {project.level}
                        </span>
                      </div>

                      {project.type === 'TEAM' ? (
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full ${
                            project.availableTeamsCount > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {project.availableTeamsCount > 0
                            ? `${project.availableTeamsCount} شواغر فرق`
                            : 'اكتملت الفرق'}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                          تسليم فردي
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-lg text-text-primary mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-body mb-4 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Metadata Box */}
                    <div className="bg-gray-50/80 rounded-2xl p-3.5 mb-4 space-y-2 text-xs border border-gray-100">
                      {project.doctor && (
                        <div className="flex items-center justify-between text-text-muted">
                          <span>المشرف الأكاديمي:</span>
                          <span className="font-bold text-text-primary">{project.doctor}</span>
                        </div>
                      )}
                      {project.createdAt && (
                        <div className="flex items-center justify-between text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-brand-orange" /> تاريخ النشر:
                          </span>
                          <span className="font-semibold text-text-primary text-[11px]" title={formatArabicTimeAgo(project.createdAt).exact}>
                            {formatArabicTimeAgo(project.createdAt).exact} ({formatArabicTimeAgo(project.createdAt).relative})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-text-muted">
                        <span>المدة المقررة:</span>
                        <span className="font-semibold text-text-primary flex items-center gap-1">
                          <Clock size={12} /> {project.completionTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted">
                        <span>الدرجات / النقاط:</span>
                        <span className="font-bold text-brand-orange font-mono">
                          +{project.score} pts
                        </span>
                      </div>
                      {project.type === 'TEAM' && (
                        <div className="flex items-center justify-between text-text-muted pt-1 border-t border-gray-200/50">
                          <span>الفرق المسجلة:</span>
                          <span className="font-bold text-text-primary">
                            {project.teamsCount} من أصل {project.maxTeams} فرق
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-gray-100">
                    <Link href={`/practical/${project.slug || project.id}`}>
                      <Button
                        variant="primary"
                        fullWidth
                        className="rounded-xl py-3 font-bold text-xs flex items-center justify-center gap-2 group-hover:shadow-md transition-all"
                      >
                        <span>
                          {project.type === 'TEAM'
                            ? (lang === 'ar' ? 'دخول تفاصيل المشروع وفرق العمل' : 'View Project & Teams')
                            : (lang === 'ar' ? 'دخول مساحة التسليم الفردي' : 'View Project & Submit')}
                        </span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
