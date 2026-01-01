// Normalize image URLs on the storefront.
// If `path` is a full URL (starts with http/https) return as-is.
// If it's an absolute server path (starts with '/'), prefix with backend base.
// If it's a relative path, also prefix with backend base.

const BACKEND_BASE = import.meta.env.VITE_API_URL || 'https://solide-production.up.railway.app/api';

export function getImageUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (trimmed === '') return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If path points to client-side public images (e.g. /images/...), return as-is
  // so mockProducts or other public assets are served by the frontend dev server.
  if (trimmed.startsWith('/images')) return trimmed;
  // If path looks like an array JSON string, try parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (typeof first === 'string') return getImageUrl(first);
    }
  } catch (e) {
    // not JSON — continue
  }
  // otherwise prefix with backend base
  if (trimmed.startsWith('/')) return `${BACKEND_BASE}${trimmed}`;
  return `${BACKEND_BASE}/${trimmed}`;
}
