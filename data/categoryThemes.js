// Centralized Job Category Visual Themes mapping for JobPortal
// Defines separate, dedicated visual identities for each job category
// Independent of global application themes

export const JOB_CATEGORIES = [
  {
    key: 'software',
    id: 'software',
    name: 'Software / IT',
    label: 'Software / IT',
    colorName: 'Blue',
    cssClass: 'job-theme-software',
    accentColor: '#2563eb',
    description: 'Software development, cloud architecture, AI/ML, and DevOps',
    icon: 'code'
  },
  {
    key: 'finance',
    id: 'finance',
    name: 'Finance / Accounting',
    label: 'Finance / Accounting',
    colorName: 'Green',
    cssClass: 'job-theme-finance',
    accentColor: '#16a34a',
    description: 'Financial analysis, fintech, accounting, and quantitative trading',
    icon: 'trending-up'
  },
  {
    key: 'healthcare',
    id: 'healthcare',
    name: 'Healthcare',
    label: 'Healthcare',
    colorName: 'Red/Rose',
    cssClass: 'job-theme-healthcare',
    accentColor: '#e11d48',
    description: 'Clinical informatics, medical research, nursing, and biotech',
    icon: 'activity'
  },
  {
    key: 'design',
    id: 'design',
    name: 'Design / Creative',
    label: 'Design / Creative',
    colorName: 'Purple',
    cssClass: 'job-theme-design',
    accentColor: '#9333ea',
    description: 'UI/UX design, design systems, visual arts, and multimedia',
    icon: 'layout'
  },
  {
    key: 'marketing',
    id: 'marketing',
    name: 'Marketing',
    label: 'Marketing',
    colorName: 'Orange',
    cssClass: 'job-theme-marketing',
    accentColor: '#ea580c',
    description: 'Brand strategy, SEO, performance marketing, and content',
    icon: 'megaphone'
  },
  {
    key: 'engineering',
    id: 'engineering',
    name: 'Engineering / Construction',
    label: 'Engineering / Construction',
    colorName: 'Amber',
    cssClass: 'job-theme-engineering',
    accentColor: '#d97706',
    description: 'Civil, mechanical, structural, and electrical engineering',
    icon: 'tool'
  },
  {
    key: 'education',
    id: 'education',
    name: 'Education',
    label: 'Education',
    colorName: 'Indigo',
    cssClass: 'job-theme-education',
    accentColor: '#4f46e5',
    description: 'Teaching, academic research, instructional design, and EdTech',
    icon: 'book-open'
  },
  {
    key: 'sales',
    id: 'sales',
    name: 'Sales / Retail',
    label: 'Sales / Retail',
    colorName: 'Teal',
    cssClass: 'job-theme-sales',
    accentColor: '#0d9488',
    description: 'Enterprise sales, account executive, business development, retail',
    icon: 'shopping-bag'
  },
  {
    key: 'legal',
    id: 'legal',
    name: 'Legal',
    label: 'Legal',
    colorName: 'Slate',
    cssClass: 'job-theme-legal',
    accentColor: '#475569',
    description: 'Corporate law, intellectual property, compliance, and regulatory',
    icon: 'shield'
  },
  {
    key: 'hospitality',
    id: 'hospitality',
    name: 'Hospitality / Tourism',
    label: 'Hospitality / Tourism',
    colorName: 'Rose',
    cssClass: 'job-theme-hospitality',
    accentColor: '#db2777',
    description: 'Hotel management, luxury travel, event coordination, and dining',
    icon: 'coffee'
  },
  {
    key: 'other',
    id: 'other',
    name: 'Other',
    label: 'Other',
    colorName: 'Neutral',
    cssClass: 'job-theme-other',
    accentColor: '#52525b',
    description: 'Operations, logistics, human resources, and general roles',
    icon: 'briefcase'
  }
];

// SVG Icon definitions for each category
export const CATEGORY_ICONS = {
  code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  'trending-up': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  activity: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  layout: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
  megaphone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  tool: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
  'book-open': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  'shopping-bag': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  coffee: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
  briefcase: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
};

/**
 * Normalizes any category string or alias to the canonical Job Category Theme definition
 * @param {string} rawCategory
 * @returns {object} Canonical theme object with key, name, cssClass, accentColor, iconSvg, etc.
 */
export function getCategoryTheme(rawCategory) {
  return getJobCategoryTheme(rawCategory);
}

export function normalizeCategory(rawCategory) {
  const theme = getJobCategoryTheme(rawCategory);
  return theme.name;
}

export function getJobCategoryTheme(rawCategory) {
  if (!rawCategory || typeof rawCategory !== 'string') {
    const fallback = JOB_CATEGORIES.find(c => c.key === 'other');
    return {
      ...fallback,
      iconSvg: CATEGORY_ICONS[fallback.icon]
    };
  }

  const normalized = rawCategory.trim().toLowerCase();

  // Keyword-to-theme mapping
  if (
    normalized.includes('software') ||
    normalized.includes('it') ||
    normalized.includes('developer') ||
    normalized.includes('devops') ||
    normalized.includes('cloud') ||
    normalized.includes('data & ai') ||
    normalized.includes('ai') ||
    normalized.includes('frontend') && !normalized.includes('design') ||
    normalized.includes('backend')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'software');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('finance') ||
    normalized.includes('accounting') ||
    normalized.includes('fintech') ||
    normalized.includes('banking') ||
    normalized.includes('tax') ||
    normalized.includes('audit')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'finance');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('healthcare') ||
    normalized.includes('health') ||
    normalized.includes('medical') ||
    normalized.includes('nursing') ||
    normalized.includes('clinical') ||
    normalized.includes('pharma') ||
    normalized.includes('biotech')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'healthcare');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('design') ||
    normalized.includes('creative') ||
    normalized.includes('ui/ux') ||
    normalized.includes('ux') ||
    normalized.includes('graphic') ||
    normalized.includes('animation')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'design');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('marketing') ||
    normalized.includes('seo') ||
    normalized.includes('advertising') ||
    normalized.includes('growth') ||
    normalized.includes('content') ||
    normalized.includes('social media')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'marketing');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('engineering') ||
    normalized.includes('construction') ||
    normalized.includes('civil') ||
    normalized.includes('mechanical') ||
    normalized.includes('hardware') ||
    normalized.includes('electrical')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'engineering');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('education') ||
    normalized.includes('teach') ||
    normalized.includes('academic') ||
    normalized.includes('school') ||
    normalized.includes('tutor') ||
    normalized.includes('edtech')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'education');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('sales') ||
    normalized.includes('retail') ||
    normalized.includes('account executive') ||
    normalized.includes('business development') ||
    normalized.includes('commerce') ||
    normalized.includes('store')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'sales');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('legal') ||
    normalized.includes('law') ||
    normalized.includes('counsel') ||
    normalized.includes('compliance') ||
    normalized.includes('attorney') ||
    normalized.includes('regulatory')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'legal');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  if (
    normalized.includes('hospitality') ||
    normalized.includes('tourism') ||
    normalized.includes('hotel') ||
    normalized.includes('travel') ||
    normalized.includes('resort') ||
    normalized.includes('restaurant') ||
    normalized.includes('culinary')
  ) {
    const theme = JOB_CATEGORIES.find(c => c.key === 'hospitality');
    return { ...theme, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[theme.icon] };
  }

  // Exact key match fallback
  const directMatch = JOB_CATEGORIES.find(c => c.key === normalized || c.name.toLowerCase() === normalized);
  if (directMatch) {
    return { ...directMatch, originalCategory: rawCategory, iconSvg: CATEGORY_ICONS[directMatch.icon] };
  }

  // Default fallback: Other / Neutral
  const fallback = JOB_CATEGORIES.find(c => c.key === 'other');
  return {
    ...fallback,
    originalCategory: rawCategory,
    name: rawCategory || 'Other',
    label: rawCategory || 'Other',
    iconSvg: CATEGORY_ICONS[fallback.icon]
  };
}
