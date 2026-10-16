'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Mic, MicOff, Video, VideoOff, MonitorUp, Circle, MessageCircle, MoreHorizontal, Phone, UserPlus, Send } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

const PARTICIPANTS = [
  { id: '1', name: 'Ahmed Gaber', role: 'Moderator', isMuted: false, hasVideo: true },
  { id: '2', name: 'Malak Mahmoud', role: 'Member', isMuted: false, hasVideo: false },
  { id: '3', name: 'Nada Elsayed', role: 'Member', isMuted: true, hasVideo: false },
  { id: '4', name: 'Rania Khaled', role: 'Member', isMuted: true, hasVideo: true },
]

const TILE_PARTICIPANTS = [
  { name: 'Sara', isMuted: true },
  { name: 'Doaa', isMuted: false },
  { name: 'Raneem', isMuted: false },
  { name: 'Mohamed', isMuted: true },
]

const CHAT_MESSAGES = [
  { id: '1', sender: 'Shahd Khamees', text: 'Ahin ya A5waty', time: '11:01 AM' },
  { id: '2', sender: 'Shahd Khamees', text: 'We will start this meeting', time: '11:01 AM' },
  { id: '3', sender: 'Shahd Mohamed', text: 'Bosr3a, El discation bokraaaaaaaaaa', time: '11:02 AM' },
  { id: '4', sender: 'Basmala', text: 'Relax', time: '12:04 AM' },
]

export default function MeetingPage({ params }: { params: { id: string } }) {
  const [isMuted, setIsMuted] = useState(false)
  const [hasVideo, setHasVideo] = useState(true)
  const [isRecording, setIsRecording] = useState(true)
  const [chatTab, setChatTab] = useState<'group' | 'personal'>('group')
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [timer] = useState('24:01:45')

  const sendMessage = () => {
    if (!chatMessage.trim()) return
    setMessages(prev => [...prev, { id: String(Date.now()), sender: 'Ahmed', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setChatMessage('')
  }

  return (
    <div className="h-screen bg-meeting-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-meeting-panel border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Video size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm">System Analysis And Design Meeting</p>
            <p className="text-xs text-gray-400">June 12th, 290 | 11:00 AM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {PARTICIPANTS.slice(0, 3).map(p => <Avatar key={p.id} name={p.name} size="xs" className="border-2 border-meeting-panel" />)}
          </div>
          <div className="flex items-center gap-2 bg-meeting-surface px-3 py-1.5 rounded-full text-xs">
            <div className="w-2 h-2 bg-brand-orange rounded-full" />
            cem-jnmt-hsu
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar name="Ahmed Gaber" size="sm" />
          <div>
            <p className="text-xs font-semibold">Ahmed Gaber</p>
            <p className="text-xs text-gray-400">Moderator</p>
          </div>
          <button className="text-gray-400 hover:text-white"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col p-4">
          {/* Active speaker */}
          <div className="flex-1 bg-meeting-surface rounded-2xl relative overflow-hidden mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-green-200/10 flex items-center justify-center">
              <div className="text-8xl">👨‍💼</div>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isRecording && <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs"><Circle size={8} className="text-red-500 fill-red-500" /> {timer}</div>}
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-sm font-medium">Ahmed</div>
            <div className="absolute bottom-3 right-3">
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-sm">🔊</button>
            </div>
          </div>
          {/* Participant tiles */}
          <div className="flex gap-2">
            {TILE_PARTICIPANTS.map(p => (
              <div key={p.name} className="flex-1 h-24 bg-meeting-surface rounded-xl relative flex items-center justify-center">
                <div className="text-3xl">👤</div>
                <div className="absolute bottom-1 left-2 text-xs text-gray-300">{p.name}</div>
                {p.isMuted && (
                  <div className="absolute bottom-1 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <MicOff size={10} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 bg-meeting-panel border-l border-white/10 flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Participants</h3>
              <button className="flex items-center gap-1 text-xs bg-blue-600 px-2 py-1 rounded-full hover:bg-blue-700">
                <UserPlus size={12} /> Add
              </button>
            </div>
            {PARTICIPANTS.map(p => (
              <div key={p.id} className="flex items-center gap-2 py-1.5">
                <Avatar name={p.name} size="xs" />
                <span className="text-xs flex-1">{p.name}</span>
                <button className={p.isMuted ? 'text-red-400' : 'text-gray-400'}>
                  {p.isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                </button>
                <button className="text-gray-400"><VideoOff size={12} /></button>
              </div>
            ))}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setChatTab('group')}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium ${chatTab === 'group' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >Group</button>
              <button
                onClick={() => setChatTab('personal')}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium ${chatTab === 'personal' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >Personal</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {messages.map(m => (
                <div key={m.id} className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar name={m.sender} size="xs" />
                    <span className="text-gray-400 font-medium">{m.sender}</span>
                    <span className="text-gray-600 ml-auto">{m.time}</span>
                  </div>
                  <p className="text-gray-300 pl-6">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 border-t border-white/10 pt-3">
              <input
                className="flex-1 bg-meeting-surface rounded-full px-3 py-1.5 text-xs focus:outline-none"
                placeholder="Type Something..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-meeting-panel border-t border-white/10">
        <div className="flex items-center gap-3">
          {[
            { icon: isMuted ? <MicOff size={18} /> : <Mic size={18} />, action: () => setIsMuted(!isMuted), active: !isMuted },
            { icon: hasVideo ? <Video size={18} /> : <VideoOff size={18} />, action: () => setHasVideo(!hasVideo), active: hasVideo },
            { icon: <MonitorUp size={18} />, action: () => {}, active: false },
            { icon: <Circle size={18} className={isRecording ? 'text-red-500' : ''} />, action: () => setIsRecording(!isRecording), active: isRecording },
            { icon: <MessageCircle size={18} />, action: () => {}, active: false },
            { icon: <MoreHorizontal size={18} />, action: () => {}, active: false },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                btn.active ? 'bg-brand-blue/80 hover:bg-brand-blue' : 'bg-meeting-surface hover:bg-white/10'
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
        <Link href="/practical">
          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold transition-colors">
            <Phone size={16} /> End Call
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <input
            className="bg-meeting-surface rounded-full px-4 py-2 text-xs focus:outline-none w-40"
            placeholder="Type Something..."
            value={chatMessage}
            onChange={e => setChatMessage(e.target.value)}
          />
          <button onClick={sendMessage} className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
