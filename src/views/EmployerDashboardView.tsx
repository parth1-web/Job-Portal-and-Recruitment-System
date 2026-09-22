import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Building2, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ExternalLink,
  DollarSign,
  MapPin,
  Sparkles,
  FileText,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { Job, JobApplication, Interview, CompanyProfile, ApplicationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreateJobModal } from '../components/CreateJobModal';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { 
  employerJobsApi, 
  employerApplicationsApi, 
  interviewsApi, 
  profileApi 
} from '../services/api';

export const EmployerDashboardView: React.FC = () => {
  const { user, companyProfile, refreshProfiles } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants' | 'interviews' | 'company'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Selected items
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<JobApplication | null>(null);

  // Filters
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState<string>('all');
  const [applicantSearch, setApplicantSearch] = useState('');

  // Company Profile Form
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySuccessMsg, setCompanySuccessMsg] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [jobsData, interviewsData] = await Promise.all([
        employerJobsApi.getMyJobs().catch(() => []),
        interviewsApi.getMyInterviews().catch(() => [])
      ]);

      const jobsList = Array.isArray(jobsData) ? jobsData : ((jobsData as any)?.items || []);
      setJobs(jobsList);
      setInterviews(Array.isArray(interviewsData) ? interviewsData : ((interviewsData as any)?.items || []));

      // Fetch all applications across company jobs
      if (jobsList.length > 0) {
        const appsPromises = jobsList.map((j: Job) => employerApplicationsApi.getByJob(j.id).catch(() => []));
        const allAppsResults = await Promise.all(appsPromises);
        const flattened = allAppsResults.flatMap(res => Array.isArray(res) ? res : ((res as any)?.items || []));
        
        // Remove duplicates if any
        const uniqueAppsMap = new Map();
        flattened.forEach(a => uniqueAppsMap.set(a.id, a));
        setApplications(Array.from(uniqueAppsMap.values()));
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error('Error loading employer dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (companyProfile) {
      setCompanyName(companyProfile.name || '');
      setIndustry(companyProfile.industry || '');
      setSize(companyProfile.size || '');
      setLocation(companyProfile.location || '');
      setWebsiteUrl(companyProfile.websiteUrl || '');
      setDescription(companyProfile.description || '');
    }
  }, [companyProfile]);

  const handleUpdateAppStatus = async (app: JobApplication, newStatus: ApplicationStatus) => {
    try {
      const updated = await employerApplicationsApi.updateStatus(app.jobId, app.id, newStatus);
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error('Failed to update application status:', e);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await employerJobsApi.delete(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setApplications(prev => prev.filter(a => a.jobId !== jobId));
    } catch (e) {
      console.error('Failed to delete job:', e);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const isCurrentlyActive = job.status === 'Active';
    try {
      if (isCurrentlyActive) {
        await employerJobsApi.closeJob(job.id);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Closed' } : j));
      } else {
        await employerJobsApi.publishJob(job.id);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Active' } : j));
      }
    } catch (e) {
      console.error('Failed to toggle job status:', e);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    setCompanySuccessMsg('');
    try {
      await profileApi.updateCompanyProfile({
        name: companyName,
        industry,
        size,
        location,
        websiteUrl,
        description,
      });

      await refreshProfiles();
      setCompanySuccessMsg('Company profile updated successfully!');
      setTimeout(() => setCompanySuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to save company profile:', e);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJobIdFilter !== 'all' && app.jobId !== selectedJobIdFilter) return false;
    if (applicantSearch.trim()) {
      const s = applicantSearch.toLowerCase();
      return (
        app.candidateName.toLowerCase().includes(s) ||
        app.candidateEmail.toLowerCase().includes(s) ||
        app.jobTitle.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Post Job Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Employer Management Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your company listings, review incoming applicants, and schedule candidate interviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => {
              setJobToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('jobs')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'jobs' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Listings</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {jobs.length}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('applicants')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'applicants' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Applicants</span>
            <Users className="w-4 h-4 text-emerald-500" />
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
          onClick={() => setActiveTab('company')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'company' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Profile</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate block mt-2">
            {companyProfile?.name || 'Nexus Tech Systems'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Postings ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'applicants'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Applicant Pipeline ({applications.length})
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
          onClick={() => setActiveTab('company')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Company Profile
        </button>
      </div>

      {/* Tab 1: Manage Job Postings */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No jobs posted yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Create your first job listing to start receiving qualified candidates.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl cursor-pointer"
              >
                Post a Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md">
                        {job.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                        job.status === 'Active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {job.employmentType} • {job.workMode}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>
                        ${(job.salaryMin || 0) / 1000}k - ${(job.salaryMax || 0) / 1000}k
                      </span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {job.applicationsCount} applicants
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => handleToggleJobStatus(job)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        job.status === 'Active'
                          ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                          : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                    >
                      {job.status === 'Active' ? 'Close Listing' : 'Publish Listing'}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedJobIdFilter(job.id);
                        setActiveTab('applicants');
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Applicants ({job.applicationsCount})
                    </button>
                    <button
                      onClick={() => {
                        setJobToEdit(job);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Edit job"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applicant Pipeline */}
      {activeTab === 'applicants' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                placeholder="Search candidates by name, email, or role..."
                className="w-full text-xs text-slate-900 dark:text-white bg-transparent focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">Filter by Job:</span>
              <select
                value={selectedJobIdFilter}
                onChange={(e) => setSelectedJobIdFilter(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Job Listings</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No applicants matching criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Applications submitted for your job postings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {app.jobTitle}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-xs text-slate-400">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {app.candidateName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.candidateTitle || 'Candidate'} • {app.candidateEmail} {app.candidatePhone ? `• ${app.candidatePhone}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app, e.target.value as ApplicationStatus)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Accepted">Accepted / Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => setSelectedAppForInterview(app)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Interview
                      </button>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Candidate Note / Cover Letter:</span>
                      <p className="leading-relaxed italic">"{app.coverLetter}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Attached Resume: <strong className="text-slate-700 dark:text-slate-300">{app.resumeFileName || 'Resume.pdf'}</strong>
                    </span>
                    <span className="text-[11px]">
                      Pipeline Status: <strong className="text-indigo-600 dark:text-indigo-400">{app.status}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interviews */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No interviews scheduled yet</h3>
              <p className="text-xs text-slate-500 mt-1">Schedule discussions directly from the Applicant Pipeline tab.</p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {interview.interviewType}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{interview.jobTitle}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Candidate: {interview.candidateName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
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

                <div className="flex items-center gap-3 shrink-0">
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Video className="w-4 h-4" />
                      Start Meeting
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Company Information</h2>
              <p className="text-xs text-slate-500">Information displayed on your public job listings.</p>
            </div>
            {companySuccessMsg && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg">
                {companySuccessMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. AI & Cloud Software"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 50-200 Employees"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Headquarters Location
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
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Company Description & Mission
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="About your company culture, technology stack, and engineering mission..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingCompany}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isSavingCompany ? 'Saving...' : 'Save Company Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        jobToEdit={jobToEdit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setJobToEdit(null);
        }}
        onJobCreated={(savedJob) => {
          setJobs(prev => {
            const exists = prev.some(j => j.id === savedJob.id);
            if (exists) return prev.map(j => j.id === savedJob.id ? savedJob : j);
            return [savedJob, ...prev];
          });
        }}
      />

      <ScheduleInterviewModal
        isOpen={Boolean(selectedAppForInterview)}
        application={selectedAppForInterview}
        onClose={() => setSelectedAppForInterview(null)}
        onSuccess={(newInterview) => {
          setInterviews(prev => [newInterview, ...prev]);
          if (selectedAppForInterview) {
            setApplications(prev => prev.map(a => a.id === selectedAppForInterview.id ? { ...a, status: 'Interview Scheduled' } : a));
          }
        }}
      />

    </div>
  );
};
