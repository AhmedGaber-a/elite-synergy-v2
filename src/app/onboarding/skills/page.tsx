'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'

const SKILLS = [
  { id: 'prog', label: 'Programming', icon: '💻', color: 'border-blue-400 text-blue-600' },
  { id: 'webdev', label: 'Web Development', icon: '</>', color: 'border-green-400 text-green-600' },
  { id: 'mobile', label: 'Mobile Development', icon: '📱', color: 'border-indigo-400 text-indigo-600' },
  { id: 'uiux', label: 'UI/UX Design', icon: '🎨', color: 'border-pink-400 text-pink-600' },
  { id: 'ba', label: 'Business Analysis', icon: '📊', color: 'border-orange-400 text-orange-600' },
  { id: 'acc', label: 'Accounting and Finance', icon: '💰', color: 'border-emerald-400 text-emerald-600' },
  { id: 'marketing', label: 'Marketing', icon: '📢', color: 'border-red-400 text-red-500' },
  { id: 'data', label: 'Data Analysis', icon: '📈', color: 'border-blue-500 text-blue-700' },
  { id: 'cloud', label: 'Cloud Computing', icon: '☁️', color: 'border-sky-400 text-sky-600' },
  { id: 'net', label: 'Networking', icon: '🌐', color: 'border-teal-400 text-teal-600' },
  { id: 'cyber', label: 'Cybersecurity', icon: '🔒', color: 'border-red-500 text-red-700' },
  { id: 'iot', label: 'IoT', icon: '🔌', color: 'border-purple-400 text-purple-600' },
  { id: 'pm', label: 'Project Management', icon: '📋', color: 'border-amber-400 text-amber-600' },
  { id: 'sad', label: 'Systems Analysis and Design', icon: '⚙️', color: 'border-slate-400 text-slate-600' },
  { id: 'erp', label: 'ERP and Odoo', icon: '🏢', color: 'border-orange-500 text-orange-700' },
]

export default function SkillsPage() {
  const router = useRouter()
  const { state, updateState } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(state.skills)
  const [query, setQuery] = useState('')
  const [customSkill, setCustomSkill] = useState(state.customSkill)

  const toggle = (label: string) => setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label])
  const filtered = SKILLS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))

  const handleNext = () => {
    updateState({ skills: selected, customSkill })
    router.push('/onboarding/projects')
  }

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider mb-2">Step 2 of 5</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">What are your skills?</h1>
          <p className="text-text-body">Select the areas you are most interested in or experienced with.</p>
        </div>

        {/* Search */}
        <div className="flex w-full mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
              placeholder="Search skills..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map(skill => {
            const isSelected = selected.includes(skill.label)
            return (
              <button
                key={skill.id}
                onClick={() => toggle(skill.label)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 bg-white text-left transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'border-brand-orange bg-orange-50 shadow-md'
                    : `border-transparent shadow-sm`
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                  isSelected ? 'bg-orange-100' : 'bg-gray-50'
                }`}>
                  {skill.icon}
                </div>
                <span className={`font-semibold text-sm ${isSelected ? 'text-brand-orange' : 'text-text-primary'}`}>
                  {skill.label}
                </span>
                {isSelected && <span className="ml-auto text-brand-orange">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Custom Skill */}
        <div className="mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-semibold text-text-primary mb-2">Other / Custom Skill</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
            placeholder="Type any other skill you have..."
            value={customSkill}
            onChange={e => setCustomSkill(e.target.value)}
          />
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Button variant="ghost" onClick={() => router.push('/onboarding/register')}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNext} 
            disabled={selected.length === 0 && !customSkill.trim()}
          >
            Continue <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
