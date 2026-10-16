'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Upload, X, File, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'

export default function ProjectsPage() {
  const router = useRouter()
  const { state, updateState } = useOnboarding()
  const [projects, setProjects] = useState(state.projects)
  const [hasProjects, setHasProjects] = useState<boolean | null>(state.projects.length > 0 ? true : null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '', filename: '' }])
  }

  const handleUpdateProject = (index: number, field: string, value: string) => {
    const newProjects = [...projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setProjects(newProjects)
  }

  const handleRemoveProject = (index: number) => {
    const newProjects = [...projects]
    newProjects.splice(index, 1)
    setProjects(newProjects)
    if (newProjects.length === 0) setHasProjects(null)
  }

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpdateProject(index, 'filename', file.name)
    }
  }

  const handleNext = () => {
    updateState({ projects: hasProjects ? projects.filter(p => p.title || p.filename) : [] })
    router.push('/onboarding/cv')
  }

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider mb-2">Step 3 of 5</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">Showcase Your Work</h1>
          <p className="text-text-body">Do you have any existing projects you&apos;d like to share?</p>
        </div>

        {hasProjects === null && (
          <div className="flex gap-4 mb-12">
            <button 
              onClick={() => { setHasProjects(true); if (projects.length === 0) handleAddProject() }}
              className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-brand-orange hover:bg-orange-50 transition-colors"
            >
              <div className="text-3xl mb-2">📁</div>
              <div className="font-bold text-text-primary">Yes, I have projects</div>
            </button>
            <button 
              onClick={() => { setHasProjects(false); setProjects([]) }}
              className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-brand-navy hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">⏭️</div>
              <div className="font-bold text-text-primary">No, skip for now</div>
            </button>
          </div>
        )}

        {hasProjects === true && (
          <div className="space-y-6 mb-8">
            {projects.map((proj, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                <button 
                  onClick={() => handleRemoveProject(i)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
                
                <h3 className="font-bold text-text-primary mb-4">Project {i + 1}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Project Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                      placeholder="E.g., E-commerce Website"
                      value={proj.title}
                      onChange={e => handleUpdateProject(i, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm min-h-[80px]"
                      placeholder="Briefly describe what you built..."
                      value={proj.description}
                      onChange={e => handleUpdateProject(i, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Upload File (Optional Demo)</label>
                    {proj.filename ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                        <File size={16} />
                        <span className="font-medium truncate flex-1">{proj.filename}</span>
                        <button onClick={() => handleUpdateProject(i, 'filename', '')} className="text-blue-400 hover:text-blue-700">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          onChange={(e) => handleFileSelect(i, e)}
                        />
                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:border-brand-orange">
                          <Upload size={18} />
                          <span>Click to browse files</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddProject}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-brand-orange hover:border-brand-orange hover:bg-orange-50 font-medium transition-colors"
            >
              <Plus size={18} /> Add Another Project
            </button>
          </div>
        )}

        {hasProjects === false && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center mb-12">
            <p className="text-text-body">You can always add projects later from your profile.</p>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Button variant="ghost" onClick={() => router.push('/onboarding/skills')}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button 
            variant={hasProjects === false ? 'outline' : 'primary'} 
            onClick={handleNext}
            disabled={hasProjects === null}
          >
            {hasProjects === false ? 'Skip Step' : 'Continue'} <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
