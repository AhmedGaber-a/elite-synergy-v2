// src/lib/services/studentEmail.ts
// Only students with an address on this exact domain can register, log in, or get codes.
// The domain is intentionally not mentioned in any error message.
export const STUDENT_EMAIL_DOMAIN = 'fa-hists.edu.eg';

export function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isStudentEmail(email: string): boolean {
  const e = normalizeEmail(email);
  const at = e.lastIndexOf('@');
  if (at < 1) return false;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  return domain === STUDENT_EMAIL_DOMAIN && /^[a-z0-9._%+-]{1,64}$/.test(local);
}

export const GENERIC_AUTH_ERROR = 'البريد أو كلمة المرور غير صحيحة';
export const GENERIC_CODE_MESSAGE = 'لو البيانات صحيحة، هيوصلك كود تفعيل جديد على بريدك خلال دقائق.';
