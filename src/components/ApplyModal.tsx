import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Send,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { candidateApplicationsApi } from '../services/api';

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onSuccess: (application: any) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  onClose,
  onSuccess,
}) => {
  const { user, candidateProfile } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResume, setSelectedResume] = useState(
    candidateProfile?.resumes?.[0]?.fileName || 'Alex_Morgan_Software_Engineer_2026.pdf'
  );
  const [customResumeName, setCustomResumeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingAiLetter, setIsGeneratingAiLetter] = useState(false);

  const handleGenerateAiLetter = async () => {
    if (!job) return;
    setIsGeneratingAiLetter(true);
    try {
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: user?.id || 'cand_1',
          candidateProfile
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coverLetter) {
          setCoverLetter(data.coverLetter);
        }
      }
    } catch (e) {
      console.error('Failed to generate cover letter:', e);
    } finally {
      setIsGeneratingAiLetter(false);
    }
  };

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const resumeToUse = customResumeName || selectedResume;
      const data = await candidateApplicationsApi.apply({
        jobId: job.id,
        candidateId: user?.id || 'cand_1',
        coverLetter,
        resumeFileName: resumeToUse,
      });

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Apply to {job.companyName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{job.title}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Candidate Info Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Applicant:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName || 'Alex Morgan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'alex.morgan@example.com'}</span>
            </div>
          </div>

          {/* Resume Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Resume
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedResume}
                  </p>
                  <p className="text-[10px] text-slate-400">Primary Candidate Resume</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Upload alternative */}
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCustomResumeName(file.name);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>{customResumeName ? `Selected: ${customResumeName}` : 'Or click/drag to attach different resume (PDF/DOC)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter / Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Cover Note / Why You're a Fit
              </label>
              <button
                type="button"
                onClick={handleGenerateAiLetter}
                disabled={isGeneratingAiLetter}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>{isGeneratingAiLetter ? 'Generating AI Letter...' : 'Draft with AI'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself, share highlights of your relevant experience or projects, and why you are excited for this opportunity..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Application
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
