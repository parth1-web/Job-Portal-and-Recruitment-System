/**
 * Client-Side Job Category Visual Theme Helper
 */
(function() {
  'use strict';

  const JOB_CATEGORIES = [
    { key: 'software', name: 'Software / IT', label: 'Software / IT', colorName: 'Blue', cssClass: 'job-theme-software' },
    { key: 'finance', name: 'Finance / Accounting', label: 'Finance / Accounting', colorName: 'Green', cssClass: 'job-theme-finance' },
    { key: 'healthcare', name: 'Healthcare', label: 'Healthcare', colorName: 'Red/Rose', cssClass: 'job-theme-healthcare' },
    { key: 'design', name: 'Design / Creative', label: 'Design / Creative', colorName: 'Purple', cssClass: 'job-theme-design' },
    { key: 'marketing', name: 'Marketing', label: 'Marketing', colorName: 'Orange', cssClass: 'job-theme-marketing' },
    { key: 'engineering', name: 'Engineering / Construction', label: 'Engineering / Construction', colorName: 'Amber', cssClass: 'job-theme-engineering' },
    { key: 'education', name: 'Education', label: 'Education', colorName: 'Indigo', cssClass: 'job-theme-education' },
    { key: 'sales', name: 'Sales / Retail', label: 'Sales / Retail', colorName: 'Teal', cssClass: 'job-theme-sales' },
    { key: 'legal', name: 'Legal', label: 'Legal', colorName: 'Slate', cssClass: 'job-theme-legal' },
    { key: 'hospitality', name: 'Hospitality / Tourism', label: 'Hospitality / Tourism', colorName: 'Rose', cssClass: 'job-theme-hospitality' },
    { key: 'other', name: 'Other', label: 'Other', colorName: 'Neutral', cssClass: 'job-theme-other' }
  ];

  function getJobCategoryTheme(rawCategory) {
    if (!rawCategory || typeof rawCategory !== 'string') {
      return JOB_CATEGORIES.find(c => c.key === 'other');
    }

    const normalized = rawCategory.trim().toLowerCase();

    if (
      normalized.includes('software') ||
      normalized.includes('it') ||
      normalized.includes('developer') ||
      normalized.includes('devops') ||
      normalized.includes('cloud') ||
      normalized.includes('data & ai') ||
      normalized.includes('ai') ||
      normalized.includes('backend') ||
      (normalized.includes('frontend') && !normalized.includes('design'))
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'software');
    }

    if (
      normalized.includes('finance') ||
      normalized.includes('accounting') ||
      normalized.includes('fintech') ||
      normalized.includes('banking') ||
      normalized.includes('tax') ||
      normalized.includes('audit')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'finance');
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
      return JOB_CATEGORIES.find(c => c.key === 'healthcare');
    }

    if (
      normalized.includes('design') ||
      normalized.includes('creative') ||
      normalized.includes('ui/ux') ||
      normalized.includes('ux') ||
      normalized.includes('graphic') ||
      normalized.includes('animation')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'design');
    }

    if (
      normalized.includes('marketing') ||
      normalized.includes('seo') ||
      normalized.includes('advertising') ||
      normalized.includes('growth') ||
      normalized.includes('content') ||
      normalized.includes('social media')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'marketing');
    }

    if (
      normalized.includes('engineering') ||
      normalized.includes('construction') ||
      normalized.includes('civil') ||
      normalized.includes('mechanical') ||
      normalized.includes('hardware') ||
      normalized.includes('electrical')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'engineering');
    }

    if (
      normalized.includes('education') ||
      normalized.includes('teach') ||
      normalized.includes('academic') ||
      normalized.includes('school') ||
      normalized.includes('tutor') ||
      normalized.includes('edtech')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'education');
    }

    if (
      normalized.includes('sales') ||
      normalized.includes('retail') ||
      normalized.includes('account executive') ||
      normalized.includes('business development') ||
      normalized.includes('commerce') ||
      normalized.includes('store')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'sales');
    }

    if (
      normalized.includes('legal') ||
      normalized.includes('law') ||
      normalized.includes('counsel') ||
      normalized.includes('compliance') ||
      normalized.includes('attorney') ||
      normalized.includes('regulatory')
    ) {
      return JOB_CATEGORIES.find(c => c.key === 'legal');
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
      return JOB_CATEGORIES.find(c => c.key === 'hospitality');
    }

    const direct = JOB_CATEGORIES.find(c => c.key === normalized || c.name.toLowerCase() === normalized);
    if (direct) return direct;

    return JOB_CATEGORIES.find(c => c.key === 'other');
  }

  window.JobCategoryThemes = {
    categories: JOB_CATEGORIES,
    getTheme: getJobCategoryTheme
  };
})();
