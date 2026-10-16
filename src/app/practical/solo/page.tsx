// src/app/practical/solo/page.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SOLO_CASES, SOLO_CATEGORIES } from '@/lib/data/projects'
import { Clock, BookOpen, ChevronRight, FileText, CheckCircle2, User } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function SoloCasesPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'available' | 'previous'>('available')
  const [activeCategory, setActiveCategory] = useState(SOLO_CATEGORIES[0].label)

  const filteredCases = SOLO_CASES.filter(c => c.category === activeCategory)

  // All previous student solutions from all cases
  const allSolutions = SOLO_CASES.flatMap(c =>
    (c.previousSolutions ?? []).map(sol => ({ ...sol, caseTitle: c.title, caseCategory: c.category, caseId: c.id }))
  )

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-orange">Home</Link>
            <ChevronRight size={14} />
            <Link href="/practical" className="hover:text-brand-orange">Practical</Link>
            <ChevronRight size={14} />
            <span className="text-text-primary font-medium">Solo Cases</span>
          </nav>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary text-center mb-3">
            Practical Learning Cases
          </h1>
          <p className="text-center text-text-muted mb-8 max-w-2xl mx-auto">
            Choose a case, solve it independently, and submit your solution to your supervisor.
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'available'
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand-navy hover:text-brand-navy'
              }`}
            >
              {t('practical.available')}
              <span className="ms-2 text-xs opacity-70">({SOLO_CASES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'previous'
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand-orange hover:text-brand-orange'
              }`}
            >
              {t('practical.previous')}
              <span className="ms-2 text-xs opacity-70">({allSolutions.length})</span>
            </button>
          </div>

          {/* Category tabs (available only) */}
          {activeTab === 'available' && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide justify-center">
              {SOLO_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                    activeCategory === cat.label
                      ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                      : 'bg-white border-gray-200 text-text-muted hover:text-brand-orange hover:border-brand-orange'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Available Cases */}
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.length > 0 ? filteredCases.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="navy" className="bg-transparent text-text-primary border border-gray-200 text-xs">{c.category}</Badge>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      c.level === 'Beginner' ? 'bg-teal-100 text-teal-700' :
                      c.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {c.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors">{c.title}</h3>
                  <p className="text-text-body text-sm mb-4 line-clamp-3 flex-1">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                    <div className="flex items-center gap-1"><Clock size={14} /> {c.completionTime}</div>
                    <div className="flex items-center gap-1"><BookOpen size={14} /> {c.score} {t('common.points')}</div>
                  </div>
                  {/* Supervisor */}
                  {c.supervisors.length > 0 && (
                    <p className="text-xs text-text-muted mb-4 flex items-center gap-1">
                      <User size={12} /> {c.supervisors.join(', ')}
                    </p>
                  )}
                  <Link href={`/practical/solo/${c.id}`} className="mt-auto">
                    <Button variant="outline" fullWidth className="border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white transition-all font-bold rounded-xl shadow-xs">
                      {t('practical.viewCase')}
                    </Button>
                  </Link>
                </div>
              )) : (
                <div className="col-span-full text-center py-16 text-text-muted">
                  <div className="text-5xl mb-4">📂</div>
                  <p className="font-medium">No cases in this category yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}

          {/* Previous Cases — with student submissions */}
          {activeTab === 'previous' && (
            <div className="space-y-8">
              {SOLO_CASES.filter(c => (c.previousSolutions ?? []).length > 0).map(c => (
                <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Case header */}
                  <div className="bg-gradient-to-r from-brand-navy to-brand-blue p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="orange" className="text-[10px] mb-2">{c.category}</Badge>
                        <h3 className="font-bold text-base">{c.title}</h3>
                        <p className="text-white/60 text-xs mt-1 flex items-center gap-2">
                          <Clock size={12} /> {c.completionTime}
                          <span>·</span>
                          <BookOpen size={12} /> {c.score} pts
                        </p>
                      </div>
                      <Link href={`/practical/solo/${c.id}`}>
                        <Button variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs">
                          {t('practical.openCase')}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Student Submissions */}
                  <div className="p-5">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={13} /> Student Submitted Solutions ({(c.previousSolutions ?? []).length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(c.previousSolutions ?? []).map(sol => (
                        <div key={sol.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-orange/30 transition-colors group">
                          <Avatar name={sol.author} size="md" className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-text-primary truncate">{sol.author}</p>
                              {sol.isSample && (
                                <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Sample
                                </span>
                              )}
                            </div>
                            {sol.submittedAt && (
                              <p className="text-[10px] text-text-muted mb-2">{sol.submittedAt}</p>
                            )}
                            <p className="text-xs text-text-body line-clamp-2">{sol.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {SOLO_CASES.filter(c => (c.previousSolutions ?? []).length > 0).length === 0 && (
                <div className="text-center py-16 text-text-muted">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="font-medium">No previous submissions yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
