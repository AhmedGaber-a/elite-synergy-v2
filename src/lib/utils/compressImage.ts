// src/lib/utils/compressImage.ts
// Shrinks a photo in the browser before upload. A 3-8 MB phone photo becomes a few hundred KB,
// so it uploads in a fraction of the time. Any failure returns the original file.
const MAX_SIDE = 1600;
const QUALITY = 0.8;
const COMPRESSIBLE = ['image/jpeg', 'image/png', 'image/webp'];

export async function compressImageFile(file: File): Promise<File> {
  if (!COMPRESSIBLE.includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    // White background so transparent PNGs do not turn black as JPEG.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    );
    // Keep the original when re-encoding does not make it smaller (e.g. tiny images).
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
