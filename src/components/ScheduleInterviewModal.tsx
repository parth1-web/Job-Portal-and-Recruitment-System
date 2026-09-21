import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { JobApplication } from '../types';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onSuccess: (interview: any) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewType, setInterviewType] = useState<'Online Video' | 'Phone Call' | 'In-Person'>('Online Video');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/job-sync-tech');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('Technical interview covering domain knowledge, coding architecture, and cultural alignment.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: application.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes,
          interviewType,
          meetingLink: interviewType === 'Online Video' ? meetingLink : undefined,
          location: interviewType === 'In-Person' ? location : undefined,
          notes,
        })
      });

      if (!res.ok) throw new Error('Failed to schedule interview');
      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error scheduling interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Schedule Candidate Interview
            </h2>
            <p className="text-xs text-slate-500">
              Candidate: <span className="font-semibold text-slate-800 dark:text-slate-200">{application.candidateName}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Interview Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Online Video', 'Phone Call', 'In-Person'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    interviewType === type
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration (minutes)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          {interviewType === 'Online Video' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Meeting URL (Google Meet, Zoom, Teams)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {interviewType === 'In-Person' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Office / Room Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 500 Howard St, Floor 4, Meeting Room B"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Interview Notes & Agenda
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions for the candidate..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
