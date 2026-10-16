// src/app/practical/solo/[id]/page.tsx
'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronRight, Clock, BookOpen, Upload, CheckCircle2,
  FileText, AlertCircle, User, ChevronDown, ChevronUp, X, Send,
  Play, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, Download
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SOLO_CASES } from '@/lib/data/projects'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function SoloCaseDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const caseData = SOLO_CASES.find(c => c.id === id)
  const { t, lang } = useLanguage()

  // Requirement 1: User starts in 'View Case' mode. Only clicking 'Start Practice' unlocks practice/submission.
  const [isPracticeStarted, setIsPracticeStarted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [note, setNote] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('background')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const submissionSectionRef = useRef<HTMLDivElement>(null)

  const handleStartPractice = () => {
    setIsPracticeStarted(true)
    setTimeout(() => {
      submissionSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (uploadedFiles.length === 0 && !note.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }

  const toggleSection = (key: string) =>
    setExpandedSection(prev => prev === key ? null : key)

  if (!caseData) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-bg-cream">
          <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {lang === 'ar' ? 'الكيس مش موجودة' : 'Case Not Found'}
            </h2>
            <p className="text-text-muted mb-6 text-sm">
              {lang === 'ar' ? 'الكيس دي مش متاحة أو تم نقلها.' : "This case doesn't exist or has been removed."}
            </p>
            <Link href="/practical/solo">
              <Button variant="primary" className="rounded-xl">
                {lang === 'ar' ? '← ارجع للكيسات' : '← Back to Cases'}
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-bg-cream p-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-lg w-full shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={44} className="text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-3">
              {t('practical.solutionSubmitted')}
            </h2>
            <p className="text-text-body text-sm md:text-base mb-2">
              {lang === 'ar' ? 'حلك للكيس' : 'Your solution for'}{' '}
              <strong className="text-brand-orange">&ldquo;{caseData.title}&rdquo;</strong>{' '}
              {lang === 'ar' ? 'وصل بنجاح للمشرف!' : 'was submitted successfully!'}
            </p>
            <p className="text-xs md:text-sm text-text-muted mb-8 leading-relaxed">
              {t('practical.submissionFeedback')}{' '}
              {lang === 'ar'
                ? `مشرف الكيس: ${caseData.supervisors.join('، ')}`
                : `Supervisor: ${caseData.supervisors.join(', ')}`}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/practical/solo" className="flex-1">
                <Button variant="outline" fullWidth className="rounded-xl font-bold">
                  {lang === 'ar' ? 'كيسات تانية' : 'More Cases'}
                </Button>
              </Link>
              <Link href="/profile" className="flex-1">
                <Button variant="primary" fullWidth className="rounded-xl font-bold">
                  {t('nav.myProfile')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const sections = [
    { key: 'background', title: t('practical.companyBackground'), content: caseData.companyBackground, icon: '🏢' },
    { key: 'problem', title: t('practical.businessProblem'), content: caseData.businessProblem, icon: '⚠️' },
  ]

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-orange">{t('nav.home')}</Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <Link href="/practical" className="hover:text-brand-orange">{t('nav.practical')}</Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <Link href="/practical/solo" className="hover:text-brand-orange">{t('practical.solo')}</Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <span className="text-text-primary font-bold line-clamp-1">{caseData.title}</span>
          </nav>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* ─── Main Content: Case Details & Requirements ───── */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Case Header Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 end-0 w-44 h-44 bg-gradient-to-bl from-orange-100/60 to-transparent rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="navy" className="text-xs bg-gray-100 text-brand-navy border-none font-bold">
                      {caseData.category}
                    </Badge>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      caseData.level === 'Beginner' ? 'bg-teal-100 text-teal-700' :
                      caseData.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {caseData.level}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={13} />
                      {t('common.verified')}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-3 leading-snug">
                    {caseData.title}
                  </h1>
                  <p className="text-text-body text-sm md:text-base mb-6 leading-relaxed">
                    {caseData.description}
                  </p>

                  <div className="flex flex-wrap gap-5 text-xs md:text-sm text-text-muted pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-brand-orange" />
                      <span><strong>{t('common.duration')}:</strong> {caseData.completionTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-brand-orange" />
                      <span><strong>{t('common.points')}:</strong> {caseData.score} {t('common.points')}</span>
                    </div>
                    {caseData.supervisors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-brand-orange" />
                        <span><strong>{t('common.supervisors')}:</strong> {caseData.supervisors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement 1: Prominent "Start Practice" CTA Banner inside the Case Details view */}
              {!isPracticeStarted && (
                <div className="bg-gradient-to-r from-brand-orange to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-orange-500/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1.5 text-center sm:text-start">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold text-white mb-1">
                      <Sparkles size={13} />
                      <span>{t('practical.viewCaseDetails')}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black">
                      {t('practical.readyToSolve')}
                    </h2>
                    <p className="text-white/90 text-xs md:text-sm max-w-xl leading-relaxed">
                      {t('practical.readyToSolveDesc')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleStartPractice}
                    className="bg-white text-brand-orange hover:bg-white/90 text-sm md:text-base font-extrabold px-7 py-3 rounded-2xl shadow-md whitespace-nowrap hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Play size={18} className="fill-brand-orange" />
                    <span>{t('practical.startPractice')}</span>
                  </Button>
                </div>
              )}

              {/* Case Brief — Collapsible Company Background & Problem */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <FileText size={18} className="text-brand-orange" />
                  <span>{t('practical.caseRequirements')}</span>
                </h2>

                {sections.map(s => (
                  <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors text-start"
                      onClick={() => toggleSection(s.key)}
                    >
                      <span className="font-bold text-text-primary text-sm flex items-center gap-2">
                        <span>{s.icon}</span> {s.title}
                      </span>
                      {expandedSection === s.key ? (
                        <ChevronUp size={18} className="text-brand-orange" />
                      ) : (
                        <ChevronDown size={18} className="text-text-muted" />
                      )}
                    </button>
                    {expandedSection === s.key && (
                      <div className="px-6 pb-5 text-sm text-text-body leading-relaxed border-t border-gray-100 pt-4 bg-gray-50/30">
                        {s.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Relevant Data */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm md:text-base">
                  <span>📊</span> {t('practical.relevantData')}
                </h3>
                <ul className="space-y-2.5">
                  {caseData.relevantData.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                      <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks to Solve */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm md:text-base">
                  <span>✅</span> {t('practical.tasksToSolve')}
                </h3>
                <ul className="space-y-3">
                  {caseData.tasksToSolve.map((task, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                      <div className="w-5 h-5 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expected Deliverables */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm md:text-base">
                  <span>📦</span> {t('practical.expectedDeliverables')}
                </h3>
                <ul className="space-y-2">
                  {caseData.expectedDeliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs md:text-sm">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-text-body leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hints from Supervisor */}
              {caseData.hints && caseData.hints.length > 0 && (
                <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-200/60">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                    <AlertCircle size={18} className="text-amber-600" />
                    <span>{t('practical.supervisorHints')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {caseData.hints.map((h, i) => (
                      <li key={i} className="text-xs md:text-sm text-amber-800 flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-amber-500 mt-0.5">💡</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Previous Student Solutions */}
              {caseData.previousSolutions && caseData.previousSolutions.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm md:text-base">
                    <span>👥</span>
                    <span>{lang === 'ar' ? 'حلول نموذجية من الطلاب السابقين' : 'Sample Previous Student Solutions'}</span>
                  </h3>
                  <div className="space-y-3">
                    {caseData.previousSolutions.map(sol => (
                      <div key={sol.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar name={sol.author} size="sm" />
                          <div>
                            <p className="font-bold text-xs text-text-primary">{sol.author}</p>
                            <p className="text-[10px] text-text-muted">{sol.submittedAt ?? 'Spring Semester'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-text-body leading-relaxed">{sol.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Sidebar: Practice & Submission Flow ────────── */}
            <div className="w-full xl:w-96 flex-shrink-0" ref={submissionSectionRef}>
              <div className="sticky top-24 space-y-6">

                {/* State A: Not started yet -> View Case state card */}
                {!isPracticeStarted ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <Play size={28} className="fill-brand-orange ms-1" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-text-primary">
                        {lang === 'ar' ? 'ابدأ حل الكيس' : 'Ready to begin?'}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {lang === 'ar'
                          ? 'اقرأ المتطلبات كويس، واضغط ع الزرار ده عشان تفتح مساحة الشغل وترفع حلك للدكتور.'
                          : 'Review the requirements on the left, then click below to officially start your practice workspace.'}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleStartPractice}
                      className="rounded-2xl py-3.5 font-bold shadow-md shadow-brand-orange/25 hover:scale-[1.02] transition-transform text-sm flex items-center justify-center gap-2"
                    >
                      <Play size={16} className="fill-white" />
                      <span>{t('practical.startPractice')}</span>
                    </Button>
                    <p className="text-[11px] text-text-muted">
                      {lang === 'ar' ? '⏱️ وقت التسليم المحسوب:' : '⏱️ Estimated Duration:'} {caseData.completionTime}
                    </p>
                  </div>
                ) : (
                  /* State B: Started -> Active Practice & Submission Card */
                  <div className="bg-white rounded-3xl border border-brand-orange/30 shadow-md overflow-hidden animate-in fade-in duration-200">
                    <div className="bg-gradient-to-br from-brand-navy to-brand-blue p-5 text-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-green-500/20 text-green-300 rounded-full border border-green-400/30">
                          {t('practical.practiceActive')} ✓
                        </span>
                        <span className="text-xs text-white/70 font-mono">
                          +{caseData.score} pts
                        </span>
                      </div>
                      <h2 className="font-extrabold text-base md:text-lg">
                        {t('practical.submitSolution')}
                      </h2>
                      <p className="text-white/70 text-xs mt-0.5">
                        {lang === 'ar' ? 'ارفع ملفات الحل لمشرف الكيس' : 'Upload your work files for supervisor grading'}
                      </p>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Drag & Drop File Upload Area */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFiles}
                        multiple
                        className="hidden"
                      />
                      <div
                        className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/30 transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const files = Array.from(e.dataTransfer.files)
                          setUploadedFiles(prev => [...prev, ...files])
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100/70 text-brand-orange flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-text-primary">
                          {t('practical.uploadFile')}
                        </p>
                        <p className="text-[10px] text-text-muted mt-1">
                          {t('practical.dragDropFiles')}
                        </p>
                        <p className="text-[9px] text-text-muted/70 mt-1 font-mono">
                          PDF, DOCX, XLSX, ZIP — Max 50MB
                        </p>
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            {lang === 'ar' ? 'الملفات المرفوعة' : 'Selected Files'} ({uploadedFiles.length})
                          </p>
                          {uploadedFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={14} className="text-brand-orange flex-shrink-0" />
                                <span className="font-medium text-text-primary truncate">{f.name}</span>
                              </div>
                              <button
                                onClick={() => removeFile(i)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Note for Supervisor */}
                      <div>
                        <label className="block text-xs font-bold text-text-primary mb-1.5">
                          {t('practical.notesForSupervisor')}
                        </label>
                        <textarea
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={
                            lang === 'ar'
                              ? 'اكتب نبذة عن طريقتك في الحل أو أسئلة للمشرف...'
                              : 'Write a brief description of your approach or questions for the supervisor...'
                          }
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting || (uploadedFiles.length === 0 && !note.trim())}
                        className="rounded-xl py-3 font-bold text-sm shadow-md shadow-brand-orange/20"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('common.loading')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <Send size={15} />
                            <span>{t('practical.submitSolution')}</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Case Info / Supervisor Card */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-text-muted uppercase tracking-wider">
                    {lang === 'ar' ? 'معلومات الكيس' : 'Case Specifications'}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-text-muted">{t('common.category')}:</span>
                      <span className="font-bold text-text-primary">{caseData.category}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-text-muted">{t('common.level')}:</span>
                      <span className="font-bold text-text-primary">{caseData.level}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-text-muted">{t('common.points')}:</span>
                      <span className="font-bold text-brand-orange font-mono">+{caseData.score} pts</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-text-muted">{t('common.supervisors')}:</span>
                      <span className="font-bold text-text-primary">{caseData.supervisors.join(', ')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
