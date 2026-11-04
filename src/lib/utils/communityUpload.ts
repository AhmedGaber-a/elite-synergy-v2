// src/lib/utils/communityUpload.ts
import { upload } from '@vercel/blob/client';
import { compressImageFile } from '@/lib/utils/compressImage';

export type UploadKind = 'image' | 'video' | 'file';

export const UPLOAD_LIMIT_MB: Record<UploadKind, number> = {
  image: 10,
  video: 100,
  file: 25,
};

// Returns an Arabic error message if the file is too large, otherwise null.
export function checkUploadSize(file: File, kind: UploadKind): string | null {
  if (file.size > UPLOAD_LIMIT_MB[kind] * 1024 * 1024) {
    return `حجم الملف يتجاوز الحد الأقصى ${UPLOAD_LIMIT_MB[kind]} ميجابايت`;
  }
  return null;
}

// Uploads the file to Vercel Blob and resolves with its public URL.
export async function uploadCommunityFile(file: File, kind: UploadKind): Promise<string> {
  // Photos are shrunk first; videos and documents go up as they are.
  const toSend = kind === 'image' ? await compressImageFile(file) : file;
  const safeName = toSend.name.replace(/[^\w.-]+/g, '_');
  try {
    const blob = await upload(`community/${kind}/${safeName}`, toSend, {
      access: 'public',
      handleUploadUrl: '/api/community/upload',
      clientPayload: kind,
    });
    return blob.url;
  } catch (err) {
    const reason = err instanceof Error ? err.message : '';
    throw new Error(`تعذر رفع الملف${reason ? `: ${reason}` : ''}`);
  }
}
