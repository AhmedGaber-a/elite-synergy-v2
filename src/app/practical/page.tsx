// src/app/practical/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, User, ArrowRight, Clock, BookOpen, Shield, ChevronRight, Zap, FolderGit2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface PracticalProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'TEAM' | 'SOLO';
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

  const filteredProjects = projects.filter((p) => p.type === activeTab);

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
                  {projects.filter((p) => p.type === 'TEAM').length}
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
                  {projects.filter((p) => p.type === 'SOLO').length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="section-container py-10">
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
