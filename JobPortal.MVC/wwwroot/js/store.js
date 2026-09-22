// In-memory data store for JobPortal

export const users = [
  {
    id: 1,
    email: 'candidate@example.com',
    password: 'Password123!',
    name: 'Alex Morgan',
    firstName: 'Alex',
    lastName: 'Morgan',
    role: 'Candidate',
    title: 'Senior Full-Stack Engineer',
    location: 'San Francisco, CA',
    phone: '+1 (555) 234-5678',
    bio: 'Passionate full-stack software engineer with 6+ years building scalable web applications in TypeScript, React, Node.js, and C# .NET.',
    skills: ['React', 'TypeScript', 'Node.js', 'C#', '.NET', 'PostgreSQL', 'Docker', 'AWS'],
    resumeUrl: 'https://example.com/resumes/alex-morgan.pdf',
    createdAt: new Date('2026-01-15')
  },
  {
    id: 2,
    email: 'employer@example.com',
    password: 'Password123!',
    name: 'Sarah Chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'Employer',
    title: 'VP of Engineering',
    companyName: 'TechCorp Solutions',
    companyId: 1,
    location: 'San Francisco, CA',
    phone: '+1 (555) 987-6543',
    bio: 'Leading talent acquisition and engineering teams at TechCorp Solutions.',
    createdAt: new Date('2026-01-10')
  }
];

export const companies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    logoUrl: '',
    industry: 'Enterprise Software & Cloud',
    location: 'San Francisco, CA',
    website: 'https://techcorp-example.com',
    size: '250-500 employees',
    description: 'TechCorp Solutions builds enterprise-grade cloud computing, workflow automation, and distributed systems trusted by Fortune 500 companies worldwide.',
    verified: true
  },
  {
    id: 2,
    name: 'InnovateAI Labs',
    logoUrl: '',
    industry: 'Artificial Intelligence',
    location: 'New York, NY',
    website: 'https://innovateai-example.com',
    size: '50-100 employees',
    description: 'Pioneering multimodal foundation models, neural search, and agentic workflows to empower creative and engineering teams.',
    verified: true
  },
  {
    id: 3,
    name: 'NextGen Media',
    logoUrl: '',
    industry: 'Digital Media & Streaming',
    location: 'Austin, TX',
    website: 'https://nextgenmedia-example.com',
    size: '100-250 employees',
    description: 'High-throughput real-time streaming architectures and media delivery networks serving tens of millions of active users.',
    verified: true
  },
  {
    id: 4,
    name: 'FinFlow Global',
    logoUrl: '',
    industry: 'Fintech & Payments',
    location: 'Chicago, IL',
    website: 'https://finflow-example.com',
    size: '500+ employees',
    description: 'Ultra-low latency clearing, global banking APIs, and high-frequency settlement infrastructure.',
    verified: true
  },
  {
    id: 5,
    name: 'Quantum Dynamics',
    logoUrl: '',
    industry: 'Security & Infrastructure',
    location: 'Seattle, WA',
    website: 'https://quantumdynamics-example.com',
    size: '150-300 employees',
    description: 'Zero-trust cloud security and automated compliance monitoring for mission-critical Kubernetes environments.',
    verified: true
  },
  {
    id: 6,
    name: 'BioHealth Therapeutics',
    logoUrl: '',
    industry: 'Healthcare & Biotech',
    location: 'Boston, MA',
    website: 'https://biohealth-example.com',
    size: '200-400 employees',
    description: 'Advancing clinical informatics, biomarker analysis, and precision patient therapeutics.',
    verified: true
  },
  {
    id: 7,
    name: 'PulseMedia Global',
    logoUrl: '',
    industry: 'Marketing & Digital Growth',
    location: 'Los Angeles, CA',
    website: 'https://pulsemedia-example.com',
    size: '80-150 employees',
    description: 'Omnichannel brand strategy, data-driven performance marketing, and creative viral content.',
    verified: true
  },
  {
    id: 8,
    name: 'Apex Build Group',
    logoUrl: '',
    industry: 'Civil & Structural Engineering',
    location: 'Denver, CO',
    website: 'https://apexbuild-example.com',
    size: '300-600 employees',
    description: 'Sustainable infrastructure, structural engineering systems, and urban architectural projects.',
    verified: true
  },
  {
    id: 9,
    name: 'Beacon Academy Online',
    logoUrl: '',
    industry: 'Education & EdTech',
    location: 'Cambridge, MA',
    website: 'https://beaconacademy-example.com',
    size: '50-120 employees',
    description: 'Empowering future leaders through adaptive AI curriculum, remote tutoring, and credentialing.',
    verified: true
  },
  {
    id: 10,
    name: 'OmniSales Cloud',
    logoUrl: '',
    industry: 'Enterprise SaaS & Commerce',
    location: 'Atlanta, GA',
    website: 'https://omnisales-example.com',
    size: '150-350 employees',
    description: 'Modern B2B revenue intelligence, omnichannel CRM, and retail inventory management.',
    verified: true
  },
  {
    id: 11,
    name: 'Sterling & Cross LLP',
    logoUrl: '',
    industry: 'Legal & Corporate Advisory',
    location: 'Washington, DC',
    website: 'https://sterlingcross-example.com',
    size: '100-250 employees',
    description: 'Premier technology IP counsel, cross-border corporate governance, and regulatory compliance.',
    verified: true
  },
  {
    id: 12,
    name: 'Azure Coastline Resorts',
    logoUrl: '',
    industry: 'Hospitality & Luxury Travel',
    location: 'Miami, FL',
    website: 'https://azureresorts-example.com',
    size: '400+ employees',
    description: 'Bespoke coastal hospitality, eco-resort dining, and global guest luxury experiences.',
    verified: true
  }
];

export const jobs = [
  {
    id: 1,
    employerId: 2,
    companyId: 1,
    companyName: 'TechCorp Solutions',
    companyLogoUrl: '',
    title: 'Senior Full-Stack Engineer',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Software / IT',
    minSalary: 140000,
    maxSalary: 185000,
    currency: 'USD',
    description: `We are looking for a Senior Full-Stack Engineer to join our core product team. You will lead the development of our high-volume workflow automation engine and cloud orchestration platforms.

You will collaborate closely with product management, designers, and infrastructure teams to design, architect, and ship scalable, resilient software that serves thousands of enterprise clients.`,
    requirements: `• 5+ years of software engineering experience in modern web platforms.
• Strong proficiency in TypeScript, React, and Node.js or C# / ASP.NET Core.
• Proven track record architecting microservices and database schemas with PostgreSQL.
• Experience with containerization (Docker, Kubernetes) and CI/CD automation pipelines.
• Excellent communication skills and passion for mentoring junior engineers.`,
    responsibilities: [
      'Architect robust APIs and interactive web user interfaces using modern best practices.',
      'Improve system reliability, latency, and throughput across distributed cloud services.',
      'Participate in code reviews, design documentation, and architectural planning.',
      'Mentor and guide junior and mid-level engineering team members.'
    ],
    benefits: 'Comprehensive health, vision, dental coverage; 401(k) with 5% match; unlimited PTO; $3,000 annual learning stipend; modern MacBook Pro setup.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    status: 'Active',
    viewsCount: 342,
    applicationsCount: 14,
    postedDate: new Date('2026-09-15'),
    expiryDate: new Date('2026-10-31')
  },
  {
    id: 2,
    employerId: 2,
    companyId: 4,
    companyName: 'FinFlow Global',
    companyLogoUrl: '',
    title: 'Quantitative Risk & Financial Analyst',
    location: 'Chicago, IL',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Finance / Accounting',
    minSalary: 155000,
    maxSalary: 210000,
    currency: 'USD',
    description: `FinFlow Global is seeking a Quantitative Risk Analyst to design predictive risk models, stress-testing algorithms, and automated balance sheet valuations.

You will work closely with portfolio managers and quantitative trading desks to formulate capital efficiency strategies.`,
    requirements: `• MS in Financial Engineering, Quantitative Finance, Mathematics, or Economics.
• 3+ years experience in risk management, algorithmic modeling, or capital analytics.
• Strong statistical modeling skills in Python, R, and SQL.
• Familiarity with Basel regulatory frameworks and Dodd-Frank compliance.`,
    responsibilities: [
      'Build statistical valuation models and credit risk metrics.',
      'Automate daily market exposure assessments and stress testing scenarios.',
      'Present risk forecasts directly to the executive treasury committee.'
    ],
    benefits: 'Competitive base + 25% target bonus, 401(k) 6% match, private medical concierge, tuition reimbursement.',
    skills: ['Python', 'Quantitative Modeling', 'Risk Analytics', 'SQL', 'Financial Modeling'],
    status: 'Active',
    viewsCount: 280,
    applicationsCount: 9,
    postedDate: new Date('2026-09-16'),
    expiryDate: new Date('2026-11-10')
  },
  {
    id: 3,
    employerId: 2,
    companyId: 6,
    companyName: 'BioHealth Therapeutics',
    companyLogoUrl: '',
    title: 'Clinical Data Informatics & Health Lead',
    location: 'Boston, MA',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Healthcare',
    minSalary: 135000,
    maxSalary: 175000,
    currency: 'USD',
    description: `BioHealth Therapeutics is hiring a Clinical Data Informatics Lead to orchestrate electronic health record (EHR) analytics and biomarker telemetry across phase II/III clinical trials.`,
    requirements: `• Advanced degree in Health Informatics, Biostatistics, or Bioinformatics.
• 4+ years analyzing clinical trial protocols and real-world health evidence (RWE).
• Deep understanding of HIPAA, FHIR standards, and CDISC regulatory submissions.
• Hands-on expertise with Python / R and clinical database warehousing.`,
    responsibilities: [
      'Standardize electronic health records and trial endpoint telemetry.',
      'Collaborate with principal investigators on patient cohort identification.',
      'Ensure strict data governance and regulatory audit readiness.'
    ],
    benefits: 'Comprehensive health, vision, and mental wellness coverage, annual healthcare bonus, flexible scheduling.',
    skills: ['Health Informatics', 'EHR/FHIR', 'Biostatistics', 'HIPAA', 'Python'],
    status: 'Active',
    viewsCount: 310,
    applicationsCount: 12,
    postedDate: new Date('2026-09-17'),
    expiryDate: new Date('2026-11-20')
  },
  {
    id: 4,
    employerId: 2,
    companyId: 3,
    companyName: 'NextGen Media',
    companyLogoUrl: '',
    title: 'Principal Design Systems & UI/UX Specialist',
    location: 'Austin, TX',
    workMode: 'Remote',
    employmentType: 'FullTime',
    category: 'Design / Creative',
    minSalary: 130000,
    maxSalary: 170000,
    currency: 'USD',
    description: `Join NextGen Media to define and maintain our next-generation design systems across multi-platform streaming apps, TV interfaces, and mobile viewports.`,
    requirements: `• 5+ years crafting enterprise design systems and component token architectures.
• Mastery of Figma, component libraries, accessibility standards (WCAG 2.1 AA), and interactive prototyping.
• Portfolio exhibiting exceptional optical alignment, typographic rhythm, and design craft.`,
    responsibilities: [
      'Lead token architecture in Figma and synchronize tokens with frontend engineers.',
      'Conduct usability tests and iterate on streaming navigation patterns.',
      'Establish brand aesthetic guidelines and responsive interaction principles.'
    ],
    benefits: 'Remote-first setup stipend ($2,500), unlimited PTO, creative conference allowance, wellness stipends.',
    skills: ['Figma', 'Design Systems', 'UI/UX', 'Accessibility', 'Prototyping'],
    status: 'Active',
    viewsCount: 420,
    applicationsCount: 26,
    postedDate: new Date('2026-09-18'),
    expiryDate: new Date('2026-10-28')
  },
  {
    id: 5,
    employerId: 2,
    companyId: 7,
    companyName: 'PulseMedia Global',
    companyLogoUrl: '',
    title: 'Growth Marketing & Brand Strategist',
    location: 'Los Angeles, CA',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Marketing',
    minSalary: 110000,
    maxSalary: 145000,
    currency: 'USD',
    description: `PulseMedia is looking for a Growth Marketing & Brand Strategist to orchestrate high-impact multi-channel acquisition campaigns and data-driven brand storytelling.`,
    requirements: `• 4+ years spearheading B2B/B2C acquisition, brand positioning, and content funnels.
• Proven track record scaling organic search traffic (SEO) and optimizing paid CAC/LTV.
• Strong analytical background with Google Analytics 4, Mixpanel, and HubSpot.`,
    responsibilities: [
      'Formulate viral campaign playbooks and multi-touch attribution funnels.',
      'Coordinate with product and creative teams to produce compelling launch assets.',
      'A/B test landing pages and conversion optimization funnels.'
    ],
    benefits: 'Performance bonus, full healthcare, modern creator gear stipend, company retreats.',
    skills: ['Growth Marketing', 'SEO', 'Brand Strategy', 'Analytics', 'Conversion Optimization'],
    status: 'Active',
    viewsCount: 295,
    applicationsCount: 18,
    postedDate: new Date('2026-09-14'),
    expiryDate: new Date('2026-10-30')
  },
  {
    id: 6,
    employerId: 2,
    companyId: 8,
    companyName: 'Apex Build Group',
    companyLogoUrl: '',
    title: 'Lead Structural & Civil Project Engineer',
    location: 'Denver, CO',
    workMode: 'OnSite',
    employmentType: 'FullTime',
    category: 'Engineering / Construction',
    minSalary: 125000,
    maxSalary: 165000,
    currency: 'USD',
    description: `Apex Build Group is hiring a Lead Structural Engineer to direct large-scale sustainable commercial developments and municipal transit infrastructure.`,
    requirements: `• BS or MS in Civil / Structural Engineering with active PE license.
• 5+ years in structural design, steel/concrete drafting, and site inspection.
• Proficiency with AutoCAD, Revit BIM, ETABS, and seismic building codes.`,
    responsibilities: [
      'Perform rigorous load calculations and structural integrity assessments.',
      'Coordinate with city zoning officials, architects, and on-site contractors.',
      'Supervise on-site safety compliance and material testing verification.'
    ],
    benefits: 'Company truck allowance, 401(k) match, health/dental/vision, PE license renewal support.',
    skills: ['Structural Engineering', 'Revit BIM', 'AutoCAD', 'Civil Construction', 'Project Management'],
    status: 'Active',
    viewsCount: 210,
    applicationsCount: 7,
    postedDate: new Date('2026-09-13'),
    expiryDate: new Date('2026-11-15')
  },
  {
    id: 7,
    employerId: 2,
    companyId: 9,
    companyName: 'Beacon Academy Online',
    companyLogoUrl: '',
    title: 'Curriculum & EdTech Learning Director',
    location: 'Cambridge, MA',
    workMode: 'Remote',
    employmentType: 'FullTime',
    category: 'Education',
    minSalary: 105000,
    maxSalary: 140000,
    currency: 'USD',
    description: `Lead the next era of digital learning. Beacon Academy is seeking an Instructional Design Director to author interactive computer science and STEM curricula.`,
    requirements: `• Master's in Education, Instructional Design, or related field.
• 4+ years designing interactive online coursework or EdTech learning experiences.
• Experience with pedagogy assessment, LMS platforms (Canvas, Moodle), and microlearning.`,
    responsibilities: [
      'Design engaging modular STEM and computer science curriculum modules.',
      'Train remote educators on blended instruction and formative feedback.',
      'Evaluate student engagement metrics to refine course pacing.'
    ],
    benefits: 'Flexible schedule, home office budget, educational sabbatical options, full health coverage.',
    skills: ['Instructional Design', 'EdTech', 'Curriculum Development', 'Pedagogy', 'LMS'],
    status: 'Active',
    viewsCount: 185,
    applicationsCount: 15,
    postedDate: new Date('2026-09-16'),
    expiryDate: new Date('2026-11-25')
  },
  {
    id: 8,
    employerId: 2,
    companyId: 10,
    companyName: 'OmniSales Cloud',
    companyLogoUrl: '',
    title: 'Enterprise SaaS Account Executive',
    location: 'Atlanta, GA',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Sales / Retail',
    minSalary: 115000,
    maxSalary: 180000,
    currency: 'USD',
    description: `OmniSales Cloud is seeking an Enterprise Account Executive to close strategic multi-year software agreements with Fortune 1000 retailers and brands.`,
    requirements: `• 4+ years quota-carrying software sales experience in B2B SaaS or Retail Tech.
• Track record of exceeding $1.2M+ annual ARR quotas.
• Strong negotiation, discovery, executive presentation, and MEDDPICC qualification skills.`,
    responsibilities: [
      'Prospect, negotiate, and close enterprise SaaS contracts ($50k-$250k ARR).',
      'Partner with solutions architects to deliver customized ROI demonstrations.',
      'Maintain CRM hygiene and accurate quarterly pipeline forecasts.'
    ],
    benefits: 'Uncapped commission plan, President\'s Club trips, 401(k), car allowance, premium benefits.',
    skills: ['Enterprise Sales', 'B2B SaaS', 'Account Management', 'Negotiation', 'CRM'],
    status: 'Active',
    viewsCount: 350,
    applicationsCount: 19,
    postedDate: new Date('2026-09-15'),
    expiryDate: new Date('2026-11-05')
  },
  {
    id: 9,
    employerId: 2,
    companyId: 11,
    companyName: 'Sterling & Cross LLP',
    companyLogoUrl: '',
    title: 'Senior Corporate & Technology IP Counsel',
    location: 'Washington, DC',
    workMode: 'Hybrid',
    employmentType: 'FullTime',
    category: 'Legal',
    minSalary: 165000,
    maxSalary: 225000,
    currency: 'USD',
    description: `Sterling & Cross LLP is seeking a Senior Legal Counsel to provide strategic guidance on intellectual property licensing, venture financings, and SaaS terms of service.`,
    requirements: `• JD from an ABA-accredited law school and active state bar membership.
• 4+ years of relevant corporate or technology transactions experience at a law firm or in-house.
• Deep expertise in software licensing, data privacy (GDPR/CCPA), and commercial contracts.`,
    responsibilities: [
      'Draft and negotiate high-value commercial agreements and vendor partnerships.',
      'Advise executive leadership on risk mitigation and intellectual property protection.',
      'Ensure worldwide regulatory compliance and privacy policies.'
    ],
    benefits: 'Full health/vision/dental, 401(k) with high firm contribution, CLE allowance, fitness stipend.',
    skills: ['Corporate Law', 'IP Licensing', 'Contract Negotiation', 'Compliance', 'Data Privacy'],
    status: 'Active',
    viewsCount: 230,
    applicationsCount: 6,
    postedDate: new Date('2026-09-11'),
    expiryDate: new Date('2026-11-18')
  },
  {
    id: 10,
    employerId: 2,
    companyId: 12,
    companyName: 'Azure Coastline Resorts',
    companyLogoUrl: '',
    title: 'Luxury Hospitality & Operations Manager',
    location: 'Miami, FL',
    workMode: 'OnSite',
    employmentType: 'FullTime',
    category: 'Hospitality / Tourism',
    minSalary: 95000,
    maxSalary: 130000,
    currency: 'USD',
    description: `Oversee luxury guest operations, concierge services, and beachfront hospitality for a premier 5-star resort destination.`,
    requirements: `• Bachelor's degree in Hospitality Management or related field.
• 4+ years managing front-of-house, guest experience, or luxury boutique operations.
• Exceptional leadership, multilingual communication, and conflict resolution skills.`,
    responsibilities: [
      'Ensure immaculate 5-star luxury standards across guest arrival, dining, and concierge.',
      'Train and mentor front-desk, valet, and guest relations staff.',
      'Analyze guest satisfaction feedback and drive continuous service improvements.'
    ],
    benefits: 'Resort stay privileges worldwide, health/dental plans, seasonal bonus, relocation support.',
    skills: ['Hospitality Management', 'Guest Experience', 'Operations', 'Team Leadership', 'Luxury Service'],
    status: 'Active',
    viewsCount: 275,
    applicationsCount: 21,
    postedDate: new Date('2026-09-17'),
    expiryDate: new Date('2026-11-28')
  },
  {
    id: 11,
    employerId: 2,
    companyId: 1,
    companyName: 'TechCorp Solutions',
    companyLogoUrl: '',
    title: 'Operations & Workplace Facilities Coordinator',
    location: 'San Francisco, CA',
    workMode: 'OnSite',
    employmentType: 'FullTime',
    category: 'Other',
    minSalary: 75000,
    maxSalary: 95000,
    currency: 'USD',
    description: `Coordinate workplace services, facilities logistics, vendor management, and internal events across our multi-floor corporate headquarters.`,
    requirements: `• 2+ years experience in office management, workplace operations, or facilities coordination.
• High organizational skill, vendor contract management, and problem-solving agility.
• Proficiency in modern workspace management software and ticketing systems.`,
    responsibilities: [
      'Manage day-to-day campus facilities, badge security, and workplace supply logistics.',
      'Coordinate catering, equipment deliveries, and all-hands company events.',
      'Liaise with building management and security contractors.'
    ],
    benefits: 'Comprehensive benefits package, transit commuter pass, free catered lunches, 401(k).',
    skills: ['Operations', 'Facilities Management', 'Vendor Management', 'Event Planning', 'Logistics'],
    status: 'Active',
    viewsCount: 160,
    applicationsCount: 10,
    postedDate: new Date('2026-09-14'),
    expiryDate: new Date('2026-11-01')
  }
];

export const savedJobIds = new Set([1, 4]); // Alex Morgan's saved jobs

export const applications = [
  {
    id: 1,
    jobId: 1,
    candidateId: 1,
    candidateName: 'Alex Morgan',
    candidateEmail: 'candidate@example.com',
    candidateTitle: 'Senior Full-Stack Engineer',
    jobTitle: 'Senior Full-Stack Engineer',
    companyName: 'TechCorp Solutions',
    coverLetter: 'I am thrilled to apply for the Senior Full-Stack role at TechCorp. With 6+ years designing scalable web architectures and leading distributed systems, I am confident I can make an immediate impact.',
    status: 'Interview Scheduled',
    appliedDate: new Date('2026-09-16'),
    history: [
      { status: 'Submitted', date: new Date('2026-09-16') },
      { status: 'Under Review', date: new Date('2026-09-18') },
      { status: 'Interview Scheduled', date: new Date('2026-09-19') }
    ]
  },
  {
    id: 2,
    jobId: 4,
    candidateId: 1,
    candidateName: 'Alex Morgan',
    candidateEmail: 'candidate@example.com',
    candidateTitle: 'Senior Full-Stack Engineer',
    jobTitle: 'Senior Backend .NET Core Engineer',
    companyName: 'FinFlow Global',
    coverLetter: 'My background in C#, .NET Core, and distributed message queues aligns closely with the high-reliability demands of FinFlow Global.',
    status: 'Under Review',
    appliedDate: new Date('2026-09-17'),
    history: [
      { status: 'Submitted', date: new Date('2026-09-17') },
      { status: 'Under Review', date: new Date('2026-09-19') }
    ]
  }
];

export const interviews = [
  {
    id: 1,
    applicationId: 1,
    jobTitle: 'Senior Full-Stack Engineer',
    companyName: 'TechCorp Solutions',
    interviewerName: 'Sarah Chen',
    interviewerRole: 'VP of Engineering',
    candidateName: 'Alex Morgan',
    scheduledAt: new Date('2026-09-24T10:00:00-07:00'),
    durationMinutes: 45,
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'Scheduled',
    notes: 'Technical Architecture & System Design Discussion'
  }
];

export const notifications = [
  {
    id: 1,
    userId: 1,
    title: 'Interview Scheduled',
    message: 'TechCorp Solutions scheduled a Technical Architecture interview with you on Sep 24, 2026 at 10:00 AM.',
    read: false,
    createdAt: new Date('2026-09-19T14:30:00')
  },
  {
    id: 2,
    userId: 1,
    title: 'Application Under Review',
    message: 'Your application for Senior Backend .NET Core Engineer at FinFlow Global is now being reviewed.',
    read: false,
    createdAt: new Date('2026-09-19T09:15:00')
  },
  {
    id: 3,
    userId: 1,
    title: 'Welcome to JobPortal',
    message: 'Complete your candidate profile to get personalized job recommendations.',
    read: true,
    createdAt: new Date('2026-09-15T08:00:00')
  }
];
