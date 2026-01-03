import { supabase } from './supabase'

/**
 * Helper function to get full image URL
 * @param {string} imagePath - The image path or URL
 * @returns {string|null} The image URL or null
 */
export const getImageUrl = (imagePath) => {
  // If no path provided, return null
  if (!imagePath) return null;
  
  // If already a full URL (starts with http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove 'products/' prefix if present (to avoid duplication)
  let cleanPath = imagePath.replace(/^products\//, '');
  
  // Remove leading slash if present
  cleanPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  
  // Get Supabase URL from the client
  const supabaseUrl = supabase.supabaseUrl;
  
  // Construct full Supabase storage URL
  // Format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
  return `${supabaseUrl}/storage/v1/object/public/products/${cleanPath}`;
}
