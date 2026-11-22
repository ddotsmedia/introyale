// Admin UI labels. English plus Arabic; layouts use logical properties so RTL works (SPEC §2.4).
export const LABELS = {
  en: {
    dashboard: 'Dashboard',
    leadsBoard: 'Leads board',
    leadsTable: 'Leads table',
    workflow: 'Workflow',
    contentHealth: 'Content health',
    mediaLibrary: 'Media library',
    siteTools: 'Site management',
    system: 'System',
    security: 'Users & security',
    auditViewer: 'Audit log',
    newEnquiries: 'New enquiries',
    unassigned: 'Unassigned leads',
    overdue: 'Overdue follow-ups',
    wonMonth: 'Won this month',
    awaiting: 'Awaiting review',
    studioTitle: 'Introyale Studio',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    leadsBoard: 'لوحة العملاء المحتملين',
    leadsTable: 'جدول العملاء المحتملين',
    workflow: 'سير العمل',
    contentHealth: 'صحة المحتوى',
    mediaLibrary: 'مكتبة الوسائط',
    siteTools: 'إدارة الموقع',
    system: 'النظام',
    security: 'المستخدمون والأمان',
    auditViewer: 'سجل التدقيق',
    newEnquiries: 'استفسارات جديدة',
    unassigned: 'غير مسندة',
    overdue: 'متابعات متأخرة',
    wonMonth: 'تم الفوز هذا الشهر',
    awaiting: 'بانتظار المراجعة',
    studioTitle: 'استوديو إنترويال',
  },
} as const
export type LabelKey = keyof (typeof LABELS)['en']
export const tr = (lang: string | undefined, k: LabelKey): string =>
  (LABELS[lang === 'ar' ? 'ar' : 'en'] as Record<string, string>)[k] ?? LABELS.en[k]
