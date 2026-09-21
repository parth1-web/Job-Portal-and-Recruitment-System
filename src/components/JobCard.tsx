import React from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Briefcase, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onApply?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onSelectJob,
  onApply,
}) => {
  const formatSalary = (min?: number, max?: number, curr: string = '$') => {
    if (!min && !max) return 'Competitive Salary';
    if (min && max) return `${curr}${(min / 1000).toFixed(0)}k - ${curr}${(max / 1000).toFixed(0)}k / year`;
    if (min) return `From ${curr}${(min / 1000).toFixed(0)}k / year`;
    return `Up to ${curr}${(max! / 1000).toFixed(0)}k / year`;
  };

  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case 'Remote':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Hybrid':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-250 flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Company Logo, Title, Bookmark */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs group-hover:border-blue-500/40 transition-colors">
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={job.companyName} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {job.companyName}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h3 
                onClick={() => onSelectJob(job)}
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1 mt-0.5 font-display"
              >
                {job.title}
              </h3>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-400 hover:text-blue-600 border-slate-200 dark:border-slate-700'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save job'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Badges: Location, WorkMode, Type, Salary */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border font-bold text-[11px] ${getWorkModeBadge(job.workMode)}`}>
            {job.workMode}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-100 dark:border-blue-900/50">
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            {job.employmentType}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-extrabold text-[11px] ml-auto sm:ml-0">
            <DollarSign className="w-3.5 h-3.5 -mr-1" />
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed font-normal">
          {job.description}
        </p>

        {/* Skills Tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200/50 dark:border-slate-700/50"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Applicants count & Action button */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {job.applicationsCount} {job.applicationsCount === 1 ? 'applicant' : 'applicants'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectJob(job)}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Details
          </button>
          
          {onApply && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply(job);
              }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1"
            >
              Apply
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
