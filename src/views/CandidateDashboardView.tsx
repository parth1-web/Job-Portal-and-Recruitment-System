import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bookmark, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  FileText, 
  Plus, 
  Trash2, 
  MapPin, 
  Building2, 
  DollarSign, 
  AlertCircle,
  Video,
  ChevronRight,
  Sparkles,
  Star,
  Upload,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import { JobApplication, Job, Interview, CandidateProfile, ApplicationStatus, Resume } from '../types';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/JobCard';
import { 
  candidateApplicationsApi, 
  savedJobsApi, 
  interviewsApi, 
  profileApi, 
  resumesApi 
} from '../services/api';

interface CandidateDashboardViewProps {
  onSelectJob: (job: Job) => void;
  onApply: (job: Job) => void;
}

export const CandidateDashboardView: React.FC<CandidateDashboardViewProps> = ({
  onSelectJob,
  onApply,
}) => {
  const { user, candidateProfile, refreshProfiles } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'interviews' | 'resumes' | 'profile' | 'copilot'>('applications');
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Copilot state
  const [targetJobTitle, setTargetJobTitle] = useState('Senior Full-Stack Engineer');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const handleAnalyzeResumeWithAi = async () => {
    setIsAnalyzingResume(true);
    try {
      const res = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.id || 'cand_1',
          targetJobTitle,
          resumeText: `${title} | Skills: ${skillsString} | Experience: ${experience}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data);
      }
    } catch (e) {
      console.error('Failed to analyze resume:', e);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [newResumeName, setNewResumeName] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [appsData, savedData, interviewsData, resumesData] = await Promise.all([
        candidateApplicationsApi.getMyApplications().catch(() => []),
        savedJobsApi.getSavedJobs().catch(() => []),
        interviewsApi.getMyInterviews().catch(() => []),
        resumesApi.getMyResumes().catch(() => candidateProfile?.resumes || [])
      ]);

      setApplications(Array.isArray(appsData) ? appsData : ((appsData as any)?.items || []));
      setSavedJobs(Array.isArray(savedData) ? savedData : ((savedData as any)?.items || []));
      setInterviews(Array.isArray(interviewsData) ? interviewsData : ((interviewsData as any)?.items || []));
      setResumes(Array.isArray(resumesData) ? resumesData : ((resumesData as any)?.items || []));
    } catch (e) {
      console.error('Error loading candidate dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (candidateProfile) {
      setFullName(candidateProfile.fullName || '');
      setTitle(candidateProfile.title || '');
      setBio(candidateProfile.bio || '');
      setLocation(candidateProfile.location || '');
      setSkillsString(candidateProfile.skills?.join(', ') || '');
      setExperience(candidateProfile.experience || '');
      setEducation(candidateProfile.education || '');
      setPhone(candidateProfile.phone || '');
      if (candidateProfile.resumes && resumes.length === 0) {
        setResumes(candidateProfile.resumes);
      }
    }
  }, [candidateProfile]);

  const handleWithdrawApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await candidateApplicationsApi.withdraw(appId);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Withdrawn' } : a));
    } catch (e) {
      console.error('Failed to withdraw application:', e);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await savedJobsApi.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (e) {
      console.error('Failed to unsave job:', e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMsg('');
    try {
      await profileApi.updateCandidateProfile({
        fullName,
        title,
        bio,
        location,
        phone,
        skills: skillsString.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        education
      });

      await refreshProfiles();
      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSetPrimaryResume = async (resumeId: string) => {
    try {
      await resumesApi.setPrimary(resumeId);
      setResumes(prev => prev.map(r => ({
        ...r,
        isPrimary: r.id === resumeId
      })));
      await refreshProfiles();
    } catch (e) {
      console.error('Failed to set primary resume:', e);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumesApi.delete(resumeId);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      await refreshProfiles();
    } catch (e) {
      console.error('Failed to delete resume:', e);
    }
  };

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeName.trim()) return;
    setIsUploadingResume(true);
    try {
      const added = await resumesApi.upload({
        fileName: newResumeName.trim().endsWith('.pdf') ? newResumeName.trim() : `${newResumeName.trim()}.pdf`,
        fileUrl: `/uploads/${encodeURIComponent(newResumeName.trim())}`,
        fileSize: 184500,
        isPrimary: resumes.length === 0,
      });
      setResumes(prev => [...prev, added]);
      setNewResumeName('');
      await refreshProfiles();
    } catch (e) {
      console.error('Failed to add resume:', e);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Interview Scheduled':
        return 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Shortlisted':
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Under Review':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Withdrawn':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Overview Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Candidate Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName || 'Alex'}</span>. Track applications, interviews, and resume files.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('applications')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'applications' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Applications</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {applications.length}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('applications')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'applications' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Applications</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {applications.length}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('interviews')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'interviews' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interviews</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {interviews.length}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('saved')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'saved' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Jobs</span>
            <Bookmark className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {savedJobs.length}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('profile')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'profile' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resumes & Profile</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 block">
            {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'} Available
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          My Applications ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'interviews'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Scheduled Interviews ({interviews.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'saved'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Jobs ({savedJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Resumes
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'copilot'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          Resume & Skills Profiler
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">Browse open job postings and apply with your custom cover notes.</p>
            </div>
          ) : (
            applications.map((app) => (
              <div 
                key={app.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{app.companyName}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-xs text-slate-400">
                        Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {app.jobTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeColor(app.status)}`}>
                      {app.status}
                    </span>

                    {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                      <button
                        onClick={() => handleWithdrawApplication(app.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Withdraw application"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* History Timeline */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Application Progress & Status Updates
                    </span>
                    <div className="space-y-2">
                      {app.statusHistory.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{h.status}</span>
                            <span className="text-slate-400 text-[11px] ml-2">
                              {new Date(h.changedAt).toLocaleDateString()}
                            </span>
                            {h.notes && (
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{h.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {app.coverLetter && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Note:</span>
                    <p className="italic leading-relaxed">"{app.coverLetter}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Interviews */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No interviews scheduled yet</h3>
              <p className="text-xs text-slate-500 mt-1">When an employer schedules an interview with you, it will appear here with calendar and meeting links.</p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {interview.interviewType}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{interview.companyName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {interview.jobTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {new Date(interview.scheduledAt).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {interview.durationMinutes} Minutes
                    </span>
                  </div>
                  {interview.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Agenda:</span> {interview.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Video className="w-4 h-4" />
                      Join Video Meeting
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Saved Jobs */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No saved jobs</h3>
              <p className="text-xs text-slate-500 mt-1">Bookmark positions while browsing to apply or compare later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={true}
                  onToggleSave={handleUnsaveJob}
                  onSelectJob={onSelectJob}
                  onApply={onApply}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile & Resumes */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Candidate Information</h2>
                <p className="text-xs text-slate-500">Keep your background details up to date for hiring teams.</p>
              </div>
              {saveSuccessMsg && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg">
                  {saveSuccessMsg}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Key Skills & Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="TypeScript, React, Node.js, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio summarizing your background and key passions..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Work Experience
                </label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Senior Engineer at Acme Corp (2022-Present)..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Resumes Management Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Resume Documents</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Manage your CV versions. Mark a primary resume to auto-attach to incoming job applications.
              </p>

              {/* Upload form */}
              <form onSubmit={handleAddResume} className="mb-6 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResumeName}
                    onChange={(e) => setNewResumeName(e.target.value)}
                    placeholder="e.g. Alex_Morgan_Resume_2026.pdf"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingResume || !newResumeName.trim()}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Resumes List */}
              <div className="space-y-3">
                {resumes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No resumes uploaded yet.</p>
                ) : (
                  resumes.map((resume) => (
                    <div 
                      key={resume.id}
                      className={`p-3 rounded-xl border transition-all ${
                        resume.isPrimary 
                          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/30' 
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className={`w-4 h-4 shrink-0 ${resume.isPrimary ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {resume.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(resume.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {resume.isPrimary ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md">
                              Primary
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetPrimaryResume(resume.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Set as primary"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Resume & Skills Profiler */}
      {activeTab === 'copilot' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Target Role & Skills Match Profiler
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                    Profile Audit
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit your candidate profile against target roles, identify skill gaps, and view recommended position fits.
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeResumeWithAi}
              disabled={isAnalyzingResume}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAnalyzingResume ? 'Analyzing Profile...' : 'Run Profile Audit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Role / Job Title
              </label>
              <input
                type="text"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, Lead Product Manager"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAnalyzeResumeWithAi}
                disabled={isAnalyzingResume}
                className="w-full px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                Analyze Target Role Match
              </button>
            </div>
          </div>

          {aiAnalysisResult ? (
            <div className="space-y-6 pt-4 animate-in fade-in duration-200">
              {/* Strength Score Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resume Strength Index</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {aiAnalysisResult.summary || 'Strong technical foundation with relevant framework expertise.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                      {aiAnalysisResult.strengthScore || 92}/100
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Strong Match</span>
                  </div>
                </div>
              </div>

              {/* Skills Gaps & Recommended Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Recommended Skill Enhancements
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {(aiAnalysisResult.skillGaps || ['Docker / Kubernetes Architecture', 'GraphQL & Microservices', 'CI/CD Pipeline Automation']).map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Suggested Position Fits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(aiAnalysisResult.recommendedTitles || ['Senior React Engineer', 'Full-Stack Developer (Node/C#)', 'Software Architect']).map((titleStr: string, i: number) => (
                      <span key={i} className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-900">
                        {titleStr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click "Run Profile Audit" above</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Analyze your bio, title, and candidate skills against target role requirements.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
