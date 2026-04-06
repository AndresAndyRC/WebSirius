import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks if a product image exists natively on disk during build.
 * @param slug Product slug (folder name)
 * @param num Image number (1, 2, 3...)
 * @returns The public URL path if it exists, otherwise null
 */
export function getProductImage(slug: string, num: string = '1'): string | null {
  const extensions = ['.webp', '.jpg', '.jpeg', '.png'];
  
  for (const ext of extensions) {
    const relPath = `public/images/productos/${slug}/${num}${ext}`;
    const absolutePath = path.join(process.cwd(), relPath);
    
    try {
      if (fs.existsSync(absolutePath)) {
        return `/images/productos/${slug}/${num}${ext}`;
      }
    } catch (error) {
      // Ignore errors
    }
  }
  return null;
}
