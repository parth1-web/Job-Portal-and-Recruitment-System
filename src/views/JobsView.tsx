import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  ChevronDown, 
  DollarSign, 
  Briefcase,
  Building2 
} from 'lucide-react';
import { Job, JobFilter } from '../types';
import { JobCard } from '../components/JobCard';

interface JobsViewProps {
  jobs: Job[];
  savedJobIds: Set<string>;
  onToggleSave: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onApply: (job: Job) => void;
  initialSearch?: string;
  initialLocation?: string;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  savedJobIds,
  onToggleSave,
  onSelectJob,
  onApply,
  initialSearch = '',
  initialLocation = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState('All Categories');
  const [employmentType, setEmploymentType] = useState('All Types');
  const [workMode, setWorkMode] = useState('All Modes');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'salary_high' | 'salary_low' | 'popular'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    'All Categories',
    'Software Engineering',
    'Design & Creative',
    'Artificial Intelligence',
    'DevOps & Infrastructure',
    'Product Management',
    'Data & Analytics',
    'Marketing & Sales',
    'Finance & Accounting'
  ];

  const employmentTypes = ['All Types', 'Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];
  const workModes = ['All Modes', 'Remote', 'Hybrid', 'On-site'];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search term filter
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(s);
        const matchesCompany = job.companyName.toLowerCase().includes(s);
        const matchesSkill = job.skills.some(sk => sk.toLowerCase().includes(s));
        const matchesDesc = job.description.toLowerCase().includes(s);
        if (!matchesTitle && !matchesCompany && !matchesSkill && !matchesDesc) return false;
      }

      // Location filter
      if (location.trim()) {
        const loc = location.toLowerCase();
        const matchesLoc = job.location.toLowerCase().includes(loc) || job.companyLocation.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }

      // Category filter
      if (category !== 'All Categories' && job.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // Employment Type
      if (employmentType !== 'All Types' && job.employmentType.toLowerCase() !== employmentType.toLowerCase()) {
        return false;
      }

      // Work Mode
      if (workMode !== 'All Modes' && job.workMode.toLowerCase() !== workMode.toLowerCase()) {
        return false;
      }

      // Salary Filter
      if (minSalary > 0 && (job.salaryMax || job.salaryMin || 0) < minSalary) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary_high') return (b.salaryMax || 0) - (a.salaryMax || 0);
      if (sortBy === 'salary_low') return (a.salaryMin || 0) - (b.salaryMin || 0);
      if (sortBy === 'popular') return b.applicationsCount - a.applicationsCount;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [jobs, searchTerm, location, category, employmentType, workMode, minSalary, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setCategory('All Categories');
    setEmploymentType('All Types');
    setWorkMode('All Modes');
    setMinSalary(0);
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || location || category !== 'All Categories' || employmentType !== 'All Types' || workMode !== 'All Modes' || minSalary > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Search Bar */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Job Opportunities
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Browse {jobs.length} open tech, engineering, product, and creative roles.
        </p>

        {/* Global Search Bar */}
        <div className="mt-6 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, skill (e.g. React, Python), or company..."
              className="w-full text-sm text-slate-900 dark:text-white bg-transparent focus:outline-hidden placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />

          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Remote..."
              className="w-full text-sm text-slate-900 dark:text-white bg-transparent focus:outline-hidden placeholder:text-slate-400"
            />
            {location && (
              <button onClick={() => setLocation('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '(Active)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Work Mode
            </label>
            <div className="space-y-1.5">
              {workModes.map((mode) => (
                <label key={mode} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="workMode"
                    checked={workMode === mode}
                    onChange={() => setWorkMode(mode)}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Employment Type
            </label>
            <div className="space-y-1.5">
              {employmentTypes.map((type) => (
                <label key={type} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    checked={employmentType === type}
                    onChange={() => setEmploymentType(type)}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Min Salary
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {minSalary === 0 ? 'Any' : `$${minSalary / 1000}k+ / yr`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={10000}
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$0</span>
              <span>$100k</span>
              <span>$200k+</span>
            </div>
          </div>

        </div>

        {/* Results Column */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Results Bar with Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-bold">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'position' : 'positions'}
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
                <option value="popular">Most Applications</option>
              </select>
            </div>
          </div>

          {/* Job List / Grid */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No matching jobs found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                Try adjusting your search criteria, clearing specific filters, or expanding your search radius.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
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
          )}

        </div>

      </div>

    </div>
  );
};
