import { 
  Job, 
  JobApplication, 
  Interview, 
  Notification, 
  CandidateProfile, 
  Company, 
  User, 
  UserRole,
  JobFilter,
  Resume
} from '../types';

// Central API Helper
const getToken = (): string | null => {
  return localStorage.getItem('jobportal_token') || 'jwt_mock_token_cand_1';
};

const getUserId = (): string => {
  return localStorage.getItem('jobportal_user_id') || 'cand_1';
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  const userId = getUserId();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {})
  };
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.message) errorMsg = errJson.message;
      else if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return await res.json();
}

// ============================================
// 1. AUTH API (Matches .NET AuthController)
// ============================================
export const authApi = {
  async login(email: string, password = 'Password123!'): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async register(fullName: string, email: string, role: UserRole, password = 'Password123!'): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/Auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, role, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getProfile(): Promise<User> {
    const res = await fetch('/api/Auth/profile', {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/Auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {
      // ignore
    }
  }
};

// ============================================
// 2. JOBS API (Matches .NET JobController)
// ============================================
export const jobsApi = {
  async getPublishedJobs(filter?: JobFilter): Promise<{ items: Job[]; totalCount: number; page: number; pageSize: number }> {
    const params = new URLSearchParams();
    if (filter?.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter?.location) params.append('location', filter.location);
    if (filter?.category && filter.category !== 'All Categories') params.append('category', filter.category);
    if (filter?.employmentType && filter.employmentType !== 'All Types') params.append('employmentType', filter.employmentType);
    if (filter?.workMode && filter.workMode !== 'All Modes') params.append('workMode', filter.workMode);
    if (filter?.minSalary) params.append('minSalary', String(filter.minSalary));
    if (filter?.maxSalary) params.append('maxSalary', String(filter.maxSalary));
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/jobs${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ items: Job[]; totalCount: number; page: number; pageSize: number }>(res);
  },

  async getJobById(id: string): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Job>(res);
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch('/api/jobs/categories', {
      headers: getAuthHeaders()
    });
    return handleResponse<string[]>(res);
  }
};

// ====================================================
// 3. EMPLOYER JOBS API (Matches .NET EmployerJobController)
// ====================================================
export const employerJobsApi = {
  async getMyJobs(): Promise<Job[]> {
    return this.getAll();
  },

  async getAll(): Promise<Job[]> {
    const res = await fetch('/api/employer/jobs', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : (data.items || []);
  },

  async getById(id: string): Promise<Job> {
    const res = await fetch(`/api/employer/jobs/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Job>(res);
  },

  async create(jobData: Partial<Job>): Promise<Job> {
    const res = await fetch('/api/employer/jobs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    return handleResponse<Job>(res);
  },

  async update(id: string, jobData: Partial<Job>): Promise<Job> {
    const res = await fetch(`/api/employer/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    return handleResponse<Job>(res);
  },

  async publish(id: string): Promise<Job> {
    const res = await fetch(`/api/employer/jobs/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Job>(res);
  },

  async publishJob(id: string): Promise<Job> {
    return this.publish(id);
  },

  async close(id: string): Promise<Job> {
    const res = await fetch(`/api/employer/jobs/${id}/close`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Job>(res);
  },

  async closeJob(id: string): Promise<Job> {
    return this.close(id);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/employer/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  }
};

// ==========================================================
// 4. CANDIDATE APPLICATIONS (Matches .NET JobApplicationController)
// ==========================================================
export const candidateApplicationsApi = {
  async apply(data: { jobId: string; candidateId?: string; coverLetter?: string; resumeFileName?: string; resumeId?: string; portfolioUrl?: string }): Promise<JobApplication> {
    const res = await fetch('/api/candidate/applications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<JobApplication>(res);
  },

  async getMyApplications(): Promise<JobApplication[]> {
    const res = await fetch('/api/candidate/applications', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : (data.items || []);
  },

  async getById(id: string): Promise<JobApplication> {
    const res = await fetch(`/api/candidate/applications/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<JobApplication>(res);
  },

  async withdraw(id: string): Promise<void> {
    const res = await fetch(`/api/candidate/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  }
};

// ===============================================================
// 5. EMPLOYER APPLICATIONS (Matches .NET EmployerJobApplicationController)
// ===============================================================
export const employerApplicationsApi = {
  async getByJob(jobId: string): Promise<JobApplication[]> {
    return this.getApplicationsForJob(jobId);
  },

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    const res = await fetch(`/api/employer/jobs/${jobId}/applications`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : (data.items || []);
  },

  async updateStatus(jobId: string, applicationId: string, status: string, notes?: string): Promise<JobApplication> {
    const res = await fetch(`/api/employer/jobs/${jobId}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse<JobApplication>(res);
  }
};

// ====================================================
// 6. INTERVIEWS API (Matches .NET InterviewController)
// ====================================================
export const interviewsApi = {
  async getMyInterviews(): Promise<Interview[]> {
    return this.getAll();
  },

  async schedule(data: {
    applicationId: string;
    jobId?: string;
    candidateId?: string;
    scheduledAt: string;
    durationMinutes: number;
    interviewType: string;
    meetingLink?: string;
    location?: string;
    notes?: string;
  }): Promise<Interview> {
    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Interview>(res);
  },

  async getByApplicationId(applicationId: string): Promise<Interview[]> {
    const res = await fetch(`/api/interviews/application/${applicationId}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : [];
  },

  async getAll(): Promise<Interview[]> {
    const res = await fetch('/api/interviews', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : [];
  },

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    const res = await fetch(`/api/interviews/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Interview>(res);
  },

  async cancel(id: string): Promise<void> {
    const res = await fetch(`/api/interviews/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  }
};

// ====================================================
// 7. SAVED JOBS API (Matches .NET SavedJobController)
// ====================================================
export const savedJobsApi = {
  async getSavedJobs(): Promise<Job[]> {
    const res = await fetch('/api/candidate/saved-jobs', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : (data.items || []);
  },

  async saveJob(jobId: string): Promise<any> {
    const res = await fetch(`/api/candidate/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async unsaveJob(jobId: string): Promise<void> {
    const res = await fetch(`/api/candidate/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  },

  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/candidate/saved-jobs/${jobId}/check`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse<{ isSaved: boolean }>(res);
      return Boolean(data.isSaved);
    } catch {
      return false;
    }
  }
};

// ====================================================
// 8. NOTIFICATIONS API (Matches .NET NotificationController)
// ====================================================
export const notificationsApi = {
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const res = await fetch(`/api/notifications?unreadOnly=${unreadOnly}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    return Array.isArray(data) ? data : (data.items || []);
  },

  async getUnreadCount(): Promise<number> {
    const res = await fetch('/api/notifications/unread-count', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<{ unreadCount: number }>(res);
    return data.unreadCount || 0;
  },

  async markAsRead(id: string): Promise<void> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  },

  async markAllAsRead(): Promise<void> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    await handleResponse<any>(res);
  }
};

// ====================================================
// 9. PROFILES API (Candidate & Employer & Company)
// ====================================================
export const profileApi = {
  async getCandidateProfile(): Promise<CandidateProfile> {
    const res = await fetch('/api/candidate/profile', {
      headers: getAuthHeaders()
    });
    return handleResponse<CandidateProfile>(res);
  },

  async updateCandidateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch('/api/candidate/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<CandidateProfile>(res);
  },

  async getEmployerCompany(): Promise<Company> {
    const res = await fetch('/api/employer/profile', {
      headers: getAuthHeaders()
    });
    return handleResponse<Company>(res);
  },

  async updateEmployerCompany(data: Partial<Company>): Promise<Company> {
    const res = await fetch('/api/employer/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Company>(res);
  },

  async updateCompanyProfile(data: Partial<Company>): Promise<Company> {
    return this.updateEmployerCompany(data);
  },

  async getSkills(): Promise<string[]> {
    const res = await fetch('/api/skills', {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<any>(res);
    if (Array.isArray(data)) {
      return data.map(s => (typeof s === 'string' ? s : s.name || s.title));
    }
    return [];
  }
};

// ====================================================
// 10. RESUMES API
// ====================================================
export const resumesApi = {
  async getMyResumes(): Promise<Resume[]> {
    return this.getAll();
  },

  async getAll(): Promise<Resume[]> {
    try {
      const res = await fetch('/api/candidate/resumes', {
        headers: getAuthHeaders()
      });
      const data = await handleResponse<any>(res);
      return Array.isArray(data) ? data : (data.items || []);
    } catch {
      return [];
    }
  },

  async upload(data: { fileName: string; fileUrl?: string; fileSize?: number; isPrimary?: boolean }): Promise<Resume> {
    try {
      const res = await fetch('/api/candidate/resumes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse<Resume>(res);
    } catch {
      return {
        id: `res_${Date.now()}`,
        candidateId: getUserId(),
        fileName: data.fileName,
        fileSize: `${Math.round((data.fileSize || 184500) / 1024)} KB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        isPrimary: data.isPrimary ?? false,
        fileUrl: data.fileUrl || `/uploads/${encodeURIComponent(data.fileName)}`
      };
    }
  },

  async setPrimary(resumeId: string): Promise<any> {
    try {
      const res = await fetch(`/api/candidate/resumes/${resumeId}/primary`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return await handleResponse<any>(res);
    } catch {
      return { success: true };
    }
  },

  async delete(resumeId: string): Promise<void> {
    try {
      const res = await fetch(`/api/candidate/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleResponse<any>(res);
    } catch {
      // ignore mock fallback
    }
  }
};

