import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Job } from './types';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { JobsView } from './views/JobsView';
import { CandidateDashboardView } from './views/CandidateDashboardView';
import { EmployerDashboardView } from './views/EmployerDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { NotificationsView } from './views/NotificationsView';
import { JobDetailsModal } from './components/JobDetailsModal';
import { ApplyModal } from './components/ApplyModal';
import { AuthModal } from './views/AuthModal';
import { Briefcase, Heart, Shield, Sparkles, Building2, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export function App() {
  const { user, isCandidate, isEmployer, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'dashboard' | 'notifications'>('home');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Search handoff from Home to Jobs view
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Modals state
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Load all jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load jobs:', e);
    }
  };

  // Load candidate saved jobs
  const fetchSavedJobs = async () => {
    if (!user) {
      setSavedJobIds(new Set());
      return;
    }
    try {
      const res = await fetch(`/api/saved-jobs?candidateId=${user.id}`);
      if (res.ok) {
        const savedJobs: Job[] = await res.json();
        setSavedJobIds(new Set(savedJobs.map(j => j.id)));
      }
    } catch (e) {
      console.error('Failed to load saved jobs:', e);
    }
  };

  // Load unread notifications count
  const fetchNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`, {
        headers: { 'x-user-id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        } else {
          const list = Array.isArray(data) ? data : (data?.items || []);
          setUnreadCount(list.filter((n: any) => !n.isRead).length);
        }
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchSavedJobs();
    fetchNotifications();
  }, [user?.id]);

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    const isAlreadySaved = savedJobIds.has(jobId);
    try {
      if (isAlreadySaved) {
        await fetch(`/api/saved-jobs/${jobId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id }
        });
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({ jobId })
        });
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (e) {
      console.error('Failed to toggle save job:', e);
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setSelectedJobForApply(job);
  };

  const handleSearchSubmitFromHero = (searchTerm: string, location: string) => {
    setSearchQuery(searchTerm);
    setSearchLocation(location);
    setActiveTab('jobs');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadNotificationsCount={unreadCount}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            jobs={jobs}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSaveJob}
            onSelectJob={(j) => setSelectedJobForDetails(j)}
            onApply={handleApplyClick}
            onSearchSubmit={handleSearchSubmitFromHero}
            onNavigateToJobs={() => {
              setSearchQuery('');
              setSearchLocation('');
              setActiveTab('jobs');
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSaveJob}
            onSelectJob={(j) => setSelectedJobForDetails(j)}
            onApply={handleApplyClick}
            initialSearch={searchQuery}
            initialLocation={searchLocation}
          />
        )}

        {activeTab === 'dashboard' && (
          isAdmin ? (
            <AdminDashboardView
              jobs={jobs}
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onRefreshJobs={fetchJobs}
            />
          ) : isEmployer ? (
            <EmployerDashboardView />
          ) : (
            <CandidateDashboardView
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onApply={handleApplyClick}
            />
          )
        )}

        {activeTab === 'notifications' && (
          <NotificationsView />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Talent<span className="text-blue-600 dark:text-blue-400">Nexus</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering candidates, recruiters, and platform administrators with high-performance hiring tools, transparent salary metrics, and end-to-end recruitment management.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              For Job Seekers
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => { setActiveTab('jobs'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Browse Remote & Tech Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Candidate Dashboard & Saved Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Resume & Skill Profile Builder
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              For Employers & Recruiters
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Post Job Listings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Applicant Pipeline & Review
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Schedule Video Interviews
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              System & Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Migrated to React + Node.js</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>REST API + In-Memory Database</span>
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Port 3000 • Single-Process Express + Vite SPA
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          <p>© 2026 JobPortal & Recruitment System. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <JobDetailsModal
        job={selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onApply={(j) => handleApplyClick(j)}
        isSaved={selectedJobForDetails ? savedJobIds.has(selectedJobForDetails.id) : false}
        onToggleSave={handleToggleSaveJob}
      />

      <ApplyModal
        job={selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={(application) => {
          fetchNotifications();
          setActiveTab('dashboard');
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}
export default App;
