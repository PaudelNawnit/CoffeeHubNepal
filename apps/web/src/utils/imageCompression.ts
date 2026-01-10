/**
 * Compress and resize an image file
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @param maxSizeKB - Maximum size in KB for the final image (default: 500)
 * @returns Promise<string> - Base64 data URL of compressed image
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8,
  maxSizeKB: number = 500
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress with iterative quality reduction if needed
        const compressWithQuality = (currentQuality: number, attempt: number = 0): void => {
          if (attempt > 5) {
            reject(new Error('Image too large even after maximum compression'));
            return;
          }
          
          // Always use JPEG for better compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Check if compressed size is acceptable
              const sizeKB = blob.size / 1024;
              if (sizeKB > maxSizeKB && currentQuality > 0.1) {
                // Reduce quality and try again
                compressWithQuality(currentQuality * 0.7, attempt + 1);
              } else {
                // Convert to base64
                const reader2 = new FileReader();
                reader2.onload = () => {
                  const result = reader2.result as string;
                  // Verify final base64 size
                  const base64SizeKB = (result.length * 3) / 4 / 1024;
                  if (base64SizeKB > maxSizeKB * 1.5) {
                    // Base64 is ~33% larger, so check against 1.5x
                    if (currentQuality > 0.1) {
                      compressWithQuality(currentQuality * 0.6, attempt + 1);
                    } else {
                      reject(new Error(`Image is too large (${base64SizeKB.toFixed(0)}KB). Maximum allowed: ${(maxSizeKB * 1.5).toFixed(0)}KB`));
                    }
                  } else {
                    resolve(result);
                  }
                };
                reader2.onerror = () => reject(new Error('Failed to read compressed image'));
                reader2.readAsDataURL(blob);
              }
            },
            'image/jpeg', // Always use JPEG for maximum compression
            currentQuality
          );
        };
        
        compressWithQuality(quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

