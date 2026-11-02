/**
 * Shrinks an image file in the browser before it is stored as a base64 data URL.
 * Raw phone photos can be 3-8 MB; storing them as-is bloats the database and
 * every API response that repeats the avatar. A 256-512px JPEG is a few KB.
 *
 * Non-image files and any failure fall back to the original data URL.
 */
export function resizeImageToDataUrl(file: File, maxSize = 512, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const original = reader.result as string;
      if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        resolve(original);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(original);
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(original);
          return;
        }
        // White background so transparent PNGs do not turn black as JPEG.
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}
