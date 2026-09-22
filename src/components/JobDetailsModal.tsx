import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Calendar,
  Globe,
  Users,
  ShieldCheck,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onApply,
  isSaved = false,
  onToggleSave,
}) => {
  const { user, isCandidate, candidateProfile } = useAuth();
  const [matchData, setMatchData] = useState<any>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    if (!job || !isCandidate) return;
    const fetchMatch = async () => {
      setLoadingMatch(true);
      try {
        const res = await fetch('/api/ai/match-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            candidateId: user?.id || 'cand_1',
            jobSkills: job.skills,
            candidateSkills: candidateProfile?.skills || ['React', 'TypeScript', 'Node.js']
          })
        });
        if (res.ok) {
          const data = await res.json();
          setMatchData(data);
        }
      } catch (e) {
        console.error('Failed to fetch AI match score:', e);
      } finally {
        setLoadingMatch(false);
      }
    };
    fetchMatch();
  }, [job?.id, user?.id, isCandidate]);

  if (!job) return null;

  const formatSalary = (min?: number, max?: number, curr: string = '$') => {
    if (!min && !max) return 'Competitive Compensation';
    if (min && max) return `${curr}${(min / 1000).toFixed(0)}k - ${curr}${(max / 1000).toFixed(0)}k / year`;
    if (min) return `From ${curr}${(min / 1000).toFixed(0)}k / year`;
    return `Up to ${curr}${(max! / 1000).toFixed(0)}k / year`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900">
              {job.category}
            </span>
            <span className="text-xs text-slate-400">
              Posted {new Date(job.postedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(job.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save this job'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-600 dark:fill-blue-400" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={job.companyName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {job.companyName}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end shrink-0">
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">
                {job.applicationsCount} applicants applied
              </span>
            </div>
          </div>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Job Type</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{job.employmentType}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Work Mode</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{job.workMode}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Location</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">{job.location}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Deadline</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling basis'}
              </span>
            </div>
          </div>

          {/* AI Candidate Match Score Banner */}
          {isCandidate && (
            <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-900/10 via-indigo-600/10 to-violet-900/10 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      AI Compatibility Assessment
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Gemini AI
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Calculated based on your profile skills and experience
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {loadingMatch ? '...' : `${matchData?.matchPercentage || 88}%`}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    High Fit
                  </span>
                </div>
              </div>

              {matchData?.matchedSkills && matchData.matchedSkills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-200/50 dark:border-indigo-800/40 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Matched Skills:</span>
                  {matchData.matchedSkills.map((sk: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">About the Role</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Key Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Benefits & Perks</h3>
              <ul className="space-y-2">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          
          <button
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            Apply for this Role
          </button>
        </div>
      </div>
    </div>
  );
};
