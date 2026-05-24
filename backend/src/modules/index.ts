export const moduleRegistry = [
  // Foundation
  'auth',
  'users',
  'roles',
  'permissions',
  'tenants',
  'sessions',
  'dashboard',
  'audit-logs',

  // Academic / ERP
  'admissions',
  'students',
  'courses',
  'departments',
  'faculty',
  'attendance',
  'results',
  'exams',
  'fees',
  'timetable',
  'library',
  'hostel',
  'transport',

  // Public CRM
  'inquiries',

  // CMS
  'cms-pages',
  'cms-page-builder',
  'cms-menus',
  'cms-seo',
  'cms-media',
  'cms-forms',
  'cms-content-versioning',

  // Integrations
  'notifications',
  'integrations-webhooks',
  'search',
] as const;

export type ModuleName = (typeof moduleRegistry)[number];
