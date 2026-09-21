import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  users,
  companies,
  jobs,
  savedJobIds,
  applications,
  interviews,
  notifications
} from './data/store.js';
import {
  getCategoryTheme,
  JOB_CATEGORIES,
  normalizeCategory
} from './data/categoryThemes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Auth & Context Middleware
app.use((req, res, next) => {
  const userId = req.cookies.user_id ? parseInt(req.cookies.user_id, 10) : null;
  const user = users.find(u => u.id === userId) || null;

  req.user = user;
  res.locals.user = user;
  res.locals.currentPath = req.path;
  res.locals.theme = req.cookies.theme || 'light';
  res.locals.getCategoryTheme = getCategoryTheme;
  res.locals.JOB_CATEGORIES = JOB_CATEGORIES;

  // Counts for sidebar badges
  if (user && user.role === 'Candidate') {
    const userApps = applications.filter(a => a.candidateId === user.id);
    res.locals.applicationsCount = userApps.length;
    res.locals.savedJobsCount = savedJobIds.size;
    res.locals.interviewsCount = interviews.filter(i => i.candidateName === user.name).length;
  } else if (user && user.role === 'Employer') {
    const employerJobsList = jobs.filter(j => j.employerId === user.id);
    res.locals.employerJobsCount = employerJobsList.length;
    res.locals.employerApplicationsCount = applications.length;
  }

  // Notifications for user
  const userNotifications = notifications.filter(n => !user || n.userId === user.id);
  res.locals.notificationsList = userNotifications;
  res.locals.unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  next();
});

// Require Auth Helper
function requireAuth(role = null) {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect(`/auth/login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
    }
    if (role && req.user.role !== role && req.user.role !== 'Admin') {
      return res.status(403).send('Access denied. Insufficient permissions.');
    }
    next();
  };
}

// ==========================================
// Web Page Routes
// ==========================================

// Home Page
app.get('/', (req, res) => {
  const latestJobs = jobs.slice(0, 6).map(j => ({
    ...j,
    isSaved: req.user ? savedJobIds.has(j.id) : false
  }));

  res.render('home/index', {
    title: 'Find Your Dream Job',
    jobs: latestJobs
  });
});

// Browse Jobs
app.get('/jobs', (req, res) => {
  const { searchTerm, location, workMode, employmentType, minSalary, category } = req.query;

  let filtered = jobs.filter(j => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(term);
      const matchCompany = j.companyName.toLowerCase().includes(term);
      const matchSkill = (j.skills || []).some(s => s.toLowerCase().includes(term));
      if (!matchTitle && !matchCompany && !matchSkill) return false;
    }
    if (category && category.trim() !== '' && category !== 'all') {
      const filterTheme = getCategoryTheme(category);
      const jobTheme = getCategoryTheme(j.category);
      if (filterTheme.key !== jobTheme.key) {
        return false;
      }
    }
    if (location && !j.location.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    if (workMode && j.workMode.toLowerCase() !== workMode.toLowerCase()) {
      return false;
    }
    if (employmentType && j.employmentType.toLowerCase() !== employmentType.toLowerCase()) {
      return false;
    }
    if (minSalary && j.minSalary && Number(j.minSalary) < Number(minSalary)) {
      return false;
    }
    return true;
  });

  const processed = filtered.map(j => ({
    ...j,
    isSaved: req.user ? savedJobIds.has(j.id) : false
  }));

  res.render('jobs/index', {
    title: 'Browse Jobs',
    filteredJobs: processed,
    filter: req.query
  });
});

// Job Details
app.get('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).send('Job opening not found.');
  }

  // Increment views
  job.viewsCount = (job.viewsCount || 0) + 1;

  const company = companies.find(c => c.id === job.companyId) || companies[0];
  const userApplication = req.user
    ? applications.find(a => a.jobId === jobId && a.candidateId === req.user.id)
    : null;

  res.render('jobs/details', {
    title: `${job.title} at ${job.companyName}`,
    job: {
      ...job,
      isSaved: req.user ? savedJobIds.has(job.id) : false
    },
    company,
    application: userApplication
  });
});

// Auth: Login
app.get('/auth/login', (req, res) => {
  if (req.user) {
    return res.redirect(req.user.role === 'Employer' ? '/employerdashboard' : '/candidatedashboard');
  }
  res.render('auth/login', {
    title: 'Sign In',
    returnUrl: req.query.returnUrl || '',
    error: null,
    email: req.query.role === 'Employer' ? 'employer@example.com' : 'candidate@example.com'
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password, returnUrl } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());

  if (!user || user.password !== password) {
    return res.render('auth/login', {
      title: 'Sign In',
      returnUrl,
      error: 'Invalid email or password. You can use the quick test account buttons above.',
      email
    });
  }

  // Set auth cookie
  res.cookie('user_id', user.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  if (returnUrl && returnUrl.startsWith('/')) {
    return res.redirect(returnUrl);
  }

  res.redirect(user.role === 'Employer' ? '/employerdashboard' : '/candidatedashboard');
});

// Auth: Register
app.get('/auth/register', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('auth/register', {
    title: 'Create Account',
    error: null,
    preselectedRole: req.query.role || 'Candidate'
  });
});

app.post('/auth/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!email || !password || !firstName) {
    return res.render('auth/register', {
      title: 'Create Account',
      error: 'Please fill in all required fields.',
      preselectedRole: role
    });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.render('auth/register', {
      title: 'Create Account',
      error: 'An account with this email already exists.',
      preselectedRole: role
    });
  }

  const newUser = {
    id: users.length + 1,
    email: email.trim(),
    password,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    role: role === 'Employer' ? 'Employer' : 'Candidate',
    createdAt: new Date()
  };

  users.push(newUser);
  res.cookie('user_id', newUser.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.redirect(newUser.role === 'Employer' ? '/employerdashboard' : '/candidatedashboard');
});

// Auth: Logout
app.get('/auth/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

// Generic & role dashboard redirect aliases
app.get(['/dashboard', '/candidate/dashboard'], (req, res) => {
  if (!req.user) return res.redirect('/auth/login');
  res.redirect(req.user.role === 'Employer' ? '/employerdashboard' : '/candidatedashboard');
});

app.get('/employer/dashboard', (req, res) => {
  if (!req.user) return res.redirect('/auth/login?role=Employer');
  res.redirect('/employerdashboard');
});

// ==========================================
// Candidate Dashboard & Views
// ==========================================

app.get('/candidatedashboard', requireAuth('Candidate'), (req, res) => {
  const userApps = applications.filter(a => a.candidateId === req.user.id);
  const userInterviews = interviews.filter(i => i.candidateName === req.user.name);

  const stats = {
    totalApplications: userApps.length,
    pendingApplications: userApps.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length,
    savedJobs: savedJobIds.size,
    interviewsScheduled: userInterviews.length
  };

  const recommendedJobs = jobs.slice(0, 4);

  res.render('candidate/dashboard', {
    title: 'Candidate Dashboard',
    stats,
    applications: userApps.slice(0, 5),
    interviews: userInterviews,
    recommendedJobs
  });
});

app.get('/candidatedashboard/applications', requireAuth('Candidate'), (req, res) => {
  const userApps = applications.filter(a => a.candidateId === req.user.id);
  res.render('candidate/applications', {
    title: 'My Applications',
    applications: userApps
  });
});

app.get('/candidatedashboard/saved', requireAuth('Candidate'), (req, res) => {
  const saved = jobs.filter(j => savedJobIds.has(j.id));
  res.render('candidate/saved', {
    title: 'Saved Jobs',
    savedJobs: saved
  });
});

app.get('/candidatedashboard/interviews', requireAuth('Candidate'), (req, res) => {
  const userInterviews = interviews.filter(i => i.candidateName === req.user.name);
  res.render('candidate/interviews', {
    title: 'Scheduled Interviews',
    interviews: userInterviews
  });
});

app.get('/account/profile', requireAuth(), (req, res) => {
  res.render('account/profile', {
    title: 'My Profile',
    success: req.query.updated ? 'Profile updated successfully.' : null
  });
});

app.post('/account/profile', requireAuth(), (req, res) => {
  const { name, title, location, phone, bio, skills } = req.body;
  req.user.name = name;
  req.user.title = title;
  req.user.location = location;
  req.user.phone = phone;
  req.user.bio = bio;
  req.user.skills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  res.redirect('/account/profile?updated=true');
});

// ==========================================
// Employer Dashboard & Views
// ==========================================

app.get('/employerdashboard', requireAuth('Employer'), (req, res) => {
  const employerJobs = jobs.filter(j => j.employerId === req.user.id);
  const activeJobs = employerJobs.filter(j => j.status === 'Active');

  const stats = {
    totalJobs: employerJobs.length,
    activeJobs: activeJobs.length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length
  };

  const company = companies.find(c => c.id === req.user.companyId) || companies[0];

  res.render('employer/dashboard', {
    title: 'Employer Dashboard',
    stats,
    employerJobs: employerJobs.slice(0, 5),
    recentApplications: applications.slice(0, 5),
    company
  });
});

app.get('/employerdashboard/jobs', requireAuth('Employer'), (req, res) => {
  const employerJobs = jobs.filter(j => j.employerId === req.user.id);
  res.render('employer/jobs', {
    title: 'My Job Postings',
    employerJobs
  });
});

app.get('/employerjobs/create', requireAuth('Employer'), (req, res) => {
  res.render('employer/create-job', {
    title: 'Post a Job',
    error: null
  });
});

app.post('/employerjobs/create', requireAuth('Employer'), (req, res) => {
  const {
    title,
    location,
    workMode,
    employmentType,
    category,
    minSalary,
    maxSalary,
    description,
    requirements,
    responsibilities,
    skills,
    benefits
  } = req.body;

  if (!title || !location || !description) {
    return res.render('employer/create-job', {
      title: 'Post a Job',
      error: 'Please complete all required fields.'
    });
  }

  const newJob = {
    id: jobs.length + 1,
    employerId: req.user.id,
    companyId: req.user.companyId || 1,
    companyName: req.user.companyName || 'TechCorp Solutions',
    companyLogoUrl: '',
    title,
    location,
    workMode: workMode || 'Hybrid',
    employmentType: employmentType || 'FullTime',
    category: category || 'Software / IT',
    minSalary: minSalary ? Number(minSalary) : 100000,
    maxSalary: maxSalary ? Number(maxSalary) : 150000,
    currency: 'USD',
    description,
    requirements: requirements || '',
    responsibilities: responsibilities ? responsibilities.split('\n').filter(Boolean) : [],
    skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    benefits: benefits || '',
    status: 'Active',
    viewsCount: 1,
    applicationsCount: 0,
    postedDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  jobs.unshift(newJob);
  res.redirect('/employerdashboard/jobs');
});

app.get('/employerdashboard/applications', requireAuth('Employer'), (req, res) => {
  let apps = [...applications];
  if (req.query.jobId) {
    const jid = parseInt(req.query.jobId, 10);
    apps = apps.filter(a => a.jobId === jid);
  }
  res.render('employer/applications', {
    title: 'Candidate Applications',
    applications: apps
  });
});

app.get('/employerdashboard/company', requireAuth('Employer'), (req, res) => {
  const company = companies.find(c => c.id === req.user.companyId) || companies[0];
  res.render('employer/company', {
    title: 'Company Profile',
    company,
    success: req.query.updated ? 'Company profile updated successfully.' : null
  });
});

app.post('/employerdashboard/company', requireAuth('Employer'), (req, res) => {
  const company = companies.find(c => c.id === req.user.companyId) || companies[0];
  const { name, industry, location, size, website, description } = req.body;

  company.name = name || company.name;
  company.industry = industry || company.industry;
  company.location = location || company.location;
  company.size = size || company.size;
  company.website = website || company.website;
  company.description = description || company.description;

  res.redirect('/employerdashboard/company?updated=true');
});

// ==========================================
// REST APIs
// ==========================================

// GET /api/jobs
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs,
    total: jobs.length
  });
});

// POST /api/jobs/:id/save
app.post('/api/jobs/:id/save', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to save jobs.' });
  }

  const jobId = parseInt(req.params.id, 10);
  let isSaved = false;

  if (savedJobIds.has(jobId)) {
    savedJobIds.delete(jobId);
    isSaved = false;
  } else {
    savedJobIds.add(jobId);
    isSaved = true;
  }

  res.json({
    success: true,
    isSaved,
    savedCount: savedJobIds.size,
    message: isSaved ? 'Job saved!' : 'Job removed from saved.'
  });
});

// POST /api/jobs/:id/apply
app.post('/api/jobs/:id/apply', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to apply for jobs.' });
  }
  if (req.user.role !== 'Candidate') {
    return res.status(403).json({ error: 'Only candidate accounts can submit job applications.' });
  }

  const jobId = parseInt(req.params.id, 10);
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const existing = applications.find(a => a.jobId === jobId && a.candidateId === req.user.id);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied for this job.' });
  }

  const newApp = {
    id: applications.length + 1,
    jobId: job.id,
    candidateId: req.user.id,
    candidateName: req.user.name,
    candidateEmail: req.user.email,
    candidateTitle: req.user.title || 'Candidate',
    jobTitle: job.title,
    companyName: job.companyName,
    coverLetter: req.body.coverLetter || '',
    status: 'Submitted',
    appliedDate: new Date(),
    history: [{ status: 'Submitted', date: new Date() }]
  };

  applications.push(newApp);
  job.applicationsCount = (job.applicationsCount || 0) + 1;

  // Add notification
  notifications.unshift({
    id: notifications.length + 1,
    userId: req.user.id,
    title: 'Application Submitted',
    message: `Your application for ${job.title} at ${job.companyName} was submitted successfully.`,
    read: false,
    createdAt: new Date()
  });

  res.json({ success: true, application: newApp });
});

// Employer: Toggle job status
app.post('/api/employer/jobs/:id/toggle-status', requireAuth('Employer'), (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  job.status = job.status === 'Active' ? 'Closed' : 'Active';
  res.json({ success: true, status: job.status, message: `Job is now ${job.status}` });
});

// Employer: Update application status
app.post('/api/employer/applications/:id/status', requireAuth('Employer'), (req, res) => {
  const appId = parseInt(req.params.id, 10);
  const appItem = applications.find(a => a.id === appId);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  const { status } = req.body;
  appItem.status = status;
  appItem.history.push({ status, date: new Date() });

  // Add notification for candidate
  notifications.unshift({
    id: notifications.length + 1,
    userId: appItem.candidateId,
    title: `Application Status: ${status}`,
    message: `Your application for ${appItem.jobTitle} has been updated to "${status}".`,
    read: false,
    createdAt: new Date()
  });

  res.json({ success: true, application: appItem });
});

// Employer: Schedule interview
app.post('/api/employer/interviews/schedule', requireAuth('Employer'), (req, res) => {
  const { applicationId, scheduledAt, topic } = req.body;
  const appItem = applications.find(a => a.id === parseInt(applicationId, 10));
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  const newInterview = {
    id: interviews.length + 1,
    applicationId: appItem.id,
    jobTitle: appItem.jobTitle,
    companyName: appItem.companyName,
    interviewerName: req.user.name,
    interviewerRole: req.user.title || 'Hiring Lead',
    candidateName: appItem.candidateName,
    scheduledAt: new Date(scheduledAt || Date.now() + 48 * 3600 * 1000),
    durationMinutes: 45,
    location: 'Google Meet',
    meetingLink: `https://meet.google.com/job-${appItem.id}-${Date.now().toString().slice(-4)}`,
    status: 'Scheduled',
    notes: topic || 'Technical & Experience Interview'
  };

  interviews.push(newInterview);
  appItem.status = 'Interview Scheduled';
  appItem.history.push({ status: 'Interview Scheduled', date: new Date() });

  // Notify candidate
  notifications.unshift({
    id: notifications.length + 1,
    userId: appItem.candidateId,
    title: 'Interview Scheduled!',
    message: `${appItem.companyName} scheduled an interview with you on ${newInterview.scheduledAt.toLocaleString()}.`,
    read: false,
    createdAt: new Date()
  });

  res.json({ success: true, interview: newInterview });
});

// Notifications
app.get('/Notifications/UnreadCount', (req, res) => {
  const unread = notifications.filter(n => !req.user || n.userId === req.user.id).filter(n => !n.read);
  res.json({ count: unread.length });
});

app.post(['/api/notifications/mark-read', '/Notifications/MarkAllRead'], (req, res) => {
  notifications.forEach(n => {
    if (!req.user || n.userId === req.user.id) {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`JobPortal running on http://0.0.0.0:${PORT}`);
});
