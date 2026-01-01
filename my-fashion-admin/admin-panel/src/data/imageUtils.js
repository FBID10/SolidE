// Helper to normalize product / asset image URLs in the admin panel.
// If the value is a full URL (starts with http/https) we return it as-is.
// If it's a server-relative path (starts with '/'), prefix with the backend base URL.
// Otherwise return the value (it may already be a Cloudinary URL or similar).

const BACKEND_BASE = import.meta.env.VITE_API_URL || 'https://solide-production.up.railway.app/api';

export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (typeof imagePath !== 'string') return '';
  const trimmed = imagePath.trim();
  if (trimmed === '') return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${BACKEND_BASE}${trimmed}`;
  return trimmed;
}

