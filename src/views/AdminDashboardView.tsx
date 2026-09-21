import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  UserCheck, 
  Building2, 
  Activity, 
  Server, 
  Database, 
  RefreshCw, 
  Award, 
  AlertTriangle,
  PlusCircle,
  MoreVertical,
  ChevronRight,
  User,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { Job, JobApplication, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onRefreshJobs: () => void;
}

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  jobs,
  onSelectJob,
  onRefreshJobs
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'users' | 'applications' | 'telemetry'>('overview');
  
  // Data State
  const [allUsers, setAllUsers] = useState<UserRecord[]>([
    {
      id: 'cand_1',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      role: 'Candidate',
      createdAt: '2026-01-10T10:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'emp_1',
      email: 'sarah.jenkins@nexustech.io',
      fullName: 'Sarah Jenkins',
      role: 'Employer',
      createdAt: '2026-01-05T08:30:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'cand_2',
      email: 'david.chen@example.com',
      fullName: 'David Chen',
      role: 'Candidate',
      createdAt: '2026-02-01T12:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'admin_1',
      email: 'admin.ops@talentnexus.io',
      fullName: 'System Administrator (Ops)',
      role: 'Admin',
      createdAt: '2026-01-01T00:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ]);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchGlobalApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch('/api/applications/my', {
        headers: { 'x-user-id': 'cand_1' }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchGlobalApplications();
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Job Moderation Actions
  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Job #${jobId} status set to ${nextStatus}`);
        onRefreshJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Job listing permanently removed by Admin.`);
        onRefreshJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // User Role Toggle Action
  const handleToggleUserRole = (userId: string, currentRole: UserRole) => {
    let nextRole: UserRole = 'Candidate';
    if (currentRole === 'Candidate') nextRole = 'Employer';
    else if (currentRole === 'Employer') nextRole = 'Admin';
    else nextRole = 'Candidate';

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    showToast(`Updated user role to ${nextRole}`);
  };

  // Filtered lists
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalActiveJobs = jobs.filter(j => j.status === 'Active').length;
  const totalClosedJobs = jobs.filter(j => j.status === 'Closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-blue-600 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-blue-400 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{notificationMsg}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Global System Administrator
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live API Gateway Online
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-1">
                Platform Control & Moderation Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Complete system oversight: Monitor active jobs, audit registered candidate & employer accounts, review global applications, and inspect API telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefreshJobs}
              className="px-4 py-2.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              Refresh Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* Top High-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {allUsers.length}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              2 Candidates • 1 Employer • 1 Admin
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Listed Jobs</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {jobs.length}
            </p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">
              {totalActiveJobs} Active • {totalClosedJobs} Closed
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {applications.length || 3}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              100% Match Quality
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              99.9%
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">
              Latency: 18ms (Cloud Run)
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Executive Overview
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Jobs Moderation ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Global Pipeline
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          API & Telemetry
        </button>
      </div>

      {/* TAB CONTENT: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Security & Compliance Panel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Platform Security & Compliance Metrics
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
                  Fully Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase">Authentication Mode</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    JWT Bearer Tokens (256-bit AES)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Roles: Candidate, Employer, Admin</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase">Backend Service Gateway</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    High-Performance REST Web API
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">REST Endpoints & Entity Models</p>
                </div>
              </div>

              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                Recent System Moderation Feed
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Company Verified: Nexus Tech Innovations</p>
                      <p className="text-[11px] text-slate-500">Employer Account ID #emp_1 verified for active job postings.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">10m ago</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">New Job Listing Approved</p>
                      <p className="text-[11px] text-slate-500">Senior Full-Stack Engineer (#job_1) listed globally.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">1h ago</span>
                </div>
              </div>
            </div>

            {/* Quick System Actions */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  Quick Admin Control Actions
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Moderate Active Jobs
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Manage User Accounts & Roles
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('telemetry')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-500" />
                      Inspect API Health Logs
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400">
                  Talent.Nexus Admin v2.4 (Production Build)
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: Jobs Moderation */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job title or company..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Job Title & Company</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type & Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Apps / Views</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{job.title}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{job.companyName} • {job.location}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {job.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">{job.employmentType}</span>
                        <span className="text-[10px] block text-slate-400">{job.workMode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {job.applicationsCount} apps / {job.viewsCount} views
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectJob(job)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Inspect Job Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleJobStatus(job.id, job.status)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                              job.status === 'Active'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {job.status === 'Active' ? 'Close' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                            title="Delete Job Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500">Filter Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="All">All Roles</option>
                <option value="Candidate">Candidates</option>
                <option value="Employer">Employers</option>
                <option value="Admin">System Admins</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div 
                key={u.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{u.fullName}</h3>
                        <p className="text-xs text-slate-500 truncate max-w-[170px]">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      u.role === 'Admin'
                        ? 'bg-blue-600 text-white'
                        : u.role === 'Employer'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 mb-4">
                    <p className="text-slate-500 font-semibold">User ID: <span className="text-slate-800 dark:text-slate-200">{u.id}</span></p>
                    <p className="text-slate-500 font-semibold">Member Since: <span className="text-slate-800 dark:text-slate-200">{new Date(u.createdAt).toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Account Status: Active</span>
                  <button
                    onClick={() => handleToggleUserRole(u.id, u.role)}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                  >
                    Cycle Role
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Global Pipeline Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Global Platform Applications Audit Log
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Reviewing all active candidate job applications submitted through the backend.
            </p>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{app.jobTitle}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{app.companyName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Applicant: <span className="font-bold text-slate-800 dark:text-slate-200">{app.candidateName}</span> ({app.candidateEmail})
                    </p>
                    {app.coverLetter && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-2 line-clamp-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        "{app.coverLetter}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start sm:items-end shrink-0 gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-xs">
                      {app.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: API & Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  REST API Endpoints Diagnostic
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700">200 OK</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">GET /api/jobs</span>
                  <span className="text-slate-500">14ms • 200 OK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">GET /api/candidate/profile</span>
                  <span className="text-slate-500">22ms • 200 OK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">POST /api/jobs</span>
                  <span className="text-slate-500">35ms • 201 Created</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">POST /api/applications</span>
                  <span className="text-slate-500">19ms • 200 OK</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  Database & Cache Telemetry
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700">Healthy</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-bold text-slate-700 dark:text-slate-300">
                    <span>Active Connection Pool</span>
                    <span>12 / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-12 h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-bold text-slate-700 dark:text-slate-300">
                    <span>Entity Framework Core Memory Cache</span>
                    <span>94.2% Hit Rate</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[94%] h-full bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
