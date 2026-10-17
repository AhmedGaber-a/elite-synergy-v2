// src/app/community/page.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, MessageCircle, Plus, FileText, Send,
  Image as ImageIcon, X, Film, Upload, Smile, Sparkles, AlertCircle, Users,
  Share2, Pencil, CheckCircle2, Download, Trash2, CornerDownRight, Check
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export interface CommentReactionItem {
  id?: string;
  type: string;
  userId: string;
  userName?: string;
}

export interface PostCommentReplyItem {
  id: string;
  authorId?: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'male' | 'female';
  text: string;
  textAr?: string | null;
  timeAgo?: string;
  timeAgoAr?: string;
  exactDate?: string;
  createdAt?: string;
  reactions?: CommentReactionItem[];
}

export interface PostCommentItem {
  id: string;
  authorId?: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'male' | 'female';
  text: string;
  textAr?: string | null;
  timeAgo?: string;
  timeAgoAr?: string;
  exactDate?: string;
  createdAt?: string;
  reactions?: CommentReactionItem[];
  replies?: PostCommentReplyItem[];
}

export interface PostItem {
  id: string;
  authorId?: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'male' | 'female';
  authorDetails?: {
    id: string;
    name: string;
    fullName?: string;
    avatar?: string;
    avatarType?: 'male' | 'female';
    college?: string;
    specialty?: string;
  };
  role?: string;
  content: string;
  contentAr?: string | null;
  mediaType?: 'image' | 'video' | 'file' | null;
  mediaUrl?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  sharedPostId?: string | null;
  sharedPost?: {
    id: string;
    authorId?: string;
    author: string;
    authorAvatar?: string;
    authorAvatarType?: 'male' | 'female';
    role?: string;
    content: string;
    mediaType?: 'image' | 'video' | 'file' | null;
    mediaUrl?: string | null;
    fileName?: string | null;
    fileUrl?: string | null;
    timeAgo?: string;
    timeAgoAr?: string;
    exactDate?: string;
    createdAt?: string;
  } | null;
  likes: string[];
  comments: PostCommentItem[];
  timeAgo: string;
  timeAgoAr?: string;
  exactDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({
  onClose,
  onPostCreated,
}: {
  onClose: () => void;
  onPostCreated: (post: PostItem) => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'video' | 'file'>('text');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Strict 4MB payload limit to prevent Vercel 413 / timeout
    if (f.size > 4 * 1024 * 1024) {
      setError('حجم الملف يتجاوز الحد الأقصى 4 ميجابايت لتجنب بطء الرفع (File exceeds 4MB limit)');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setError('');
    setFileName(f.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!text.trim() && !filePreview) return;
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/community', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          content: text.trim(),
          mediaType: activeTab === 'photo' ? 'image' : activeTab === 'video' ? 'video' : activeTab === 'file' ? 'file' : null,
          mediaUrl: filePreview,
          fileName: fileName || null,
          fileUrl: activeTab === 'file' ? filePreview : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل نشر المنشور');
        return;
      }

      setText('');
      setFilePreview(null);
      setFileName('');
      setActiveTab('text');
      if (fileRef.current) {
        fileRef.current.value = '';
      }

      onPostCreated(data);
      onClose();
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'photo' as const, icon: <ImageIcon size={18} />, label: t('community.addPhoto'), color: 'text-green-600 hover:bg-green-50' },
    { id: 'video' as const, icon: <Film size={18} />, label: t('community.addVideo'), color: 'text-red-500 hover:bg-red-50' },
    { id: 'file' as const, icon: <FileText size={18} />, label: t('community.addFile'), color: 'text-blue-600 hover:bg-blue-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-lg font-extrabold text-text-primary">
            {t('community.sharePost')}
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* User Preview */}
          {user && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={user.name} avatarType={user.avatarType} src={user.avatar || user.avatarUrl || ''} size="md" />
              <div>
                <p className="font-bold text-sm text-text-primary">{user.fullName || user.name}</p>
                <p className="text-xs text-text-muted">{user.college || 'Student'}</p>
              </div>
            </div>
          )}

          {/* Text Area */}
          <textarea
            autoFocus
            rows={4}
            className="w-full text-sm md:text-base resize-none border-0 outline-none placeholder-gray-400 bg-transparent leading-relaxed mb-2"
            placeholder={t('community.writePost')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* File upload area */}
          {activeTab !== 'text' && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-orange hover:bg-orange-50/30 transition-all mb-3 relative group"
              onClick={() => fileRef.current?.click()}
            >
              {filePreview ? (
                <div className="relative">
                  {activeTab === 'photo' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={filePreview} alt="Preview" className="max-h-[240px] w-full object-contain mx-auto rounded-xl" />
                  )}
                  {activeTab === 'video' && (
                    <video controls src={filePreview} className="max-h-[240px] w-full object-contain mx-auto rounded-xl bg-black" />
                  )}
                  {activeTab === 'file' && (
                    <div className="flex items-center justify-center gap-3 py-4 text-brand-navy">
                      <FileText size={32} className="text-brand-orange" />
                      <div className="text-start">
                        <p className="text-xs font-bold truncate max-w-xs">{fileName || 'Attached Document'}</p>
                        <span className="text-[10px] text-gray-500">جاهز للمشاركة</span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilePreview(null);
                      setFileName('');
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="absolute -top-2 -end-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={28} />
                  <p className="text-sm font-medium">
                    {activeTab === 'photo' ? 'اضغط لرفع صورة من جهازك' : activeTab === 'video' ? 'اضغط لرفع مقطع فيديو' : 'اضغط لاختيار ملف (PDF, Word, Code)'}
                  </p>
                  <p className="text-xs text-text-muted">الحد الأقصى المسموح 4 ميجابايت</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={activeTab === 'photo' ? 'image/*' : activeTab === 'video' ? 'video/*' : '.pdf,.doc,.docx,.pptx,.xlsx,.zip'}
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex gap-1 mb-2 border border-gray-100 rounded-2xl p-1 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
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
        <div className="px-5 py-4 flex items-center gap-3 border-t border-gray-100 shrink-0 bg-white">
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-full px-6 font-bold"
            onClick={submit}
            isLoading={loading}
            disabled={!text.trim() && !filePreview}
          >
            {t('common.post')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────────────────────
function EditPostModal({
  post,
  onClose,
  onPostUpdated,
}: {
  post: PostItem;
  onClose: () => void;
  onPostUpdated: (updatedPost: PostItem) => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState(post.content || '');
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'video' | 'file'>(
    post.mediaType === 'image' ? 'photo' : post.mediaType === 'video' ? 'video' : post.mediaType === 'file' ? 'file' : 'text'
  );
  const [filePreview, setFilePreview] = useState<string | null>(post.mediaUrl || post.fileUrl || null);
  const [fileName, setFileName] = useState<string>(post.fileName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      setError('حجم الملف يتجاوز الحد الأقصى 4 ميجابايت لتجنب بطء الرفع (File exceeds 4MB limit)');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setError('');
    setFileName(f.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const submitEdit = async () => {
    if (!text.trim() && !filePreview) return;
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/community/${post.id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          content: text.trim(),
          mediaType: activeTab === 'photo' ? 'image' : activeTab === 'video' ? 'video' : activeTab === 'file' ? 'file' : null,
          mediaUrl: filePreview,
          fileName: fileName || null,
          fileUrl: activeTab === 'file' ? filePreview : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل حفظ التعديلات');
        return;
      }

      onPostUpdated(data);
      onClose();
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'photo' as const, icon: <ImageIcon size={18} />, label: t('community.addPhoto'), color: 'text-green-600 hover:bg-green-50' },
    { id: 'video' as const, icon: <Film size={18} />, label: t('community.addVideo'), color: 'text-red-500 hover:bg-red-50' },
    { id: 'file' as const, icon: <FileText size={18} />, label: t('community.addFile'), color: 'text-blue-600 hover:bg-blue-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <Pencil size={18} className="text-brand-orange" /> تعديل المنشور
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <textarea
            autoFocus
            rows={4}
            className="w-full text-sm md:text-base resize-none border-0 outline-none placeholder-gray-400 bg-transparent leading-relaxed mb-2"
            placeholder={t('community.writePost')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {activeTab !== 'text' && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-orange hover:bg-orange-50/30 transition-all mb-3 relative group"
              onClick={() => fileRef.current?.click()}
            >
              {filePreview ? (
                <div className="relative">
                  {activeTab === 'photo' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={filePreview} alt="Preview" className="max-h-[240px] w-full object-contain mx-auto rounded-xl" />
                  )}
                  {activeTab === 'video' && (
                    <video controls src={filePreview} className="max-h-[240px] w-full object-contain mx-auto rounded-xl bg-black" />
                  )}
                  {activeTab === 'file' && (
                    <div className="flex items-center justify-center gap-3 py-4 text-brand-navy">
                      <FileText size={32} className="text-brand-orange" />
                      <div className="text-start">
                        <p className="text-xs font-bold truncate max-w-xs">{fileName || 'Attached Document'}</p>
                        <span className="text-[10px] text-gray-500">جاهز للتعديل</span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilePreview(null);
                      setFileName('');
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="absolute -top-2 -end-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={28} />
                  <p className="text-sm font-medium">اضغط لتغيير أو رفع مرفق جديد</p>
                  <p className="text-xs text-text-muted">الحد الأقصى المسموح 4 ميجابايت</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={activeTab === 'photo' ? 'image/*' : activeTab === 'video' ? 'video/*' : '.pdf,.doc,.docx,.pptx,.xlsx,.zip'}
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          <div className="flex gap-1 mb-2 border border-gray-100 rounded-2xl p-1 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
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

        <div className="px-5 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0 bg-white">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-full px-6 font-bold"
            onClick={submitEdit}
            isLoading={loading}
            disabled={!text.trim() && !filePreview}
          >
            حفظ التعديلات
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Share Post Modal (Internal Post Sharing) ─────────────────────────────────
function SharePostModal({
  post,
  onClose,
  onPostShared,
  onShowToast,
}: {
  post: PostItem;
  onClose: () => void;
  onPostShared: (newPost: PostItem) => void;
  onShowToast: (msg: string) => void;
}) {
  const [shareDestination, setShareDestination] = useState<'community' | 'chat'>('community');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Array<{ id: string; name: string; role?: string; avatar?: string }>>([]);
  const [selectedConvId, setSelectedConvId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          if (data.conversations?.length > 0) {
            setSelectedConvId(data.conversations[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    }
    loadConversations();
  }, []);

  const handleShareToCommunity = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: caption.trim(),
          sharedPostId: post.id,
        }),
      });

      if (res.ok) {
        const newPost = await res.json();
        onPostShared(newPost);
        onShowToast('تمت مشاركة المنشور في المجتمع بنجاح!');
        onClose();
      }
    } catch {
      onShowToast('حدث خطأ أثناء المشاركة');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToChat = async () => {
    if (!selectedConvId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          text: caption.trim() || 'شارك معك هذا المنشور من المجتمع',
          sharedPostId: post.id,
        }),
      });

      if (res.ok) {
        onShowToast('تم إرسال المنشور في المحادثة بنجاح!');
        onClose();
      }
    } catch {
      onShowToast('حدث خطأ أثناء إرسال المنشور');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/community#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      onShowToast('تم نسخ رابط المنشور');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-brand-orange" />
            <h2 className="text-lg font-extrabold text-text-primary">مشاركة المنشور</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Destination tabs */}
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setShareDestination('community')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                shareDestination === 'community'
                  ? 'bg-white text-brand-orange shadow-sm ring-1 ring-orange-200'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              إعادة النشر في المجتمع
            </button>
            <button
              type="button"
              onClick={() => setShareDestination('chat')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                shareDestination === 'chat'
                  ? 'bg-white text-brand-orange shadow-sm ring-1 ring-orange-200'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              إرسال في محادثة خاصة / فريق
            </button>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              {shareDestination === 'community' ? 'أضف تعليقك على المنشور (اختياري)' : 'رسالة مرافقة (اختياري)'}
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="اكتب أفكارك أو ملاحظاتك هنا..."
              className="w-full text-xs md:text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50 outline-none"
            />
          </div>

          {/* Select Conversation when sending to Chat */}
          {shareDestination === 'chat' && (
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">اختر الزميل أو المحادثة المستهدفة</label>
              {conversations.length === 0 ? (
                <p className="text-xs text-text-muted bg-gray-50 p-3 rounded-xl border border-gray-100">
                  لا توجد محادثات نشطة حالياً. يمكنك تواصل مع الزملاء عبر قسم Peers أولاً.
                </p>
              ) : (
                <select
                  value={selectedConvId}
                  onChange={(e) => setSelectedConvId(e.target.value)}
                  className="w-full text-xs md:text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50 outline-none"
                >
                  {conversations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.role ? `(${c.role})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Post Preview Box */}
          <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/60 text-xs">
            <p className="text-[10px] font-bold text-text-muted uppercase mb-1.5">معاينة المنشور الأصلي</p>
            <div className="flex items-center gap-2 mb-2">
              <Avatar src={post.authorAvatar} avatarType={post.authorAvatarType} name={post.author} size="xs" />
              <div>
                <p className="font-bold text-text-primary">{post.author}</p>
                <p className="text-[10px] text-text-muted">{post.role || post.timeAgoAr}</p>
              </div>
            </div>
            <p className="text-text-body line-clamp-3 leading-relaxed mb-2">{post.content}</p>
            {post.mediaUrl && post.mediaType === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mediaUrl} alt="Thumbnail" className="w-full h-24 object-cover rounded-xl" />
            )}
          </div>

          {/* Quick Copy Link Option */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
            <button
              type="button"
              onClick={copyLink}
              className="text-brand-orange hover:underline font-bold flex items-center gap-1.5"
            >
              {copiedLink ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط المنشور المباشر'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0 bg-white">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-full px-6 font-bold"
            onClick={shareDestination === 'community' ? handleShareToCommunity : handleSendToChat}
            isLoading={loading}
            disabled={shareDestination === 'chat' && !selectedConvId}
          >
            {shareDestination === 'community' ? 'مشاركة الآن في المجتمع' : 'إرسال في المحادثة'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({
  post,
  currentUser,
  onEdit,
  onDelete,
  onShare,
  onShowToast,
}: {
  post: PostItem;
  currentUser: { id?: string; name: string; avatar?: string | null; avatarUrl?: string | null; avatarType?: 'male' | 'female' | string } | null;
  onEdit: (post: PostItem) => void;
  onDelete: (postId: string) => void;
  onShare: (post: PostItem) => void;
  onShowToast: (msg: string) => void;
}) {
  const { t } = useLanguage();
  const [liked, setLiked] = useState(
    currentUser ? post.likes.includes(currentUser.name) : false
  );
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComment, setShowComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<PostCommentItem[]>(post.comments || []);
  const [commenting, setCommenting] = useState(false);

  // Nested reply state for specific comment
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Sync comments if post prop changes
  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const isAuthor = Boolean(
    currentUser &&
    (
      (currentUser.id && post.authorId && post.authorId === currentUser.id) ||
      (currentUser.id && post.authorDetails?.id && post.authorDetails.id === currentUser.id) ||
      post.author === currentUser.name
    )
  );

  const toggleLike = async () => {
    if (!currentUser) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/community/posts/${post.id}/like`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.count);
        setLiked(data.liked);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور؟ سيتم الحذف نهائياً.')) return;
    onDelete(post.id); // optimistic removal
    onShowToast('تم حذف المنشور');

    try {
      await fetch(`/api/community/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    const commentText = newComment.trim();
    setNewComment('');
    setCommenting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ text: commentText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [...prev, data.comment]);
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  const submitReply = async (commentId: string) => {
    if (!replyText.trim() || !currentUser) return;
    const textToSubmit = replyText.trim();
    setReplyText('');
    setSubmittingReply(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          text: textToSubmit,
          parentId: commentId,
          commentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: [...(c.replies || []), data.reply],
                  }
                : c
            )
          );
          setReplyingToCommentId(null);
          onShowToast('تمت إضافة الرد بنجاح');
        }
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReactToComment = async (commentId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/community/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: emoji }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                reactions: data.reactions || [],
              };
            }
            // Check if it's a nested reply
            if (c.replies && c.replies.some((r) => r.id === commentId)) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, reactions: data.reactions || [] } : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to react to comment:', err);
    }
  };

  const postTimes = formatArabicTimeAgo(post.createdAt);

  return (
    <div id={`post-${post.id}`} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 mb-6 transition-all hover:border-gray-200">
      {/* Post Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.authorAvatar}
            avatarType={post.authorAvatarType}
            name={post.author}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-base text-text-primary truncate">{post.author}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
              <span>{post.role || 'طالب في المنصة'}</span>
              <span>·</span>
              <span title={postTimes.exact} className="text-brand-orange font-medium">
                {postTimes.relative}
              </span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(post)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-200"
              title="تعديل المنشور"
            >
              <Pencil size={13} />
              <span>تعديل</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
              title="حذف المنشور"
            >
              <Trash2 size={13} />
              <span>حذف</span>
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-sm md:text-base text-text-body mb-4 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Embedded Shared Post (Internal Sharing) */}
      {post.sharedPost && (
        <div className="border border-orange-200/80 bg-orange-50/20 rounded-2xl p-4 mb-4 relative hover:border-brand-orange transition-all">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar
              src={post.sharedPost.authorAvatar}
              avatarType={post.sharedPost.authorAvatarType}
              name={post.sharedPost.author}
              size="sm"
            />
            <div className="min-w-0">
              <p className="font-bold text-xs text-text-primary">{post.sharedPost.author}</p>
              <p className="text-[10px] text-text-muted">
                {post.sharedPost.role} · {post.sharedPost.timeAgoAr || 'منذ فترة'}
              </p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-text-body mb-3 leading-relaxed">
            {post.sharedPost.content}
          </p>

          {post.sharedPost.mediaType === 'image' && post.sharedPost.mediaUrl && (
            <div className="w-full max-h-72 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.sharedPost.mediaUrl} alt="Shared Attachment" className="w-full h-auto max-h-72 object-contain rounded-xl" />
            </div>
          )}

          {post.sharedPost.mediaType === 'video' && post.sharedPost.mediaUrl && (
            <div className="w-full max-h-72 bg-black rounded-xl overflow-hidden relative border border-gray-800 flex items-center justify-center">
              <video controls src={post.sharedPost.mediaUrl} className="w-full max-h-72 object-contain rounded-xl" />
            </div>
          )}
        </div>
      )}

      {/* Media: Image */}
      {post.mediaType === 'image' && post.mediaUrl && (
        <div className="w-full max-h-96 bg-gray-50 rounded-2xl mb-4 overflow-hidden relative border border-gray-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.mediaUrl} alt="Post Attachment" className="w-full h-auto max-h-96 object-contain rounded-2xl" />
        </div>
      )}

      {/* Media: Video */}
      {post.mediaType === 'video' && post.mediaUrl && (
        <div className="w-full max-h-96 bg-black rounded-2xl mb-4 overflow-hidden relative border border-gray-800 flex items-center justify-center">
          <video controls src={post.mediaUrl} className="w-full max-h-96 object-contain rounded-2xl" />
        </div>
      )}

      {/* Media: File Attachment */}
      {(post.fileUrl || (post.mediaType === 'file' && post.mediaUrl)) && (
        <a
          href={post.fileUrl || post.mediaUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          download={post.fileName || 'document'}
          className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-orange-50/60 rounded-2xl border border-gray-200 hover:border-brand-orange/40 mb-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">{post.fileName || 'ملف مرفق (Attachment)'}</p>
            <span className="text-[10px] text-text-muted">اضغط للتحميل أو المعاينة</span>
          </div>
          <Download size={16} className="text-gray-400 group-hover:text-brand-orange transition-colors" />
        </a>
      )}

      {/* Actions Row */}
      <div className="flex items-center gap-6 text-sm font-medium text-text-muted py-3 border-y border-gray-50 mb-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-brand-orange font-bold' : 'hover:text-brand-orange'}`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-brand-orange' : ''} />
          <span>{likesCount} {t('community.likes')}</span>
        </button>

        <button
          onClick={() => setShowComment((s) => !s)}
          className="flex items-center gap-1.5 hover:text-brand-orange transition-colors"
        >
          <MessageCircle size={18} />
          <span>{comments.length} {t('community.comments')}</span>
        </button>

        <button
          onClick={() => onShare(post)}
          className="flex items-center gap-1.5 hover:text-brand-orange transition-colors ms-auto font-semibold"
          title="مشاركة المنشور داخلياً"
        >
          <Share2 size={18} />
          <span>مشاركة</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComment && (
        <div className="pt-2">
          {comments.length > 0 && (
            <div className="space-y-4 mb-4">
              {comments.map((c) => {
                const commentTimes = formatArabicTimeAgo(c.createdAt);
                const reactionsList = c.reactions || [];

                return (
                  <div key={c.id} className="space-y-2">
                    {/* Top Level Comment */}
                    <div className="flex items-start gap-3 group">
                      <Avatar src={c.authorAvatar} avatarType={c.authorAvatarType} name={c.author} size="sm" className="mt-1" />
                      <div className="flex-1 bg-gray-50 rounded-2xl rounded-ss-none px-4 py-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-xs text-text-primary">{c.author}</p>
                          <span className="text-[10px] text-text-muted" title={commentTimes.exact}>
                            {commentTimes.relative}
                          </span>
                        </div>
                        <p className="text-sm text-text-body leading-relaxed mb-2">{c.text}</p>

                        {/* Reaction and Reply Action Bar */}
                        <div className="flex items-center gap-3 pt-1 border-t border-gray-100/70 text-xs text-text-muted flex-wrap">
                          {/* Reaction Emojis Picker */}
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {['👍', '❤️', '🔥', '👏'].map((emoji) => {
                              const count = reactionsList.filter((r) => r.type === emoji).length;
                              const userReacted = currentUser && reactionsList.some((r) => r.type === emoji && r.userId === currentUser.id);

                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactToComment(c.id, emoji)}
                                  className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[11px] hover:scale-125 transition-transform ${
                                    userReacted ? 'bg-orange-100 rounded-full' : ''
                                  }`}
                                  title={`تفاعل بـ ${emoji}`}
                                >
                                  <span>{emoji}</span>
                                  {count > 0 && <span className="text-[10px] font-bold text-text-primary">{count}</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* Reply Button */}
                          <button
                            onClick={() => {
                              setReplyingToCommentId((cur) => (cur === c.id ? null : c.id));
                              setReplyText('');
                            }}
                            className="hover:text-brand-orange font-semibold text-[11px] flex items-center gap-1"
                          >
                            <CornerDownRight size={12} />
                            <span>رد</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Nested Replies List */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ms-10 space-y-2 border-s-2 border-orange-200 ps-3 pt-1">
                        {c.replies.map((reply) => {
                          const replyTimes = formatArabicTimeAgo(reply.createdAt);
                          const replyReactions = reply.reactions || [];

                          return (
                            <div key={reply.id} className="flex items-start gap-2.5">
                              <Avatar src={reply.authorAvatar} avatarType={reply.authorAvatarType} name={reply.author} size="xs" className="mt-1" />
                              <div className="flex-1 bg-white rounded-2xl rounded-ss-none px-3.5 py-2.5 border border-gray-100 shadow-xs">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="font-bold text-xs text-text-primary">{reply.author}</p>
                                  <span className="text-[10px] text-text-muted" title={replyTimes.exact}>
                                    {replyTimes.relative}
                                  </span>
                                </div>
                                <p className="text-xs text-text-body leading-relaxed mb-1.5">{reply.text}</p>

                                {/* Reply Reactions */}
                                <div className="flex items-center gap-1">
                                  {['👍', '❤️', '🔥'].map((emoji) => {
                                    const count = replyReactions.filter((r) => r.type === emoji).length;
                                    const userReacted = currentUser && replyReactions.some((r) => r.type === emoji && r.userId === currentUser.id);

                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReactToComment(reply.id, emoji)}
                                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] hover:scale-110 transition-transform ${
                                          userReacted ? 'bg-orange-100 rounded-full' : ''
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        {count > 0 && <span className="font-bold text-text-primary">{count}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Reply Input */}
                    {replyingToCommentId === c.id && currentUser && (
                      <div className="ms-10 flex items-center gap-2 pt-1 animate-in fade-in">
                        <Avatar name={currentUser.name} avatarType={currentUser.avatarType} src={currentUser.avatar || currentUser.avatarUrl || ''} size="xs" />
                        <div className="flex-1 relative">
                          <input
                            autoFocus
                            className="w-full text-xs border border-gray-200 rounded-full ps-3.5 pe-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
                            placeholder={`اكتب رداً على ${c.author}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitReply(c.id)}
                          />
                          <button
                            onClick={() => submitReply(c.id)}
                            disabled={!replyText.trim() || submittingReply}
                            className="absolute end-1.5 top-1/2 -translate-y-1/2 text-brand-orange p-1 hover:bg-orange-50 rounded-full transition-colors disabled:opacity-40"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => setReplyingToCommentId(null)}
                          className="text-gray-400 hover:text-gray-600 text-xs px-2"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Top-level Comment */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} avatarType={currentUser.avatarType} src={currentUser.avatar || currentUser.avatarUrl || ''} size="sm" />
              <div className="flex-1 relative">
                <input
                  className="w-full text-sm border border-gray-200 rounded-full ps-4 pe-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50"
                  placeholder={t('community.writeComment')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || commenting}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-brand-orange p-1.5 hover:bg-orange-100 rounded-full transition-colors disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Community Page ─────────────────────────────────────────────────────
export default function CommunityPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [sharingPost, setSharingPost] = useState<PostItem | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2500);
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/community', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    showToast('تم نشر منشورك بنجاح!');
  };

  const handlePostUpdated = (updatedPost: PostItem) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    showToast('تم حفظ التعديلات بنجاح');
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <AppLayout>
      {modalOpen && (
        <CreatePostModal
          onClose={() => setModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {sharingPost && (
        <SharePostModal
          post={sharingPost}
          onClose={() => setSharingPost(null)}
          onPostShared={handlePostCreated}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-brand-navy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border border-white/10 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={18} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-bg-cream min-h-screen pb-12">
        <div className="section-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {isAuthenticated && user ? (
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
                    <Avatar
                      name={user.name}
                      avatarType={user.avatarType}
                      src={user.avatar || user.avatarUrl || ''}
                      size="lg"
                      className="mx-auto mb-3"
                    />
                    <h3 className="font-extrabold text-text-primary text-base">{user.fullName || user.name}</h3>
                    <p className="text-xs text-brand-orange font-semibold mt-0.5">{user.college}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{user.specialty}</p>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around text-center">
                      <div>
                        <span className="block font-black text-sm text-text-primary">{user.points || 0}</span>
                        <span className="text-[10px] text-text-muted uppercase font-bold">Points</span>
                      </div>
                      <div className="h-8 w-px bg-gray-100" />
                      <div>
                        <span className="block font-black text-sm text-text-primary">{user.skills?.length || 0}</span>
                        <span className="text-[10px] text-text-muted uppercase font-bold">Skills</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
                    <div className="w-12 h-12 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users size={22} />
                    </div>
                    <h4 className="font-extrabold text-sm text-text-primary mb-1">Student Community</h4>
                    <p className="text-xs text-text-muted mb-4">Join conversations and connect with fellow academic peers.</p>
                    <Link href="/auth/login">
                      <Button variant="primary" size="sm" fullWidth className="rounded-xl font-bold">
                        Sign In to Post
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-text-primary mb-3 text-sm px-2">Academic Hubs</h3>
                  <div className="space-y-1.5">
                    <Link href="/peers" className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-body hover:bg-orange-50 hover:text-brand-orange transition-colors">
                      <span>Verified Peers Directory</span>
                      <span>→</span>
                    </Link>
                    <Link href="/practical" className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-body hover:bg-orange-50 hover:text-brand-orange transition-colors">
                      <span>Practical Projects</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
              {/* Composer Box (Only when authenticated) */}
              {isAuthenticated && user && (
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar name={user.name} avatarType={user.avatarType} src={user.avatar || user.avatarUrl || ''} size="md" />
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
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <ImageIcon size={18} /> {t('community.addPhoto')}
                    </button>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Film size={18} /> {t('community.addVideo')}
                    </button>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <FileText size={18} /> {t('community.addFile')}
                    </button>
                  </div>
                </div>
              )}

              {/* Feed Content */}
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-text-muted">Loading community discussions...</p>
                </div>
              ) : !isAuthenticated ? (
                /* Unauthenticated View */
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🔒
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary mb-2">
                    مجتمع طلابي أكاديمي مغلق
                  </h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto mb-6 leading-relaxed">
                    محتوى هذا المجتمع مخصص لطلاب الكلية المسجلين والمفعلين رسمياً. يرجى تسجيل الدخول بحسابك الجامعي لعرض المنشورات والتفاعل مع زملائك.
                  </p>
                  <Link href="/auth/login">
                    <Button variant="primary" size="md" className="rounded-xl px-6 font-bold">
                      تسجيل الدخول الآن
                    </Button>
                  </Link>
                </div>
              ) : posts.length === 0 ? (
                /* Clean 0 Posts Empty State */
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    💬
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary mb-2">
                    لا توجد منشورات في المجتمع حالياً (0 Posts)
                  </h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto mb-6 leading-relaxed">
                    كن أول من يشارك أفكاره الأكاديمية أو يطرح استفساراته لزملائه في مختلف التخصصات!
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-xl px-6 font-bold"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={16} className="me-1.5" /> إنشاء أول منشور الآن
                  </Button>
                </div>
              ) : (
                <div>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={user}
                      onEdit={(p) => setEditingPost(p)}
                      onDelete={handlePostDeleted}
                      onShare={(p) => setSharingPost(p)}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-brand-orange" />
                    <h3 className="font-bold text-text-primary text-sm">Academic Guidelines</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Share helpful academic resources, project milestones, and collaborate constructively across disciplines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
