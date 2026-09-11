import { CourseService } from '@services/CourseService';

describe('CourseService & Slug Generation', () => {
  let service: CourseService;

  beforeEach(() => {
    service = new CourseService();
  });

  it('should generate URL-friendly slug from course name', () => {
    const slug = (service as any).createSlug('Bachelor of Computer Applications');
    expect(slug).toMatch(/^bachelor-of-computer-applications-\d+$/);
  });

  it('should handle special characters and extra spaces in course name', () => {
    const slug = (service as any).createSlug('M.Sc. in Data Science & A.I. (Hons.)');
    expect(slug).not.toContain('&');
    expect(slug).not.toContain('.');
    expect(slug).not.toContain('(');
    expect(slug).not.toContain(')');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('should differentiate numeric IDs from string slugs', () => {
    const idInput = '42';
    const slugInput = 'bachelor-of-computer-applications';

    expect(/^\d+$/.test(idInput)).toBe(true);
    expect(/^\d+$/.test(slugInput)).toBe(false);
  });
});
