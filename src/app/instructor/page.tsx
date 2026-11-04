'use client';
// src/app/instructor/page.tsx
// Instructor view: students' completed projects and approved cases, split by department.
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/context/AuthContext';
import { DEPARTMENTS } from '@/lib/departments';

type Project = { id: string; title: string; domain: string; grade: string; completedDate: string };
type Case = { id: string; caseTitle: string; fileName: string; grade: number | null; reviewedAt: string | null };
type Student = {
  id: string;
  name: string;
  fullName: string;
  college: string;
  academicYear: number | null;
  specialty: string;
  points: number;
  projects: Project[];
  approvedCases: Case[];
};

export default function InstructorPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [department, setDepartment] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const params = department ? `?college=${encodeURIComponent(department)}` : '';
    fetch(`/api/instructor/students${params}`, { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || t('instr.loadFail'));
          setStudents([]);
          return;
        }
        setError('');
        setStudents(data.students || []);
      })
      .catch(() => setError(t('instr.serverErr')))
      .finally(() => setLoading(false));
  }, [department, isAuthenticated]);

  const isInstructor = user?.userRole === 'INSTRUCTOR' || user?.userRole === 'ADMIN';

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen pb-12">
        <div className="section-container py-8">
          <h1 className="text-2xl font-black text-text-primary mb-1">{t('instr.title')}</h1>
          <p className="text-sm text-text-muted mb-6">{t('instr.sub')}</p>

          {!isInstructor && !loading ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
              <p className="font-bold text-text-primary">{t('instr.doctorsOnly')}</p>
              <p className="text-sm text-text-muted mt-2">{t('instr.contactAdmin')}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setDepartment('')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${department === '' ? 'bg-brand-navy text-white' : 'bg-white text-text-body border border-gray-100'}`}
                >
                  {t('instr.allDepts')}
                </button>
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDepartment(d.label)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${department === d.label ? 'bg-brand-orange text-white' : 'bg-white text-text-body border border-gray-100'}`}
                  >
                    {d.labelAr}
                  </button>
                ))}
              </div>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              {loading ? (
                <p className="text-sm text-text-muted">{t('common.loading')}</p>
              ) : students.length === 0 ? (
                <p className="text-sm text-text-muted">{t('instr.noData')}</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {students.map((s) => (
                    <div key={s.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-text-primary">{s.fullName || s.name}</h3>
                          <p className="text-xs text-text-muted mt-0.5">
                            {s.college}{s.academicYear ? ` · ${t('instr.yearWord')} ${s.academicYear}` : ''}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brand-orange">{s.points} {t('instr.points')}</span>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold text-text-primary mb-1">{t('instr.doneProjects')} ({s.projects.length})</p>
                        {s.projects.length === 0 ? (
                          <p className="text-xs text-text-muted">{t('instr.none')}</p>
                        ) : (
                          <ul className="text-xs text-text-body space-y-1">
                            {s.projects.map((p) => (
                              <li key={p.id}>• {p.title} · {p.domain} · {p.grade}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-bold text-text-primary mb-1">{t('instr.approvedCases')} ({s.approvedCases.length})</p>
                        {s.approvedCases.length === 0 ? (
                          <p className="text-xs text-text-muted">{t('instr.none')}</p>
                        ) : (
                          <ul className="text-xs text-text-body space-y-1">
                            {s.approvedCases.map((c) => (
                              <li key={c.id}>• {c.caseTitle || c.fileName}{c.grade !== null ? ` · ${c.grade}/100` : ''}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
