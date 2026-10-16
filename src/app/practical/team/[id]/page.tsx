// src/app/practical/team/[id]/page.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronRight, MessageCircle, Video, Users, CheckCircle2, FileText,
  Clock, AlertCircle, Send, Paperclip, X, Upload,
  Link as LinkIcon, Play, Mic, MicOff, PhoneOff, Crown, Shield,
  BarChart2, Cpu, Smartphone, Star, Plus, Download, ExternalLink,
  Sparkles, Check, UserPlus, Search, ArrowRight, Zap, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { TEAM_PROJECTS, TeamProject } from '@/lib/data/projects'
import { PEERS, Peer } from '@/lib/data/peers'
import { useLanguage } from '@/lib/context/LanguageContext'

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface AvailableTeam {
  id: string
  name: string
  emoji: string
  slots: number
  maxSlots: number
  members: string[]
  level: string
  isMyTeam?: boolean
  goal?: string
}

const INITIAL_AVAILABLE_TEAMS: AvailableTeam[] = [
  { id: 'alpha', name: 'الفراعنة (Team Alpha)', emoji: '🚀', slots: 3, maxSlots: 11, members: ['Mariem ahmed', 'Mohamed hamada', 'Raneem Yasser', 'Rahma', 'Nada Elsayed', 'Rania Khaled', 'Shahd Mohamed', 'basmalha Ibrahim'], level: 'All Levels', goal: 'Targeting 98% grade with full IoT + ERP integration' },
  { id: 'beta', name: 'بناة المستقبل (Team Future)', emoji: '⚡', slots: 4, maxSlots: 11, members: ['Dooa Abd-elftah', 'Malak Mahmouad', 'Shahd Khamees', 'Mariem ahmed', 'basmalha Ibrahim', 'Raneem Yasser', 'Rahma'], level: 'Intermediate', goal: 'Rapid execution and clean system architecture' },
  { id: 'gamma', name: 'أبطال التقنية (Cyber Squad)', emoji: '🔥', slots: 6, maxSlots: 11, members: ['Mohamed hamada', 'Shahd Mohamed', 'Rania Khaled', 'Nada Elsayed', 'Malak Mahmouad'], level: 'All Levels', goal: 'Focus on high security and cloud scaling' },
]

const MEGA_TEAM_MEMBERS = [
  { name: 'Mariem ahmed', role: 'Backend & Cloud Lead', avatar: '', avatarType: 'niqab' as const, domain: 'ERP', online: true },
  { name: 'Mohamed hamada', role: 'IoT & Hardware Lead', avatar: '', avatarType: 'male' as const, domain: 'IoT', online: true },
  { name: 'Rahma', role: 'Flutter Mobile Lead', avatar: '', avatarType: 'hijab' as const, domain: 'Flutter', online: true },
  { name: 'Raneem Yasser', role: 'Web & API Engineer', avatar: '', avatarType: 'hijab' as const, domain: 'ERP', online: false },
  { name: 'basmalha Ibrahim', role: 'BI & Analytics Lead', avatar: '', avatarType: 'hijab' as const, domain: 'Management', online: true },
  { name: 'Dooa Abd-elftah', role: 'Business Systems Analyst', avatar: '', avatarType: 'hijab' as const, domain: 'Management', online: false },
  { name: 'Nada Elsayed', role: 'ERP / Odoo Specialist', avatar: '', avatarType: 'hijab' as const, domain: 'ERP', online: true },
  { name: 'Rania Khaled', role: 'Database Architect', avatar: '', avatarType: 'hijab' as const, domain: 'ERP', online: true },
  { name: 'Shahd Mohamed', role: 'Cybersecurity Engineer', avatar: '', avatarType: 'hijab' as const, domain: 'IoT', online: false },
  { name: 'Malak Mahmouad', role: 'Financial Feasibility Modeler', avatar: '', avatarType: 'hijab' as const, domain: 'Design', online: false },
  { name: 'Shahd Khamees', role: 'QA & Compliance Lead', avatar: '', avatarType: 'hijab' as const, domain: 'QA', online: true },
]

const DOMAIN_COLORS: Record<string, string> = {
  IoT: 'bg-green-100 text-green-700',
  ERP: 'bg-blue-100 text-blue-700',
  Flutter: 'bg-purple-100 text-purple-700',
  Management: 'bg-orange-100 text-orange-700',
  Design: 'bg-pink-100 text-pink-700',
  QA: 'bg-yellow-100 text-yellow-700',
  Docs: 'bg-gray-100 text-gray-700',
}

const MOCK_MESSAGES = [
  { id: '1', author: 'Mariem Ahmed', text: 'Good morning everyone! Ready to finalize the ERP API endpoints today?', time: '09:12 AM', isMe: false },
  { id: '2', author: 'Omar Hassan', text: 'Yes! I finished the Flutter authentication screens. Pushing to repo now.', time: '09:15 AM', isMe: false },
  { id: '3', author: 'Youssef Ibrahim', text: 'IoT sensors are transmitting data to MQTT broker successfully. Temperature readings stable.', time: '09:18 AM', isMe: false },
  { id: '4', author: 'Me', text: 'Great progress team! Let\'s sync on the integration points this afternoon at 3PM.', time: '09:20 AM', isMe: true },
  { id: '5', author: 'Rania Khaled', text: 'The ERP dashboard is almost done. Just need the IoT live data feed integrated.', time: '09:45 AM', isMe: false },
]

const MOCK_PROJECT_FILES = [
  { id: 'f1', name: 'System_Architecture_v2.pdf', size: '2.4 MB', uploadedBy: 'Ahmed Mohamed', time: '2 days ago', type: 'pdf' },
  { id: 'f2', name: 'ERP_Database_Schema.sql', size: '48 KB', uploadedBy: 'Mariem Ahmed', time: '1 day ago', type: 'code' },
  { id: 'f3', name: 'Flutter_UI_Mockups.fig', size: '8.1 MB', uploadedBy: 'Sara Khalil', time: '5 hours ago', type: 'design' },
  { id: 'f4', name: 'IoT_Sensor_Setup_Guide.docx', size: '1.2 MB', uploadedBy: 'Youssef Ibrahim', time: '3 hours ago', type: 'doc' },
  { id: 'f5', name: 'Sprint_2_Progress_Report.pptx', size: '3.7 MB', uploadedBy: 'Heba Mostafa', time: '1 hour ago', type: 'pptx' },
]

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', code: '💾', design: '🎨', doc: '📝', pptx: '📊', default: '📁',
}

// ─── Video Call Modal ─────────────────────────────────────────────────────────
function VideoCallModal({ onClose, teamName }: { onClose: () => void; teamName: string }) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div>
            <span className="text-white font-bold block">{t('workspace.videoCall')} — {teamName}</span>
            <span className="text-white/50 text-xs">Live collaboration room</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/70 text-sm font-mono">
          <Clock size={15} /> 00:08:45
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto">
        {MEGA_TEAM_MEMBERS.slice(0, 7).map((m, i) => (
          <div key={i} className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-white/10 shadow-lg">
            <div className="text-center p-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow">
                {m.name[0]}
              </div>
              <p className="text-white text-xs font-semibold">{m.name.split(' ')[0]}</p>
              <p className="text-white/50 text-[10px]">{m.role}</p>
            </div>
            {!m.online && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                <span className="text-white/60 text-xs font-medium">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 start-2 flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${m.online ? 'bg-green-500' : 'bg-gray-600'}`}>
                <Mic size={10} className="text-white" />
              </div>
            </div>
          </div>
        ))}

        {/* User Card */}
        <div className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-brand-orange shadow-lg">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-md">
              A
            </div>
            <p className="text-white text-xs font-bold">{t('common.you')}</p>
            <p className="text-brand-orange text-[10px]">Team Lead</p>
          </div>
          <div className="absolute top-2 end-2 bg-brand-orange text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold">
            YOU
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex items-center justify-center gap-4 py-5 border-t border-white/10 bg-slate-900/80 backdrop-blur">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          }`}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={() => setCamOn(!camOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            camOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          }`}
          title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          <Smartphone size={20} />
        </button>
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-all hover:scale-105"
          title="End Call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        author: 'Me',
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-slate-50/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
            {!msg.isMe && <Avatar name={msg.author} size="xs" className="flex-shrink-0 mb-1" />}
            <div className={`max-w-[78%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {!msg.isMe && <p className="text-[11px] text-text-muted ms-1 font-semibold">{msg.author}</p>}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isMe
                    ? 'bg-brand-orange text-white rounded-ee-none'
                    : 'bg-white border border-gray-100 text-text-primary rounded-ss-none'
                }`}
              >
                {msg.text}
              </div>
              <p className="text-[10px] text-text-muted px-1">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 p-3 bg-white flex items-center gap-2">
        <button className="p-2.5 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-full transition-colors flex-shrink-0">
          <Paperclip size={18} />
        </button>
        <input
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          placeholder={t('workspace.typeMessage')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="p-2.5 bg-brand-orange text-white rounded-full hover:bg-brand-orange-dark transition-colors disabled:opacity-40 flex-shrink-0 shadow-sm"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Files Panel ──────────────────────────────────────────────────────────────
function FilesPanel() {
  const { t } = useLanguage()
  const [files, setFiles] = useState(MOCK_PROJECT_FILES)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFiles(prev => [
      {
        id: String(Date.now()),
        name: f.name,
        size: `${(f.size / 1024).toFixed(0)} KB`,
        uploadedBy: 'Ahmed Mohamed',
        time: 'Just now',
        type: f.name.split('.').pop() ?? 'default',
      },
      ...prev,
    ])
  }

  return (
    <div className="p-6 space-y-5">
      <div
        className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-3xl p-8 text-center cursor-pointer bg-orange-50/20 hover:bg-orange-50/40 transition-all"
        onClick={() => fileRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto mb-3">
          <Upload size={24} />
        </div>
        <p className="text-sm font-bold text-text-primary">{t('workspace.uploadFile')}</p>
        <p className="text-xs text-text-muted mt-1">{t('workspace.uploadFileTypes')}</p>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} multiple />
      </div>

      <div className="space-y-2.5">
        {files.map(f => (
          <div
            key={f.id}
            className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-brand-orange/40 transition-all group shadow-sm"
          >
            <span className="text-2xl flex-shrink-0">{FILE_ICONS[f.type] ?? FILE_ICONS.default}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{f.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.size} · {f.uploadedBy} · {f.time}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-colors">
                <Download size={16} />
              </button>
              <button className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Presentation Panel ───────────────────────────────────────────────────────
function PresentationPanel() {
  const { t } = useLanguage()
  const [videoUrl, setVideoUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [presentationFile, setPresentationFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
          <Play size={18} className="text-red-500 fill-red-500" /> {t('workspace.demoVideo')}
        </p>
        <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden relative flex items-center justify-center border border-gray-200 shadow-md">
          {submitted && videoUrl ? (
            <iframe
              src={videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/70 p-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Play size={28} className="text-white ms-1" />
              </div>
              <p className="text-sm font-bold">No demo video uploaded yet</p>
              <p className="text-xs text-white/50 mt-1">Paste a video link below to showcase your final delivery</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <p className="text-sm font-bold text-text-primary mb-2">{t('workspace.linkVideo')}</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full ps-9 pe-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            className="rounded-xl px-5"
            onClick={() => setSubmitted(true)}
            disabled={!videoUrl.trim()}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-text-muted font-bold">{t('common.or')}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div>
        <p className="text-sm font-bold text-text-primary mb-2">{t('workspace.uploadPresentation')}</p>
        <div
          className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-2xl p-6 text-center cursor-pointer hover:bg-orange-50/30 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          {presentationFile ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">📊</span>
              <div className="text-start">
                <p className="text-sm font-bold text-text-primary">{presentationFile.name}</p>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Uploaded Successfully
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto text-brand-orange mb-2" />
              <p className="text-sm font-bold text-text-primary">{t('workspace.uploadPresentation')}</p>
              <p className="text-xs text-text-muted mt-1">PDF, PPTX, Keynote — Max 50MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.key"
            className="hidden"
            onChange={e => setPresentationFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── AI Teammate Finder Component ─────────────────────────────────────────────
function AiTeammateFinder({ project, onInviteSuccess }: { project: TeamProject; onInviteSuccess?: (peer: Peer) => void }) {
  const { t } = useLanguage()
  const [isScanning, setIsScanning] = useState(false)
  const [invitedIds, setInvitedIds] = useState<string[]>([])
  const [searchFilter, setSearchFilter] = useState('')

  // Filter peers by project category or general skills
  const matchedPeers = PEERS.map(p => {
    // Generate contextual match score
    let score = p.matchScore ?? 85
    if (project.category.toLowerCase().includes('computer') && p.discipline.includes('Computer')) score = 96
    if (project.category.toLowerCase().includes('account') && p.discipline.includes('Accounting')) score = 94
    if (project.category.toLowerCase().includes('information') && p.discipline.includes('Information')) score = 95
    return { ...p, calculatedScore: score }
  }).sort((a, b) => b.calculatedScore - a.calculatedScore)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
    }, 1200)
  }

  const toggleInvite = (id: string, peer: Peer) => {
    if (invitedIds.includes(id)) {
      setInvitedIds(prev => prev.filter(i => i !== id))
    } else {
      setInvitedIds(prev => [...prev, id])
      onInviteSuccess?.(peer)
    }
  }

  const filtered = matchedPeers.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.skills.some(s => s.toLowerCase().includes(searchFilter.toLowerCase()))
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Recommendation Engine
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-extrabold">{t('team.aiFinderTitle')}</h3>
            <p className="text-white/70 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              {t('team.aiFinderDesc')}
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleScan}
            disabled={isScanning}
            className="rounded-2xl shadow-lg shadow-brand-orange/30 whitespace-nowrap"
          >
            {isScanning ? (
              <>
                <RefreshCw size={15} className="animate-spin me-2" />
                {t('team.searchingAi')}
              </>
            ) : (
              <>
                <Zap size={15} className="me-2 fill-white" />
                {t('practical.suggestTeammates')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full ps-9 pe-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Peers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(peer => {
          const isInvited = invitedIds.includes(peer.id)
          return (
            <div
              key={peer.id}
              className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={peer.name} size="md" />
                    <div>
                      <h4 className="font-bold text-sm text-text-primary group-hover:text-brand-orange transition-colors">
                        {peer.name}
                      </h4>
                      <p className="text-xs text-text-muted">{peer.specialty} · {peer.discipline}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                      <Sparkles size={11} className="text-purple-600" />
                      {peer.calculatedScore}% {t('team.matchScore')}
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {peer.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="text-[11px] bg-gray-50 text-text-body px-2 py-0.5 rounded-lg border border-gray-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <Link
                  href={`/peers/${peer.id}`}
                  className="text-xs text-brand-orange font-semibold hover:underline flex items-center gap-1"
                >
                  {t('common.profile')} <ArrowRight size={12} className="rtl:rotate-180" />
                </Link>

                <Button
                  variant={isInvited ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => toggleInvite(peer.id, peer)}
                  className={`rounded-xl text-xs font-bold transition-all ${
                    isInvited ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100' : ''
                  }`}
                >
                  {isInvited ? (
                    <>
                      <Check size={13} className="me-1 text-green-600" />
                      {t('team.invited')}
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} className="me-1" />
                      {t('team.invite')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Create Team Modal with Integrated AI Matchmaking ────────────────────────
function CreateTeamModal({
  onClose,
  onCreate,
  project,
}: {
  onClose: () => void
  onCreate: (name: string, emoji: string, goal: string, invitedNames: string[]) => void
  project: TeamProject
}) {
  const { t, lang } = useLanguage()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🚀')
  const [goal, setGoal] = useState('')
  const [domainFilter, setDomainFilter] = useState<'all' | 'IoT' | 'ERP' | 'Flutter' | 'Other'>('all')
  const [invitedPeerNames, setInvitedPeerNames] = useState<string[]>([])

  const EMOJI_OPTIONS = ['🚀', '⚡', '🔥', '💎', '💡', '🤖', '🎯', '🌟', '🛡️', '🏆']
  const totalSpots = project.members // 11 for Mega Project
  const remainingSpotsToFill = totalSpots - 1 // 10 spots for teammates

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setStep(2)
  }

  const toggleInvitePeer = (peerName: string) => {
    setInvitedPeerNames(prev =>
      prev.includes(peerName)
        ? prev.filter(n => n !== peerName)
        : prev.length < remainingSpotsToFill
        ? [...prev, peerName]
        : prev
    )
  }

  const handleFinalSubmit = () => {
    onCreate(name.trim(), emoji, goal.trim(), invitedPeerNames)
    onClose()
  }

  const filteredPeers = PEERS.filter(p => {
    if (domainFilter === 'all') return true
    if (domainFilter === 'IoT') return p.skills.some(s => s.toLowerCase().includes('iot') || s.toLowerCase().includes('arduino') || s.toLowerCase().includes('mqtt'))
    if (domainFilter === 'ERP') return p.skills.some(s => s.toLowerCase().includes('erp') || s.toLowerCase().includes('odoo') || s.toLowerCase().includes('sql') || s.toLowerCase().includes('architecture'))
    if (domainFilter === 'Flutter') return p.skills.some(s => s.toLowerCase().includes('flutter') || s.toLowerCase().includes('dart') || s.toLowerCase().includes('mobile'))
    return true
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-orange-50 rounded-2xl">{emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base md:text-lg text-text-primary">
                  {step === 1 ? t('team.createTeamModalTitle') : t('team.aiFinderTitle')}
                </h3>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {step === 1
                  ? t('team.createTeamModalDesc')
                  : t('team.aiFinderDesc')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: Team Basic Info */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5 mt-5">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-2">{t('team.teamEmoji')}</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(em => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setEmoji(em)}
                    className={`w-10 h-10 rounded-2xl text-lg flex items-center justify-center border transition-all ${
                      emoji === em ? 'border-brand-orange bg-orange-50 scale-110 shadow-sm font-bold' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">{t('team.teamName')}</label>
              <input
                type="text"
                required
                placeholder={t('team.teamNamePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">{t('team.targetGoal')}</label>
              <input
                type="text"
                placeholder={t('team.targetGoalPlaceholder')}
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50/50"
              />
            </div>

            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-start gap-3">
              <Sparkles size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-purple-900 leading-relaxed">
                <strong>{lang === 'ar' ? 'المشروع الكبير يحتاج 11 عضو:' : 'Mega Project requires 11 members:'}</strong>{' '}
                {lang === 'ar'
                  ? 'في الخطوة الجاية، الذكاء الاصطناعي هيرشحلك أنسب 10 طلاب يكملوا معاك تخصصات الـ IoT والـ ERP والموبايل فلاتر.'
                  : 'In the next step, AI Matchmaking will suggest the best 10 students to complete your squad across IoT, ERP, and Flutter domains.'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="ghost" type="button" onClick={onClose} className="rounded-xl">
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={!name.trim()} className="rounded-2xl font-bold px-6 py-2.5 flex items-center gap-1.5 shadow-md shadow-brand-orange/20">
                <span>{lang === 'ar' ? 'التالي: دور ع التيم بالذكاء الاصطناعي' : 'Next: Find Teammates with AI'}</span>
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: AI Matchmaking UI for the remaining 10 spots */}
        {step === 2 && (
          <div className="space-y-5 mt-5">
            {/* Squad Status & Counter */}
            <div className="bg-gradient-to-r from-purple-900 to-brand-navy p-5 rounded-2xl text-white shadow-md">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <h4 className="font-bold text-sm">{name}</h4>
                    <p className="text-[11px] text-purple-200">{goal || 'Target: Top Grade A+'}</p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-xs font-mono font-bold text-yellow-300">
                    {1 + invitedPeerNames.length} / {totalSpots} {lang === 'ar' ? 'أعضاء' : 'Members'}
                  </span>
                  <p className="text-[10px] text-white/70">
                    {remainingSpotsToFill - invitedPeerNames.length} {t('team.remainingSpots')}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-300 rounded-full"
                  style={{ width: `${((1 + invitedPeerNames.length) / totalSpots) * 100}%` }}
                />
              </div>
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(['all', 'IoT', 'ERP', 'Flutter'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDomainFilter(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    domainFilter === d
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {d === 'all' ? (lang === 'ar' ? 'كل المرشحين' : 'All Candidates') : d}
                </button>
              ))}
            </div>

            {/* Candidate Cards Grid */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pe-1">
              {filteredPeers.map(peer => {
                const isInvited = invitedPeerNames.includes(peer.name)
                return (
                  <div
                    key={peer.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isInvited
                        ? 'border-green-500/50 bg-green-50/50 shadow-xs'
                        : 'border-gray-100 bg-gray-50/50 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={peer.name} avatarType={peer.avatarType} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs md:text-sm text-text-primary truncate">{peer.name}</p>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.2 rounded-full font-extrabold flex items-center gap-1">
                            <Sparkles size={10} /> {peer.matchScore ?? 92}% {t('team.matchScore')}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{peer.specialty} · {peer.discipline}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {peer.skills.slice(0, 3).map(sk => (
                            <span key={sk} className="text-[9px] bg-white border border-gray-200 text-text-muted px-1.5 py-0.2 rounded-md">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isInvited ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleInvitePeer(peer.name)}
                      className={`rounded-xl text-xs px-3.5 py-1.5 font-bold flex-shrink-0 transition-all ${
                        isInvited ? 'border-green-500 text-green-700 bg-green-50' : ''
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check size={12} className="me-1 text-green-600" />
                          {t('team.invited')}
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} className="me-1" />
                          {t('team.invite')}
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl text-xs">
                {lang === 'ar' ? '← رجوع لتفاصيل التيم' : '← Back to Details'}
              </Button>
              <Button
                variant="primary"
                onClick={handleFinalSubmit}
                className="rounded-2xl font-bold px-6 py-3 shadow-md shadow-brand-orange/20 flex items-center gap-2"
              >
                <Check size={16} />
                <span>{t('team.launchWorkspace')}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Team Workspace Page Component ───────────────────────────────────────
export default function TeamWorkspacePage() {
  const params = useParams()
  const id = params?.id as string
  const project = TEAM_PROJECTS.find(p => p.id === id)
  const { t } = useLanguage()

  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'files' | 'presentation' | 'members' | 'ai-match'>('overview')
  const [videoCallOpen, setVideoCallOpen] = useState(false)
  const [joinedTeamId, setJoinedTeamId] = useState<string | null>(null)
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>(INITIAL_AVAILABLE_TEAMS)
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('background')
  const [extraMembers, setExtraMembers] = useState<string[]>([])

  if (!project) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-bg-cream">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Project Not Found</h2>
            <Link href="/practical/team">
              <Button variant="primary" className="rounded-xl">{t('team.backToProjects')}</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const isMega = !!project.isMega
  const currentTeam = availableTeams.find(t => t.id === joinedTeamId)

  // FIX Requirement 2: Users are NOT automatically assigned to an 11-member team upon opening the Mega Project page.
  // They only enter the workspace once they join an available team or create a new team.
  const isInWorkspace = !!joinedTeamId

  const handleCreateNewTeam = (name: string, emoji: string, goal: string, invitedNames: string[] = []) => {
    const newTeam: AvailableTeam = {
      id: `team-${Date.now()}`,
      name,
      emoji,
      slots: Math.max(0, project.members - (1 + invitedNames.length)),
      maxSlots: project.members,
      members: ['Mariem ahmed (You)', ...invitedNames],
      level: 'All Levels',
      isMyTeam: true,
      goal,
    }

    setAvailableTeams(prev => [newTeam, ...prev])
    setExtraMembers(invitedNames)
    setJoinedTeamId(newTeam.id)
    setActiveTab('overview')
  }

  const handleJoinTeam = (teamId: string) => {
    if (joinedTeamId === teamId) {
      setJoinedTeamId(null)
    } else {
      setJoinedTeamId(teamId)
      // Decrease open slot
      setAvailableTeams(prev =>
        prev.map(tm =>
          tm.id === teamId ? { ...tm, slots: Math.max(0, tm.slots - 1), members: [...tm.members, 'Mariem ahmed (You)'] } : tm
        )
      )
    }
  }

  const toggleSection = (key: string) =>
    setExpandedSection(prev => (prev === key ? null : key))

  const teamMembers = currentTeam?.isMyTeam
    ? [
        { name: 'Mariem ahmed', role: 'Team Lead', avatar: '', avatarType: 'niqab' as const, domain: 'Management', online: true },
        ...extraMembers.map((name, i) => ({
          name,
          role: i % 3 === 0 ? 'IoT Engineer' : i % 3 === 1 ? 'ERP Specialist' : 'Flutter Developer',
          avatar: '',
          avatarType: (name.toLowerCase().includes('mohamed') ? 'male' : 'hijab') as 'male' | 'hijab',
          domain: i % 3 === 0 ? 'IoT' : i % 3 === 1 ? 'ERP' : 'Flutter',
          online: i < 3,
        })),
      ]
    : isMega
    ? MEGA_TEAM_MEMBERS
    : [
        { name: 'Mariem ahmed', role: 'Team Lead', avatar: '', avatarType: 'niqab' as const, domain: 'Management', online: true },
        { name: 'Mohamed hamada', role: 'Hardware Dev', avatar: '', avatarType: 'male' as const, domain: 'IoT', online: true },
        { name: 'Rahma', role: 'Flutter Mobile Lead', avatar: '', avatarType: 'hijab' as const, domain: 'Flutter', online: false },
        ...extraMembers.map(name => ({
          name,
          role: 'Teammate (Invited)',
          avatar: '',
          avatarType: 'hijab' as const,
          domain: 'Dev',
          online: false,
        })),
      ]

  const workspaceTabs = [
    { id: 'overview', icon: <BarChart2 size={18} />, label: t('workspace.overview') },
    { id: 'chat', icon: <MessageCircle size={18} />, label: t('workspace.chat') },
    { id: 'files', icon: <FileText size={18} />, label: t('workspace.files') },
    { id: 'presentation', icon: <Play size={18} />, label: t('workspace.presentation') },
    { id: 'members', icon: <Users size={18} />, label: t('workspace.members') },
    { id: 'ai-match', icon: <Sparkles size={18} className="text-purple-400" />, label: t('workspace.aiMatch') },
  ]

  return (
    <AppLayout>
      {videoCallOpen && (
        <VideoCallModal
          onClose={() => setVideoCallOpen(false)}
          teamName={currentTeam?.name ?? project.title}
        />
      )}

      {createTeamModalOpen && (
        <CreateTeamModal
          project={project}
          onClose={() => setCreateTeamModalOpen(false)}
          onCreate={handleCreateNewTeam}
        />
      )}

      <div className="bg-bg-cream min-h-screen">
        {/* Header Hero */}
        <div
          className={`text-white py-8 transition-colors ${
            isMega
              ? 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900'
              : 'bg-gradient-to-r from-brand-navy to-brand-blue'
          }`}
        >
          <div className="section-container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-white/50 mb-4 flex-wrap">
              <Link href="/" className="hover:text-white">{t('nav.home')}</Link>
              <ChevronRight size={12} className="rtl:rotate-180" />
              <Link href="/practical/team" className="hover:text-white">{t('practical.team')}</Link>
              <ChevronRight size={12} className="rtl:rotate-180" />
              <span className="text-white/80">{project.title}</span>
            </nav>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {isMega && (
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/30">
                      <Crown size={11} /> MEGA PROJECT
                    </span>
                  )}
                  <Badge variant="orange" className="text-xs">{project.category}</Badge>
                  {isInWorkspace && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-green-400/30">
                      <CheckCircle2 size={12} /> {t('team.activeWorkspace')}
                    </span>
                  )}
                  {currentTeam && (
                    <span className="text-xs bg-white/10 text-white px-3 py-0.5 rounded-full font-semibold">
                      {currentTeam.emoji} {currentTeam.name}
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight max-w-2xl">
                  {project.title}
                </h1>

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Users size={13} /> {project.members} {t('common.members')}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {project.completionTime}</span>
                  <span className="flex items-center gap-1"><Zap size={13} className="text-yellow-400" /> {project.score} {t('common.points')}</span>
                  <span className="flex items-center gap-1"><Shield size={13} /> {project.doctor}</span>
                </div>
              </div>

              {/* Actions Right Side */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setCreateTeamModalOpen(true)}
                  className="rounded-2xl border-white/30 text-white hover:bg-white/10 text-xs font-bold"
                >
                  <Plus size={14} className="me-1" />
                  {t('team.createNewTeam')}
                </Button>

                {isInWorkspace && (
                  <button
                    onClick={() => setVideoCallOpen(true)}
                    className="flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-2xl font-bold transition-all shadow-lg hover:scale-105 group"
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors shadow">
                      <Video size={16} />
                    </div>
                    <div className="text-start">
                      <p className="text-xs font-bold leading-none">{t('team.startVideoCall')}</p>
                      <p className="text-[10px] text-white/60 mt-0.5">{teamMembers.filter(m => m.online).length} online</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Workspace Navigation Tabs */}
            {isInWorkspace && (
              <div className="flex gap-1.5 mt-6 overflow-x-auto pb-1">
                {workspaceTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Page Content Layout */}
        <div className="section-container py-8">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Panel */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* If in Workspace: render Workspace Tabs */}
              {isInWorkspace ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="p-6 md:p-8 space-y-6">
                      {/* Mega domains banner */}
                      {isMega && project.megaDomains && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { domain: 'IoT', icon: <Cpu size={24} />, color: 'from-green-500 to-teal-600', desc: 'Sensor Network & Edge Computing' },
                            { domain: 'ERP System', icon: <BarChart2 size={24} />, color: 'from-blue-500 to-indigo-600', desc: 'Resource Planning & Backend APIs' },
                            { domain: 'Flutter App', icon: <Smartphone size={24} />, color: 'from-purple-500 to-pink-600', desc: 'Cross-Platform Mobile App' },
                          ].map(d => (
                            <div key={d.domain} className={`bg-gradient-to-br ${d.color} rounded-2xl p-4 text-white text-center shadow-sm`}>
                              <div className="flex justify-center mb-2">{d.icon}</div>
                              <p className="font-bold text-sm">{d.domain}</p>
                              <p className="text-[10px] text-white/75 mt-1">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <h2 className="font-extrabold text-base text-text-primary mb-2">{t('team.projectBrief')}</h2>
                        <p className="text-sm text-text-body leading-relaxed">{project.description}</p>
                      </div>

                      {/* Collapsible Background & Problem */}
                      <div className="space-y-3">
                        {[
                          { key: 'background', title: `🏢 ${t('team.companyBackground')}`, content: project.companyBackground },
                          { key: 'problem', title: `⚠️ ${t('team.businessProblem')}`, content: project.businessProblem },
                        ].map(s => (
                          <div key={s.key} className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
                            <button
                              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-start"
                              onClick={() => toggleSection(s.key)}
                            >
                              <span className="font-bold text-text-primary text-sm">{s.title}</span>
                              {expandedSection === s.key ? (
                                <ChevronUp size={16} className="text-brand-orange" />
                              ) : (
                                <ChevronDown size={16} className="text-text-muted" />
                              )}
                            </button>
                            {expandedSection === s.key && (
                              <div className="px-5 pb-5 text-sm text-text-body leading-relaxed border-t border-gray-100 pt-3 bg-white">
                                {s.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Relevant Data */}
                      <div>
                        <h2 className="font-bold text-text-primary mb-3 text-sm">📊 {t('team.relevantData')}</h2>
                        <ul className="space-y-2">
                          {project.relevantData.map((d, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body bg-gray-50 rounded-xl px-4 py-3 border border-gray-100/60">
                              <span className="text-brand-orange font-bold flex-shrink-0">→</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tasks to solve */}
                      <div>
                        <h2 className="font-bold text-text-primary mb-3 text-sm">✅ {t('team.tasksToSolve')}</h2>
                        <ul className="space-y-2.5">
                          {project.tasksToSolve.map((task, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                              <div className="w-6 h-6 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <span className="leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Expected Deliverables */}
                      <div>
                        <h2 className="font-bold text-text-primary mb-3 text-sm">📦 {t('team.expectedDeliverables')}</h2>
                        <ul className="space-y-2">
                          {project.expectedDeliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs md:text-sm">
                              <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-text-body">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* CHAT TAB */}
                  {activeTab === 'chat' && <ChatPanel />}

                  {/* FILES TAB */}
                  {activeTab === 'files' && <FilesPanel />}

                  {/* PRESENTATION TAB */}
                  {activeTab === 'presentation' && <PresentationPanel />}

                  {/* MEMBERS TAB */}
                  {activeTab === 'members' && (
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="font-extrabold text-base text-text-primary">
                            {t('team.membersCount')} ({teamMembers.length}/{project.members})
                          </h2>
                          <p className="text-xs text-text-muted mt-0.5">
                            Collaborate with your squad across various project responsibilities.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveTab('ai-match')}
                          className="rounded-xl text-xs font-bold"
                        >
                          <Sparkles size={13} className="me-1" />
                          {t('practical.suggestTeammates')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {teamMembers.map((m, i) => (
                          <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="relative flex-shrink-0">
                              <Avatar name={m.name} size="md" />
                              <span
                                className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white ${
                                  m.online ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-text-primary truncate">{m.name}</p>
                              <p className="text-xs text-text-muted">{m.role}</p>
                            </div>
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${
                                DOMAIN_COLORS[m.domain] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {m.domain}
                            </span>
                          </div>
                        ))}

                        {/* Open Slots */}
                        {Array.from({ length: Math.max(0, project.members - teamMembers.length) }).map((_, i) => (
                          <div
                            key={`open-${i}`}
                            onClick={() => setActiveTab('ai-match')}
                            className="flex items-center gap-3 p-3.5 border-2 border-dashed border-gray-200 hover:border-brand-orange hover:bg-orange-50/30 rounded-2xl text-gray-400 hover:text-brand-orange cursor-pointer transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Plus size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary">{t('team.openSlot')}</p>
                              <p className="text-[10px] text-text-muted">{t('practical.suggestTeammates')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI MATCHMAKING TAB */}
                  {activeTab === 'ai-match' && (
                    <AiTeammateFinder
                      project={project}
                      onInviteSuccess={peer => {
                        setExtraMembers(prev => [...prev, peer.name])
                      }}
                    />
                  )}
                </div>
              ) : (
                /* Regular Case Overview before entering workspace */
                <div className="space-y-6">
                  {/* Project Brief */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <h2 className="font-extrabold text-base text-text-primary mb-4">{t('team.projectBrief')}</h2>
                    <div className="space-y-4 text-sm text-text-body">
                      <div>
                        <p className="font-bold text-text-primary mb-1">🏢 {t('team.companyBackground')}</p>
                        <p className="leading-relaxed">{project.companyBackground}</p>
                      </div>
                      <div>
                        <p className="font-bold text-text-primary mb-1">⚠️ {t('team.businessProblem')}</p>
                        <p className="leading-relaxed">{project.businessProblem}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <h2 className="font-extrabold text-base text-text-primary mb-4">{t('team.tasksToSolve')}</h2>
                    <ul className="space-y-3">
                      {project.tasksToSolve.map((tItem, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-body">
                          <div className="w-6 h-6 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{tItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Team Roles */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <h2 className="font-extrabold text-base text-text-primary mb-4">{t('team.teamRoles')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {project.teamRoles.map((r, i) => (
                        <div key={i} className="flex gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-8 h-8 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-text-primary">{r.role}</p>
                            <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{r.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Available Teams & Create Team CTA */}
            <div className="w-full xl:w-96 flex-shrink-0 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Available Teams Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-brand-navy to-brand-blue p-5 text-white flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-base">{t('team.availableTeams')}</h2>
                      <p className="text-white/60 text-xs mt-0.5">{t('team.availableTeamsDesc')}</p>
                    </div>
                    <button
                      onClick={() => setCreateTeamModalOpen(true)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title={t('team.createNewTeam')}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="p-5 space-y-3 max-h-[580px] overflow-y-auto">
                    {/* Create Team Quick CTA */}
                    <button
                      onClick={() => setCreateTeamModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-brand-orange/40 bg-orange-50/50 hover:bg-orange-50 rounded-2xl text-brand-orange font-bold text-xs transition-all hover:scale-[1.01]"
                    >
                      <Plus size={15} />
                      {t('team.createNewTeam')}
                    </button>

                    {availableTeams.map(team => {
                      const isJoined = joinedTeamId === team.id
                      return (
                        <div
                          key={team.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isJoined
                              ? 'border-brand-orange bg-orange-50/60 shadow-sm'
                              : 'border-gray-100 bg-gray-50/70 hover:border-brand-orange/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{team.emoji}</span>
                              <div>
                                <p className="font-bold text-xs md:text-sm text-text-primary flex items-center gap-1.5">
                                  {team.name}
                                  {team.isMyTeam && (
                                    <span className="text-[9px] bg-brand-orange text-white px-1.5 py-0.2 rounded-full font-bold">
                                      {t('team.myTeam')}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-text-muted">{team.level}</p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                team.slots === 1
                                  ? 'bg-red-100 text-red-600'
                                  : team.slots === 2
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {team.slots > 0 ? `${team.slots} ${t('team.slotsLeft')}` : t('team.full')}
                            </span>
                          </div>

                          {team.goal && (
                            <p className="text-[11px] text-text-body/80 italic mb-2.5 bg-white/70 px-2 py-1 rounded-lg">
                              &ldquo;{team.goal}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100/60">
                            <div className="flex -space-x-1.5 rtl:space-x-reverse">
                              {team.members.map((m, idx) => (
                                <div
                                  key={idx}
                                  title={m}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-navy to-brand-blue border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
                                >
                                  {m[0]}
                                </div>
                              ))}
                            </div>

                            <Button
                              variant={isJoined ? 'outline' : 'primary'}
                              size="sm"
                              className={`rounded-xl text-xs px-3.5 py-1 ${
                                isJoined ? 'border-green-500 text-green-600 bg-green-50' : ''
                              }`}
                              onClick={() => handleJoinTeam(team.id)}
                              disabled={team.slots === 0 && !isJoined}
                            >
                              {isJoined ? t('team.joined') : t('team.joinThisTeam')}
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {joinedTeamId && (
                      <Button
                        variant="primary"
                        fullWidth
                        className="rounded-2xl font-bold py-3 shadow-md shadow-brand-orange/20 mt-2"
                        onClick={() => setActiveTab('chat')}
                      >
                        {t('team.enterWorkspace')}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress / Team Roles Side Panel */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-text-primary text-sm mb-4">{t('team.projectProgress')}</h3>
                  {[
                    { label: 'Architecture & System Design', pct: 80, color: 'bg-green-500' },
                    { label: 'Core Modules & Implementation', pct: 55, color: 'bg-blue-500' },
                    { label: 'UI/UX & Integration', pct: 40, color: 'bg-purple-500' },
                    { label: 'Final Demo & Documentation', pct: 20, color: 'bg-orange-500' },
                  ].map(p => (
                    <div key={p.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-text-primary">{p.label}</span>
                        <span className="text-text-muted font-mono">{p.pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
