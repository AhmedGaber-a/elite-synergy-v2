// src/app/profile/page.tsx
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Linkedin, Download, ExternalLink, Pencil, X, Check,
  Plus, Cloud, Award, BookOpen, Star, Facebook, ShieldCheck,
  FileText, Briefcase, Sparkles, AlertCircle, Camera, Upload, Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ProfileData {
  id: string;
  name: string;
  fullName: string;
  email: string;
  specialty: string;
  avatarType: 'male' | 'female' | 'hijab' | 'niqab';
  avatar: string;
  college: string;
  age: number | null;
  role: string;
  address: string;
  points: number;
  bio: string;
  matchScore: number;
  isVerified: boolean;
  resumeUrl: string;
  skills: string[];
  languages: Array<{ name: string; level?: number }>;
  toolSkills: Array<{ name: string; level?: number }>;
  extraSkills: string[];
  socialLinks: { x?: string; linkedin?: string; facebook?: string; github?: string };
  priorProjects: Array<{
    id: string;
    title: string;
    desc: string;
    skill: string;
    emoji: string;
    uploadDate: string;
    source: string;
    fileUrl?: string | null;
  }>;
  platformProjects: Array<{
    id: string;
    title: string;
    desc: string;
    domain: string;
    role: string;
    teamName?: string | null;
    supervisor: string;
    grade: string;
    score: number;
    completedDate: string;
    status: string;
    badge: string;
  }>;
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({
  user,
  onSave,
  onClose,
}: {
  user: ProfileData;
  onSave: (updated: Partial<ProfileData>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    avatar: user.avatar || '',
    avatarType: user.avatarType || 'male',
    name: user.name,
    fullName: user.fullName,
    specialty: user.specialty,
    college: user.college,
    address: user.address,
    bio: user.bio,
    age: user.age ? String(user.age) : '',
    resumeUrl: user.resumeUrl,
    skills: [...user.skills],
    newSkill: '',
    linkedin: user.socialLinks?.linkedin || '',
    x: user.socialLinks?.x || '',
    facebook: user.socialLinks?.facebook || '',
  });
  const [saving, setSaving] = useState(false);
  const modalFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!form.newSkill.trim()) return;
    if (!form.skills.includes(form.newSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, prev.newSkill.trim()], newSkill: '' }));
    }
  };

  const removeSkill = (index: number) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      avatar: form.avatar,
      avatarType: form.avatarType as any,
      name: form.name,
      fullName: form.fullName,
      specialty: form.specialty,
      college: form.college,
      address: form.address,
      bio: form.bio,
      age: form.age ? parseInt(form.age, 10) : null,
      resumeUrl: form.resumeUrl,
      skills: form.skills,
      socialLinks: {
        linkedin: form.linkedin,
        x: form.x,
        facebook: form.facebook,
      },
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary">Edit Profile</h2>
            <p className="text-sm text-text-muted">Update your academic information</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Management Section */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-orange bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              {form.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatar}
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar
                  avatarType={form.avatarType}
                  name={form.name || 'User'}
                  size="xl"
                  className="w-full h-full"
                />
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Profile Picture & Avatar
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => modalFileRef.current?.click()}
                    className="rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Upload Custom Photo
                  </Button>
                  {form.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((prev) => ({ ...prev, avatar: '' }))}
                      className="rounded-xl text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Reset to Default
                    </Button>
                  )}
                  <input
                    ref={modalFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">
                  Predefined Avatar Character
                </label>
                <select
                  value={form.avatarType}
                  onChange={(e) => setForm({ ...form, avatarType: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-white"
                >
                  <option value="male">Male (طالب)</option>
                  <option value="female">Female (طالبة)</option>
                  <option value="hijab">Hijab (محجبة)</option>
                  <option value="niqab">Niqab (منتقبة)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Display Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Full Legal Name</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">College / Department</label>
              <select
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Business Information System">Business Information System (BIS)</option>
                <option value="Accounting (English)">Accounting (English)</option>
                <option value="Accounting (Arabic)">Accounting (Arabic)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Specialty</label>
              <input
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Address / City</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">CV / Portfolio Link</label>
              <input
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">Academic Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
            />
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={form.newSkill}
                onChange={(e) => setForm({ ...form, newSkill: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a new skill (e.g. Next.js, Docker, SAP)..."
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
              <Button type="button" variant="primary" size="sm" onClick={addSkill} className="rounded-xl px-4">
                <Plus size={16} /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((skill, index) => (
                <span key={skill} className="inline-flex items-center gap-1.5 bg-orange-100 text-brand-orange font-bold text-xs px-3 py-1 rounded-full">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" variant="primary" isLoading={saving} className="rounded-xl px-6">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Prior Project Modal ──────────────────────────────────────────────────
function AddPriorProjectModal({
  onAdd,
  onClose,
}: {
  onAdd: (project: { title: string; desc: string; skill: string; fileUrl?: string; emoji?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [skill, setSkill] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [emoji, setEmoji] = useState('💼');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    await onAdd({ title, desc, skill: skill || 'General', fileUrl, emoji });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h3 className="text-lg font-extrabold text-text-primary">Add Portfolio / Prior Project</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-text-primary rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">Project Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart Warehouse Automation System"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Primary Skill / Tech</label>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Next.js & AWS"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Icon Emoji</label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50 text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">Description</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What did this project achieve?"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">Live Demo / Repo / File Link (Optional)</label>
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange bg-gray-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" variant="primary" isLoading={loading} className="rounded-xl px-5">Add Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Profile Page Component ──────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, refreshUser, updateUser } = useAuth();
  const { t, lang } = useLanguage();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProjectTab, setActiveProjectTab] = useState<'platform' | 'prior'>('platform');
  const [editOpen, setEditOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addSkillPrompt, setAddSkillPrompt] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile', {
        headers,
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else if (res.status === 401 && !authLoading && !authUser) {
        router.push('/auth/login?redirect=/profile');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push('/auth/login?redirect=/profile');
      } else {
        loadProfile();
      }
    }
  }, [authLoading, authUser, loadProfile, router]);

  const handleUpdateProfile = async (updates: Partial<ProfileData>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && updateUser) {
          updateUser(data.user);
        }
        await loadProfile();
        if (refreshUser) {
          await refreshUser();
        }
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleDirectAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await handleUpdateProfile({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleAddPriorProject = async (proj: { title: string; desc: string; skill: string; fileUrl?: string; emoji?: string }) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_prior_project', priorProject: proj }),
      });
      if (res.ok) {
        await loadProfile();
      }
    } catch (err) {
      console.error('Failed to add prior project:', err);
    }
  };

  const handleQuickAddSkill = async () => {
    if (!newSkillInput.trim()) return;
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_skill', skill: newSkillInput.trim() }),
      });
      if (res.ok) {
        setNewSkillInput('');
        setAddSkillPrompt(false);
        await loadProfile();
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-bg-cream flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-text-muted">Loading your academic profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-lg">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Profile Not Available</h2>
            <p className="text-sm text-text-muted mb-4">Please log in to view and manage your profile.</p>
            <Link href="/auth/login">
              <Button variant="primary" fullWidth className="rounded-xl">Go to Login</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen pb-16">
        <div className="section-container py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* ─── Left Sidebar Profile Card ────────────────────────────── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-brand-navy rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 end-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl" />

                {/* Avatar & Header */}
                <div className="text-center mb-6 relative z-10">
                  <div className="relative w-28 h-28 mx-auto mb-3 group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-brand-navy flex items-center justify-center">
                      {(profile.avatar || authUser?.avatar || authUser?.avatarUrl || authUser?.image) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatar || authUser?.avatar || authUser?.avatarUrl || authUser?.image || ''}
                          alt={profile.fullName || profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Avatar
                          src={profile.avatar || authUser?.avatar || authUser?.avatarUrl || authUser?.image || ''}
                          avatarType={profile.avatarType || authUser?.avatarType}
                          name={profile.fullName || profile.name}
                          size="xl"
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload / Change Profile Picture"
                      className="absolute bottom-0 end-0 bg-brand-orange hover:bg-brand-orange-dark text-white p-2 rounded-full shadow-lg border-2 border-brand-navy transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDirectAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl font-black">{profile.fullName}</h2>
                    {profile.isVerified && (
                      <span title="Verified Institutional Account" className="text-blue-400">
                        <ShieldCheck size={20} className="fill-blue-400/20" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-orange font-bold mt-1">{profile.specialty}</p>
                  <p className="text-[11px] text-white/60">{profile.college}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                      <Star size={16} className="fill-yellow-400" />
                    </div>
                    <span className="font-mono text-xl font-black text-white">{profile.points}</span>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Points</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Sparkles size={16} />
                    </div>
                    <span className="font-mono text-xl font-black text-white">{profile.matchScore}%</span>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">AI Match</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/50">Email</span>
                    <span className="font-medium text-white truncate max-w-[170px]">{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">College</span>
                    <span className="font-semibold text-white">{profile.college}</span>
                  </div>
                  {profile.address && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Address</span>
                      <span className="font-semibold text-white">{profile.address}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Verified Skills</h4>
                    <button
                      onClick={() => setAddSkillPrompt((p) => !p)}
                      className="text-white/60 hover:text-brand-orange transition-colors"
                      title="Add Skill"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {addSkillPrompt && (
                    <div className="flex gap-1.5 mb-3">
                      <input
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="Skill name..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
                      />
                      <button
                        onClick={handleQuickAddSkill}
                        className="px-2.5 py-1 bg-brand-orange text-white text-xs font-bold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.length === 0 ? (
                      <p className="text-xs text-white/40">No skills added yet</p>
                    ) : (
                      profile.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {profile.resumeUrl ? (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white py-3 rounded-2xl transition-colors text-xs font-bold shadow-md"
                    >
                      <FileText size={16} /> View Academic CV
                    </a>
                  ) : (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl transition-colors text-xs font-bold"
                    >
                      <Download size={16} /> Add CV / Resume Link
                    </button>
                  )}
                  <button
                    onClick={() => setEditOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl transition-colors text-xs font-bold"
                  >
                    <Pencil size={16} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Main Content ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Bio & Intro Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <Badge variant="orange" className="mb-2">Verified Student Profile</Badge>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">
                      Welcome back, {profile.name}! 👋
                    </h1>
                    <p className="text-sm font-semibold text-brand-orange mb-3">{profile.specialty}</p>
                    <p className="text-text-body text-sm leading-relaxed max-w-xl">
                      {profile.bio || 'Passionate student collaborating on real-world projects, building production skills, and aiming for academic excellence.'}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setEditOpen(true)}>
                      <Pencil size={14} className="me-1" /> Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setAddProjectOpen(true)}>
                      <Plus size={14} className="me-1" /> Add Project
                    </Button>
                  </div>
                </div>
              </div>

              {/* Projects Tabs */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-text-primary">Academic & Portfolio Projects</h2>
                    <p className="text-xs text-text-muted">Verified project deliverables and previous student work</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveProjectTab('platform')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeProjectTab === 'platform'
                          ? 'bg-brand-orange text-white shadow-sm'
                          : 'bg-gray-100 text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Award size={15} /> Platform Projects ({profile.platformProjects.length})
                    </button>
                    <button
                      onClick={() => setActiveProjectTab('prior')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeProjectTab === 'prior'
                          ? 'bg-brand-navy text-white shadow-sm'
                          : 'bg-gray-100 text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <BookOpen size={15} /> Portfolio / Prior ({profile.priorProjects.length})
                    </button>
                  </div>
                </div>

                {/* Tab 1: Platform Projects */}
                {activeProjectTab === 'platform' && (
                  <div>
                    {profile.platformProjects.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award size={28} />
                        </div>
                        <h4 className="font-bold text-text-primary mb-1">No Graded Platform Projects Yet</h4>
                        <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                          Join a practical project team, upload your deliverables, and receive verified evaluations and academic points!
                        </p>
                        <Link href="/practical/team">
                          <Button variant="primary" size="sm" className="rounded-xl">Browse Teams & Projects</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.platformProjects.map((p) => (
                          <div key={p.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="orange" className="text-[10px]">{p.domain}</Badge>
                                <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                  Grade: {p.grade}
                                </span>
                              </div>
                              <h3 className="font-bold text-sm text-text-primary mb-1">{p.title}</h3>
                              <p className="text-xs text-text-body mb-3">{p.desc}</p>
                              <div className="text-[11px] text-text-muted space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                                <div>Supervisor: <span className="font-semibold text-text-primary">{p.supervisor}</span></div>
                                {p.teamName && <div>Team: <span className="font-semibold text-brand-orange">{p.teamName}</span></div>}
                                <div>Earned Points: <span className="font-bold text-yellow-600">+{p.score} pts</span></div>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-text-muted">
                              Completed on {p.completedDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Prior / Portfolio Projects */}
                {activeProjectTab === 'prior' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-text-muted">Previous work submitted during onboarding or uploaded later</span>
                      <Button variant="outline" size="sm" onClick={() => setAddProjectOpen(true)} className="rounded-xl text-xs">
                        <Plus size={14} className="me-1" /> Add Project
                      </Button>
                    </div>

                    {profile.priorProjects.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-blue-50 text-brand-navy rounded-full flex items-center justify-center mx-auto mb-3">
                          <BookOpen size={28} />
                        </div>
                        <h4 className="font-bold text-text-primary mb-1">No Prior Projects Uploaded</h4>
                        <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                          Showcase your prior work, case studies, or github repos to boost your AI matchmaking score!
                        </p>
                        <Button variant="primary" size="sm" onClick={() => setAddProjectOpen(true)} className="rounded-xl">
                          Upload Prior Project
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.priorProjects.map((p) => (
                          <div key={p.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl">{p.emoji || '💼'}</span>
                                <Badge variant="navy" className="text-[10px]">{p.skill}</Badge>
                              </div>
                              <h3 className="font-bold text-sm text-text-primary mb-1">{p.title}</h3>
                              <p className="text-xs text-text-body mb-3">{p.desc}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px]">
                              <span className="text-text-muted">📅 {p.uploadDate}</span>
                              {p.fileUrl && (
                                <a
                                  href={p.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-orange hover:underline font-bold flex items-center gap-1"
                                >
                                  View Link <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Modals */}
        {editOpen && (
          <EditProfileModal
            user={profile}
            onSave={handleUpdateProfile}
            onClose={() => setEditOpen(false)}
          />
        )}

        {addProjectOpen && (
          <AddPriorProjectModal
            onAdd={handleAddPriorProject}
            onClose={() => setAddProjectOpen(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}
