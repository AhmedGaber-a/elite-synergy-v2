// src/app/peers/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, UserPlus, MessageCircle, FilterX, Sparkles, X, Users, Check, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

export interface PeerItem {
  id: string;
  name: string;
  fullName: string;
  email: string;
  discipline: string;
  specialty: string;
  college: string;
  avatar: string;
  avatarType: 'male' | 'female' | 'hijab' | 'niqab';
  skills: string[];
  bio: string;
  points: number;
  matchScore: number;
  projects: Array<{
    id: string;
    title: string;
    skill: string;
    description: string;
    image: string;
  }>;
}

const DISCIPLINES = [
  'Computer Science',
  'Business Information System',
  'Accounting (English)',
  'Accounting (Arabic)',
];

function SuggestTeammatesModal({
  peers,
  onClose,
  onConnect,
}: {
  peers: PeerItem[];
  onClose: () => void;
  onConnect: (peerId: string) => void;
}) {
  const [skillInput, setSkillInput] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [results, setResults] = useState<PeerItem[] | null>(null);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!customSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setCustomSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const allActiveSkills = [...customSkills];
  if (skillInput.trim() && !allActiveSkills.some((s) => s.toLowerCase() === skillInput.trim().toLowerCase())) {
    allActiveSkills.push(skillInput.trim());
  }

  const suggest = () => {
    const querySkills = allActiveSkills;
    if (querySkills.length === 0) return;

    const suggested = peers
      .map((p) => {
        const matchingCount = p.skills.filter((s) =>
          querySkills.some((qs) => s.toLowerCase().includes(qs.toLowerCase()) || qs.toLowerCase().includes(s.toLowerCase()))
        ).length;

        const calculatedScore = matchingCount * 20 + (p.matchScore ?? 75);
        return {
          ...p,
          calculatedScore,
          matchingCount,
        };
      })
      .filter((p) => {
        const matchesDept =
          !selectedDept ||
          p.discipline.toLowerCase().includes(selectedDept.toLowerCase()) ||
          p.college.toLowerCase().includes(selectedDept.toLowerCase());
        const hasSkillMatch = p.matchingCount > 0;
        return matchesDept && hasSkillMatch;
      })
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 6);

    setResults(suggested);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">AI Teammate Suggestions</h2>
              <p className="text-xs text-text-muted">Find peers with matching skills for your practical project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Free-Text Skill Search Input (No restricted presets) */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              اكتب المهارة التي تبحث عنها (Type skills you are looking for)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Cybersecurity, Python, Linux, Marketing, AWS..."
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-50"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={addSkill}
                disabled={!skillInput.trim()}
                className="rounded-xl px-4 bg-purple-600 hover:bg-purple-700"
              >
                إضافة
              </Button>
            </div>

            {/* Selected Skills Chips */}
            {customSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {customSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Department filter */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-3">Filter by Department (optional)</label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(selectedDept === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedDept === d
                      ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                      : 'bg-gray-50 text-text-body border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            className="rounded-xl bg-purple-600 hover:bg-purple-700"
            onClick={suggest}
            disabled={allActiveSkills.length === 0}
          >
            <Sparkles size={16} className="me-2" /> بحث عن زملاء مطابقين للمهارات
          </Button>

          {/* Results */}
          {results !== null && (
            <div>
              <p className="text-sm font-bold text-text-primary mb-3">
                {results.length > 0 ? `✨ ${results.length} recommended teammates found` : 'No matches found. Try different skills or broad search.'}
              </p>
              <div className="space-y-3">
                {results.map((peer) => (
                  <div key={peer.id} className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <Avatar src={peer.avatar} name={peer.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm">{peer.name}</p>
                      <p className="text-xs text-purple-600 font-semibold">{peer.specialty}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {peer.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              selectedSkills.some((sel) => s.toLowerCase().includes(sel.toLowerCase()))
                                ? 'bg-purple-200 text-purple-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-full font-bold">
                        {peer.matchScore}% match
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/peers/${peer.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs px-2.5 py-1 h-auto">Profile</Button>
                        </Link>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs px-2.5 py-1 h-auto"
                          onClick={() => onConnect(peer.id)}
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PeersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [peers, setPeers] = useState<PeerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPeers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedDiscipline) params.set('discipline', selectedDiscipline);
      if (user?.id) params.set('currentUserId', user.id);

      const res = await fetch(`/api/peers?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // CRITICAL RULE: Ensure current user is never included in peers view
        const verifiedPeers = (data.peers || []).filter((p: PeerItem) => (user ? p.id !== user.id : true));
        setPeers(verifiedPeers);
      }
    } catch (err) {
      console.error('Failed to fetch peers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDiscipline, user]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPeers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPeers]);

  const handleConnect = async (peerId: string) => {
    try {
      const res = await fetch('/api/peers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId, message: 'I would like to collaborate on upcoming practical projects!' }),
      });

      const data = await res.json();
      if (res.ok) {
        setConnectedIds((prev) => ({ ...prev, [peerId]: true }));
        setNotification('تم إرسال طلب التواصل بنجاح! سيتم إخطار زميلك.');
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification(data.error || 'فشل إرسال الطلب');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch {
      setNotification('حدث خطأ أثناء التواصل');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-[calc(100vh-80px)]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white">
          <div className="section-container py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-white/10">
              <Users size={14} /> Peer Collaboration Network
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              {t('peers.findTeammates')}
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-xl mx-auto mb-8">
              Connect with verified students across Computer Science, BIS, and Accounting departments to form multi-disciplinary teams.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('peers.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 rounded-2xl text-text-primary text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
              />
            </div>
          </div>
        </div>

        <div className="section-container py-8">
          {notification && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl text-sm mb-6 flex items-center justify-between shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                <span className="font-semibold">{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-green-600 hover:text-green-800">
                <X size={16} />
              </button>
            </div>
          )}

          {/* AI Banner */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-yellow-300" />
              </div>
              <div>
                <p className="font-bold text-white text-base">AI Teammate Finder ✨</p>
                <p className="text-purple-200 text-xs md:text-sm">Need specific skills? Let AI analyze student competencies and recommend top team candidates.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="bg-white text-purple-700 hover:bg-purple-50 border-0 font-bold whitespace-nowrap flex-shrink-0 rounded-xl"
              onClick={() => setShowSuggest(true)}
            >
              <Sparkles size={16} className="me-2" /> {t('practical.suggestTeammates')}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-primary text-base">{t('peers.disciplines')}</h3>
                  {selectedDiscipline && (
                    <button
                      onClick={() => setSelectedDiscipline(null)}
                      className="text-xs text-brand-orange hover:underline flex items-center gap-1 font-bold"
                    >
                      <FilterX size={14} /> Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedDiscipline(null)}
                    className={`text-start px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      !selectedDiscipline ? 'bg-brand-orange text-white shadow-sm' : 'text-text-body hover:bg-orange-50'
                    }`}
                  >
                    {t('peers.allDisciplines')}
                    <span className="ms-2 opacity-75">({peers.length})</span>
                  </button>
                  {DISCIPLINES.map((disc) => {
                    const count = peers.filter((p) => p.discipline.toLowerCase().includes(disc.toLowerCase()) || p.college.toLowerCase().includes(disc.toLowerCase())).length;
                    return (
                      <button
                        key={disc}
                        onClick={() => setSelectedDiscipline(disc)}
                        className={`text-start px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          selectedDiscipline === disc ? 'bg-brand-orange text-white shadow-sm' : 'text-text-body hover:bg-orange-50'
                        }`}
                      >
                        {disc}
                        <span className="ms-2 opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Peers Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-text-primary">
                  {selectedDiscipline ?? 'Verified Peers'}
                  <span className="text-text-muted text-sm font-medium ms-2">({peers.length})</span>
                </h2>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-text-muted">Loading verified peers...</p>
                </div>
              ) : peers.length === 0 ? (
                /* Clean 0 Peers Empty State (Requirement Phase 3.2) */
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    👥
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary mb-2">
                    {search || selectedDiscipline ? 'No Matching Peers Found' : 'لا يوجد زملاء مسجلون حالياً (0 Peers)'}
                  </h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto mb-6 leading-relaxed">
                    {search || selectedDiscipline
                      ? 'Try clearing your filters or search query to see all verified students.'
                      : 'أنت أول من يستكشف المنصة! بمجرد قيام طلاب آخرين بالتسجيل وتأكيد حساباتهم الرسمية، ستظهر بطاقاتهم الأكاديمية هنا للتعاون وتكوين الفرق.'}
                  </p>
                  <div className="flex justify-center gap-3">
                    {(search || selectedDiscipline) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setSelectedDiscipline(null);
                        }}
                        className="rounded-xl"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Link href="/onboarding/register">
                      <Button variant="primary" size="sm" className="rounded-xl font-bold">
                        Invite Classmates
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {peers.map((peer) => (
                    <div
                      key={peer.id}
                      className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start gap-3.5 mb-4">
                          <Link href={`/peers/${peer.id}`} className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-400 text-white font-black flex items-center justify-center text-lg shadow-sm">
                              {peer.name.charAt(0)}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/peers/${peer.id}`} className="hover:text-brand-orange transition-colors">
                              <h3 className="font-bold text-text-primary text-base truncate">{peer.fullName || peer.name}</h3>
                            </Link>
                            <p className="text-xs text-brand-orange font-semibold truncate">{peer.specialty}</p>
                            <p className="text-[11px] text-text-muted truncate">{peer.college}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex-shrink-0">
                            {peer.matchScore}%
                          </span>
                        </div>

                        <p className="text-xs text-text-body line-clamp-2 mb-4">
                          {peer.bio || 'Verified academic student actively collaborating on engineering & business systems.'}
                        </p>

                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Verified Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {peer.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="bg-gray-100 text-text-primary text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                {skill}
                              </span>
                            ))}
                            {peer.skills.length > 3 && (
                              <span className="bg-gray-100 text-text-muted text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                                +{peer.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                        <Link href={`/peers/${peer.id}`}>
                          <Button variant="ghost" size="sm" className="px-2.5 py-1 text-xs font-bold text-text-muted hover:text-brand-orange">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          variant={connectedIds[peer.id] ? 'outline' : 'primary'}
                          size="sm"
                          className="px-3 py-1.5 text-xs font-bold rounded-xl"
                          onClick={() => handleConnect(peer.id)}
                          disabled={connectedIds[peer.id]}
                        >
                          {connectedIds[peer.id] ? (
                            <>
                              <Check size={13} className="me-1 text-green-600" /> Requested
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} className="me-1" /> Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggest modal */}
        {showSuggest && (
          <SuggestTeammatesModal
            peers={peers}
            onClose={() => setShowSuggest(false)}
            onConnect={handleConnect}
          />
        )}
      </div>
    </AppLayout>
  );
}
