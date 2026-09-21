import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store
interface DBState {
  users: Array<{
    id: string;
    email: string;
    fullName: string;
    role: 'Candidate' | 'Employer' | 'Admin';
    avatarUrl?: string;
    createdAt: string;
  }>;
  companies: Array<{
    id: string;
    name: string;
    tagline?: string;
    description: string;
    industry: string;
    size: string;
    location: string;
    websiteUrl?: string;
    logoUrl?: string;
    verified: boolean;
    employerId: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    companyId: string;
    companyName: string;
    companyLogo?: string;
    companyLocation: string;
    category: string;
    employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | 'Remote';
    workMode: 'On-site' | 'Remote' | 'Hybrid';
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    description: string;
    requirements: string[];
    benefits: string[];
    skills: string[];
    status: 'Active' | 'Closed' | 'Draft';
    viewsCount: number;
    applicationsCount: number;
    postedAt: string;
    deadline?: string;
    employerId: string;
  }>;
  applications: Array<{
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
    status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Accepted' | 'Rejected' | 'Withdrawn';
    appliedAt: string;
    statusHistory: Array<{ id: string; status: any; changedAt: string; notes?: string }>;
    employerNotes?: string;
  }>;
  interviews: Array<{
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
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
    notes?: string;
  }>;
  candidateProfiles: Record<string, {
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
    resumes: Array<{
      id: string;
      candidateId: string;
      fileName: string;
      fileSize: string;
      uploadedAt: string;
      isPrimary: boolean;
      fileUrl?: string;
    }>;
  }>;
  savedJobs: Array<{
    id: string;
    candidateId: string;
    jobId: string;
    savedAt: string;
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'application' | 'interview' | 'job' | 'system';
    isRead: boolean;
    createdAt: string;
    link?: string;
  }>;
}

// Initial Seed Data
const db: DBState = {
  users: [
    {
      id: 'cand_1',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      role: 'Candidate',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'emp_1',
      email: 'sarah.jenkins@nexustech.io',
      fullName: 'Sarah Jenkins',
      role: 'Employer',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-05T08:30:00Z',
    },
    {
      id: 'cand_2',
      email: 'david.chen@example.com',
      fullName: 'David Chen',
      role: 'Candidate',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T12:00:00Z',
    }
  ],
  companies: [
    {
      id: 'comp_1',
      name: 'Nexus Tech Innovations',
      tagline: 'Empowering the next generation of cloud and AI infrastructure',
      description: 'Nexus Tech is a high-growth cloud intelligence platform helping global engineering teams deploy and monitor resilient microservices at scale.',
      industry: 'Software & Technology',
      size: '100-250 employees',
      location: 'San Francisco, CA',
      websiteUrl: 'https://nexustech.example.com',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      verified: true,
      employerId: 'emp_1',
    },
    {
      id: 'comp_2',
      name: 'CloudScale AI',
      tagline: 'Next-generation machine learning workflows',
      description: 'Building autonomous generative AI tooling and real-time distributed data pipelines for modern enterprises.',
      industry: 'Artificial Intelligence',
      size: '50-100 employees',
      location: 'New York, NY',
      websiteUrl: 'https://cloudscale.example.com',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      verified: true,
      employerId: 'emp_2',
    },
    {
      id: 'comp_3',
      name: 'FinEdge Global',
      tagline: 'Frictionless digital banking & algorithmic assets',
      description: 'Pioneering safe, instantaneous cross-border settlement infrastructure and fintech security solutions.',
      industry: 'Financial Technology',
      size: '500+ employees',
      location: 'London / Remote',
      websiteUrl: 'https://finedge.example.com',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      verified: true,
      employerId: 'emp_3',
    },
    {
      id: 'comp_4',
      name: 'DesignCraft Studio',
      tagline: 'Crafting memorable brand & product experiences',
      description: 'An award-winning digital design agency specializing in fluid UI design systems and interactive web design.',
      industry: 'Design & Creative',
      size: '20-50 employees',
      location: 'Austin, TX / Hybrid',
      websiteUrl: 'https://designcraft.example.com',
      logoUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=120&auto=format&fit=crop&q=80',
      verified: true,
      employerId: 'emp_4',
    }
  ],
  jobs: [
    {
      id: 'job_1',
      title: 'Senior Full-Stack Engineer',
      companyId: 'comp_1',
      companyName: 'Nexus Tech Innovations',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'San Francisco, CA',
      category: 'Software Engineering',
      employmentType: 'Full-Time',
      workMode: 'Hybrid',
      location: 'San Francisco, CA',
      salaryMin: 155000,
      salaryMax: 190000,
      salaryCurrency: '$',
      description: 'We are looking for a Senior Full-Stack Engineer to architect and scale our core cloud observability engine. You will collaborate directly with product leads and infrastructure architects to build high-throughput data visualizers and microservice APIs.',
      requirements: [
        '5+ years of experience with React, TypeScript, and Node.js or C#/.NET Core',
        'Proven expertise building high-performance REST and GraphQL services',
        'Experience with distributed caching (Redis) and relational databases (PostgreSQL)',
        'Strong focus on test-driven development, CI/CD, and scalable cloud deployments'
      ],
      benefits: [
        'Comprehensive medical, dental, and vision insurance with 100% premium coverage',
        '$3,000 annual continuous learning and conference stipend',
        'Flexible hybrid schedule with remote office setup allowance',
        '401(k) retirement plan with 5% employer match'
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API'],
      status: 'Active',
      viewsCount: 1420,
      applicationsCount: 24,
      postedAt: '2026-09-15T09:00:00Z',
      deadline: '2026-10-30',
      employerId: 'emp_1',
    },
    {
      id: 'job_2',
      title: 'Lead Product Designer (UI/UX)',
      companyId: 'comp_4',
      companyName: 'DesignCraft Studio',
      companyLogo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'Austin, TX',
      category: 'Design & Creative',
      employmentType: 'Full-Time',
      workMode: 'Remote',
      location: 'Austin, TX / Remote',
      salaryMin: 130000,
      salaryMax: 165000,
      salaryCurrency: '$',
      description: 'DesignCraft is seeking a Lead Product Designer to guide our design systems and client application interfaces. You will translate complex workflows into crisp, delightful digital products.',
      requirements: [
        '4+ years designing complex SaaS or web applications in Figma',
        'Strong portfolio showcasing design systems, typography hierarchy, and user research',
        'Familiarity with front-end components and design token implementations',
        'Excellent communication and client presentation abilities'
      ],
      benefits: [
        'Unlimited PTO and mental health recharge Fridays',
        'Top-tier Apple hardware and ergonomic workspace grant',
        'Annual company retreat in international locations',
        'Health and wellness monthly subsidy'
      ],
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
      status: 'Active',
      viewsCount: 980,
      applicationsCount: 18,
      postedAt: '2026-09-17T11:30:00Z',
      deadline: '2026-10-25',
      employerId: 'emp_4',
    },
    {
      id: 'job_3',
      title: 'Senior AI / ML Research Engineer',
      companyId: 'comp_2',
      companyName: 'CloudScale AI',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'New York, NY',
      category: 'Artificial Intelligence',
      employmentType: 'Full-Time',
      workMode: 'Remote',
      location: 'New York, NY / Remote',
      salaryMin: 180000,
      salaryMax: 230000,
      salaryCurrency: '$',
      description: 'Join our research group to push the boundaries of real-time multi-modal inference and LLM orchestration systems.',
      requirements: [
        'MS or PhD in Computer Science, Machine Learning, or equivalent industry experience',
        'Deep proficiency with PyTorch, Python, Hugging Face, and CUDA optimization',
        'Experience with model quantization, fine-tuning, and RAG evaluation',
        'Track record of building production AI services'
      ],
      benefits: [
        'Generous equity package with high growth upside',
        'Full health, dental, life, and disability insurance',
        'Home office budget and compute allocation',
        'Paid parental leave for both parents'
      ],
      skills: ['Python', 'PyTorch', 'LLMs', 'Machine Learning', 'Docker', 'Kubernetes'],
      status: 'Active',
      viewsCount: 2150,
      applicationsCount: 38,
      postedAt: '2026-09-18T14:00:00Z',
      deadline: '2026-11-15',
      employerId: 'emp_2',
    },
    {
      id: 'job_4',
      title: 'DevOps & Cloud Security Specialist',
      companyId: 'comp_3',
      companyName: 'FinEdge Global',
      companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'London / Remote',
      category: 'DevOps & Infrastructure',
      employmentType: 'Contract',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 120000,
      salaryMax: 150000,
      salaryCurrency: '$',
      description: 'FinEdge is hiring a Cloud Security specialist to audit, automate, and harden our multi-region Kubernetes clusters and AWS infrastructure.',
      requirements: [
        '3+ years managing AWS/GCP cloud environments via Terraform',
        'Hands-on experience with Kubernetes security, IAM policies, and SOC2 compliance',
        'Automated CI/CD security scanning (Snyk, SonarQube, Trivy)',
        'Incident response and vulnerability management experience'
      ],
      benefits: [
        'Competitive hourly / contract compensation with performance bonuses',
        'Flexible working hours across UTC and EST timezones',
        'Contract extension opportunities'
      ],
      skills: ['Terraform', 'Kubernetes', 'AWS', 'CI/CD', 'Security', 'Linux'],
      status: 'Active',
      viewsCount: 740,
      applicationsCount: 12,
      postedAt: '2026-09-19T08:00:00Z',
      deadline: '2026-10-15',
      employerId: 'emp_3',
    },
    {
      id: 'job_5',
      title: 'Frontend React Developer',
      companyId: 'comp_1',
      companyName: 'Nexus Tech Innovations',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'San Francisco, CA',
      category: 'Software Engineering',
      employmentType: 'Full-Time',
      workMode: 'On-site',
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 150000,
      salaryCurrency: '$',
      description: 'Craft responsive, intuitive user interfaces for our real-time developer dashboards with React, Tailwind CSS, and state-of-the-art charting libraries.',
      requirements: [
        '3+ years in production React development with TypeScript',
        'Deep understanding of CSS, component architecture, and responsive design',
        'Experience with WebSockets, optimistic UI updates, and performance profiling',
        'Passion for micro-interactions and smooth user experiences'
      ],
      benefits: [
        'Daily catered lunch and artisanal espresso bar in SF office',
        'Comprehensive medical and dental coverage',
        'Commuter transit pass subsidy',
        'Stock options in Series B venture'
      ],
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management'],
      status: 'Active',
      viewsCount: 1120,
      applicationsCount: 31,
      postedAt: '2026-09-20T10:15:00Z',
      deadline: '2026-11-01',
      employerId: 'emp_1',
    },
    {
      id: 'job_6',
      title: 'Technical Product Manager',
      companyId: 'comp_3',
      companyName: 'FinEdge Global',
      companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      companyLocation: 'New York, NY',
      category: 'Product Management',
      employmentType: 'Full-Time',
      workMode: 'Hybrid',
      location: 'New York, NY',
      salaryMin: 140000,
      salaryMax: 175000,
      salaryCurrency: '$',
      description: 'Lead the roadmap for our core transaction processing engines and developer SDKs. Define specifications and lead agile sprints with engineering teams.',
      requirements: [
        '4+ years product management experience in FinTech or Developer Tools',
        'Demonstrated ability to write clear PRDs, user stories, and acceptance criteria',
        'Strong quantitative analysis and metric-driven prioritization',
        'Technical background (engineering degree or equivalent coding knowledge)'
      ],
      benefits: [
        'Competitive salary with annual performance bonus',
        'Hybrid working policy (2 days office, 3 days remote)',
        'Full health coverage & pension contribution'
      ],
      skills: ['Product Strategy', 'Agile/Scrum', 'Data Analysis', 'Roadmapping', 'APIs'],
      status: 'Active',
      viewsCount: 890,
      applicationsCount: 14,
      postedAt: '2026-09-20T15:45:00Z',
      deadline: '2026-11-20',
      employerId: 'emp_3',
    }
  ],
  applications: [
    {
      id: 'app_1',
      jobId: 'job_1',
      jobTitle: 'Senior Full-Stack Engineer',
      companyName: 'Nexus Tech Innovations',
      companyLocation: 'San Francisco, CA',
      candidateId: 'cand_1',
      candidateName: 'Alex Morgan',
      candidateEmail: 'alex.morgan@example.com',
      candidatePhone: '+1 (555) 349-2810',
      candidateTitle: 'Full-Stack Software Engineer',
      coverLetter: 'I am excited to submit my application for the Senior Full-Stack Engineer position. With 6+ years building reactive TypeScript web apps and resilient microservices, I am confident in adding immediate velocity to Nexus Tech.',
      resumeFileName: 'Alex_Morgan_Software_Engineer_2026.pdf',
      status: 'Interview Scheduled',
      appliedAt: '2026-09-16T14:20:00Z',
      statusHistory: [
        { id: 'sh_1', status: 'Applied', changedAt: '2026-09-16T14:20:00Z', notes: 'Application received' },
        { id: 'sh_2', status: 'Under Review', changedAt: '2026-09-17T09:30:00Z', notes: 'Resume screened by hiring team' },
        { id: 'sh_3', status: 'Shortlisted', changedAt: '2026-09-18T11:00:00Z', notes: 'Candidate meets all technical requirements' },
        { id: 'sh_4', status: 'Interview Scheduled', changedAt: '2026-09-19T16:00:00Z', notes: 'Technical deep-dive scheduled with Lead Architect' }
      ],
      employerNotes: 'Strong frontend and backend background. Invited for architecture round.'
    },
    {
      id: 'app_2',
      jobId: 'job_2',
      jobTitle: 'Lead Product Designer (UI/UX)',
      companyName: 'DesignCraft Studio',
      companyLocation: 'Austin, TX',
      candidateId: 'cand_1',
      candidateName: 'Alex Morgan',
      candidateEmail: 'alex.morgan@example.com',
      candidatePhone: '+1 (555) 349-2810',
      candidateTitle: 'Product Designer & Developer',
      coverLetter: 'I have designed design token systems and user experiences for multiple developer tooling products.',
      resumeFileName: 'Alex_Morgan_Software_Engineer_2026.pdf',
      status: 'Shortlisted',
      appliedAt: '2026-09-18T16:45:00Z',
      statusHistory: [
        { id: 'sh_5', status: 'Applied', changedAt: '2026-09-18T16:45:00Z', notes: 'Application submitted' },
        { id: 'sh_6', status: 'Shortlisted', changedAt: '2026-09-19T10:00:00Z', notes: 'Portfolio matches our creative direction' }
      ],
      employerNotes: 'Great design eye, reviewing available interview slots.'
    },
    {
      id: 'app_3',
      jobId: 'job_5',
      jobTitle: 'Frontend React Developer',
      companyName: 'Nexus Tech Innovations',
      companyLocation: 'San Francisco, CA',
      candidateId: 'cand_2',
      candidateName: 'David Chen',
      candidateEmail: 'david.chen@example.com',
      candidatePhone: '+1 (555) 912-4433',
      candidateTitle: 'React Specialist',
      coverLetter: 'Passionate about building fluid, performant web applications with modern React.',
      resumeFileName: 'David_Chen_Resume.pdf',
      status: 'Under Review',
      appliedAt: '2026-09-20T11:00:00Z',
      statusHistory: [
        { id: 'sh_7', status: 'Applied', changedAt: '2026-09-20T11:00:00Z', notes: 'Application received' },
        { id: 'sh_8', status: 'Under Review', changedAt: '2026-09-20T14:30:00Z', notes: 'Under engineering review' }
      ]
    }
  ],
  interviews: [
    {
      id: 'int_1',
      applicationId: 'app_1',
      jobId: 'job_1',
      jobTitle: 'Senior Full-Stack Engineer',
      companyName: 'Nexus Tech Innovations',
      candidateId: 'cand_1',
      candidateName: 'Alex Morgan',
      candidateEmail: 'alex.morgan@example.com',
      scheduledAt: '2026-09-23T15:00:00Z',
      durationMinutes: 45,
      meetingLink: 'https://meet.google.com/xyz-job-rec',
      interviewType: 'Online Video',
      status: 'Scheduled',
      notes: 'Technical discussion covering React state architecture, API design, and distributed systems.'
    }
  ],
  candidateProfiles: {
    cand_1: {
      id: 'cp_1',
      userId: 'cand_1',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 349-2810',
      title: 'Senior Full-Stack Engineer',
      bio: 'Experienced software engineer focused on building clean, intuitive, and performant web products with React, TypeScript, Node.js, and cloud architecture.',
      location: 'San Francisco, CA',
      experienceYears: 6,
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL', 'Tailwind CSS', 'AWS'],
      education: 'B.S. in Computer Science - University of California, Berkeley',
      experience: 'Senior Software Engineer at Horizon Labs (2022-Present) • Full-Stack Developer at Veloce (2019-2022)',
      portfolioUrl: 'https://alexmorgan.dev',
      githubUrl: 'https://github.com/alexmorgan',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      resumes: [
        {
          id: 'res_1',
          candidateId: 'cand_1',
          fileName: 'Alex_Morgan_Software_Engineer_2026.pdf',
          fileSize: '142 KB',
          uploadedAt: '2026-09-10T12:00:00Z',
          isPrimary: true,
          fileUrl: '#'
        }
      ]
    },
    cand_2: {
      id: 'cp_2',
      userId: 'cand_2',
      fullName: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 912-4433',
      title: 'Frontend React Specialist',
      bio: 'UI engineer passionate about accessible interfaces and modern state architecture.',
      location: 'Seattle, WA',
      experienceYears: 4,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Next.js'],
      education: 'B.S. in Software Engineering - University of Washington',
      experience: 'Frontend Developer at Pulse Interactive (2021-Present)',
      resumes: [
        {
          id: 'res_2',
          candidateId: 'cand_2',
          fileName: 'David_Chen_Resume.pdf',
          fileSize: '118 KB',
          uploadedAt: '2026-09-12T09:00:00Z',
          isPrimary: true,
          fileUrl: '#'
        }
      ]
    }
  },
  savedJobs: [
    {
      id: 'sj_1',
      candidateId: 'cand_1',
      jobId: 'job_3',
      savedAt: '2026-09-18T18:00:00Z'
    },
    {
      id: 'sj_2',
      candidateId: 'cand_1',
      jobId: 'job_4',
      savedAt: '2026-09-19T09:15:00Z'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'cand_1',
      title: 'Interview Scheduled!',
      message: 'Nexus Tech Innovations has scheduled an interview for Senior Full-Stack Engineer on Sept 23, 2026.',
      type: 'interview',
      isRead: false,
      createdAt: '2026-09-19T16:05:00Z',
      link: '/interviews'
    },
    {
      id: 'notif_2',
      userId: 'cand_1',
      title: 'Application Shortlisted',
      message: 'Your application for Lead Product Designer at DesignCraft Studio was shortlisted.',
      type: 'application',
      isRead: false,
      createdAt: '2026-09-19T10:00:00Z',
      link: '/applications'
    },
    {
      id: 'notif_3',
      userId: 'emp_1',
      title: 'New Application Received',
      message: 'Alex Morgan submitted an application for Senior Full-Stack Engineer.',
      type: 'application',
      isRead: false,
      createdAt: '2026-09-16T14:20:00Z',
      link: '/employer/applications'
    }
  ]
};

// ==========================================
// ==========================================
// API ROUTES (Fully Aligned with JobPortal.API Controllers)
// ==========================================

// Helper to extract userId from headers/token/query
function extractUserId(req: Request): string {
  const queryUserId = req.query.userId as string;
  if (queryUserId) return queryUserId;
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId) return headerUserId;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.includes('emp_')) return 'emp_1';
    if (token.includes('cand_2')) return 'cand_2';
    if (token.includes('cand_')) return 'cand_1';
  }
  return 'cand_1';
}

// Health check
app.get(['/api/health', '/api/Health'], (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'JobPortal .NET & React API Gateway', timestamp: new Date().toISOString() });
});

// Categories & Skills (Matches .NET SkillController and JobController)
app.get(['/api/categories', '/api/jobs/categories'], (req: Request, res: Response) => {
  const categories = [
    'Software Engineering',
    'Design & Creative',
    'Artificial Intelligence',
    'DevOps & Infrastructure',
    'Product Management',
    'Data & Analytics',
    'Marketing & Sales',
    'Finance & Accounting',
    'Healthcare & Science'
  ];
  res.json(categories);
});

app.get(['/api/skills', '/api/skills'], (req: Request, res: Response) => {
  const skills = [
    { id: '1', name: 'TypeScript' },
    { id: '2', name: 'JavaScript' },
    { id: '3', name: 'React' },
    { id: '4', name: 'Node.js' },
    { id: '5', name: 'Python' },
    { id: '6', name: 'C#' },
    { id: '7', name: '.NET Core' },
    { id: '8', name: 'PostgreSQL' },
    { id: '9', name: 'Docker' },
    { id: '10', name: 'AWS' },
    { id: '11', name: 'Figma' },
    { id: '12', name: 'GraphQL' },
    { id: '13', name: 'REST API' }
  ];
  res.json(skills);
});

// Companies (Matches .NET CompanyController)
app.get('/api/companies', (req: Request, res: Response) => {
  res.json(db.companies);
});

app.get('/api/companies/:id', (req: Request, res: Response) => {
  const comp = db.companies.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ message: 'Company not found.' });
  res.json(comp);
});

// ==========================================
// AUTH CONTROLLER (/api/Auth & /api/auth)
// ==========================================
const handleLogin = (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[0];
  res.json({
    token: 'jwt_mock_token_' + user.id,
    user
  });
};

const handleRegister = (req: Request, res: Response) => {
  const { email, fullName, role } = req.body;
  const userRole = role === 'Employer' ? 'Employer' : 'Candidate';
  const newUser = {
    id: (userRole === 'Employer' ? 'emp_' : 'cand_') + Date.now(),
    email: email || 'user@example.com',
    fullName: fullName || 'New User',
    role: userRole as 'Candidate' | 'Employer' | 'Admin',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);

  if (newUser.role === 'Candidate') {
    db.candidateProfiles[newUser.id] = {
      id: 'cp_' + Date.now(),
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      skills: ['JavaScript', 'React'],
      resumes: []
    };
  } else {
    db.companies.push({
      id: 'comp_' + Date.now(),
      name: newUser.fullName + "'s Company",
      description: 'Newly registered company on JobPortal.',
      industry: 'Technology',
      size: '1-10 employees',
      location: 'Remote',
      verified: false,
      employerId: newUser.id
    });
  }

  res.status(201).json({
    token: 'jwt_mock_token_' + newUser.id,
    user: newUser
  });
};

app.post(['/api/Auth/login', '/api/auth/login'], handleLogin);
app.post(['/api/Auth/register', '/api/auth/register'], handleRegister);

app.get(['/api/Auth/profile', '/api/auth/profile', '/api/auth/me'], (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const user = db.users.find(u => u.id === userId) || db.users[0];
  res.json(user);
});

app.put(['/api/Auth/profile', '/api/auth/profile'], (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const user = db.users.find(u => u.id === userId);
  if (user && req.body.fullName) {
    user.fullName = req.body.fullName;
  }
  res.json(user || db.users[0]);
});

app.post(['/api/Auth/logout', '/api/auth/logout'], (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully.' });
});

// ==========================================
// JOBS CONTROLLER (/api/jobs)
// ==========================================
app.get('/api/jobs', (req: Request, res: Response) => {
  const { 
    search, 
    searchTerm,
    location, 
    category, 
    employmentType, 
    workMode, 
    minSalary, 
    maxSalary, 
    sortBy,
    employerId 
  } = req.query;

  let filtered = [...db.jobs];

  if (employerId) {
    filtered = filtered.filter(j => j.employerId === employerId);
  }

  const querySearch = searchTerm || search;
  if (querySearch) {
    const s = String(querySearch).toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(s) || 
      j.companyName.toLowerCase().includes(s) ||
      j.skills.some(sk => sk.toLowerCase().includes(s)) ||
      j.description.toLowerCase().includes(s)
    );
  }

  if (location) {
    const loc = String(location).toLowerCase();
    filtered = filtered.filter(j => 
      j.location.toLowerCase().includes(loc) ||
      j.companyLocation.toLowerCase().includes(loc)
    );
  }

  if (category && category !== 'All Categories') {
    filtered = filtered.filter(j => j.category.toLowerCase() === String(category).toLowerCase());
  }

  if (employmentType && employmentType !== 'All Types') {
    filtered = filtered.filter(j => j.employmentType.toLowerCase() === String(employmentType).toLowerCase());
  }

  if (workMode && workMode !== 'All Modes') {
    filtered = filtered.filter(j => j.workMode.toLowerCase() === String(workMode).toLowerCase());
  }

  if (minSalary) {
    const min = Number(minSalary);
    filtered = filtered.filter(j => (j.salaryMax || j.salaryMin || 0) >= min);
  }

  if (maxSalary) {
    const max = Number(maxSalary);
    filtered = filtered.filter(j => (j.salaryMin || 0) <= max);
  }

  if (sortBy === 'salary_high') {
    filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
  } else if (sortBy === 'salary_low') {
    filtered.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => b.applicationsCount - a.applicationsCount);
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  res.json({
    items: filtered,
    totalCount: filtered.length,
    page: 1,
    pageSize: 50,
    totalPages: 1
  });
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  job.viewsCount += 1;
  const company = db.companies.find(c => c.id === job.companyId);
  res.json({ ...job, company });
});

// ====================================================
// EMPLOYER JOBS CONTROLLER (/api/employer/jobs)
// ====================================================
app.get('/api/employer/jobs', (req: Request, res: Response) => {
  const employerId = extractUserId(req);
  const jobs = db.jobs.filter(j => j.employerId === employerId || employerId === 'emp_1');
  res.json(jobs);
});

app.get('/api/employer/jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  res.json(job);
});

app.post(['/api/employer/jobs', '/api/jobs'], (req: Request, res: Response) => {
  const body = req.body;
  const employerId = extractUserId(req) || 'emp_1';
  const company = db.companies.find(c => c.employerId === employerId) || db.companies[0];

  const newJob = {
    id: 'job_' + Date.now(),
    title: body.title || 'Untitled Role',
    companyId: company?.id || 'comp_1',
    companyName: company?.name || 'Nexus Tech Innovations',
    companyLogo: company?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    companyLocation: company?.location || 'San Francisco, CA',
    category: body.category || 'Software Engineering',
    employmentType: body.employmentType || 'Full-Time',
    workMode: body.workMode || 'Remote',
    location: body.location || company?.location || 'Remote',
    salaryMin: body.salaryMin ? Number(body.salaryMin) : 100000,
    salaryMax: body.salaryMax ? Number(body.salaryMax) : 140000,
    salaryCurrency: '$',
    description: body.description || '',
    requirements: Array.isArray(body.requirements) ? body.requirements : (body.requirements || '').split('\n').filter(Boolean),
    benefits: Array.isArray(body.benefits) ? body.benefits : (body.benefits || '').split('\n').filter(Boolean),
    skills: Array.isArray(body.skills) ? body.skills : (body.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    status: (body.status || 'Active') as 'Active' | 'Closed' | 'Draft',
    viewsCount: 1,
    applicationsCount: 0,
    postedAt: new Date().toISOString(),
    deadline: body.deadline || undefined,
    employerId: employerId,
  };

  db.jobs.unshift(newJob);

  // Notify candidates about new job
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: 'cand_1',
    title: 'New Opportunity Posted!',
    message: `${newJob.companyName} just posted: ${newJob.title}`,
    type: 'job',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: `/jobs/${newJob.id}`
  });

  res.status(201).json(newJob);
});

app.put(['/api/employer/jobs/:id', '/api/jobs/:id'], (req: Request, res: Response) => {
  const index = db.jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const updated = {
    ...db.jobs[index],
    ...req.body,
    requirements: Array.isArray(req.body.requirements) ? req.body.requirements : db.jobs[index].requirements,
    benefits: Array.isArray(req.body.benefits) ? req.body.benefits : db.jobs[index].benefits,
    skills: Array.isArray(req.body.skills) ? req.body.skills : db.jobs[index].skills,
  };

  db.jobs[index] = updated;
  res.json(updated);
});

app.post('/api/employer/jobs/:id/publish', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  job.status = 'Active';
  res.json(job);
});

app.post('/api/employer/jobs/:id/close', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  job.status = 'Closed';
  res.json(job);
});

app.delete(['/api/employer/jobs/:id', '/api/jobs/:id'], (req: Request, res: Response) => {
  db.jobs = db.jobs.filter(j => j.id !== req.params.id);
  res.json({ success: true, message: 'Job deleted' });
});

// ==========================================================
// CANDIDATE APPLICATIONS CONTROLLER (/api/candidate/applications)
// ==========================================================
app.get(['/api/candidate/applications', '/api/applications'], (req: Request, res: Response) => {
  const candidateId = (req.query.candidateId as string) || extractUserId(req);
  const employerId = req.query.employerId as string;
  const jobId = req.query.jobId as string;
  let apps = [...db.applications];

  if (candidateId && !employerId) {
    apps = apps.filter(a => a.candidateId === candidateId || candidateId === 'cand_1');
  }
  if (jobId) {
    apps = apps.filter(a => a.jobId === jobId);
  }
  if (employerId) {
    const employerJobIds = db.jobs.filter(j => j.employerId === employerId).map(j => j.id);
    apps = apps.filter(a => employerJobIds.includes(a.jobId));
  }

  res.json(apps);
});

app.post(['/api/candidate/applications', '/api/applications'], (req: Request, res: Response) => {
  const { jobId, coverLetter, resumeFileName } = req.body;
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const cid = extractUserId(req) || 'cand_1';
  const user = db.users.find(u => u.id === cid) || db.users[0];
  const profile = db.candidateProfiles[cid];

  const newApp = {
    id: 'app_' + Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    companyLocation: job.companyLocation,
    candidateId: cid,
    candidateName: profile?.fullName || user.fullName,
    candidateEmail: user.email,
    candidatePhone: profile?.phone || '+1 (555) 123-4567',
    candidateTitle: profile?.title || 'Software Professional',
    coverLetter: coverLetter || '',
    resumeFileName: resumeFileName || profile?.resumes?.[0]?.fileName || 'Resume.pdf',
    status: 'Applied' as const,
    appliedAt: new Date().toISOString(),
    statusHistory: [
      {
        id: 'sh_' + Date.now(),
        status: 'Applied' as const,
        changedAt: new Date().toISOString(),
        notes: 'Application submitted by candidate'
      }
    ]
  };

  db.applications.unshift(newApp);
  job.applicationsCount += 1;

  // Create notification for employer
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: job.employerId,
    title: 'New Applicant Received',
    message: `${newApp.candidateName} applied for ${job.title}`,
    type: 'application',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/employer/applications'
  });

  res.status(201).json(newApp);
});

app.get('/api/candidate/applications/:id', (req: Request, res: Response) => {
  const appItem = db.applications.find(a => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ message: 'Application not found.' });
  res.json(appItem);
});

app.delete(['/api/candidate/applications/:id', '/api/applications/:id'], (req: Request, res: Response) => {
  const appItem = db.applications.find(a => a.id === req.params.id);
  if (appItem) {
    appItem.status = 'Withdrawn';
    appItem.statusHistory.push({
      id: 'sh_' + Date.now(),
      status: 'Withdrawn',
      changedAt: new Date().toISOString(),
      notes: 'Application withdrawn by candidate'
    });
  }
  res.status(204).send();
});

// ===============================================================
// EMPLOYER JOB APPLICATIONS (/api/employer/jobs/:jobId/applications)
// ===============================================================
app.get('/api/employer/jobs/:jobId/applications', (req: Request, res: Response) => {
  const apps = db.applications.filter(a => a.jobId === req.params.jobId);
  res.json(apps);
});

app.put(['/api/employer/jobs/:jobId/applications/:applicationId/status', '/api/applications/:id/status'], (req: Request, res: Response) => {
  const appId = req.params.applicationId || req.params.id;
  const { status, notes } = req.body;
  const appItem = db.applications.find(a => a.id === appId);
  if (!appItem) {
    return res.status(404).json({ message: 'Application not found' });
  }

  appItem.status = status;
  if (notes) {
    appItem.employerNotes = notes;
  }
  appItem.statusHistory.push({
    id: 'sh_' + Date.now(),
    status: status,
    changedAt: new Date().toISOString(),
    notes: notes || `Status updated to ${status}`
  });

  // Notify candidate
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: appItem.candidateId,
    title: `Application Status Updated: ${status}`,
    message: `Your application for ${appItem.jobTitle} at ${appItem.companyName} is now "${status}".`,
    type: 'application',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/applications'
  });

  res.json(appItem);
});

// ====================================================
// INTERVIEWS CONTROLLER (/api/interviews)
// ====================================================
app.get('/api/interviews', (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const { candidateId, employerId } = req.query;
  let list = [...db.interviews];

  if (candidateId) {
    list = list.filter(i => i.candidateId === candidateId);
  } else if (employerId) {
    const employerJobIds = db.jobs.filter(j => j.employerId === employerId).map(j => j.id);
    list = list.filter(i => employerJobIds.includes(i.jobId));
  } else {
    list = list.filter(i => i.candidateId === userId || i.candidateId === 'cand_1');
  }

  res.json(list);
});

app.get('/api/interviews/application/:applicationId', (req: Request, res: Response) => {
  const list = db.interviews.filter(i => i.applicationId === req.params.applicationId);
  res.json(list);
});

app.get('/api/interviews/:id', (req: Request, res: Response) => {
  const interview = db.interviews.find(i => i.id === req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found.' });
  res.json(interview);
});

app.post('/api/interviews', (req: Request, res: Response) => {
  const { applicationId, scheduledAt, durationMinutes, meetingLink, location, interviewType, notes } = req.body;
  const appItem = db.applications.find(a => a.id === applicationId);
  if (!appItem) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const newInterview = {
    id: 'int_' + Date.now(),
    applicationId: appItem.id,
    jobId: appItem.jobId,
    jobTitle: appItem.jobTitle,
    companyName: appItem.companyName,
    candidateId: appItem.candidateId,
    candidateName: appItem.candidateName,
    candidateEmail: appItem.candidateEmail,
    scheduledAt: scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: Number(durationMinutes) || 45,
    meetingLink: meetingLink || 'https://meet.google.com/ais-interview-' + Math.floor(Math.random() * 1000),
    location: location || '',
    interviewType: interviewType || 'Online Video',
    status: 'Scheduled' as const,
    notes: notes || 'Interview scheduled.'
  };

  db.interviews.unshift(newInterview);

  // Update application status to Interview Scheduled
  appItem.status = 'Interview Scheduled';
  appItem.statusHistory.push({
    id: 'sh_' + Date.now(),
    status: 'Interview Scheduled',
    changedAt: new Date().toISOString(),
    notes: `Interview scheduled on ${new Date(newInterview.scheduledAt).toLocaleDateString()}`
  });

  // Notify candidate
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: appItem.candidateId,
    title: 'New Interview Scheduled!',
    message: `${appItem.companyName} scheduled an interview for ${appItem.jobTitle}.`,
    type: 'interview',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/interviews'
  });

  res.status(201).json(newInterview);
});

app.put('/api/interviews/:id', (req: Request, res: Response) => {
  const index = db.interviews.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  db.interviews[index] = { ...db.interviews[index], ...req.body };
  res.json(db.interviews[index]);
});

app.post('/api/interviews/:id/cancel', (req: Request, res: Response) => {
  const interview = db.interviews.find(i => i.id === req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found.' });
  interview.status = 'Cancelled';
  res.json(interview);
});

// ====================================================
// SAVED JOBS CONTROLLER (/api/candidate/saved-jobs)
// ====================================================
app.get(['/api/candidate/saved-jobs', '/api/saved-jobs'], (req: Request, res: Response) => {
  const candidateId = extractUserId(req) || 'cand_1';
  const saved = db.savedJobs.filter(s => s.candidateId === candidateId || candidateId === 'cand_1');
  const jobs = saved.map(s => {
    const job = db.jobs.find(j => j.id === s.jobId);
    return { ...job, savedId: s.id, savedAt: s.savedAt };
  }).filter(Boolean);
  res.json(jobs);
});

app.get('/api/candidate/saved-jobs/:jobId/check', (req: Request, res: Response) => {
  const candidateId = extractUserId(req) || 'cand_1';
  const isSaved = db.savedJobs.some(s => s.candidateId === candidateId && s.jobId === req.params.jobId);
  res.json({ isSaved });
});

app.post(['/api/candidate/saved-jobs/:jobId', '/api/saved-jobs'], (req: Request, res: Response) => {
  const jobId = req.params.jobId || req.body.jobId;
  const candidateId = extractUserId(req) || 'cand_1';
  const existing = db.savedJobs.find(s => s.candidateId === candidateId && s.jobId === jobId);
  if (existing) {
    return res.json({ isSaved: true, saved: existing });
  }

  const saved = {
    id: 'sj_' + Date.now(),
    candidateId,
    jobId,
    savedAt: new Date().toISOString()
  };
  db.savedJobs.unshift(saved);
  res.status(201).json({ isSaved: true, saved });
});

app.delete(['/api/candidate/saved-jobs/:jobId', '/api/saved-jobs/:jobId'], (req: Request, res: Response) => {
  const candidateId = extractUserId(req) || 'cand_1';
  db.savedJobs = db.savedJobs.filter(s => !(s.candidateId === candidateId && s.jobId === req.params.jobId));
  res.status(204).send();
});

// ====================================================
// NOTIFICATIONS CONTROLLER (/api/notifications)
// ====================================================
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const { unreadOnly } = req.query;
  let list = db.notifications.filter(n => n.userId === userId || n.userId === 'cand_1');
  if (unreadOnly === 'true') {
    list = list.filter(n => !n.isRead);
  }
  res.json({
    items: list,
    unreadCount: list.filter(n => !n.isRead).length,
    totalCount: list.length
  });
});

app.get('/api/notifications/unread-count', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const unreadCount = db.notifications.filter(n => (n.userId === userId || n.userId === 'cand_1') && !n.isRead).length;
  res.json({ unreadCount });
});

app.put(['/api/notifications/:id/read', '/api/notifications/:id'], (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  db.notifications.forEach(n => {
    if (n.userId === userId || n.userId === 'cand_1') {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  db.notifications.forEach(n => {
    if (n.userId === userId || n.userId === 'cand_1') {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

// ====================================================
// CANDIDATE PROFILE CONTROLLER (/api/candidate/profile)
// ====================================================
app.get(['/api/candidate/profile', '/api/candidates/profile'], (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const profile = db.candidateProfiles[userId] || db.candidateProfiles['cand_1'] || {
    id: 'cp_' + userId,
    userId: userId,
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    skills: ['TypeScript', 'React', 'Node.js'],
    resumes: []
  };
  res.json(profile);
});

app.post(['/api/candidate/profile', '/api/candidates/profile'], (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const newProfile = {
    id: 'cp_' + userId,
    userId: userId,
    ...req.body,
    resumes: []
  };
  db.candidateProfiles[userId] = newProfile;
  res.status(201).json(newProfile);
});

app.put(['/api/candidate/profile', '/api/candidates/profile'], (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const existing = db.candidateProfiles[userId] || db.candidateProfiles['cand_1'] || {
    id: 'cp_' + userId,
    userId: userId,
    fullName: req.body.fullName || 'Alex Morgan',
    email: req.body.email || 'alex.morgan@example.com',
    skills: [],
    resumes: []
  };

  const updated = {
    ...existing,
    ...req.body,
    skills: Array.isArray(req.body.skills) ? req.body.skills : (typeof req.body.skills === 'string' ? req.body.skills.split(',').map((s: string) => s.trim()) : existing.skills)
  };

  db.candidateProfiles[userId] = updated;

  // Also update User entity if name changed
  const u = db.users.find(u => u.id === userId);
  if (u && req.body.fullName) {
    u.fullName = req.body.fullName;
  }

  res.json(updated);
});

// Resumes for candidate
app.get('/api/candidate/resumes', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const profile = db.candidateProfiles[userId] || db.candidateProfiles['cand_1'];
  res.json(profile?.resumes || []);
});

app.post('/api/candidate/resumes', (req: Request, res: Response) => {
  const userId = extractUserId(req) || 'cand_1';
  const profile = db.candidateProfiles[userId] || db.candidateProfiles['cand_1'];
  const newResume = {
    id: 'res_' + Date.now(),
    candidateId: userId,
    fileName: req.body.fileName || 'Resume.pdf',
    fileSize: req.body.fileSize || '150 KB',
    uploadedAt: new Date().toISOString(),
    isPrimary: Boolean(req.body.isPrimary),
    fileUrl: '#'
  };
  if (profile) {
    profile.resumes.unshift(newResume);
  }
  res.status(201).json(newResume);
});

// ====================================================
// EMPLOYER PROFILE CONTROLLER (/api/employer/profile)
// ====================================================
app.get(['/api/employer/profile', '/api/employers/company'], (req: Request, res: Response) => {
  const employerId = extractUserId(req) || 'emp_1';
  const comp = db.companies.find(c => c.employerId === employerId) || db.companies[0];
  res.json(comp);
});

app.post(['/api/employer/profile', '/api/employers/company'], (req: Request, res: Response) => {
  const employerId = extractUserId(req) || 'emp_1';
  const newComp = {
    id: 'comp_' + Date.now(),
    employerId,
    name: req.body.name || 'My Company',
    description: req.body.description || '',
    industry: req.body.industry || 'Technology',
    size: req.body.size || '10-50 employees',
    location: req.body.location || 'Remote',
    websiteUrl: req.body.websiteUrl,
    logoUrl: req.body.logoUrl,
    verified: true
  };
  db.companies.push(newComp);
  res.status(201).json(newComp);
});

app.put(['/api/employer/profile', '/api/employers/company'], (req: Request, res: Response) => {
  const employerId = extractUserId(req) || 'emp_1';
  const compIndex = db.companies.findIndex(c => c.employerId === employerId);
  if (compIndex === -1) {
    const newComp = {
      id: 'comp_' + Date.now(),
      employerId,
      name: req.body.name || 'My Company',
      description: req.body.description || '',
      industry: req.body.industry || 'Technology',
      size: req.body.size || '10-50 employees',
      location: req.body.location || 'Remote',
      websiteUrl: req.body.websiteUrl,
      logoUrl: req.body.logoUrl,
      verified: true
    };
    db.companies.push(newComp);
    return res.json(newComp);
  }

  db.companies[compIndex] = {
    ...db.companies[compIndex],
    ...req.body
  };
  res.json(db.companies[compIndex]);
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JobPortal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
