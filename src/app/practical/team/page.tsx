// src/app/practical/team/page.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search, Grid, List, SlidersHorizontal, X, Users, Clock,
  Plus, Sparkles, Zap, ChevronRight, Crown
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TEAM_PROJECTS, FILTER_CATEGORIES, FILTER_DOCTORS, FILTER_POINTS, FILTER_LEVELS } from '@/lib/data/projects'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useLanguage } from '@/lib/context/LanguageContext'

// ─── Filter group ──────────────────────────────────────────────────────────────
function FilterGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string
  items: { label: string; count: number; value?: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-xs text-text-muted uppercase tracking-wider mb-3">{title}</h4>
      {items.map((item) => {
        const val = item.value || item.label
        const isSelected = selected.includes(val)
        return (
          <label key={val} className="flex items-center justify-between py-2 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected ? 'bg-brand-orange border-brand-orange' : 'border-gray-300 group-hover:border-brand-orange'
                }`}
              >
                {isSelected && (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(val)} className="sr-only" />
              </div>
              <span className={`text-xs transition-colors ${isSelected ? 'font-bold text-text-primary' : 'text-text-body group-hover:text-text-primary'}`}>
                {item.label}
              </span>
            </div>
            <span className="text-[10px] text-text-muted bg-gray-100 px-1.5 py-0.5 rounded-full">{item.count}</span>
          </label>
        )
      })}
    </div>
  )
}

// ─── Create Team Modal ────────────────────────────────────────────────────────
function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [maxMembers, setMaxMembers] = useState('4')
  const [category, setCategory] = useState('')
  const [created, setCreated] = useState(false)

  const submit = () => {
    if (!teamName.trim()) return
    setCreated(true)
  }

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary mb-2">Team Created!</h2>
          <p className="text-text-body mb-2">
            <strong>&ldquo;{teamName}&rdquo;</strong> is ready. Share the invite link with your teammates.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-muted font-mono mb-6 select-all">
            elitesynergy.io/team/join/TS-{Math.random().toString(36).slice(2,8).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth className="rounded-xl" onClick={onClose}>Close</Button>
            <Button variant="primary" fullWidth className="rounded-xl">Copy Link</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-blue px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">Create a Team</h2>
            <p className="text-white/60 text-xs mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-white/20 relative">
          <div className={`h-1 bg-brand-orange transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">Team Name <span className="text-red-500">*</span></label>
                <input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. InnoTeam Alpha"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is your team working on?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm bg-gray-50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth className="rounded-xl" onClick={onClose}>Cancel</Button>
                <Button variant="primary" fullWidth className="rounded-xl" onClick={() => setStep(2)} disabled={!teamName.trim()}>
                  Next →
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">Project Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm bg-gray-50"
                >
                  <option value="">Select a category...</option>
                  {FILTER_CATEGORIES.map(c => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">Max Team Size</label>
                <div className="flex gap-2 flex-wrap">
                  {['2', '3', '4', '5', '6', '11'].map(n => (
                    <button
                      key={n}
                      onClick={() => setMaxMembers(n)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        maxMembers === n
                          ? 'bg-brand-orange text-white border-brand-orange'
                          : 'bg-gray-50 text-text-body border-gray-200 hover:border-brand-orange'
                      }`}
                    >
                      {n} {n === '11' ? '🏆 Mega' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Team Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-navy to-brand-blue rounded-2xl flex items-center justify-center text-xl">🚀</div>
                  <div>
                    <p className="font-bold text-text-primary">{teamName || 'Your Team Name'}</p>
                    <p className="text-xs text-text-muted">{category || 'No category'} · Max {maxMembers} members</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" fullWidth className="rounded-xl" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" fullWidth className="rounded-xl" onClick={submit}>
                  🚀 Create Team
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SCORE_COLORS: Record<number, 'teal' | 'orange' | 'blue'> = {
  200: 'teal', 300: 'orange', 400: 'blue', 500: 'orange', 600: 'blue', 1000: 'orange',
}
const PROJECT_EMOJIS = ['📊', '🏗️', '💼', '🔬', '📈', '⚙️', '🌐', '🤖']

export default function TeamProjectsPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
  const [selectedPoints, setSelectedPoints] = useState<string[]>(['all'])
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['all'])
  const [filterOpen, setFilterOpen] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)

  const toggle = (arr: string[], val: string, setArr: React.Dispatch<React.SetStateAction<string[]>>) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const filtered = TEAM_PROJECTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(p.category)
    const matchDoc = selectedDoctors.length === 0 || selectedDoctors.includes(p.doctor)
    return matchSearch && matchCat && matchDoc
  })

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedDoctors([])
    setSelectedPoints(['all'])
    setSelectedLevels(['all'])
    setSearch('')
  }

  const activeFilterCount = selectedCategories.length + selectedDoctors.length +
    (selectedPoints[0] !== 'all' ? 1 : 0) + (selectedLevels[0] !== 'all' ? 1 : 0)

  // Mega project first
  const megaProject = filtered.find(p => p.isMega)
  const regularProjects = filtered.filter(p => !p.isMega)

  function FilterSidebar() {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-text-primary">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs text-brand-orange hover:underline flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <FilterGroup title="Category" items={FILTER_CATEGORIES} selected={selectedCategories}
          onToggle={v => toggle(selectedCategories, v, setSelectedCategories)} />
        <FilterGroup title="Supervisor" items={FILTER_DOCTORS} selected={selectedDoctors}
          onToggle={v => toggle(selectedDoctors, v, setSelectedDoctors)} />
        <FilterGroup title="Points" items={FILTER_POINTS} selected={selectedPoints}
          onToggle={v => setSelectedPoints([v])} />
        <FilterGroup title="Level" items={FILTER_LEVELS} selected={selectedLevels}
          onToggle={v => setSelectedLevels([v])} />
      </div>
    )
  }

  return (
    <AppLayout>
      {createTeamOpen && <CreateTeamModal onClose={() => setCreateTeamOpen(false)} />}

      <div className="bg-bg-cream min-h-screen">
        {/* Hero */}
        <div className="bg-brand-navy text-white py-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-transparent to-transparent" />
          <div className="section-container relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Team Projects</h1>
            <p className="text-blue-200 max-w-2xl mx-auto text-lg">
              Collaborate with peers, tackle real business challenges, and earn points together.
            </p>
          </div>
        </div>

        <div className="section-container py-8">
          {/* ─── Action Bar ─── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full ps-11 pe-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white text-sm shadow-sm"
              />
            </div>

            {/* Create Team Button */}
            <Button
              variant="primary"
              className="rounded-2xl font-bold whitespace-nowrap"
              onClick={() => setCreateTeamOpen(true)}
            >
              <Plus size={18} className="me-2" /> {t('practical.createTeam')}
            </Button>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm font-medium shadow-sm hover:border-brand-orange transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-text-primary'}`}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-text-primary'}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          {filterOpen && (
            <div className="lg:hidden mb-6">
              <FilterSidebar />
            </div>
          )}

          <div className="flex gap-7">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-muted mb-5">
                Showing <span className="font-bold text-text-primary">{filtered.length}</span> project{filtered.length !== 1 ? 's' : ''}
                {search && <> for &ldquo;<span className="text-brand-orange">{search}</span>&rdquo;</>}
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-5xl mb-4">🔎</p>
                  <h3 className="text-xl font-bold text-text-primary mb-2">No projects found</h3>
                  <p className="text-text-muted text-sm mb-6">Try adjusting your search or filters.</p>
                  <Button variant="primary" size="sm" className="rounded-full" onClick={clearAll}>Clear Filters</Button>
                </div>
              ) : (
                <>
                  {/* ── MEGA Project Banner ── */}
                  {megaProject && (
                    <Link href={`/practical/team/${megaProject.id}`} className="block mb-8 group">
                      <div className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30">
                        {/* Animated grid background */}
                        <div className="absolute inset-0 opacity-10"
                          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                        {/* Glow */}
                        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-96 h-40 bg-purple-500/30 rounded-full blur-3xl" />

                        <div className="relative z-10 p-7 md:p-9">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/30">
                              <Crown size={10} /> MEGA PROJECT
                            </span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full border border-purple-400/30">
                              {megaProject.category}
                            </span>
                            {(megaProject.megaDomains ?? []).map(d => (
                              <span key={d} className="text-[10px] font-bold px-3 py-1 bg-white/10 text-white/70 rounded-full border border-white/20">
                                {d}
                              </span>
                            ))}
                          </div>

                          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight group-hover:text-purple-200 transition-colors">
                            {megaProject.title}
                          </h2>
                          <p className="text-white/60 text-sm mb-6 max-w-2xl leading-relaxed line-clamp-2">
                            {megaProject.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-6">
                            <span className="flex items-center gap-1.5"><Users size={14} /> {megaProject.members} members required</span>
                            <span className="flex items-center gap-1.5"><Clock size={14} /> {megaProject.completionTime}</span>
                            <span className="flex items-center gap-1.5"><Zap size={14} className="text-yellow-400" /> {megaProject.score} points</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {['A','B','C','D','E'].map((l, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                  {l}
                                </div>
                              ))}
                              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white/60 font-bold">
                                +6
                              </div>
                            </div>
                            <Button variant="ghost" className="bg-white text-purple-900 hover:bg-purple-50 font-bold rounded-xl border-0 group-hover:shadow-lg transition-all">
                              Enter Workspace <ChevronRight size={16} className="ms-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Regular Projects */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {regularProjects.map((project, idx) => (
                        <Link key={project.id} href={`/practical/team/${project.id}`} className="group block">
                          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
                            <div className="h-40 bg-gradient-to-br from-brand-navy to-brand-blue relative flex items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#F97316,_transparent)]" />
                              <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                                {PROJECT_EMOJIS[idx % PROJECT_EMOJIS.length]}
                              </span>
                              <div className="absolute top-3 end-3">
                                <Badge variant={SCORE_COLORS[project.score] || 'orange'} size="sm">
                                  {project.score} pts
                                </Badge>
                              </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                              <Badge variant="navy" className="text-[10px] bg-gray-100 text-text-muted border-none mb-2 self-start">
                                {project.category}
                              </Badge>
                              <h3 className="font-bold text-sm text-text-primary mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors leading-snug">
                                {project.title}
                              </h3>
                              <p className="text-xs text-text-body mb-4 line-clamp-2 flex-1 leading-relaxed">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-text-muted mb-4">
                                <span className="flex items-center gap-1"><Clock size={12} /> {project.completionTime}</span>
                                <span className="flex items-center gap-1"><Users size={12} /> {project.members} members</span>
                              </div>
                              <Button variant="navy" size="sm" fullWidth className="rounded-xl group-hover:bg-brand-orange transition-colors duration-300">
                                {t('practical.viewJoin')}
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {regularProjects.map((project, idx) => (
                        <Link key={project.id} href={`/practical/team/${project.id}`} className="group block">
                          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all flex gap-5 items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-navy to-brand-blue rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-105 transition-transform">
                              {PROJECT_EMOJIS[idx % PROJECT_EMOJIS.length]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 mb-1">
                                <Badge variant="navy" className="text-[10px] bg-gray-100 text-text-muted border-none">{project.category}</Badge>
                                <Badge variant={SCORE_COLORS[project.score] || 'orange'} size="sm">{project.score} pts</Badge>
                              </div>
                              <h3 className="font-bold text-text-primary group-hover:text-brand-orange transition-colors text-sm mb-1 truncate">
                                {project.title}
                              </h3>
                              <p className="text-xs text-text-body line-clamp-1">{project.description}</p>
                              <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                                <span className="flex items-center gap-1"><Clock size={11} /> {project.completionTime}</span>
                                <span className="flex items-center gap-1"><Users size={11} /> {project.members} members</span>
                              </div>
                            </div>
                            <Button variant="navy" size="sm" className="hidden sm:flex rounded-xl flex-shrink-0">
                              View →
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
