// src/app/practical/[projectId]/page.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight, Users, User, Clock, BookOpen, Shield,
  CheckCircle2, FileText, Send, Upload, Plus, Download,
  MessageCircle, Paperclip, AlertCircle, X, ChevronDown, ChevronUp,
  FolderGit2, Sparkles, Check
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

interface ProjectDetails {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'TEAM' | 'SOLO';
  source?: 'INTERNAL' | 'ERP' | string;
  erpReferenceId?: string;
  professorName?: string;
  courseCode?: string;
  deadline?: string;
  attachments?: string[];
  maxTeamSize?: number;
  maxTeams: number;
  teamsCount: number;
  availableTeamsCount: number;
  domain: string;
  forStudents?: string;
  level: number;
  doctor?: string;
  score: number;
  completionTime: string;
  maxSlots: number;
  isMega: boolean;
  phases: string[];
  companyBackground?: string;
  businessProblem?: string;
  relevantData: string[];
  tasksToSolve: string[];
  expectedDeliverables: string[];
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

function formatDeadlineCountdown(deadlineStr?: string | null): {
  text: string;
  isExpired: boolean;
  days: number;
  hours: number;
} | null {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr).getTime();
  if (isNaN(deadline)) return null;
  const now = Date.now();
  const diff = deadline - now;
  if (diff <= 0) {
    return { text: 'انتهى موعد التسليم', isExpired: true, days: 0, hours: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) {
    return { text: `متبقي ${days} يوم و ${hours} ساعة`, isExpired: false, days, hours };
  }
  return { text: `متبقي ${hours} ساعة و ${minutes} دقيقة`, isExpired: false, days, hours };
}

interface TeamMemberItem {
  userId: string;
  name: string;
  fullName: string;
  role: string;
  domain: string;
  online: boolean;
  avatar: string;
  avatarType?: 'male' | 'female' | 'hijab' | 'niqab';
}

interface TeamMessageItem {
  id: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'male' | 'female' | 'hijab' | 'niqab';
  text: string;
  time: string;
  isMe: boolean;
}

interface TeamFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string | null;
  uploadedBy: string;
  time: string;
  isMe?: boolean;
}

interface TeamDetails {
  id: string;
  dbId: string;
  slug?: string;
  name: string;
  emoji: string;
  slots: number;
  maxSlots: number;
  level: string;
  goal?: string;
  isLead?: boolean;
  members: TeamMemberItem[];
  messages: TeamMessageItem[];
  files: TeamFileItem[];
}

interface SoloSubmissionItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ─── Create Team Modal (Specifically for this TEAM Project) ───────────────────
function CreateTeamModal({
  projectId,
  projectTitle,
  onClose,
  onTeamCreated,
}: {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onTeamCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🚀');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الفريق');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emoji,
          goal: goal.trim(),
          projectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل إنشاء الفريق');
        return;
      }

      onTeamCreated();
      onClose();
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const EMOJIS = ['🚀', '⚡', '🔥', '💡', '🛡️', '🌟', '🤖', '🎯'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-brand-navy to-brand-blue px-6 py-5 flex items-center justify-between text-white">
          <div>
            <h3 className="font-extrabold text-base">إنشاء فريق للمشروع</h3>
            <p className="text-xs text-white/70 truncate max-w-xs">{projectTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 text-white/60 hover:text-white rounded-full">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">أيقونة الفريق</label>
            <div className="flex gap-2">
              {EMOJIS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    emoji === em ? 'border-brand-orange bg-orange-50 scale-110 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              اسم الفريق <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: رواد التقنية (Team Alpha)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-brand-orange outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">هدف الفريق وخطة العمل</label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="اكتب نبذة عن أهداف الفريق وتوزيع المهام..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:ring-2 focus:ring-brand-orange outline-none resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button variant="ghost" fullWidth type="button" onClick={onClose} className="rounded-xl">
              إلغاء
            </Button>
            <Button variant="primary" fullWidth type="submit" isLoading={loading} className="rounded-xl font-bold">
              تأسيس الفريق وحجز الشاغر
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Project Page Component ──────────────────────────────────────────────
export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const { user, isAuthenticated } = useAuth();
  const { lang } = useLanguage();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeam, setMyTeam] = useState<TeamDetails | null>(null);
  const [mySubmissions, setMySubmissions] = useState<SoloSubmissionItem[]>([]);
  const [availableTeamsCount, setAvailableTeamsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tabs for Team Workspace
  const [teamTab, setTeamTab] = useState<'overview' | 'chat' | 'files' | 'members'>('overview');

  // Modals & form state
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingTeamFile, setUploadingTeamFile] = useState(false);
  const [submittingSolo, setSubmittingSolo] = useState(false);
  const [soloNote, setSoloNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const teamFileInputRef = useRef<HTMLInputElement>(null);
  const soloFileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setTeams(data.teams || []);
        setMyTeam(data.myTeam || null);
        setMySubmissions(data.mySubmissions || []);
        setAvailableTeamsCount(data.project?.availableTeamsCount ?? 0);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    if (teamTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [myTeam?.messages, teamTab]);

  // Join an existing team under this project
  const handleJoinTeam = async (teamId: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/practical/${projectId}`);
      return;
    }

    setJoiningTeamId(teamId);
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, role: 'Software Engineer', domain: 'Engineering' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || 'فشل الانضمام للفريق');
        return;
      }

      setStatusMessage('تم الانضمام للفريق بنجاح والدخول لمساحة العمل!');
      await loadProjectData();
      setTeamTab('chat');
    } catch {
      setStatusMessage('حدث خطأ أثناء الانضمام للفريق');
    } finally {
      setJoiningTeamId(null);
    }
  };

  // Send team message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !myTeam) return;

    const text = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    try {
      const res = await fetch(`/api/teams/${myTeam.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMyTeam((prev) =>
            prev ? { ...prev, messages: [...prev.messages, data.message] } : prev
          );
        }
      }
    } catch (err) {
      console.error('Failed to send team message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Upload team deliverable file (TeamFile)
  const handleUploadTeamFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !myTeam) return;

    setUploadingTeamFile(true);
    const sizeStr = `${(f.size / 1024).toFixed(0)} KB`;
    const ext = f.name.split('.').pop() || 'doc';

    try {
      const res = await fetch(`/api/teams/${myTeam.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'file',
          fileName: f.name,
          fileSize: sizeStr,
          fileType: ext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          setMyTeam((prev) =>
            prev ? { ...prev, files: [data.file, ...prev.files] } : prev
          );
          setStatusMessage('تم رفع وتسجيل ملف المخرجات بنجاح في مساحة عمل الفريق!');
        }
      }
    } catch (err) {
      console.error('Failed to upload deliverable file:', err);
    } finally {
      setUploadingTeamFile(false);
    }
  };

  // Submit Solo Project File (SoloSubmission)
  const handleUploadSoloFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !project) return;

    setSubmittingSolo(true);
    const sizeStr = `${(f.size / 1024).toFixed(0)} KB`;
    const ext = f.name.split('.').pop() || 'pdf';

    try {
      const res = await fetch(`/api/projects/${project.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: f.name,
          fileSize: sizeStr,
          fileType: ext,
          notes: soloNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMySubmissions((prev) => [data.submission, ...prev]);
        setSoloNote('');
        setStatusMessage('تم رفع وتسليم ملف المشروع الفردي بنجاح إلى المشرف الأكاديمي!');
      } else {
        setStatusMessage(data.error || 'فشل تسليم الملف');
      }
    } catch {
      setStatusMessage('حدث خطأ أثناء تسليم الملف');
    } finally {
      setSubmittingSolo(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-bg-cream min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-text-muted">جاري تحميل تفاصيل المشروع ومساحة العمل...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="bg-bg-cream min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-3">📂</div>
            <h2 className="text-xl font-extrabold text-text-primary mb-2">المشروع غير موجود</h2>
            <p className="text-xs text-text-muted mb-6">لم يتم العثور على المشروع الأكاديمي المطلوب في النظام.</p>
            <Link href="/practical">
              <Button variant="primary" className="rounded-xl font-bold">
                العودة لدليل المشاريع
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isErpProject = project.source === 'ERP';
  const erpCountdown = formatDeadlineCountdown(project.deadline);

  return (
    <AppLayout>
      {createTeamModalOpen && (
        <CreateTeamModal
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setCreateTeamModalOpen(false)}
          onTeamCreated={async () => {
            await loadProjectData();
            setTeamTab('chat');
          }}
        />
      )}

      <div className="bg-bg-cream min-h-screen pb-20">
        {/* Project Header Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-blue to-brand-navy text-white py-10 md:py-14">
          <div className="section-container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-4 flex-wrap">
              <Link href="/" className="hover:text-white">الرئيسية</Link>
              <ChevronRight size={12} className="rtl:rotate-180" />
              <Link href="/practical" className="hover:text-white">المشاريع العملية</Link>
              <ChevronRight size={12} className="rtl:rotate-180" />
              <span className="text-brand-orange font-bold">
                {project.source === 'ERP'
                  ? 'مشروع ERP أكاديمي معتمد'
                  : project.type === 'TEAM'
                  ? 'مشروع جماعي (Team)'
                  : 'مشروع فردي (Solo)'}
              </span>
              <ChevronRight size={12} className="rtl:rotate-180" />
              <span className="text-white/90 line-clamp-1">{project.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {project.source === 'ERP' && (
                    <span className="text-xs bg-indigo-500/25 text-indigo-200 px-3 py-0.5 rounded-full font-bold border border-indigo-400/40 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-brand-orange" /> نظام الـ ERP الأكاديمي
                    </span>
                  )}
                  {project.courseCode && (
                    <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-md font-bold">
                      {project.courseCode}
                    </span>
                  )}
                  {project.erpReferenceId && (
                    <span className="text-[11px] bg-black/25 text-blue-200 font-mono px-2 py-0.5 rounded">
                      Ref: #{project.erpReferenceId}
                    </span>
                  )}
                  <Badge variant="orange" className="text-xs">
                    {project.category || project.domain}
                  </Badge>
                  <span className="text-xs bg-white/10 px-3 py-0.5 rounded-full font-bold">
                    Level {project.level}
                  </span>
                  {project.type === 'TEAM' ? (
                    <span className="text-xs bg-yellow-400/20 text-yellow-300 px-3 py-0.5 rounded-full font-bold border border-yellow-400/30">
                      🤝 مشروع عمل جماعي
                    </span>
                  ) : (
                    <span className="text-xs bg-purple-400/20 text-purple-300 px-3 py-0.5 rounded-full font-bold border border-purple-400/30">
                      🎯 مشروع تطبيقي فردي
                    </span>
                  )}
                  {myTeam && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-0.5 rounded-full font-extrabold border border-green-400/30 flex items-center gap-1">
                      <CheckCircle2 size={12} /> مسجل في فريق: {myTeam.emoji} {myTeam.name}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight max-w-3xl">
                  {project.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-xs md:text-sm text-blue-200">
                  {(project.professorName || project.doctor) && (
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <Shield size={14} className="text-brand-orange" /> {project.professorName || project.doctor}
                    </span>
                  )}
                  {project.createdAt && (
                    <span className="flex items-center gap-1 text-orange-200 font-semibold" title={formatArabicTimeAgo(project.createdAt).exact}>
                      <Clock size={14} className="text-brand-orange" /> نُشر في: {formatArabicTimeAgo(project.createdAt).exact} ({formatArabicTimeAgo(project.createdAt).relative})
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {project.completionTime}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-300 font-bold">
                    <BookOpen size={14} /> +{project.score} pts
                  </span>
                  {project.type === 'TEAM' && (
                    <span className="flex items-center gap-1 bg-white/15 px-3 py-0.5 rounded-full text-white font-bold">
                      <Users size={14} /> الشواغر المتاحة للفرق: {availableTeamsCount} من {project.maxTeams} فرق
                    </span>
                  )}
                </div>
              </div>

              {/* Header Action Button for TEAM */}
              {project.type === 'TEAM' && !myTeam && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push(`/auth/login?redirect=/practical/${projectId}`);
                        return;
                      }
                      setCreateTeamModalOpen(true);
                    }}
                    disabled={availableTeamsCount <= 0}
                    className="rounded-2xl px-6 py-3 font-bold text-sm shadow-lg whitespace-nowrap"
                  >
                    <Plus size={16} className="me-1" />
                    {availableTeamsCount > 0 ? 'تأسيس فريق جديد للمشروع' : 'اكتمل عدد الفرق المسموح بها'}
                  </Button>
                </div>
              )}
            </div>

            {/* Team Workspace Navigation Tabs (When enrolled in a Team) */}
            {project.type === 'TEAM' && myTeam && (
              <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
                {[
                  { id: 'overview', label: 'تفاصيل ومتطلبات المشروع', icon: <FileText size={16} /> },
                  { id: 'chat', label: `محادثة الفريق (${myTeam.messages.length})`, icon: <MessageCircle size={16} /> },
                  { id: 'files', label: `مخرجات وملفات المشروع (${myTeam.files.length})`, icon: <Upload size={16} /> },
                  { id: 'members', label: `أعضاء الفريق (${myTeam.members.length}/${myTeam.maxSlots})`, icon: <Users size={16} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTeamTab(tab.id as typeof teamTab)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      teamTab === tab.id
                        ? 'bg-white text-brand-navy shadow-md scale-105'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {statusMessage && (
          <div className="section-container mt-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl text-xs md:text-sm flex items-center justify-between shadow-xs">
              <span className="font-semibold">{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="text-blue-600 hover:text-blue-800">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── CASE C: ERP ACADEMIC PROJECT ─────────────────────────────────── */}
        {isErpProject && (
          <div className="section-container py-8 space-y-8">
            {/* If enrolled in team, provide banner with direct jump or workspace toggle */}
            {myTeam && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm">
                    {myTeam.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        فريقك المسجل للمشروع
                      </span>
                      <span className="text-xs text-text-muted">({myTeam.members.length}/{myTeam.maxSlots} أعضاء)</span>
                    </div>
                    <h4 className="font-extrabold text-base text-text-primary mt-0.5">{myTeam.name}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={teamTab === 'chat' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTeamTab(teamTab === 'chat' ? 'overview' : 'chat')}
                    className="rounded-xl text-xs font-bold"
                  >
                    <MessageCircle size={14} className="me-1.5" />
                    {teamTab === 'chat' ? 'إخفاء محادثة الفريق' : `محادثة الفريق (${myTeam.messages.length})`}
                  </Button>
                  <Button
                    variant={teamTab === 'files' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTeamTab(teamTab === 'files' ? 'overview' : 'files')}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Upload size={14} className="me-1.5" />
                    {teamTab === 'files' ? 'إخفاء ملفات الفريق' : `ملفات الفريق (${myTeam.files.length})`}
                  </Button>
                </div>
              </div>
            )}

            {/* If user clicked teamTab === 'chat' or 'files' when enrolled, show team workspace inline */}
            {myTeam && teamTab === 'chat' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[520px]">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{myTeam.emoji}</span>
                    <h3 className="font-extrabold text-sm text-text-primary">{myTeam.name} — المحادثة الجماعية</h3>
                  </div>
                  <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 font-bold text-text-muted">
                    {myTeam.members.length} أعضاء
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                  {myTeam.messages.length === 0 ? (
                    <div className="text-center py-20 text-text-muted text-xs">
                      💬 لا توجد رسائل سابقة. ابدأ المحادثة مع أعضاء فريقك!
                    </div>
                  ) : (
                    myTeam.messages.map((msg) => (
                      <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                        {!msg.isMe && (
                          <Avatar
                            src={msg.authorAvatar}
                            avatarType={msg.authorAvatarType}
                            name={msg.author}
                            size="xs"
                            className="flex-shrink-0 mb-1"
                          />
                        )}
                        <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                          {!msg.isMe && <span className="text-[11px] font-bold text-text-muted px-1">{msg.author}</span>}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm shadow-xs leading-relaxed ${
                              msg.isMe
                                ? 'bg-brand-orange text-white rounded-ee-none'
                                : 'bg-white border border-gray-100 text-text-primary rounded-ss-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-text-muted px-1">{msg.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="اكتب رسالة لأعضاء الفريق..."
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="rounded-full px-5 py-2.5 font-bold text-xs"
                  >
                    <Send size={15} className="me-1 rtl:rotate-180" /> إرسال
                  </Button>
                </form>
              </div>
            )}

            {myTeam && teamTab === 'files' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-base text-text-primary">ملفات ومخرجات الفريق ({myTeam.files.length})</h3>
                    <p className="text-xs text-text-muted">الملفات المشتركة بين أعضاء الفريق للمشروع الأكاديمي</p>
                  </div>
                  <input type="file" ref={teamFileInputRef} onChange={handleUploadTeamFile} className="hidden" />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => teamFileInputRef.current?.click()}
                    disabled={uploadingTeamFile}
                    className="rounded-xl font-bold text-xs"
                  >
                    <Upload size={14} className="me-1.5" />
                    {uploadingTeamFile ? 'جاري الرفع...' : 'رفع ملف جديد للفريق'}
                  </Button>
                </div>
                <div className="space-y-3">
                  {myTeam.files.length === 0 ? (
                    <div className="text-center py-12 text-text-muted text-xs">
                      📁 لم يتم رفع ملفات من قبل أعضاء الفريق بعد.
                    </div>
                  ) : (
                    myTeam.files.map((file) => (
                      <div key={file.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100 text-xs">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-brand-orange" />
                          <div>
                            <p className="font-bold text-text-primary">{file.name}</p>
                            <p className="text-[10px] text-text-muted">
                              {file.size} · رُفع بواسطة {file.uploadedBy} · {file.time}
                            </p>
                          </div>
                        </div>
                        {file.url && (
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                              <Download size={14} className="me-1" /> تحميل
                            </Button>
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Main 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Columns: 1. Project Brief Card & 2. Available Teams View */}
              <div className="lg:col-span-2 space-y-8">
                {/* 1. PROJECT BRIEF CARD */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-100/70 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange via-indigo-600 to-brand-navy" />

                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl font-bold font-mono border border-indigo-200">
                        كود المقرر: {project.courseCode || 'ERP-ACAD'}
                      </span>
                      {project.erpReferenceId && (
                        <span className="text-xs bg-gray-100 text-text-body px-2.5 py-1 rounded-xl font-mono font-bold">
                          ERP Ref: #{project.erpReferenceId}
                        </span>
                      )}
                      <span className="text-xs bg-orange-50 text-brand-orange px-2.5 py-1 rounded-xl font-bold">
                        Level {project.level}
                      </span>
                    </div>

                    {(project.professorName || project.doctor) && (
                      <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-gray-200">
                        <Shield size={14} className="text-brand-orange" />
                        <span className="text-xs text-text-muted">أستاذ المادة:</span>
                        <span className="text-xs font-extrabold text-text-primary">
                          {project.professorName || project.doctor}
                        </span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-text-primary mb-3">
                    {project.title}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Context & Problem */}
                  {project.companyBackground && (
                    <div className="bg-slate-50/90 p-5 rounded-2xl border border-gray-200/60 mb-4">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-brand-orange" /> سياق وخلفية التكليف
                      </h3>
                      <p className="text-xs md:text-sm text-text-body leading-relaxed">{project.companyBackground}</p>
                    </div>
                  )}

                  {project.businessProblem && (
                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 mb-6">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-brand-orange mb-1 flex items-center gap-1.5">
                        <AlertCircle size={14} /> المشكلة والتحدي المستهدف
                      </h3>
                      <p className="text-xs md:text-sm text-text-body leading-relaxed">{project.businessProblem}</p>
                    </div>
                  )}

                  {/* Requirements / Tasks */}
                  {project.tasksToSolve?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-extrabold text-sm text-text-primary mb-3">
                        📋 المهام والتكليفات المطلوب إنجازها
                      </h3>
                      <div className="space-y-2.5">
                        {project.tasksToSolve.map((task, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs md:text-sm text-text-body">
                            <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-xs">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deliverables Checklist */}
                  {project.expectedDeliverables?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-extrabold text-sm text-text-primary mb-3">
                        📦 المخرجات المطلوبة للتسليم والتقييم
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {project.expectedDeliverables.map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-text-primary font-medium">
                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Professor Attachments */}
                  {project.attachments && project.attachments.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-extrabold text-sm text-text-primary mb-3 flex items-center gap-1.5">
                        <Paperclip size={16} className="text-brand-orange" />
                        <span>الملفات والمرفقات الرسمية من أستاذ المادة ({project.attachments.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {project.attachments.map((att, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                            <div className="flex items-center gap-2.5">
                              <FileText size={18} className="text-brand-navy" />
                              <span className="font-bold text-text-primary truncate max-w-xs">{att}</span>
                            </div>
                            <a href={att.startsWith('http') ? att : `#`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                                <Download size={13} className="me-1" /> تحميل الملف
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. AVAILABLE TEAMS VIEW */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange mb-1">
                        <Users size={14} /> فرق العمل المعتمدة للمشروع
                      </div>
                      <h3 className="text-lg font-black text-text-primary">
                        قائمة الفرق المسجلة ({teams.length} من أصل {project.maxTeams} فرق)
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        الحد الأقصى لأعضاء الفريق الواحد: <strong>{project.maxTeamSize || project.maxSlots || 5} طلاب</strong>
                      </p>
                    </div>

                    {!myTeam && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push(`/auth/login?redirect=/practical/${projectId}`);
                            return;
                          }
                          setCreateTeamModalOpen(true);
                        }}
                        disabled={availableTeamsCount <= 0}
                        className="rounded-xl font-bold text-xs shadow-md whitespace-nowrap"
                      >
                        <Plus size={15} className="me-1" />
                        {availableTeamsCount > 0 ? 'تأسيس فريق جديد' : 'اكتملت الفرق'}
                      </Button>
                    )}
                  </div>

                  {/* Teams List */}
                  {teams.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-2xl shadow-xs">
                        🤝
                      </div>
                      <h4 className="font-bold text-sm text-text-primary mb-1">لا توجد فرق عمل مسجلة حتى الآن</h4>
                      <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                        كن أول طالب يؤسس فريقاً لهذا المشروع وادعُ زملاءك للانضمام معك.
                      </p>
                      {!myTeam && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (!isAuthenticated) {
                              router.push(`/auth/login?redirect=/practical/${projectId}`);
                              return;
                            }
                            setCreateTeamModalOpen(true);
                          }}
                          className="rounded-xl font-bold text-xs"
                        >
                          <Plus size={14} className="me-1" /> تأسيس الفريق الأول
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {teams.map((tItem) => {
                        const isUserInThisTeam = myTeam?.id === tItem.id;
                        return (
                          <div
                            key={tItem.id}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isUserInThisTeam
                                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'bg-gray-50/70 border-gray-200/70 hover:border-brand-orange/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">{tItem.emoji}</span>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-text-primary">{tItem.name}</h4>
                                    <p className="text-[11px] text-text-muted">
                                      {tItem.membersCount} من أصل {tItem.maxSlots} أعضاء
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    tItem.slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {tItem.slots > 0 ? `${tItem.slots} شواغر` : 'مكتمل'}
                                </span>
                              </div>

                              {tItem.goal && (
                                <p className="text-xs text-text-body line-clamp-2 italic mb-3 bg-white/70 p-2 rounded-lg border border-gray-100">
                                  &ldquo;{tItem.goal}&rdquo;
                                </p>
                              )}

                              {tItem.members && tItem.members.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {tItem.members.map((m: any, idx: number) => (
                                    <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold text-text-body">
                                      {m.name || m}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              {isUserInThisTeam ? (
                                <div className="text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-100/60 rounded-xl">
                                  ✓ أنت عضو في هذا الفريق
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  fullWidth
                                  disabled={tItem.slots <= 0 || joiningTeamId === tItem.id || !!myTeam}
                                  isLoading={joiningTeamId === tItem.id}
                                  onClick={() => handleJoinTeam(tItem.dbId || tItem.id)}
                                  className="rounded-xl text-xs font-bold"
                                >
                                  {myTeam ? 'مسجل في فريق آخر' : 'الانضمام لهذا الفريق'}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 1. Deadline Countdown & 3. Project Submission View */}
              <div className="space-y-6">
                {/* 1. DEADLINE COUNTDOWN CARD */}
                {erpCountdown && (
                  <div className={`rounded-3xl p-6 border shadow-sm ${
                    erpCountdown.isExpired
                      ? 'bg-red-50/90 border-red-200 text-red-950'
                      : erpCountdown.days < 3
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-gradient-to-br from-indigo-900 to-brand-navy text-white'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold mb-2 opacity-80">
                      <Clock size={14} /> الموعد النهائي المحدد من الأستاذ
                    </div>
                    <div className="text-2xl font-black mb-1">
                      {erpCountdown.text}
                    </div>
                    <p className="text-xs opacity-75">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })
                        : 'وفق الجدول الأكاديمي'}
                    </p>
                  </div>
                )}

                {/* 3. PROJECT SUBMISSION VIEW */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-bold">
                      <Upload size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-text-primary">تسليم مخرجات الـ ERP</h3>
                      <p className="text-[11px] text-text-muted">رفع الحل النهائي مباشرة لقاعدة بيانات المقرر</p>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-xs text-text-muted">
                        يجب تسجيل الدخول بحسابك الجامعي لرفع وتسليم مخرجات التكليف.
                      </p>
                      <Link href={`/auth/login?redirect=/practical/${projectId}`}>
                        <Button variant="primary" size="sm" fullWidth className="rounded-xl font-bold">
                          تسجيل الدخول للتسليم
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Notes / Explanation */}
                      <div>
                        <label className="block text-xs font-bold text-text-primary mb-1">
                          شرح موجز للحل أو رابط المستودع / العرض (GitHub / Drive)
                        </label>
                        <textarea
                          rows={3}
                          value={soloNote}
                          onChange={(e) => setSoloNote(e.target.value)}
                          placeholder="اكتب نبذة عن الحل، رابط GitHub، أو أي ملاحظات للمشرف الأكاديمي..."
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                      </div>

                      {/* File selector dropzone */}
                      <input
                        type="file"
                        ref={soloFileInputRef}
                        onChange={handleUploadSoloFile}
                        className="hidden"
                      />
                      <div
                        onClick={() => soloFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/30 transition-all"
                      >
                        <Upload size={24} className="mx-auto text-brand-orange mb-2" />
                        <p className="text-xs font-bold text-text-primary">اضغط هنا لاختيار ورفع ملف المخرجات</p>
                        <p className="text-[10px] text-text-muted mt-1">PDF, DOCX, ZIP, PPTX — Max 50MB</p>
                      </div>

                      {submittingSolo && (
                        <div className="flex items-center justify-center gap-2 text-xs text-brand-orange font-bold">
                          <span className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                          <span>جاري تسليم وتوثيق الملف في نظام الـ ERP...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submissions History for ERP Project */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-text-muted uppercase tracking-wider">
                      سجل تسليماتك للمشروع ({mySubmissions.length})
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      ربط ERP نشط
                    </span>
                  </div>

                  {mySubmissions.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      لم تقم بتسليم أي ملفات بعد لهذا التكليف الأكاديمي.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {mySubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-text-primary truncate max-w-[170px]">{sub.name}</span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              تم التوثيق في الـ ERP ✓
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted">
                            {sub.size} · {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                          {sub.notes && (
                            <p className="text-[11px] text-text-body bg-white p-2 rounded-lg border border-gray-100">
                              {sub.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CASE A: TEAM PROJECT ────────────────────────────────────────── */}
        {!isErpProject && project.type === 'TEAM' && (
          <div className="section-container py-8">
            {/* If Student is Enrolled in a Team: Render Team Workspace Tabs */}
            {myTeam ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* 1. OVERVIEW TAB */}
                {teamTab === 'overview' && (
                  <div className="p-6 md:p-8 space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-text-primary mb-2">نبذة عن المشروع الأكاديمي</h2>
                      <p className="text-sm text-text-body leading-relaxed">{project.description}</p>
                    </div>

                    {project.companyBackground && (
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-sm text-text-primary mb-1">🏢 خلفية وسياق المشروع</h3>
                        <p className="text-xs text-text-body leading-relaxed">{project.companyBackground}</p>
                      </div>
                    )}

                    {project.businessProblem && (
                      <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                        <h3 className="font-bold text-sm text-brand-orange mb-1">⚠️ المشكلة المستهدفة بالحل</h3>
                        <p className="text-xs text-text-body leading-relaxed">{project.businessProblem}</p>
                      </div>
                    )}

                    {project.tasksToSolve?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm text-text-primary mb-3">✅ المهام والتحديات المطلوب حلها</h3>
                        <ul className="space-y-2">
                          {project.tasksToSolve.map((task, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                              <span className="w-5 h-5 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.expectedDeliverables?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm text-text-primary mb-3">📦 المخرجات المطلوبة للتسليم النهائي</h3>
                        <ul className="space-y-2">
                          {project.expectedDeliverables.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-text-body">
                              <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CHAT TAB (Real DB-backed message board) */}
                {teamTab === 'chat' && (
                  <div className="flex flex-col h-[560px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{myTeam.emoji}</span>
                        <div>
                          <h3 className="font-extrabold text-sm text-text-primary">{myTeam.name} — المحادثة الجماعية</h3>
                          <p className="text-[11px] text-text-muted">لوحة نقاش الفريق الحية المحفوظة في قاعدة البيانات</p>
                        </div>
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 font-bold text-text-muted">
                        {myTeam.members.length} أعضاء
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                      {myTeam.messages.length === 0 ? (
                        <div className="text-center py-20 text-text-muted text-xs">
                          💬 لا توجد رسائل سابقة. ابدأ المحادثة وشارك أول خطة عمل مع أعضاء فريقك!
                        </div>
                      ) : (
                        myTeam.messages.map((msg) => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                            {!msg.isMe && (
                              <Avatar
                                src={msg.authorAvatar}
                                avatarType={msg.authorAvatarType}
                                name={msg.author}
                                size="xs"
                                className="flex-shrink-0 mb-1"
                              />
                            )}
                            <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                              {!msg.isMe && <span className="text-[11px] font-bold text-text-muted px-1">{msg.author}</span>}
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm shadow-xs leading-relaxed ${
                                  msg.isMe
                                    ? 'bg-brand-orange text-white rounded-ee-none'
                                    : 'bg-white border border-gray-100 text-text-primary rounded-ss-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-text-muted px-1">{msg.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="اكتب رسالة لأعضاء الفريق..."
                        className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      />
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={!messageInput.trim() || sendingMessage}
                        className="rounded-full px-5 py-2.5 font-bold text-xs"
                      >
                        <Send size={15} className="me-1 rtl:rotate-180" /> إرسال
                      </Button>
                    </form>
                  </div>
                )}

                {/* 3. FILES TAB (Dedicated Deliverables section) */}
                {teamTab === 'files' && (
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-black text-lg text-text-primary">مخرجات وملفات المشروع المسلمة</h3>
                        <p className="text-xs text-text-muted">رفع وثائق التصميم والأكواد والعروض التقديمية الخاصة بالفريق</p>
                      </div>

                      <input
                        type="file"
                        ref={teamFileInputRef}
                        onChange={handleUploadTeamFile}
                        className="hidden"
                      />
                      <Button
                        variant="primary"
                        onClick={() => teamFileInputRef.current?.click()}
                        isLoading={uploadingTeamFile}
                        className="rounded-xl px-5 font-bold text-xs"
                      >
                        <Upload size={15} className="me-1.5" /> رفع مخرج جديد
                      </Button>
                    </div>

                    {/* Upload Dropzone */}
                    <div
                      onClick={() => teamFileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-3xl p-8 text-center cursor-pointer bg-orange-50/20 hover:bg-orange-50/40 transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto mb-2">
                        <Upload size={22} className={uploadingTeamFile ? 'animate-bounce' : ''} />
                      </div>
                      <p className="text-sm font-bold text-text-primary">اضغط لاختيار ملف ورفعه لمساحة عمل الفريق</p>
                      <p className="text-xs text-text-muted mt-1">PDF, DOCX, ZIP, PPTX — Max 50MB</p>
                    </div>

                    {/* Deliverables List */}
                    <div className="space-y-3">
                      {myTeam.files.length === 0 ? (
                        <div className="text-center py-10 text-text-muted text-xs">
                          📁 لم يقم أعضاء الفريق برفع أي مخرجات أو ملفات حتى الآن.
                        </div>
                      ) : (
                        myTeam.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100 hover:border-brand-orange/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                                📄
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-text-primary truncate">{file.name}</p>
                                <p className="text-[11px] text-text-muted">
                                  {file.size} · بواسطة {file.uploadedBy} · {file.time}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              تم الحفظ في السجل
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. MEMBERS TAB */}
                {teamTab === 'members' && (
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-lg text-text-primary">أعضاء الفريق والمسؤوليات</h3>
                        <p className="text-xs text-text-muted">
                          {myTeam.members.length} من أصل {myTeam.maxSlots} أعضاء مسجلين
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {myTeam.slots} شواغر متبقية
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myTeam.members.map((m) => (
                        <div key={m.userId} className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <Avatar
                            src={m.avatar}
                            avatarType={m.avatarType}
                            name={m.name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-text-primary truncate">{m.fullName || m.name}</p>
                            <p className="text-xs text-brand-orange font-semibold">{m.role}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-text-body font-bold">
                            {m.domain}
                          </span>
                        </div>
                      ))}

                      {Array.from({ length: myTeam.slots }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xs">
                            +
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">شاغر متاح للطلاب</p>
                            <p className="text-[10px] text-text-muted">يمكن لزملائك الانضمام لهذا المقعد</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Student NOT in a team yet: Show project details, available teams counter, create team, and existing teams list */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Project Requirements & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-black text-text-primary mb-3">تفاصيل ومتطلبات المشروع الأكاديمي</h2>
                    <p className="text-sm text-text-body leading-relaxed mb-6">{project.description}</p>

                    {project.companyBackground && (
                      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 mb-4">
                        <h3 className="font-bold text-sm text-text-primary mb-1">🏢 سياق وخلفية المشروع</h3>
                        <p className="text-xs text-text-body leading-relaxed">{project.companyBackground}</p>
                      </div>
                    )}

                    {project.businessProblem && (
                      <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 mb-6">
                        <h3 className="font-bold text-sm text-brand-orange mb-1">⚠️ المشكلة المستهدفة</h3>
                        <p className="text-xs text-text-body leading-relaxed">{project.businessProblem}</p>
                      </div>
                    )}

                    {project.tasksToSolve?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-bold text-sm text-text-primary mb-3">✅ المهام والتحديات المطلوب حلها</h3>
                        <ul className="space-y-2.5">
                          {project.tasksToSolve.map((tItem, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                              <span className="w-5 h-5 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{tItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.expectedDeliverables?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm text-text-primary mb-3">📦 المخرجات المطلوبة للتسليم</h3>
                        <ul className="space-y-2">
                          {project.expectedDeliverables.map((dItem, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-text-body">
                              <CheckCircle2 size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{dItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Available Teams Quota & Team Selection */}
                <div className="space-y-6">
                  {/* Quota Banner */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-muted">شواغر الفرق في المشروع</span>
                      <span className="text-xs font-mono font-bold text-brand-orange bg-orange-50 px-2.5 py-0.5 rounded-full">
                        {availableTeamsCount} متاحة / {project.maxTeams} أقصى حد
                      </span>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-orange to-green-500 rounded-full transition-all"
                        style={{ width: `${(teams.length / project.maxTeams) * 100}%` }}
                      />
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      للعمل على هذا المشروع، يمكنك إما <strong>تأسيس فريق جديد</strong> (يخصم من عدد الشواغر المتاحة) أو <strong>الانضمام لأحد الفرق القائمة</strong> التي تمتلك أماكن شاغرة.
                    </p>

                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(`/auth/login?redirect=/practical/${projectId}`);
                          return;
                        }
                        setCreateTeamModalOpen(true);
                      }}
                      disabled={availableTeamsCount <= 0}
                      className="rounded-xl py-3 font-bold text-xs"
                    >
                      <Plus size={16} className="me-1" />
                      {availableTeamsCount > 0 ? 'تأسيس فريق جديد للمشروع' : 'اكتملت جميع الفرق المسموح بها'}
                    </Button>
                  </div>

                  {/* Existing Teams List */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-text-primary">الفرق المنشأة لهذا المشروع ({teams.length})</h3>

                    {teams.length === 0 ? (
                      <div className="text-center py-8 text-text-muted text-xs">
                        لا توجد فرق عمل منشأة حتى الآن لهذا المشروع. كن أول من يؤسس فريقاً!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teams.map((tItem) => (
                          <div
                            key={tItem.id}
                            className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-orange/30 transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{tItem.emoji}</span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-text-primary">{tItem.name}</h4>
                                  <p className="text-[10px] text-text-muted">
                                    {tItem.membersCount} / {tItem.maxSlots} أعضاء
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  tItem.slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {tItem.slots > 0 ? `${tItem.slots} شواغر` : 'مكتمل'}
                              </span>
                            </div>

                            {tItem.goal && (
                              <p className="text-xs text-text-body line-clamp-2 italic">
                                &ldquo;{tItem.goal}&rdquo;
                              </p>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              disabled={tItem.slots <= 0 || joiningTeamId === tItem.id}
                              isLoading={joiningTeamId === tItem.id}
                              onClick={() => handleJoinTeam(tItem.dbId || tItem.id)}
                              className="rounded-xl text-xs font-bold hover:bg-brand-orange hover:text-white hover:border-brand-orange"
                            >
                              الانضمام لهذا الفريق
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CASE B: SOLO PROJECT ────────────────────────────────────────── */}
        {!isErpProject && project.type === 'SOLO' && (
          <div className="section-container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Project Requirements uploaded by Professor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-black text-text-primary mb-3">متطلبات المشروع الفردي</h2>
                  <p className="text-sm text-text-body leading-relaxed mb-6">{project.description}</p>

                  {project.companyBackground && (
                    <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 mb-4">
                      <h3 className="font-bold text-sm text-text-primary mb-1">🏢 خلفية وسياق الدراسة</h3>
                      <p className="text-xs text-text-body leading-relaxed">{project.companyBackground}</p>
                    </div>
                  )}

                  {project.businessProblem && (
                    <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 mb-6">
                      <h3 className="font-bold text-sm text-brand-orange mb-1">⚠️ المشكلة المطلوب دراستها وحلها</h3>
                      <p className="text-xs text-text-body leading-relaxed">{project.businessProblem}</p>
                    </div>
                  )}

                  {project.tasksToSolve?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-sm text-text-primary mb-3">✅ المهام الفردية المطلوبة</h3>
                      <ul className="space-y-2.5">
                        {project.tasksToSolve.map((task, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-text-body">
                            <span className="w-5 h-5 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.expectedDeliverables?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-text-primary mb-3">📦 المخرجات المطلوبة للتسليم</h3>
                      <ul className="space-y-2">
                        {project.expectedDeliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-text-body">
                            <CheckCircle2 size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Direct Solo Workspace & Deliverable Submission */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-text-primary">مساحة التسليم الفردي</h3>
                      <p className="text-[11px] text-text-muted">ارفع ملفات الحل مباشرة لأستاذ المادة</p>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-xs text-text-muted">يجب تسجيل الدخول بحسابك الجامعي لرفع وتسليم مخرجات المشروع.</p>
                      <Link href={`/auth/login?redirect=/practical/${projectId}`}>
                        <Button variant="primary" size="sm" fullWidth className="rounded-xl font-bold">
                          تسجيل الدخول للتسليم
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Notes textarea */}
                      <div>
                        <label className="block text-xs font-bold text-text-primary mb-1">
                          ملاحظات أو شرح موجز للحل (اختياري)
                        </label>
                        <textarea
                          rows={3}
                          value={soloNote}
                          onChange={(e) => setSoloNote(e.target.value)}
                          placeholder="اكتب نبذة عن منهجيتك في حل المشروع للأستاذ المشرف..."
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                      </div>

                      {/* File selector */}
                      <input
                        type="file"
                        ref={soloFileInputRef}
                        onChange={handleUploadSoloFile}
                        className="hidden"
                      />
                      <div
                        onClick={() => soloFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/30 transition-all"
                      >
                        <Upload size={24} className="mx-auto text-brand-orange mb-2" />
                        <p className="text-xs font-bold text-text-primary">اضغط هنا لاختيار ورفع ملف الحل</p>
                        <p className="text-[10px] text-text-muted mt-1">PDF, DOCX, ZIP, PPTX — Max 50MB</p>
                      </div>

                      {submittingSolo && (
                        <div className="flex items-center justify-center gap-2 text-xs text-brand-orange font-bold">
                          <span className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                          <span>جاري تسليم الملف للمشرف...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submissions History for this student */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs text-text-muted uppercase tracking-wider">
                    سجل تسليماتك لهذا المشروع ({mySubmissions.length})
                  </h4>

                  {mySubmissions.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      لم تقم بتسليم أي ملفات بعد لهذا المشروع.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {mySubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-text-primary truncate max-w-[170px]">{sub.name}</span>
                            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                              تم التسليم ✓
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted">
                            {sub.size} · {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                          {sub.notes && (
                            <p className="text-[11px] text-text-body bg-white p-2 rounded-lg border border-gray-100">
                              {sub.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
