export type UserRole = 'Candidate' | 'Employer' | 'Admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  experienceYears?: number;
  skills: string[];
  education?: string;
  experience?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumes: Resume[];
}

export interface Resume {
  id: string;
  candidateId: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  isPrimary: boolean;
  fileUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  industry: string;
  size: string; // e.g., "50-200 employees"
  location: string;
  websiteUrl?: string;
  logoUrl?: string;
  verified: boolean;
  employerId: string;
}

export type CompanyProfile = Company;

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | 'Remote';
export type WorkMode = 'On-site' | 'Remote' | 'Hybrid';
export type JobStatus = 'Active' | 'Closed' | 'Draft';

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyLocation: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  postedAt: string;
  deadline?: string;
  employerId: string;
}

export type ApplicationStatus = 
  | 'Applied' 
  | 'Under Review' 
  | 'Shortlisted' 
  | 'Interview Scheduled' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Withdrawn';

export interface StatusHistoryItem {
  id: string;
  status: ApplicationStatus;
  changedAt: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateTitle?: string;
  coverLetter?: string;
  resumeFileName?: string;
  status: ApplicationStatus;
  appliedAt: string;
  statusHistory: StatusHistoryItem[];
  employerNotes?: string;
}

export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  interviewType: 'Online Video' | 'Phone Call' | 'In-Person';
  status: InterviewStatus;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'interview' | 'job' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  savedAt: string;
}

export interface JobFilter {
  searchTerm?: string;
  location?: string;
  category?: string;
  employmentType?: string;
  workMode?: string;
  minSalary?: number;
  maxSalary?: number;
  sortBy?: 'newest' | 'salary_high' | 'salary_low' | 'popular';
}
