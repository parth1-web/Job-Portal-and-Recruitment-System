import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Briefcase, 
  Building2, 
  DollarSign, 
  MapPin, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { Job, EmploymentType, WorkMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { employerJobsApi } from '../services/api';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
  jobToEdit?: Job | null;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
  jobToEdit,
}) => {
  const { user, companyProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [location, setLocation] = useState('San Francisco, CA');
  const [salaryMin, setSalaryMin] = useState<number | ''>(120000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(160000);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState('TypeScript, React, Node.js');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);

  const handleGenerateAiJobDescription = async () => {
    if (!title.trim()) {
      setError('Please enter a Job Title first to generate content with AI.');
      return;
    }
    setIsGeneratingAiDesc(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          workMode,
          keySkills: skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
        if (data.requirements && Array.isArray(data.requirements)) {
          setRequirements(data.requirements.join('\n'));
        }
        if (data.benefits && Array.isArray(data.benefits)) {
          setBenefits(data.benefits.join('\n'));
        }
      }
    } catch (e) {
      console.error('Failed to auto-generate job description:', e);
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title);
      setCategory(jobToEdit.category);
      setEmploymentType(jobToEdit.employmentType);
      setWorkMode(jobToEdit.workMode);
      setLocation(jobToEdit.location);
      setSalaryMin(jobToEdit.salaryMin || '');
      setSalaryMax(jobToEdit.salaryMax || '');
      setDescription(jobToEdit.description);
      setRequirements(jobToEdit.requirements.join('\n'));
      setBenefits(jobToEdit.benefits.join('\n'));
      setSkills(jobToEdit.skills.join(', '));
      setDeadline(jobToEdit.deadline || '');
    } else {
      setTitle('');
      setDescription('');
      setRequirements('3+ years of professional engineering experience\nDeep proficiency with modern web architectures\nStrong communication and problem solving');
      setBenefits('Comprehensive medical and dental health coverage\nAnnual learning and technology budget\nFlexible remote-first working setup');
      setSkills('React, TypeScript, Node.js, PostgreSQL');
    }
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and job description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      category,
      employmentType,
      workMode,
      location,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      description,
      requirements: requirements.split('\n').filter(Boolean),
      benefits: benefits.split('\n').filter(Boolean),
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      deadline: deadline || undefined,
    };

    try {
      const saved = jobToEdit 
        ? await employerJobsApi.update(jobToEdit.id, payload)
        : await employerJobsApi.create(payload);

      onJobCreated(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {jobToEdit ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                <option value="Product Management">Product Management</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Min Annual Salary ($)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 100000"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Max Annual Salary ($)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 150000"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. TypeScript, React, Docker, GraphQL"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Job Description *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiJobDescription}
                disabled={isGeneratingAiDesc}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{isGeneratingAiDesc ? 'Generating with AI...' : 'Auto-Generate with AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role responsibilities and mission..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Key Requirements (one per line)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="5+ years in software engineering&#10;Experience with microservices"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Benefits & Perks (one per line)
            </label>
            <textarea
              rows={2}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Health, dental & vision insurance&#10;401(k) matching"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30"
            >
              {isSubmitting ? 'Saving...' : jobToEdit ? 'Update Job' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
