// src/lib/utils/cairoDate.ts
// Post times are always shown in Cairo time, whatever the viewer's device timezone is.
const CAIRO = 'Africa/Cairo';

export function formatCairoDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ar-EG', {
    timeZone: CAIRO,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const YEAR_NAMES_AR: Record<number, string> = {
  1: 'السنة الأولى',
  2: 'السنة الثانية',
  3: 'السنة الثالثة',
  4: 'السنة الرابعة',
  5: 'السنة الخامسة',
};

// Year name in the current language. Arabic: السنة الأولى... English: Year 1...
export function yearLabel(year: number, lang: 'ar' | 'en'): string {
  if (lang === 'en') return `Year ${year}`;
  return YEAR_NAMES_AR[year] ?? '';
}
