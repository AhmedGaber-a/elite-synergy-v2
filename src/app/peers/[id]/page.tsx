'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, UserPlus, Check, MessageCircle, MapPin, GraduationCap, Briefcase } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PEERS } from '@/lib/data/peers'

export default function PeerProfilePage({ params }: { params: { id: string } }) {
  const peer = PEERS.find(p => p.id === params.id)
  const [isFriend, setIsFriend] = useState(peer?.isFriend ?? false)
  const [requested, setRequested] = useState(false)
  if (!peer) return notFound()

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen pb-20">
        {/* Cover & Header */}
        <div className="h-48 md:h-64 bg-brand-navy w-full relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        
        <div className="section-container -mt-16 md:-mt-20 relative z-10 max-w-4xl">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <Link href="/peers" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-brand-orange mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Peers
            </Link>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar src={peer.avatar} name={peer.name} size="xl" className="w-24 h-24 md:w-32 md:h-32 shadow-md border-4 border-white" />
                <div className="text-center sm:text-left mt-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{peer.name}</h1>
                  <p className="text-lg text-brand-orange font-bold mb-3">{peer.specialty}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-text-body font-medium">
                    <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-brand-navy" /> {peer.discipline}</div>
                    <div className="flex items-center gap-1.5"><GraduationCap size={16} className="text-brand-navy" /> {peer.college} College</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center sm:justify-start gap-3 w-full md:w-auto">
                <Link href={`/messages?type=peer&id=${peer.id}`} className="flex-1 md:flex-initial">
                  <Button variant="outline" size="md" fullWidth><MessageCircle size={18} className="mr-2" /> Message</Button>
                </Link>
                {isFriend ? (
                  <Button variant="navy" size="md" onClick={() => setIsFriend(false)} className="flex-1 md:flex-initial">
                    <Check size={18} className="mr-2" /> Connected
                  </Button>
                ) : (
                  <Button
                    variant={requested ? 'ghost' : 'primary'}
                    size="md"
                    onClick={() => { setRequested(true) }}
                    disabled={requested}
                    className="flex-1 md:flex-initial"
                  >
                    {requested ? 'Request Sent' : <><UserPlus size={18} className="mr-2" /> Connect</>}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-text-primary text-lg mb-4 flex items-center gap-2">
                  <span>About</span>
                </h3>
                <p className="text-text-body text-sm leading-relaxed mb-6">
                  {peer.bio}
                </p>
                <h3 className="font-bold text-text-primary text-lg mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {peer.skills.map(skill => (
                    <Badge key={skill} variant="navy" className="bg-gray-100 text-text-secondary border-none px-3 py-1 text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">Portfolio Projects <span className="text-text-muted text-lg ml-2">({peer.projects.length})</span></h2>
              </div>

              {peer.projects.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-4">📂</div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">No Projects Yet</h3>
                  <p className="text-sm text-text-muted">This peer hasn&apos;t uploaded any projects to their portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {peer.projects.map(proj => (
                    <div key={proj.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
                      <div className="h-32 bg-brand-navy flex items-center justify-center text-4xl relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('/assets/grid-pattern.svg')]" />
                        <span className="relative z-10">✨</span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge variant="orange" className="self-start mb-3 text-[10px]">{proj.skill}</Badge>
                        <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1">{proj.title}</h3>
                        <p className="text-sm text-text-body line-clamp-3 mb-5 flex-1">{proj.description}</p>
                        <Button variant="ghost" size="sm" className="w-full mt-auto">View Details</Button>
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
