/**
 * Converts a relative image path (e.g. `/uploads/files/abc.jpg`)
 * into a full URL pointing to the backend server.
 *
 * - If the path is already a full URL (http/https/data:), it is returned as-is.
 *   This means Cloudinary URLs work automatically without any changes.
 * - If the path is empty/null/undefined, returns an empty string.
 * - For relative paths, the backend base URL is read from NEXT_PUBLIC_API_URL
 *   (stripping the "/api/v1" suffix so we get e.g. "http://localhost:3003").
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // Already an absolute URL (Cloudinary, S3, external CDN, data URIs, etc.)
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  // Derive the backend origin from NEXT_PUBLIC_API_URL, e.g.:
  //   "http://localhost:3003/api/v1"  →  "http://localhost:3003"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export default getImageUrl;
