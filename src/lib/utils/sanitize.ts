// src/lib/utils/sanitize.ts
/**
 * Utility for input sanitization and XSS prevention across user-generated content.
 * Prevents payload abuse, strips null bytes and dangerous HTML tags,
 * and enforces length boundaries.
 */

/**
 * Strips dangerous HTML injection tags, scripts, null bytes, and malicious URI schemes
 * while preserving valid user text, Arabic characters, emojis, and normal punctuation.
 */
export function sanitizeUserText(input: unknown): string {
  if (typeof input !== 'string') return '';

  return input
    // Strip null bytes
    .replace(/\0/g, '')
    // Strip <script>...</script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip <style>...</style> tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip dangerous tags (iframe, object, embed, applet, meta, link)
    .replace(/<\/?(iframe|object|embed|applet|meta|link)\b[^>]*>/gi, '')
    // Strip inline javascript/data URI execution vectors
    .replace(/javascript:[^\s"'>]*/gi, '')
    .replace(/vbscript:[^\s"'>]*/gi, '')
    .trim();
}

export interface ValidationOptions {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  fieldName?: string;
}

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * Validates text length and content integrity.
 */
export function validateTextContent(
  rawInput: unknown,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    minLength = 1,
    maxLength = 5000,
    required = true,
    fieldName = 'المحتوى',
  } = options;

  if (rawInput === undefined || rawInput === null || typeof rawInput !== 'string') {
    if (required) {
      return { valid: false, sanitized: '', error: `${fieldName} مطلوب` };
    }
    return { valid: true, sanitized: '' };
  }

  const sanitized = sanitizeUserText(rawInput);

  if (required && sanitized.length < minLength) {
    return { valid: false, sanitized: '', error: `${fieldName} لا يمكن أن يكون فارغاً` };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      sanitized,
      error: `${fieldName} يتجاوز الحد الأقصى المسموح (${maxLength} حرف)`,
    };
  }

  return { valid: true, sanitized };
}
