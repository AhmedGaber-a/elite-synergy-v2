'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, FileText, Briefcase, Award, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { useAuth } from '@/lib/context/AuthContext'

export default function ReviewPage() {
  const router = useRouter()
  const { state, reset } = useOnboarding()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinish = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      login(state.email || 'demo@elitesynergy.edu', 'mock-password', {
        skills: state.skills.length > 0 ? state.skills : undefined,
      })
      reset()
      router.push('/')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider mb-2">Step 5 of 5</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">Review Your Profile</h1>
          <p className="text-text-body">Ensure your details are accurate before completing setup.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 mb-8">
          
          {/* Account */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Account</span>
              <p className="text-text-primary font-bold">{state.email || 'guest@example.com'}</p>
            </div>
            <button onClick={() => router.push('/onboarding/register')} className="text-xs text-brand-orange hover:underline font-semibold">
              Edit
            </button>
          </div>

          {/* Skills */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Selected Skills</span>
              <button onClick={() => router.push('/onboarding/skills')} className="text-xs text-brand-orange hover:underline font-semibold">
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.skills.map(s => (
                <Badge key={s} variant="orange" className="text-xs">{s}</Badge>
              ))}
              {state.customSkill && (
                <Badge variant="navy" className="text-xs">{state.customSkill}</Badge>
              )}
              {state.skills.length === 0 && !state.customSkill && (
                <span className="text-xs text-text-muted">No skills selected</span>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Portfolio Projects</span>
              <button onClick={() => router.push('/onboarding/projects')} className="text-xs text-brand-orange hover:underline font-semibold">
                Edit
              </button>
            </div>
            {state.projects.length === 0 ? (
              <p className="text-xs text-text-muted">None added (skipped)</p>
            ) : (
              <div className="space-y-2">
                {state.projects.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                    <Briefcase size={16} className="text-brand-orange" />
                    <span className="font-semibold text-text-primary">{p.title || 'Untitled Project'}</span>
                    {p.filename && <span className="text-xs text-text-muted">({p.filename})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Uploaded CV</span>
              <button onClick={() => router.push('/onboarding/cv')} className="text-xs text-brand-orange hover:underline font-semibold">
                Edit
              </button>
            </div>
            {state.cvFilename ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-xl text-sm font-medium">
                <FileText size={16} />
                <span>{state.cvFilename}</span>
              </div>
            ) : (
              <p className="text-xs text-text-muted">No file uploaded (skipped)</p>
            )}
          </div>

        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Button variant="ghost" onClick={() => router.push('/onboarding/cv')}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleFinish} 
            isLoading={isSubmitting}
          >
            Complete Setup <CheckCircle size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
