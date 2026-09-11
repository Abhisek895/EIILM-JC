import { getImageUrl } from '../utils/getImageUrl';

describe('Frontend API & Image Utilities', () => {
  describe('getImageUrl', () => {
    it('should return empty string when input is null, undefined, or empty', () => {
      expect(getImageUrl(null)).toBe('');
      expect(getImageUrl(undefined)).toBe('');
      expect(getImageUrl('')).toBe('');
    });

    it('should return external http/https and Cloudinary URLs unchanged', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/eiilm-jc/image/upload/v123/banner.jpg';
      expect(getImageUrl(cloudinaryUrl)).toBe(cloudinaryUrl);

      const httpUrl = 'http://example.com/photo.png';
      expect(getImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('should resolve relative upload paths against backend origin on port 5000', () => {
      const relativePath = '/uploads/files/profile.jpg';
      const resolved = getImageUrl(relativePath);

      expect(resolved).toMatch(/^https?:\/\/.*\/uploads\/files\/profile\.jpg$/);
      // Ensure it does NOT use stale port 3003
      expect(resolved).not.toContain(':3003');
    });

    it('should prepend slash if relative path is missing leading slash', () => {
      const relativePath = 'uploads/files/doc.pdf';
      const resolved = getImageUrl(relativePath);

      expect(resolved).toContain('/uploads/files/doc.pdf');
    });
  });
});
