// src/app/community/page.tsx
'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Heart, MessageCircle, Plus, Search, Video, FileText, Send,
  Image as ImageIcon, X, Film, Upload, Smile
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { POSTS, MY_COMMUNITIES, COMMUNITY_GROUPS, PEOPLE_YOU_MAY_KNOW } from '@/lib/data/community'
import { useLanguage } from '@/lib/context/LanguageContext'

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({
  onClose,
  onPost,
}: {
  onClose: () => void
  onPost: (content: string, mediaType?: string) => void
}) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'video' | 'file'>('text')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setFilePreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const submit = () => {
    if (!text.trim() && !filePreview) return
    onPost(text, activeTab !== 'text' ? activeTab : undefined)
    onClose()
  }

  const tabs = [
    { id: 'photo' as const, icon: <ImageIcon size={18} />, label: t('community.addPhoto'), color: 'text-green-600 hover:bg-green-50' },
    { id: 'video' as const, icon: <Film size={18} />, label: t('community.addVideo'), color: 'text-red-500 hover:bg-red-50' },
    { id: 'file' as const, icon: <FileText size={18} />, label: t('community.addFile'), color: 'text-blue-600 hover:bg-blue-50' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">
            {t('community.sharePost')}
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* Author row */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar name="Ahmed" size="md" />
            <div>
              <p className="font-bold text-sm text-text-primary">Ahmed Mohamed</p>
              <span className="text-xs bg-gray-100 text-text-muted px-2 py-0.5 rounded-full">Student · BIS</span>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            autoFocus
            rows={4}
            className="w-full text-sm md:text-base resize-none border-0 outline-none placeholder-gray-400 bg-transparent leading-relaxed mb-2"
            placeholder={t('community.writePost')}
            value={text}
            onChange={e => setText(e.target.value)}
          />

          {/* File upload area for photo/video/file */}
          {activeTab !== 'text' && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-orange hover:bg-orange-50/30 transition-all mb-3"
              onClick={() => fileRef.current?.click()}
            >
              {filePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={28} />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs">
                    {activeTab === 'photo' ? 'JPG, PNG, GIF' : activeTab === 'video' ? 'MP4, MOV, WebM' : 'PDF, DOC, PPTX'}
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={activeTab === 'photo' ? 'image/*' : activeTab === 'video' ? 'video/*' : '.pdf,.doc,.docx,.pptx,.xlsx'}
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex gap-1 mb-4 border border-gray-100 rounded-2xl p-1 bg-gray-50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFilePreview(null) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-sm text-text-primary' : `text-gray-400 ${tab.color}`
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center gap-3 border-t border-gray-50 pt-4">
          <button className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-full transition-colors">
            <Smile size={20} />
          </button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-full px-6 font-bold"
            onClick={submit}
            disabled={!text.trim() && !filePreview}
          >
            {t('common.post')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: typeof POSTS[0] }) {
  const { t } = useLanguage()
  const [liked, setLiked] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(post.comments)

  const submitComment = () => {
    if (!newComment.trim()) return
    setComments(prev => [...prev, {
      id: String(Date.now()),
      author: 'Ahmed',
      authorAvatar: '',
      text: newComment,
      replies: [],
    }])
    setNewComment('')
  }

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-4 mb-4">
        {/* Clickable avatar → profile */}
        <Link href={`/peers/1`} className="flex-shrink-0">
          <Avatar src={post.authorAvatar} name={post.author} size="md" className="hover:ring-2 hover:ring-brand-orange transition-all cursor-pointer" />
        </Link>
        <div className="flex-1 min-w-0">
          {/* Clickable name → profile */}
          <Link href={`/peers/1`} className="hover:text-brand-orange transition-colors">
            <p className="font-bold text-base text-text-primary truncate">{post.author}</p>
          </Link>
          <p className="text-xs text-text-muted">{post.timeAgo}</p>
        </div>
        <Button variant="ghost" size="sm" className="px-3 rounded-full text-xs hidden sm:inline-flex">
          {t('common.follow')}
        </Button>
      </div>

      <p className="text-sm md:text-base text-text-body mb-4 whitespace-pre-line leading-relaxed">
        {post.content}
      </p>

      {post.mediaType === 'image' && (
        <div className="w-full aspect-video md:aspect-auto md:h-80 bg-orange-50 rounded-2xl mb-4 overflow-hidden relative border border-gray-100 flex items-center justify-center">
          <ImageIcon size={48} className="text-orange-200" />
          <span className="absolute bottom-4 end-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Image Attachment</span>
        </div>
      )}

      <div className="flex items-center gap-6 text-sm font-medium text-text-muted py-3 border-y border-gray-50 mb-4">
        <button
          onClick={() => setLiked(l => !l)}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-brand-orange' : 'hover:text-brand-orange'}`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-brand-orange' : ''} />
          <span>{liked ? post.likes.length + 1 : post.likes.length} {t('community.likes')}</span>
        </button>
        <button
          onClick={() => setShowComment(s => !s)}
          className="flex items-center gap-1.5 hover:text-brand-orange transition-colors"
        >
          <MessageCircle size={18} />
          <span>{comments.length} {t('community.comments')}</span>
        </button>
      </div>

      {showComment && (
        <div className="pt-2">
          <div className="space-y-4 mb-4">
            {comments.map(c => (
              <div key={c.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar src={c.authorAvatar} name={c.author} size="sm" className="mt-1" />
                  <div className="bg-gray-50 rounded-2xl rounded-ss-none px-4 py-3 flex-1">
                    <p className="font-bold text-xs text-text-primary mb-1">{c.author}</p>
                    <p className="text-sm text-text-body leading-relaxed">{c.text}</p>
                  </div>
                </div>
                {(c.replies ?? []).map(r => (
                  <div key={r.id} className="flex items-start gap-3 ms-10">
                    <Avatar src={r.authorAvatar} name={r.author} size="xs" className="mt-1" />
                    <div className="bg-orange-50 rounded-2xl rounded-ss-none px-4 py-3 flex-1">
                      <p className="font-bold text-xs text-brand-orange mb-1">{r.author}</p>
                      <p className="text-sm text-text-body leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Avatar name="Mariem ahmed" avatarType="niqab" size="sm" />
            <div className="flex-1 relative">
              <input
                className="w-full text-sm border border-gray-200 rounded-full ps-4 pe-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                placeholder={t('community.writeComment')}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              <button
                onClick={submitComment}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-brand-orange p-1.5 hover:bg-orange-100 rounded-full transition-colors"
                disabled={!newComment.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Community Page ─────────────────────────────────────────────────────
export default function CommunityPage() {
  const { t, isArabic } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [posts, setPosts] = useState(POSTS)

  const addPost = (content: string, mediaType?: string) => {
    if (!content.trim()) return
    setPosts(prev => [{
      id: String(Date.now()),
      author: 'Mariem ahmed',
      authorAvatarType: 'niqab',
      authorAvatar: '',
      content,
      mediaType: mediaType as 'image' | undefined,
      likes: [],
      comments: [],
      timeAgo: 'Just now',
      timeAgoAr: 'دلوقتي حالا',
    }, ...prev])
  }

  return (
    <AppLayout>
      {modalOpen && <CreatePostModal onClose={() => setModalOpen(false)} onPost={addPost} />}

      <div className="bg-bg-cream min-h-screen pb-12">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30 lg:hidden px-4 py-3 shadow-sm flex gap-2 overflow-x-auto">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="whitespace-nowrap">
            <Plus size={14} className="me-1" /> {t('community.sharePost')}
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setModalOpen(true)}>
            <Video size={14} className="me-1" /> {t('community.addVideo')}
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setModalOpen(true)}>
            <FileText size={14} className="me-1" /> {t('community.addFile')}
          </Button>
        </div>

        <div className="section-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-text-primary mb-4 px-2">Navigation</h3>
                  {['Feed', 'Trending', 'Events', 'Saved'].map((item, i) => (
                    <button key={item} className={`w-full text-start px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                      i === 0 ? 'bg-orange-50 text-brand-orange' : 'text-text-body hover:bg-gray-50'
                    }`}>{item}</button>
                  ))}
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold text-text-primary text-sm">{t('community.myConnections')}</h3>
                    <span className="text-[10px] bg-brand-navy text-white rounded-full px-2 py-0.5 font-bold">{MY_COMMUNITIES.length}</span>
                  </div>
                  <div className="space-y-1">
                    {MY_COMMUNITIES.map(c => (
                      <Link key={c.id} href="/peers" className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <Avatar avatarType={c.avatarType} name={c.name} size="xs" />
                        <span className="text-sm font-medium text-text-body truncate">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-xs font-bold text-brand-orange hover:underline text-center">{t('common.viewAll')}</button>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
              {/* Desktop Composer Actions */}
              <div className="hidden lg:block mb-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar name="Ahmed" size="md" />
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 text-start px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-400 font-medium transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      {t('community.writePost')}
                    </button>
                  </div>
                  <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <ImageIcon size={18} /> {t('community.addPhoto')}
                    </button>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Film size={18} /> {t('community.addVideo')}
                    </button>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <FileText size={18} /> {t('community.addFile')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed Posts */}
              <div>
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>

              <div className="text-center py-8">
                <Button variant="outline" size="lg" className="rounded-full">Load More Posts</Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-text-primary text-sm mb-4 px-2">{t('community.discoverHubs')}</h3>
                  <div className="space-y-2">
                    {COMMUNITY_GROUPS.map(g => (
                      <button key={g.id} className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors text-start">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-lg shadow-sm border border-orange-100/50">{g.icon}</div>
                        <span className="font-semibold text-sm text-text-primary flex-1 truncate">{g.label}</span>
                      </button>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-xs font-bold text-brand-orange hover:underline text-center">Explore Hubs</button>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-text-primary text-sm mb-4 px-2">{t('community.suggestedPeers')}</h3>
                  <div className="space-y-3">
                    {PEOPLE_YOU_MAY_KNOW.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-2 py-1">
                        {/* Clickable avatar → profile */}
                        <Link href={`/peers/${p.id}`}>
                          <Avatar avatarType={p.avatarType} name={p.name} size="sm" className="hover:ring-2 hover:ring-brand-orange transition-all cursor-pointer" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          {/* Clickable name → profile */}
                          <Link href={`/peers/${p.id}`} className="hover:text-brand-orange transition-colors">
                            <p className="font-bold text-sm text-text-primary truncate">{p.name}</p>
                          </Link>
                          <p className="text-xs text-text-muted truncate">{isArabic && p.roleAr ? p.roleAr : p.role}</p>
                        </div>
                        <button className="text-brand-orange hover:bg-orange-50 p-1.5 rounded-full transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  )
}
