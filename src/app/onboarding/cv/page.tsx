'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Upload, FileText, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'

export default function CVPage() {
  const router = useRouter()
  const { state, updateState } = useOnboarding()
  const [cvFile, setCvFile] = useState<string | null>(state.cvFilename)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const isValidExt = /\.(pdf|doc|docx)$/i.test(file.name)
      if (!validTypes.includes(file.type) && !isValidExt) {
        setError('Please select a valid PDF or Word document (.pdf, .doc, .docx).')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.')
        return
      }
      setCvFile(file.name)
    }
  }

  const handleNext = () => {
    updateState({ cvFilename: cvFile })
    router.push('/onboarding/review')
  }

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider mb-2">Step 4 of 5</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">Upload Your CV</h1>
          <p className="text-text-body">Attach your latest resume to enhance your peer recommendations.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 text-center">
          {cvFile ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-1">{cvFile}</h3>
              <p className="text-xs text-text-muted mb-6">Document ready for upload</p>
              <button 
                onClick={() => setCvFile(null)} 
                className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <X size={14} /> Remove and choose another
              </button>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Upload PDF or Word Document</h3>
              <p className="text-sm text-text-body mb-6 max-w-sm mx-auto">
                Max file size 5MB. You can always update or replace this later in your profile.
              </p>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx" 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 mx-auto"
              >
                <Upload size={16} /> Choose File
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Button variant="ghost" onClick={() => router.push('/onboarding/projects')}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button 
            variant={cvFile ? 'primary' : 'outline'} 
            onClick={handleNext}
          >
            {cvFile ? 'Continue' : 'Skip Step'} <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
