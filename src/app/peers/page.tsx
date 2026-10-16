// src/app/peers/page.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Search, UserPlus, MessageCircle, FilterX, Sparkles, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PEERS, ALLOWED_DISCIPLINES } from '@/lib/data/peers'
import { useLanguage } from '@/lib/context/LanguageContext'

// Only the 4 allowed disciplines
const DISCIPLINES = [...ALLOWED_DISCIPLINES]

function SuggestTeammatesModal({ onClose }: { onClose: () => void }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [results, setResults] = useState<typeof PEERS | null>(null)

  const skillOptions = ['React', 'Flutter', 'IoT', 'ERP', 'Python', 'SQL', 'Power BI', 'SAP', 'Financial Modeling', 'Project Management', 'Data Analysis', 'Node.js']

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const suggest = () => {
    const suggested = PEERS
      .map(p => ({
        ...p,
        score: p.skills.filter(s =>
          selectedSkills.some(sel => s.toLowerCase().includes(sel.toLowerCase()))
        ).length * 10 + (p.matchScore ?? 70)
      }))
      .filter(p => !selectedDept || p.discipline === selectedDept)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
    setResults(suggested)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">AI Teammate Suggestions</h2>
              <p className="text-xs text-text-muted">Find peers with matching skills for your project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Skills I need */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-3">What skills do you need in your team?</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-text-body border-gray-200 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Department filter */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-3">Filter by Department (optional)</label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(selectedDept === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedDept === d
                      ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                      : 'bg-gray-50 text-text-body border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" fullWidth className="rounded-xl" onClick={suggest} disabled={selectedSkills.length === 0}>
            <Sparkles size={16} className="me-2" />
            Suggest Teammates
          </Button>

          {/* Results */}
          {results !== null && (
            <div>
              <p className="text-sm font-bold text-text-primary mb-3">
                {results.length > 0 ? `✨ ${results.length} recommended teammates found` : 'No matches found. Try different skills.'}
              </p>
              <div className="space-y-3">
                {results.map(peer => (
                  <div key={peer.id} className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <Avatar src={peer.avatar} name={peer.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm">{peer.name}</p>
                      <p className="text-xs text-purple-600 font-semibold">{peer.specialty}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {peer.skills.slice(0, 3).map(s => (
                          <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            selectedSkills.some(sel => s.toLowerCase().includes(sel.toLowerCase()))
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-full font-bold">
                        {peer.matchScore ?? 80}% match
                      </span>
                      <Link href={`/peers/${peer.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs px-3 py-1.5 h-auto">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PeersPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null)
  const [showSuggest, setShowSuggest] = useState(false)

  const filteredPeers = PEERS.filter(peer => {
    const matchesSearch =
      peer.name.toLowerCase().includes(search.toLowerCase()) ||
      peer.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      peer.specialty.toLowerCase().includes(search.toLowerCase())
    const matchesDiscipline = selectedDiscipline ? peer.discipline === selectedDiscipline : true
    return matchesSearch && matchesDiscipline
  })

  return (
    <AppLayout>
      {showSuggest && <SuggestTeammatesModal onClose={() => setShowSuggest(false)} />}

      <div className="bg-bg-cream min-h-screen">
        {/* Header */}
        <div className="bg-brand-navy text-white pt-20 pb-28 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="section-container relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('peers.title')}</h1>
            <p className="text-blue-200 max-w-2xl mx-auto text-lg mb-8">
              {t('peers.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative flex items-center">
              <Search className="absolute start-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`${t('common.search')} by name, skill, or specialty...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full ps-12 pe-4 py-4 rounded-full text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="section-container -mt-10 relative z-20 pb-20">
          {/* AI Suggest Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-5 mb-8 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">AI Teammate Finder ✨</p>
                <p className="text-purple-200 text-sm">Don&apos;t have friends in college? Let AI suggest teammates with matching skills for your project.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="bg-white text-purple-700 hover:bg-purple-50 border-0 font-bold whitespace-nowrap flex-shrink-0 rounded-xl"
              onClick={() => setShowSuggest(true)}
            >
              <Sparkles size={16} className="me-2" /> {t('practical.suggestTeammates')}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-primary text-lg">{t('peers.disciplines')}</h3>
                  {selectedDiscipline && (
                    <button
                      onClick={() => setSelectedDiscipline(null)}
                      className="text-xs text-brand-orange hover:underline flex items-center gap-1"
                    >
                      <FilterX size={14} /> Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedDiscipline(null)}
                    className={`text-start px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!selectedDiscipline ? 'bg-brand-orange text-white' : 'text-text-body hover:bg-orange-50'}`}
                  >
                    {t('peers.allDisciplines')}
                    <span className="ms-2 text-xs opacity-70">({PEERS.length})</span>
                  </button>
                  {DISCIPLINES.map(disc => {
                    const count = PEERS.filter(p => p.discipline === disc).length
                    return (
                      <button
                        key={disc}
                        onClick={() => setSelectedDiscipline(disc)}
                        className={`text-start px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedDiscipline === disc ? 'bg-brand-orange text-white' : 'text-text-body hover:bg-orange-50'}`}
                      >
                        {disc}
                        <span className="ms-2 text-xs opacity-70">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  {selectedDiscipline ?? 'All Peers'}
                  <span className="text-text-muted text-base font-normal ms-2">({filteredPeers.length})</span>
                </h2>
              </div>

              {filteredPeers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">No peers found</h3>
                  <p className="text-text-muted">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPeers.map(peer => (
                    <div key={peer.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full group">
                      <div className="flex items-start gap-4 mb-4">
                        <Link href={`/peers/${peer.id}`} className="flex-shrink-0">
                          <div className="relative">
                            <Avatar src={peer.avatar} name={peer.name} size="lg" className="group-hover:ring-2 group-hover:ring-brand-orange transition-all" />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/peers/${peer.id}`} className="hover:text-brand-orange transition-colors">
                            <h3 className="font-bold text-text-primary text-lg truncate">{peer.name}</h3>
                          </Link>
                          <p className="text-xs text-brand-orange font-semibold truncate">{peer.specialty}</p>
                          <p className="text-xs text-text-muted truncate">{peer.discipline}</p>
                        </div>
                      </div>

                      <p className="text-sm text-text-body line-clamp-2 mb-4 flex-1">{peer.bio}</p>

                      <div className="mb-5">
                        <p className="text-xs font-semibold text-text-primary mb-2 uppercase tracking-wide">{t('peers.topSkills')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {peer.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="navy" className="bg-gray-100 text-text-secondary border-none text-[10px] px-2 py-0.5 font-medium">{skill}</Badge>
                          ))}
                          {peer.skills.length > 3 && (
                            <Badge variant="navy" className="bg-gray-100 text-text-secondary border-none text-[10px] px-2 py-0.5 font-medium">+{peer.skills.length - 3}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="text-xs text-text-muted font-medium">
                          <span className="text-brand-navy font-bold">{peer.projects.length}</span> Projects
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/peers/${peer.id}`}>
                            <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto text-xs">
                              <UserPlus size={14} className="me-1" /> {t('common.profile')}
                            </Button>
                          </Link>
                          <Link href={`/messages?type=peer&id=${peer.id}`}>
                            <Button variant="primary" size="sm" className="px-3 py-1.5 h-auto text-xs">
                              <MessageCircle size={14} className="me-1" /> {t('peers.chat')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
