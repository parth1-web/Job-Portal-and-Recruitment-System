import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';

interface HomeViewProps {
  jobs: Job[];
  savedJobIds: Set<string>;
  onToggleSave: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onApply: (job: Job) => void;
  onSearchSubmit: (searchTerm: string, location: string) => void;
  onNavigateToJobs: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  jobs,
  savedJobIds,
  onToggleSave,
  onSelectJob,
  onApply,
  onSearchSubmit,
  onNavigateToJobs,
  onOpenAuth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchTerm, location);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-blue-50/80 via-slate-50 to-white dark:from-[#080d1a] dark:via-[#0b1226] dark:to-[#070b14] text-slate-900 dark:text-white border-b border-blue-200/60 dark:border-blue-500/20 transition-colors">
        
        {/* Background Glowing Sapphire Accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-500/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-300/80 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Executive & Technical Talent Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-5 font-display text-slate-900 dark:text-white">
            Accelerate Your Next <br />
            <span className="blue-gradient-text">Career Milestone</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Direct Web API synchronization with top engineering & executive hiring teams. Real-time interview scheduling, automated skill gap matching, and transparent salary telemetry.
          </p>

          {/* Hero Search Box */}
          <form 
            onSubmit={handleSearch}
            className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-500/10 dark:shadow-2xl dark:shadow-black/80 border border-blue-200/80 dark:border-blue-500/30 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 backdrop-blur-xl transition-all"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 w-full">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, key skills, or target company..."
                className="w-full text-sm text-slate-900 dark:text-white bg-transparent focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 w-full">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location or Remote"
                className="w-full text-sm text-slate-900 dark:text-white bg-transparent focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              Explore Openings
            </button>
          </form>

          {/* Stats Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 mt-12 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">10,000+</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block">Live API Postings</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">0.2 ms</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block">Pipeline Latency</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">50,000+</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block">Active Candidates</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">98.4%</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block">Placement Accuracy</span>
            </div>
          </div>

        </div>
      </section>

      {/* Value Propositions / Why Choose JobPortal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Why Choose JobPortal?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Built from the ground up for modern professionals and hiring teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Smart Matching</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Algorithm matches your specific skills, experience, and salary preferences with ideal opportunities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Verified Companies</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every employer and company profile is rigorously verified to guarantee safe and legitimate applications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">One-Click Apply</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply to roles in seconds with pre-saved resumes and monitor status progression in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Interview Pipeline</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct video meeting sync, automated interview reminders, and candidate feedback channels.
            </p>
          </div>

        </div>
      </section>

      {/* Featured / Latest Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Latest Job Openings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore freshly published positions from top technology and creative innovators.
            </p>
          </div>

          <button
            onClick={onNavigateToJobs}
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.has(job.id)}
              onToggleSave={onToggleSave}
              onSelectJob={onSelectJob}
              onApply={onApply}
            />
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-700 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Ready to accelerate your career or find top talent?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 mb-8 leading-relaxed">
              Join thousands of professionals and high-growth employers building the future on JobPortal.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Sign Up as Candidate
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3 bg-indigo-800/80 hover:bg-indigo-800 text-white font-bold text-sm rounded-xl border border-indigo-400/40 transition-all cursor-pointer"
              >
                Post Jobs as Employer
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Briefcase className="w-96 h-96 text-white" />
          </div>
        </div>
      </section>

    </div>
  );
};
