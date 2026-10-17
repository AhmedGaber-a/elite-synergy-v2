// src/app/peers/[id]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Check, MessageCircle, GraduationCap, Briefcase, Star, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PeerItem } from '@/app/peers/page';

export default function PeerProfilePage({ params }: { params: { id: string } }) {
  const [peer, setPeer] = useState<PeerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    async function loadPeer() {
      try {
        setLoading(true);
        const res = await fetch(`/api/peers/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPeer(data.peer);
        }
      } catch (err) {
        console.error('Failed to load peer details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPeer();
  }, [params.id]);

  const handleConnect = async () => {
    if (!peer || requesting || connected) return;
    setRequesting(true);
    try {
      const res = await fetch('/api/peers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: peer.id }),
      });
      if (res.ok) {
        setConnected(true);
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-bg-cream min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-muted font-bold">Loading peer profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!peer) {
    return (
      <AppLayout>
        <div className="bg-bg-cream min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
            <h2 className="text-xl font-extrabold text-text-primary mb-2">Peer Not Found</h2>
            <p className="text-xs text-text-muted mb-4">This student profile is either not verified or does not exist.</p>
            <Link href="/peers">
              <Button variant="primary" size="sm" className="rounded-xl">Return to Peers Directory</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

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
                  <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{peer.fullName || peer.name}</h1>
                  <p className="text-lg text-brand-orange font-bold mb-3">{peer.specialty}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-text-body font-medium">
                    <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-brand-navy" /> {peer.discipline}</div>
                    <div className="flex items-center gap-1.5"><GraduationCap size={16} className="text-brand-navy" /> {peer.college}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-start gap-3 w-full md:w-auto">
                <Link href={`/messages?type=peer&id=${peer.id}`} className="flex-1 md:flex-initial">
                  <Button variant="outline" size="md" fullWidth><MessageCircle size={18} className="mr-2" /> Message</Button>
                </Link>
                {connected ? (
                  <Button variant="navy" size="md" disabled className="flex-1 md:flex-initial">
                    <Check size={18} className="mr-2 text-green-400" /> Request Sent
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConnect}
                    isLoading={requesting}
                    className="flex-1 md:flex-initial"
                  >
                    <UserPlus size={18} className="mr-2" /> Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-gray-100 py-6 my-6">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Academic Points</span>
                <span className="font-mono text-xl font-bold text-yellow-600 flex items-center gap-1">
                  <Star size={18} className="fill-yellow-500 text-yellow-500" /> {peer.points} pts
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">AI Match Score</span>
                <span className="font-mono text-xl font-bold text-purple-700 flex items-center gap-1">
                  <Sparkles size={18} /> {peer.matchScore}%
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Status</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Available for Projects
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <h3 className="font-bold text-text-primary text-lg mb-3">About</h3>
              <p className="text-text-body leading-relaxed">{peer.bio || 'Verified academic student active on the platform.'}</p>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h3 className="font-bold text-text-primary text-lg mb-3">Verified Skills</h3>
              <div className="flex flex-wrap gap-2">
                {peer.skills.map((skill) => (
                  <Badge key={skill} variant="orange" className="text-xs px-3 py-1 font-semibold">{skill}</Badge>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h3 className="font-bold text-text-primary text-lg mb-4">Portfolio Projects ({peer.projects.length})</h3>
              {peer.projects.length === 0 ? (
                <p className="text-xs text-text-muted">No portfolio projects uploaded by this student yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peer.projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-text-primary text-sm">{proj.title}</h4>
                          <Badge variant="navy" className="text-[10px]">{proj.skill}</Badge>
                        </div>
                        <p className="text-xs text-text-body">{proj.description}</p>
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
  );
}
