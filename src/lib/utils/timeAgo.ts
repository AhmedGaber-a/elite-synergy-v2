// src/lib/utils/timeAgo.ts

/**
 * Formats a date into an Arabic relative time string alongside an exact formatted date.
 * Examples:
 * - "منذ لحظات"
 * - "منذ 5 دقائق"
 * - "منذ ساعتين"
 * - "منذ 3 أيام"
 * Exact: "17 أكتوبر 2026، 07:15 م"
 */
export function formatArabicTimeAgo(dateInput: string | Date | undefined | null): {
  relative: string;
  exact: string;
  timeAgoEn: string;
} {
  if (!dateInput) {
    return { relative: 'الآن', exact: '', timeAgoEn: 'Just now' };
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return { relative: 'الآن', exact: '', timeAgoEn: 'Just now' };
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  let relative = 'منذ لحظات';
  let timeAgoEn = 'Just now';

  if (diffSec < 60) {
    relative = 'منذ لحظات';
    timeAgoEn = 'Just now';
  } else if (diffMin < 60) {
    timeAgoEn = diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    if (diffMin === 1) relative = 'منذ دقيقة';
    else if (diffMin === 2) relative = 'منذ دقيقتين';
    else if (diffMin <= 10) relative = `منذ ${diffMin} دقائق`;
    else relative = `منذ ${diffMin} دقيقة`;
  } else if (diffHour < 24) {
    timeAgoEn = diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    if (diffHour === 1) relative = 'منذ ساعة';
    else if (diffHour === 2) relative = 'منذ ساعتين';
    else if (diffHour <= 10) relative = `منذ ${diffHour} ساعات`;
    else relative = `منذ ${diffHour} ساعة`;
  } else if (diffDay < 30) {
    timeAgoEn = diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    if (diffDay === 1) relative = 'منذ يوم';
    else if (diffDay === 2) relative = 'منذ يومين';
    else if (diffDay <= 10) relative = `منذ ${diffDay} أيام`;
    else relative = `منذ ${diffDay} يوماً`;
  } else if (diffMonth < 12) {
    timeAgoEn = diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
    if (diffMonth === 1) relative = 'منذ شهر';
    else if (diffMonth === 2) relative = 'منذ شهرين';
    else if (diffMonth <= 10) relative = `منذ ${diffMonth} أشهر`;
    else relative = `منذ ${diffMonth} شهراً`;
  } else {
    timeAgoEn = diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
    if (diffYear === 1) relative = 'منذ سنة';
    else if (diffYear === 2) relative = 'منذ سنتين';
    else if (diffYear <= 10) relative = `منذ ${diffYear} سنوات`;
    else relative = `منذ ${diffYear} سنة`;
  }

  // Exact date in Arabic & English
  const exact = date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { relative, exact, timeAgoEn };
}
