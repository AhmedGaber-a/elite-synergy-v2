import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-20 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">About Elite Synergy</h1>
          <p className="text-text-body max-w-2xl mx-auto">
            Elite Synergy is a collaborative peer-to-peer learning platform where students build real-world projects,
            develop practical skills, and grow together through teamwork and mentorship.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
