// src/app/messages/page.tsx
'use client';
import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Plus, Paperclip, Send, MoreVertical,
  Users, Briefcase, ExternalLink, MessageSquare, ArrowLeft, RefreshCw
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils/cn';

interface SharedPostPreview {
  id: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'male' | 'female';
  content: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createdAt?: string;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  sender: string;
  senderFullName?: string;
  senderAvatar?: string;
  senderAvatarType?: 'male' | 'female';
  text: string;
  isMe: boolean;
  time: string;
  timeAgoEn: string;
  exactDate: string;
  createdAt: string;
  sharedPost?: SharedPostPreview | null;
}

interface ConversationItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarType?: 'male' | 'female';
  isGroup: boolean;
  category: 'peers' | 'practical';
  projectId?: string | null;
  teamId?: string | null;
  lastMessage: string;
  time: string;
  timeAgoEn: string;
  unread: number;
  otherUserId?: string | null;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const typeParam = searchParams.get('type'); // 'peer' | 'project'
  const idParam = searchParams.get('id');

  const [activeCategory, setActiveCategory] = useState<'all' | 'peers' | 'practical'>('all');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations from real Prisma API
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const convList: ConversationItem[] = data.conversations || [];
        setConversations(convList);

        // Auto-select first conversation if none selected
        if (!activeId && convList.length > 0 && !idParam) {
          setActiveId(convList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeId, idParam]);

  // Handle URL query navigation: open or create conversation
  useEffect(() => {
    async function handleUrlParam() {
      if (!idParam) return;

      // If idParam is a conversation ID that exists in list
      const existing = conversations.find((c) => c.id === idParam);
      if (existing) {
        setActiveId(existing.id);
        if (existing.category) setActiveCategory(existing.category);
        return;
      }

      // If typeParam is peer or project, ensure conversation is initialized
      if (typeParam === 'peer') {
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peerId: idParam, category: 'peers' }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.conversationId) {
              await fetchConversations();
              setActiveId(data.conversationId);
              setActiveCategory('peers');
            }
          }
        } catch (err) {
          console.error('Failed to create peer conversation:', err);
        }
      } else if (typeParam === 'project') {
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: idParam, category: 'practical' }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.conversationId) {
              await fetchConversations();
              setActiveId(data.conversationId);
              setActiveCategory('practical');
            }
          }
        } catch (err) {
          console.error('Failed to create project workspace conversation:', err);
        }
      }
    }

    handleUrlParam();
  }, [typeParam, idParam, conversations, fetchConversations]);

  // Initial load & poll conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;

    setLoadingMsgs(true);
    fetchMessages(activeId).finally(() => setLoadingMsgs(false));

    // Fast polling for active chat messages
    const msgInterval = setInterval(() => {
      fetchMessages(activeId);
    }, 3500);

    return () => clearInterval(msgInterval);
  }, [activeId, fetchMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // 3. Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeId || sending) return;
    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeId,
          text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
          // Update conversation last message in list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeId
                ? { ...c, lastMessage: textToSend, time: 'الآن' }
                : c
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Filter conversations by category & search query
  const filteredConversations = conversations.filter((c) => {
    const matchesCategory =
      activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const counts = {
    all: conversations.length,
    peers: conversations.filter((c) => c.category === 'peers').length,
    practical: conversations.filter((c) => c.category === 'practical').length,
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <AppLayout>
        <div className="bg-bg-cream min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              💬
            </div>
            <h2 className="text-xl font-extrabold text-text-primary mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-xs text-text-muted mb-6">
              يرجى تسجيل الدخول بحسابك الجامعي للوصول إلى محادثاتك الأكاديمية ومساحات عمل الفرق.
            </p>
            <Link href="/auth/login">
              <Button variant="primary" size="md" className="rounded-xl px-6 font-bold">
                تسجيل الدخول الآن
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-bg-cream" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="section-container h-full py-4">
          <div className="flex h-full gap-4">
            {/* Conversation List Sidebar */}
            <div className="w-80 md:w-88 flex-shrink-0 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-xl text-text-primary">الرسائل والمحادثات</h2>
                  <span className="text-xs font-bold bg-orange-100 text-brand-orange px-2.5 py-0.5 rounded-full">
                    {conversations.length}
                  </span>
                </div>

                {/* Categorized Tabs Switcher (Peers vs Practical) */}
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100 text-xs font-bold">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`py-1.5 rounded-xl transition-all ${
                      activeCategory === 'all'
                        ? 'bg-white text-text-primary shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    الكل ({counts.all})
                  </button>
                  <button
                    onClick={() => setActiveCategory('peers')}
                    className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                      activeCategory === 'peers'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-text-muted hover:text-teal-700'
                    }`}
                  >
                    <Users size={12} />
                    <span>الزملاء ({counts.peers})</span>
                  </button>
                  <button
                    onClick={() => setActiveCategory('practical')}
                    className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                      activeCategory === 'practical'
                        ? 'bg-brand-orange text-white shadow-xs'
                        : 'text-text-muted hover:text-brand-orange'
                    }`}
                  >
                    <Briefcase size={12} />
                    <span>عملي ({counts.practical})</span>
                  </button>
                </div>

                {/* Search Conversations */}
                <div className="relative">
                  <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full ps-10 pe-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                    placeholder="بحث في المحادثات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations Scrollable List */}
              <div className="flex-1 overflow-y-auto">
                {loadingConvs ? (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[11px] text-text-muted">جاري تحميل المحادثات...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted space-y-3">
                    <p>لا توجد محادثات في هذا التصنيف حالياً.</p>
                    <div className="flex flex-col gap-2 pt-2">
                      <Link href="/peers">
                        <Button variant="outline" size="sm" fullWidth className="rounded-xl text-xs">
                          <Users size={13} className="me-1" /> التواصل مع زملاء في Peers
                        </Button>
                      </Link>
                      <Link href="/practical">
                        <Button variant="outline" size="sm" fullWidth className="rounded-xl text-xs">
                          <Briefcase size={13} className="me-1" /> استكشاف المشاريع العملية
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveId(conv.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3.5 text-start transition-colors border-b border-gray-50 relative',
                        activeId === conv.id ? 'bg-orange-50/70 border-brand-orange/30' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={conv.avatar}
                          avatarType={conv.avatarType}
                          name={conv.name}
                          size="md"
                        />
                        <span
                          className={`absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${
                            conv.category === 'practical' ? 'bg-brand-orange' : 'bg-teal-600'
                          }`}
                        >
                          {conv.category === 'practical' ? <Briefcase size={9} /> : <Users size={9} />}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-bold text-xs md:text-sm text-text-primary truncate">{conv.name}</p>
                          <span className="text-[10px] text-text-muted flex-shrink-0">{conv.time}</span>
                        </div>
                        <p className="text-[11px] text-text-muted truncate mb-0.5">{conv.role}</p>
                        <p className="text-xs text-text-body truncate leading-relaxed">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unread > 0 && (
                        <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 min-w-0">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={activeConversation.avatar}
                        avatarType={activeConversation.avatarType}
                        name={activeConversation.name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm md:text-base text-text-primary truncate">
                            {activeConversation.name}
                          </h3>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              activeConversation.category === 'practical'
                                ? 'bg-orange-100 text-brand-orange'
                                : 'bg-teal-100 text-teal-700'
                            }`}
                          >
                            {activeConversation.category === 'practical' ? 'مشروع عملي' : 'محادثة زميل'}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">{activeConversation.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeConversation.otherUserId && (
                        <Link href={`/peers/${activeConversation.otherUserId}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-brand-orange">
                            عرض الملف الشخصي
                          </Button>
                        </Link>
                      )}
                      {activeConversation.projectId && (
                        <Link href={`/practical/${activeConversation.projectId}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-brand-orange">
                            مساحة المشروع
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gray-50/40">
                    {loadingMsgs && messages.length === 0 ? (
                      <div className="py-20 text-center">
                        <div className="w-8 h-8 border-3 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-text-muted">جاري تحميل الرسائل...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-20 text-center text-xs text-text-muted max-w-sm mx-auto">
                        <p className="text-3xl mb-2">👋</p>
                        <p className="font-bold text-sm text-text-primary mb-1">بداية المحادثة الأكاديمية</p>
                        <p>ابدأ بالترحيب بزميلك وناقش معه أفكار المشاريع والتعاون الدراسي المشترك.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn('flex flex-col', msg.isMe ? 'items-end' : 'items-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-xs text-xs md:text-sm leading-relaxed space-y-2',
                              msg.isMe
                                ? 'bg-brand-navy text-white rounded-ee-none'
                                : 'bg-white text-text-body border border-gray-100 rounded-es-none'
                            )}
                          >
                            {!msg.isMe && (
                              <p className="text-[10px] font-bold text-brand-orange mb-0.5">{msg.sender}</p>
                            )}

                            {/* Main Message Text */}
                            {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                            {/* Embedded Shared Post Preview in Chat */}
                            {msg.sharedPost && (
                              <div
                                className={cn(
                                  'border rounded-xl p-3 text-xs space-y-1.5 transition-all mt-1',
                                  msg.isMe
                                    ? 'border-white/20 bg-white/10 text-white'
                                    : 'border-orange-200 bg-orange-50/40 text-text-body'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Avatar
                                      src={msg.sharedPost.authorAvatar}
                                      avatarType={msg.sharedPost.authorAvatarType}
                                      name={msg.sharedPost.author}
                                      size="xs"
                                    />
                                    <span className="font-bold truncate text-[11px]">{msg.sharedPost.author}</span>
                                  </div>
                                  <Link
                                    href={`/community#post-${msg.sharedPost.id}`}
                                    className="text-[10px] font-bold underline flex items-center gap-0.5 text-brand-orange hover:text-orange-400 flex-shrink-0"
                                    target="_blank"
                                  >
                                    <span>فتح في المجتمع</span>
                                    <ExternalLink size={10} />
                                  </Link>
                                </div>

                                <p className="line-clamp-2 text-[11px] leading-relaxed">
                                  {msg.sharedPost.content}
                                </p>

                                {msg.sharedPost.mediaType === 'image' && msg.sharedPost.mediaUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={msg.sharedPost.mediaUrl}
                                    alt="Shared Preview"
                                    className="w-full h-24 object-cover rounded-lg mt-1"
                                  />
                                )}
                              </div>
                            )}

                            <span
                              className={cn(
                                'block text-[9px] text-end mt-1',
                                msg.isMe ? 'text-white/60' : 'text-gray-400'
                              )}
                              title={msg.exactDate}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <div className="p-3 md:p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      placeholder="اكتب رسالتك الأكاديمية هنا..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-full px-4 py-2.5 font-bold flex items-center gap-1.5"
                      onClick={handleSendMessage}
                      isLoading={sending}
                      disabled={!newMessage.trim()}
                    >
                      <span>إرسال</span>
                      <Send size={14} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-3">
                    <MessageSquare size={28} className="text-gray-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-text-primary mb-1">اختر محادثة للبدء</h3>
                  <p className="text-xs max-w-sm leading-relaxed mb-4">
                    اختر زميلاً أو مساحة مشروع عملي من القائمة الجانبية لبدء المراسلة الفورية ومشاركة المنشورات.
                  </p>
                  <Link href="/peers">
                    <Button variant="primary" size="sm" className="rounded-xl font-bold">
                      <Users size={14} className="me-1" /> تواصل مع زملاء جدد
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="min-h-screen bg-bg-cream flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        </AppLayout>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
