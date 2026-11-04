// src/lib/learningUi.ts
export const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DAY_NAMES = DAY_NAMES_AR;

export const TEACH_HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 .. 23:00
export const MAX_LEARNERS = 3;

export function hourLabel(hour: number, lang: 'ar' | 'en' = 'ar') {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const period = lang === 'ar' ? (hour < 12 ? 'ص' : 'م') : (hour < 12 ? 'AM' : 'PM');
  return `${h}:00 ${period}`;
}
