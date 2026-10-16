'use client'
import React from 'react'
import Link from 'next/link'
import { Users, User, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

const CARDS = [
  {
    href: '/practical/solo',
    title: 'Solo',
    subtitle: 'Build your skills — step by step',
    emoji: '🎯',
    icon: <User size={24} />,
    description: 'Tackle individual case studies and business challenges at your own pace. Perfect for sharpening your analytical skills.',
    highlights: ['Self-paced learning', 'Instant feedback', 'Track your progress'],
    gradient: 'from-brand-orange to-amber-500',
    bg: 'from-orange-50 to-amber-50',
    accent: 'text-brand-orange',
    border: 'border-orange-200',
    btn: 'bg-brand-orange hover:bg-brand-orange-dark',
  },
  {
    href: '/practical/team',
    title: 'Team',
    subtitle: 'Team up — build something amazing',
    emoji: '🤝',
    icon: <Users size={24} />,
    description: 'Collaborate with classmates on complex real-world projects. Simulate professional team dynamics and deliver together.',
    highlights: ['Team collaboration', 'Role-based tasks', 'Peer communication'],
    gradient: 'from-brand-blue to-brand-navy',
    bg: 'from-blue-50 to-indigo-50',
    accent: 'text-brand-blue',
    border: 'border-blue-200',
    btn: 'bg-brand-navy hover:opacity-90',
  },
]

export default function PracticalPage() {
  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-[calc(100vh-80px)]">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.15),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="section-container py-16 md:py-24 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-white/10">
              <Zap size={13} /> Practical Learning Hub
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Learn by <span className="text-brand-orange">Doing</span>
            </h1>
            <p className="text-blue-200 text-base md:text-lg max-w-xl mx-auto">
              Apply your knowledge to real-world business challenges. Choose your learning mode and start building experience today.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="section-container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {CARDS.map((card) => (
              <div
                key={card.href}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-br ${card.bg} p-8 border-b ${card.border} relative overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/30 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/20 rounded-full" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white mb-4 shadow-md`}>
                        {card.icon}
                      </div>
                      <h2 className="text-2xl font-extrabold text-text-primary mb-1">{card.title}</h2>
                      <p className={`text-sm font-semibold ${card.accent}`}>{card.subtitle}</p>
                    </div>
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{card.emoji}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <p className="text-text-body text-sm leading-relaxed mb-6">{card.description}</p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {card.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2.5 text-sm text-text-primary">
                        <CheckCircle2 size={15} className={card.accent} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={card.href} className="block">
                    <button
                      className={`w-full flex items-center justify-center gap-2 ${card.btn} text-white font-bold py-3.5 rounded-2xl transition-all duration-300 text-sm shadow-sm group-hover:shadow-md`}
                    >
                      Open {card.title} Projects
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
