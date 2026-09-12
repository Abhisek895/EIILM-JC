import type { NextApiRequest, NextApiResponse } from 'next';
import { queryDb } from '@/lib/db';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { slug } = req.query;
  const pathParts = Array.isArray(slug) ? slug : [slug || ''];
  const endpoint = pathParts[0] || '';
  const subEndpoint = pathParts[1] || '';

  try {
    // ── 1. Health ─────────────────────────────────────────────────────────────
    if (endpoint === 'health') {
      return res.status(200).json({
        success: true,
        status: 'OK',
        message: 'EIILM Jalpaiguri Campus API is operational',
        dynamic: true,
        timestamp: new Date().toISOString(),
      });
    }

    // ── 2. CMS Page Sections ───────────────────────────────────────────────────
    if (endpoint === 'cms' && subEndpoint === 'page-sections') {
      const pageKey = (req.query.pageKey as string) || 'home';
      const rows = await queryDb(
        'SELECT id, tenant_id, page_key, section_key, sort_order, config, status FROM page_sections WHERE page_key = $1 ORDER BY sort_order ASC',
        [pageKey]
      );
      const mapped = rows.map((r) => ({
        id: Number(r.id),
        tenantId: r.tenant_id ? Number(r.tenant_id) : 1,
        pageKey: r.page_key,
        sectionKey: r.section_key,
        sortOrder: r.sort_order ?? 0,
        config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config || {},
        status: r.status || 'published',
      }));
      return res.status(200).json({ success: true, data: mapped });
    }

    // ── 3. Courses ────────────────────────────────────────────────────────────
    if (endpoint === 'courses') {
      if (subEndpoint) {
        // Single course by slug or ID
        const rows = await queryDb(
          'SELECT * FROM courses WHERE slug = $1 OR id::text = $1 LIMIT 1',
          [subEndpoint]
        );
        if (rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Course not found' });
        }
        const r = rows[0];
        return res.status(200).json({
          success: true,
          data: {
            id: Number(r.id),
            courseName: r.course_name,
            courseCode: r.course_code,
            courseType: r.course_type,
            slug: r.slug,
            duration: r.duration,
            eligibility: r.eligibility,
            fees: r.fees,
            description: r.description,
            banner: r.banner,
            syllabus: r.syllabus,
            specialization: r.specialization,
            showFees: r.show_fees ?? true,
            status: r.status,
          },
        });
      }

      // List courses
      const statusParam = (req.query.status as string) || 'all';
      const search = (req.query.search as string) || '';
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;

      const rows = await queryDb(
        `SELECT * FROM courses 
         WHERE ($1 = 'all' OR status = $1)
           AND ($2 = '' OR course_name ILIKE $3 OR course_code ILIKE $3)
         ORDER BY id ASC 
         LIMIT $4 OFFSET $5`,
        [statusParam, search, `%${search}%`, limit, offset]
      );

      const countRes = await queryDb(
        `SELECT count(*) FROM courses 
         WHERE ($1 = 'all' OR status = $1)
           AND ($2 = '' OR course_name ILIKE $3 OR course_code ILIKE $3)`,
        [statusParam, search, `%${search}%`]
      );
      const total = Number(countRes[0]?.count || 0);

      const mapped = rows.map((r) => ({
        id: Number(r.id),
        courseName: r.course_name,
        courseCode: r.course_code,
        courseType: r.course_type,
        slug: r.slug,
        duration: r.duration,
        eligibility: r.eligibility,
        fees: r.fees,
        description: r.description,
        banner: r.banner,
        syllabus: r.syllabus,
        specialization: r.specialization,
        showFees: r.show_fees ?? true,
        status: r.status,
      }));

      return res.status(200).json({
        success: true,
        data: {
          items: mapped,
          rows: mapped,
          total,
          count: total,
          page,
          limit,
        },
      });
    }

    // ── 4. Notices ────────────────────────────────────────────────────────────
    if (endpoint === 'notices') {
      if (subEndpoint) {
        const rows = await queryDb('SELECT * FROM notices WHERE id::text = $1 LIMIT 1', [subEndpoint]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notice not found' });
        const r = rows[0];
        return res.status(200).json({
          success: true,
          data: {
            id: Number(r.id),
            title: r.title,
            description: r.description,
            image: r.image,
            pdfUrl: r.pdf_url,
            publishDate: r.publish_date,
            expiryDate: r.expiry_date,
            priority: r.priority,
            status: r.status,
          },
        });
      }

      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;

      const rows = await queryDb(
        `SELECT * FROM notices 
         WHERE status = 'published' AND deleted_at IS NULL 
         ORDER BY (priority = 'high') DESC, created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const countRes = await queryDb(
        "SELECT count(*) FROM notices WHERE status = 'published' AND deleted_at IS NULL"
      );
      const total = Number(countRes[0]?.count || 0);

      const mapped = rows.map((r) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        image: r.image,
        pdfUrl: r.pdf_url,
        publishDate: r.publish_date,
        expiryDate: r.expiry_date,
        priority: r.priority,
        status: r.status,
      }));

      return res.status(200).json({
        success: true,
        data: {
          items: mapped,
          rows: mapped,
          total,
          count: total,
          page,
          limit,
        },
      });
    }

    // ── 5. Events ─────────────────────────────────────────────────────────────
    if (endpoint === 'events') {
      if (subEndpoint) {
        const rows = await queryDb('SELECT * FROM events WHERE id::text = $1 LIMIT 1', [subEndpoint]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
        const r = rows[0];
        return res.status(200).json({
          success: true,
          data: {
            id: Number(r.id),
            title: r.title,
            description: r.description,
            banner: r.banner,
            startDate: r.start_date,
            endDate: r.end_date,
            location: r.location,
            registrationLink: r.registration_link,
            status: r.status,
          },
        });
      }

      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;

      const rows = await queryDb(
        `SELECT * FROM events 
         WHERE status = 'published' AND deleted_at IS NULL 
         ORDER BY start_date ASC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const countRes = await queryDb(
        "SELECT count(*) FROM events WHERE status = 'published' AND deleted_at IS NULL"
      );
      const total = Number(countRes[0]?.count || 0);

      const mapped = rows.map((r) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        banner: r.banner,
        startDate: r.start_date,
        endDate: r.end_date,
        location: r.location,
        registrationLink: r.registration_link,
        status: r.status,
      }));

      return res.status(200).json({
        success: true,
        data: {
          items: mapped,
          rows: mapped,
          total,
          count: total,
          page,
          limit,
        },
      });
    }

    // ── 6. Faculty ────────────────────────────────────────────────────────────
    if (endpoint === 'faculty') {
      const deptId = Number(req.query.departmentId) || 0;
      const search = (req.query.search as string) || '';

      const rows = await queryDb(
        `SELECT f.*, d.name as department_name, d.slug as department_slug 
         FROM faculty f 
         LEFT JOIN departments d ON f.department_id = d.id 
         WHERE f.deleted_at IS NULL 
           AND ($1 = 0 OR f.department_id = $1)
           AND ($2 = '' OR f.name ILIKE $3)
         ORDER BY f.sort_order ASC, f.id ASC`,
        [deptId, search, `%${search}%`]
      );

      const mapped = rows.map((r) => ({
        id: Number(r.id),
        departmentId: r.department_id ? Number(r.department_id) : null,
        name: r.name,
        designation: r.designation,
        photo: r.photo,
        qualification: r.qualification,
        experience: r.experience,
        email: r.email,
        phone: r.phone,
        bio: r.bio,
        status: r.status || 'active',
        sortOrder: r.sort_order ?? 0,
        department: r.department_name
          ? { id: Number(r.department_id), name: r.department_name, slug: r.department_slug }
          : null,
      }));

      return res.status(200).json({ success: true, data: mapped });
    }

    // ── 7. Departments ────────────────────────────────────────────────────────
    if (endpoint === 'departments') {
      if (subEndpoint) {
        const rows = await queryDb(
          'SELECT * FROM departments WHERE (slug = $1 OR id::text = $1) AND deleted_at IS NULL LIMIT 1',
          [subEndpoint]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Department not found' });
        const r = rows[0];
        return res.status(200).json({
          success: true,
          data: {
            id: Number(r.id),
            name: r.name,
            slug: r.slug,
            description: r.description,
            hodId: r.hod_id ? Number(r.hod_id) : null,
            status: r.status,
          },
        });
      }

      const rows = await queryDb(
        'SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY id ASC'
      );
      const mapped = rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        slug: r.slug,
        description: r.description,
        hodId: r.hod_id ? Number(r.hod_id) : null,
        status: r.status,
      }));

      return res.status(200).json({ success: true, data: mapped });
    }

    // ── 8. Placements ─────────────────────────────────────────────────────────
    if (endpoint === 'placements') {
      const statusParam = (req.query.status as string) || 'all';
      const placementType = (req.query.placementType as string) || 'all';
      const search = (req.query.search as string) || '';
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;

      const rows = await queryDb(
        `SELECT * FROM placements 
         WHERE ($1 = 'all' OR status = $1)
           AND ($2 = 'all' OR placement_type = $2)
           AND ($3 = '' OR student_name ILIKE $4 OR company_name ILIKE $4)
         ORDER BY id ASC 
         LIMIT $5 OFFSET $6`,
        [statusParam, placementType, search, `%${search}%`, limit, offset]
      );

      const countRes = await queryDb(
        `SELECT count(*) FROM placements 
         WHERE ($1 = 'all' OR status = $1)
           AND ($2 = 'all' OR placement_type = $2)
           AND ($3 = '' OR student_name ILIKE $4 OR company_name ILIKE $4)`,
        [statusParam, placementType, search, `%${search}%`]
      );
      const total = Number(countRes[0]?.count || 0);

      const mapped = rows.map((r) => ({
        id: Number(r.id),
        studentName: r.student_name,
        companyName: r.company_name,
        companyLogo: r.company_logo,
        package: r.package,
        year: r.year,
        course: r.course,
        studentImage: r.student_image,
        placementType: r.placement_type || 'placement',
        status: r.status || 'published',
      }));

      return res.status(200).json({
        success: true,
        data: {
          items: mapped,
          rows: mapped,
          total,
          count: total,
          page,
          limit,
        },
      });
    }

    // ── 9. Site Settings ──────────────────────────────────────────────────────
    if (endpoint === 'site-settings') {
      const rows = await queryDb('SELECT key_name, value FROM site_settings');
      const map: Record<string, string> = {};
      for (const r of rows) {
        if (r.key_name) map[r.key_name] = r.value ?? '';
      }
      return res.status(200).json({ success: true, data: map });
    }

    // ── 10. Infrastructures ───────────────────────────────────────────────────
    if (endpoint === 'infrastructures') {
      const rows = await queryDb(
        "SELECT * FROM infrastructures WHERE status = 'published' AND deleted_at IS NULL ORDER BY sort_order ASC"
      );
      const mapped = rows.map((r) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        imageUrl: r.image_url,
        videoUrl: r.video_url,
        icon: r.icon,
        category: r.category,
        sortOrder: r.sort_order ?? 0,
        status: r.status,
      }));
      return res.status(200).json({ success: true, data: mapped });
    }

    // ── 11. Inquiries ─────────────────────────────────────────────────────────
    if (endpoint === 'inquiries' && req.method === 'POST') {
      const { name, email, phone, courseId, message } = req.body || {};
      await queryDb(
        'INSERT INTO inquiries (name, email, phone, course_id, message, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [name || '', email || '', phone || '', courseId ? Number(courseId) : null, message || '', 'new']
      );
      return res.status(201).json({ success: true, message: 'Inquiry submitted successfully' });
    }

    // ── 12. Fallback / 404 ────────────────────────────────────────────────────
    return res.status(404).json({ success: false, message: `Route /api/v1/${pathParts.join('/')} not found` });
  } catch (error: any) {
    console.error(`[API /api/v1/${pathParts.join('/')}] Error:`, error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
}
