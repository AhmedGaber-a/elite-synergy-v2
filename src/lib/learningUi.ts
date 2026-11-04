// src/lib/learningUi.ts
export const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const TEACH_HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 .. 23:00
export const MAX_LEARNERS = 3;

export function hourLabel(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${hour < 12 ? 'ص' : 'م'}`;
}
