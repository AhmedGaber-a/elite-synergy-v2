// src/app/profile/page.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  Linkedin, Download, ExternalLink, Pencil, X, Check,
  Plus, Cloud, Award, BookOpen, Star, Facebook
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MOCK_USER } from '@/lib/data/mock-user'

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

type EditableUser = {
  name: string
  fullName: string
  email: string
  specialty: string
  age: number | string
  role: string
  college: string
  address: string
  bio: string
  skills: string[]
  languages: string[]
  toolSkills: string[]
  socialLinks: { x: string; linkedin: string; facebook: string }
}

function EditProfileModal({
  user,
  onSave,
  onClose,
}: {
  user: EditableUser
  onSave: (updated: EditableUser) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<EditableUser>({ ...user })
  const [newSkill, setNewSkill] = useState('')

  const set = (field: keyof EditableUser, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const addSkill = () => {
    if (!newSkill.trim()) return
    setForm((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
    setNewSkill('')
  }

  const removeSkill = (idx: number) =>
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary">Edit Profile</h2>
            <p className="text-sm text-text-muted">Update your personal information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Basic Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                ['name', 'First Name', form.name],
                ['fullName', 'Full Name', form.fullName],
                ['email', 'Email', form.email],
                ['specialty', 'Specialty / Title', form.specialty],
                ['role', 'Role', form.role],
                ['college', 'College', form.college],
                ['address', 'Address', form.address],
              ] as [keyof EditableUser, string, string][]).map(([field, label, val]) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{label}</label>
                  <input
                    value={val}
                    onChange={(e) => set(field, e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => set('age', Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Bio</h3>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Specializations</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skills.map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-gray-100 text-text-primary text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
              <Button variant="primary" size="sm" onClick={addSkill} className="px-4 rounded-xl">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Social Links</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">LinkedIn URL</label>
                <input
                  value={form.socialLinks.linkedin}
                  onChange={(e) => setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, linkedin: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">X (Twitter) URL</label>
                <input
                  value={form.socialLinks.x}
                  onChange={(e) => setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, x: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                  placeholder="https://x.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">Facebook URL</label>
                <input
                  value={form.socialLinks.facebook}
                  onChange={(e) => setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-3xl">
          <Button variant="ghost" fullWidth onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button
            variant="primary"
            fullWidth
            className="rounded-xl"
            onClick={() => { onSave(form); onClose() }}
          >
            <Check size={16} className="me-2" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Skill Tag (no progress bar) ────────────────────────────────────────────
function SkillTag({ name, dark = false }: { name: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
        dark
          ? 'bg-white/10 text-white/90 border-white/10 hover:bg-white/20'
          : 'bg-gray-100 text-text-primary border-gray-200 hover:bg-orange-50 hover:text-brand-orange hover:border-brand-orange/30'
      }`}
    >
      {name}
    </span>
  )
}

import { useLanguage } from '@/lib/context/LanguageContext'
import { Avatar } from '@/components/ui/Avatar'

export default function ProfilePage() {
  const { t, lang } = useLanguage()
  const [editOpen, setEditOpen] = useState(false)
  const [activeProjectTab, setActiveProjectTab] = useState<'platform' | 'prior'>('platform')
  const [user, setUser] = useState<EditableUser>({
    name: MOCK_USER.name,
    fullName: MOCK_USER.fullName,
    email: MOCK_USER.email,
    specialty: MOCK_USER.specialty,
    age: MOCK_USER.age,
    role: MOCK_USER.role,
    college: MOCK_USER.college,
    address: MOCK_USER.address,
    bio: MOCK_USER.bio,
    skills: [...MOCK_USER.skills],
    languages: MOCK_USER.languages.map((l) => l.name),
    toolSkills: MOCK_USER.toolSkills.map((s) => s.name),
    socialLinks: {
      ...MOCK_USER.socialLinks,
      facebook: (MOCK_USER.socialLinks as { x: string; linkedin: string; facebook?: string }).facebook ?? '',
    },
  })

  const stats = [
    { label: t('common.projects'), value: MOCK_USER.platformProjects.length + MOCK_USER.priorProjects.length, icon: <BookOpen size={16} />, color: 'text-brand-orange' },
    { label: t('common.points'), value: MOCK_USER.points, icon: <Star size={16} />, color: 'text-yellow-500' },
    { label: t('common.skills'), value: user.skills.length, icon: <Award size={16} />, color: 'text-brand-blue' },
  ]

  return (
    <AppLayout>
      {editOpen && (
        <EditProfileModal
          user={user}
          onSave={(updated) => setUser(updated)}
          onClose={() => setEditOpen(false)}
        />
      )}

      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-8 md:py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ─── Left Sidebar ─────────────────────────────────── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-brand-navy rounded-3xl p-6 text-white shadow-sm sticky top-24">
                {/* Avatar + Edit */}
                <div className="flex flex-col items-center mb-6 relative">
                  <div className="relative mb-4">
                    <Avatar
                      name={user.name}
                      avatarType={MOCK_USER.avatarType}
                      size="xl"
                      className="w-24 h-24 border-2 border-white/20 shadow-lg"
                    />
                    <button
                      onClick={() => setEditOpen(true)}
                      className="absolute -bottom-1 -end-1 w-8 h-8 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      title={t('profile.editProfile')}
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                  <h2 className="font-extrabold text-xl text-center">{user.fullName}</h2>
                  <p className="text-brand-orange font-semibold text-sm mt-1 text-center">{user.specialty}</p>
                  <p className="text-white/50 text-xs mt-0.5">{user.email}</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center">
                      <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                      <p className="font-extrabold text-lg text-white">{s.value}</p>
                      <p className="text-white/50 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Social */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <a href={user.socialLinks.x || '#'} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-brand-orange transition-colors" aria-label="X" title="X (formerly Twitter)">
                    <XIcon className="w-5 h-5" />
                  </a>
                  <a href={user.socialLinks.linkedin || '#'} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-brand-orange transition-colors" aria-label="LinkedIn" title="LinkedIn">
                    <Linkedin size={20} />
                  </a>
                  <a href={user.socialLinks.facebook || '#'} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-[#1877F2] transition-colors" aria-label="Facebook" title="Facebook">
                    <Facebook size={20} />
                  </a>
                </div>

                {/* Info */}
                <div className="space-y-2.5 text-sm border-t border-white/10 pt-4 mb-6">
                  {[
                    ['Age', String(user.age)],
                    ['Role', user.role],
                    ['College', user.college],
                    ['Address', user.address],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-xs">
                      <span className="text-white/50">{k}</span>
                      <span className="font-semibold text-white text-end">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Languages — Tags only, no progress bars */}
                <div className="border-t border-white/10 pt-4 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">Languages & Scripts</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {user.languages.map((name) => (
                      <SkillTag key={name} name={name} dark />
                    ))}
                  </div>
                </div>

                {/* Tools — Tags only, no progress bars */}
                <div className="border-t border-white/10 pt-4 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">Core Infrastructure</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {user.toolSkills.map((name) => (
                      <SkillTag key={name} name={name} dark />
                    ))}
                  </div>
                </div>

                {/* Skill Tags */}
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Specializations</h4>
                    <button onClick={() => setEditOpen(true)} className="text-white/40 hover:text-brand-orange transition-colors">
                      <Pencil size={11} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((s) => (
                      <SkillTag key={s} name={s} dark />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white py-3 rounded-full hover:bg-brand-orange-dark transition-colors text-sm font-semibold shadow-md">
                    <Download size={16} /> Download Resume
                  </button>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-full transition-colors text-sm font-semibold"
                  >
                    <Pencil size={16} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Main Content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Hero Banner */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 end-0 w-48 h-48 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="max-w-lg">
                    <Badge variant="orange" className="mb-3">Portfolio & Profile</Badge>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2">
                      Hello, I&apos;m {user.name} 👋
                    </h1>
                    <p className="text-lg text-brand-orange font-bold mb-3">{user.specialty}</p>
                    <p className="text-text-body text-sm leading-relaxed">{user.bio}</p>
                  </div>
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange flex-shrink-0">
                    <Cloud size={48} />
                  </div>
                </div>
                <div className="relative z-10 flex gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil size={14} className="me-1.5" /> Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Download size={14} className="me-1.5" /> Resume
                  </Button>
                </div>
              </div>

              {/* Projects: Two Distinct Categories (Requirement 3) */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-text-primary">
                      {t('profile.projectsSectionTitle')}
                    </h2>
                    <p className="text-xs md:text-sm text-text-muted mt-0.5">
                      {t('profile.projectsSectionSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Category Switcher Tabs */}
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full sm:w-fit">
                  <button
                    onClick={() => setActiveProjectTab('platform')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeProjectTab === 'platform'
                        ? 'bg-white text-brand-orange shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span>🏆</span>
                    <span>{t('profile.platformProjectsTab')}</span>
                    <span className="text-[10px] bg-orange-100 text-brand-orange px-1.5 py-0.2 rounded-full font-extrabold">
                      {MOCK_USER.platformProjects.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveProjectTab('prior')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeProjectTab === 'prior'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span>📁</span>
                    <span>{t('profile.priorProjectsTab')}</span>
                    <span className="text-[10px] bg-gray-200 text-text-body px-1.5 py-0.2 rounded-full font-extrabold">
                      {MOCK_USER.priorProjects.length}
                    </span>
                  </button>
                </div>

                {/* Category 1: Projects Completed Within Elite Synergy */}
                {activeProjectTab === 'platform' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-3.5 rounded-2xl border border-orange-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-brand-orange font-bold">
                        <Award size={16} />
                        <span>{t('profile.platformProjectsTitle')}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {lang === 'ar' ? 'مشاريع معتمدة ومصححة من الدكاترة' : 'Verified by University Supervisors'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {MOCK_USER.platformProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className="absolute top-0 end-0 bg-green-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl shadow-xs">
                            {proj.badge}
                          </div>

                          <div>
                            <div className="flex items-start justify-between gap-4 mb-3 mt-1">
                              <Badge variant="orange" className="text-[11px] font-bold">
                                {proj.domain}
                              </Badge>
                              <span className="text-xs font-mono font-extrabold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                                {proj.grade}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-base text-text-primary mb-2 group-hover:text-brand-orange transition-colors">
                              {proj.title}
                            </h3>
                            <p className="text-xs md:text-sm text-text-body mb-4 leading-relaxed">
                              {proj.desc}
                            </p>

                            <div className="space-y-1.5 text-xs text-text-muted bg-gray-50 p-3 rounded-2xl mb-4">
                              <div className="flex justify-between">
                                <span>{t('common.supervisors')}:</span>
                                <span className="font-bold text-text-primary">{proj.supervisor}</span>
                              </div>
                              {proj.teamName && (
                                <div className="flex justify-between">
                                  <span>{t('common.team')}:</span>
                                  <span className="font-semibold text-brand-orange">{proj.teamName}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>{t('profile.earnedPoints')}:</span>
                                <span className="font-mono font-bold text-yellow-600">+{proj.score} pts</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-text-muted">{proj.completedDate}</span>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-brand-orange/40 text-brand-orange hover:bg-brand-orange hover:text-white">
                              {lang === 'ar' ? 'عرض الشهادة والحل' : 'View Submission'} <ExternalLink size={12} className="ms-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category 2: Projects Uploaded During Initial Registration */}
                {activeProjectTab === 'prior' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="bg-gray-100/70 p-3.5 rounded-2xl border border-gray-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-text-primary font-bold">
                        <BookOpen size={16} className="text-brand-navy" />
                        <span>{t('profile.priorProjectsTitle')}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {lang === 'ar' ? 'خبرات ونماذج سابقة' : 'Prior Portfolio Experience'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {MOCK_USER.priorProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <span className="text-2xl p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                                {proj.emoji}
                              </span>
                              <Badge variant="navy" className="text-xs bg-gray-100 text-brand-navy border-none font-bold">
                                {proj.skill}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-base text-text-primary mb-2 group-hover:text-brand-orange transition-colors">
                              {proj.title}
                            </h3>
                            <p className="text-xs md:text-sm text-text-body mb-4 leading-relaxed">
                              {proj.desc}
                            </p>
                            <p className="text-[11px] text-text-muted font-medium mb-4">
                              📅 {proj.uploadDate}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" fullWidth className="flex items-center justify-center gap-1.5 text-xs rounded-xl font-bold">
                            {lang === 'ar' ? 'عرض تفاصيل المشروع' : 'View Project Details'} <ExternalLink size={13} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Project Collaborators section is completely DELETED per Requirement 3 */}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
