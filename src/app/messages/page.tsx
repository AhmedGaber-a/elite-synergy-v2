'use client'
import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Plus, Settings, Paperclip, Mic, Send, MoreVertical, Video, X, Phone, PhoneOff, MicOff } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { CONVERSATIONS } from '@/lib/data/messages'
import { PEERS } from '@/lib/data/peers'
import { SOLO_CASES, TEAM_PROJECTS } from '@/lib/data/projects'
import { cn } from '@/lib/utils/cn'

function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showVideo, setShowVideo] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialization: If navigating from a peer or project, ensure conversation exists
  useEffect(() => {
    if (type && id) {
      const convId = `${type}_${id}`
      const existing = conversations.find(c => c.id === convId)
      
      if (!existing) {
        let newConv
        if (type === 'peer') {
          const peer = PEERS.find(p => p.id === id)
          if (peer) {
            newConv = {
              id: convId,
              name: peer.name,
              role: peer.specialty,
              avatar: peer.avatar,
              lastMessage: 'Conversation started',
              time: 'Just now',
              unread: 0,
              isOnline: true,
              isGroup: false,
              messages: [],
              contextType: 'peer'
            }
          }
        } else if (type === 'project') {
          const project = SOLO_CASES.find(p => p.id === id) || TEAM_PROJECTS.find(p => p.id === id)
          if (project) {
            newConv = {
              id: convId,
              name: `${project.title} Discussion`,
              role: 'Project Workspace',
              avatar: '/assets/logo-mark.svg',
              lastMessage: 'Workspace created',
              time: 'Just now',
              unread: 0,
              isOnline: true,
              isGroup: true,
              messages: [],
              contextType: 'project'
            }
          }
        }
        
        if (newConv) {
          setConversations(prev => [newConv, ...prev])
          setActiveId(newConv.id)
        }
      } else {
        setActiveId(existing.id)
      }
    }
  }, [type, id]) // run only when type/id change in URL

  const active = conversations.find(c => c.id === activeId) || conversations[0]

  const sendMessage = () => {
    if (!newMessage.trim()) return
    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? {
            ...c,
            messages: [...c.messages, {
              id: String(Date.now()),
              text: newMessage,
              sender: 'me',
              senderName: 'Ahmed',
              senderRole: 'Student',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }],
            lastMessage: newMessage,
          }
        : c
    ))
    setNewMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages?.length])

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="bg-bg-cream" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="section-container h-full py-4">
          <div className="flex h-full gap-4">
            
            {/* Conversation list */}
            <div className="w-72 md:w-80 flex-shrink-0 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hidden sm:flex">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-xl text-text-primary">Inbox</h2>
                  <div className="flex gap-2">
                    <button className="text-text-muted hover:text-brand-orange transition-colors"><Plus size={20} /></button>
                    <button className="text-text-muted hover:text-brand-orange transition-colors"><Settings size={20} /></button>
                  </div>
                </div>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-gray-50',
                      activeId === conv.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={conv.avatar} name={conv.name} size="md" />
                      {conv.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-sm font-bold text-text-primary truncate">{conv.name}</span>
                        <span className="text-xs font-medium text-text-muted ml-2 whitespace-nowrap">{conv.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-text-body truncate pr-2">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="w-4 h-4 bg-brand-orange text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                        )}
                      </div>
                      {conv.contextType === 'project' && <Badge variant="navy" className="text-[9px] px-1.5 py-0 mt-1">Practical</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat panel */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar src={active.avatar} name={active.name} size="md" />
                    {active.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-text-primary text-base md:text-lg leading-tight">{active.name}</h2>
                    <p className="text-xs text-text-muted font-medium">
                      {active.role} • {active.isOnline ? <span className="text-green-500">Online</span> : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3">
                  {active.contextType !== 'project' && (
                    <button 
                      onClick={() => setShowVideo(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy rounded-full transition-colors text-sm font-semibold"
                    >
                      <Video size={16} /> <span className="hidden md:inline">Meet</span>
                    </button>
                  )}
                  <button className="p-2 text-text-muted hover:text-brand-orange rounded-full hover:bg-orange-50 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('/assets/grid-pattern.svg')] bg-repeat opacity-95">
                {active.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">💬</div>
                    <h3 className="font-bold text-text-primary mb-1">No messages yet</h3>
                    <p className="text-sm text-text-muted">Start the conversation with {active.name}</p>
                  </div>
                ) : (
                  active.messages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                      <div className="max-w-[85%] md:max-w-[70%]">
                        <div className={cn('flex items-baseline gap-2 mb-1', msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row')}>
                          <span className="text-xs font-bold text-text-primary">{msg.senderName}</span>
                          <span className="text-[10px] font-medium text-text-muted">{msg.senderRole}</span>
                        </div>
                        <div className={cn(
                          'px-4 py-3 text-sm shadow-sm',
                          msg.sender === 'me'
                            ? 'bg-brand-orange text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border border-gray-100 text-text-primary rounded-2xl rounded-tl-sm'
                        )}>
                          {msg.text}
                        </div>
                        <p className={cn('text-[10px] font-medium text-text-muted mt-1', msg.sender === 'me' ? 'text-right' : 'text-left')}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange transition-all">
                  <button className="p-2.5 text-gray-400 hover:text-brand-orange transition-colors"><Paperclip size={20} /></button>
                  <textarea
                    className="flex-1 text-sm bg-transparent resize-none border-0 outline-none max-h-32 py-2.5"
                    rows={1}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 pb-1 pr-1">
                    <button className="p-2 text-gray-400 hover:text-brand-orange transition-colors"><Mic size={20} /></button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:bg-brand-orange-dark transition-colors disabled:opacity-50 disabled:hover:bg-brand-orange shadow-sm"
                    >
                      <Send size={18} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Call Modal Overlay */}
              {showVideo && (
                <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col">
                  {/* Video Header */}
                  <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">00:00</span>
                    </div>
                    <button onClick={() => setShowVideo(false)} className="text-white/80 hover:text-white p-2">
                      <X size={24} />
                    </button>
                  </div>
                  
                  {/* Video Area (Demo) */}
                  <div className="flex-1 flex items-center justify-center relative">
                    {/* Remote User Placeholder */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Avatar src={active.avatar} name={active.name} size="xl" className="w-32 h-32 mb-4 ring-4 ring-white/10" />
                      <h3 className="text-white text-xl font-bold">{active.name}</h3>
                      <p className="text-white/60 text-sm">Connecting...</p>
                    </div>
                    
                    {/* Local User Mini Placeholder */}
                    <div className="absolute bottom-6 right-6 w-32 h-44 bg-gray-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl flex items-center justify-center">
                      <Avatar name="Ahmed" size="md" />
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-6">
                    <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all">
                      <MicOff size={20} />
                    </button>
                    <button 
                      onClick={() => setShowVideo(false)}
                      className="w-16 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                    >
                      <PhoneOff size={24} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all">
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
