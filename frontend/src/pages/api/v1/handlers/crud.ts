import { NextApiRequest, NextApiResponse } from 'next';
import { queryDb } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function handleCrud(req: NextApiRequest, res: NextApiResponse, endpoint: string, subEndpoint: string) {
  const method = req.method;
  
  // Require Auth for mutations
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    verifyAccessToken(authHeader.split(' ')[1]);
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const id = Number(subEndpoint);

  try {
    if (endpoint === 'courses') {
      if (method === 'POST') {
        const { courseName, courseCode, courseType, slug, duration, eligibility, fees, description, banner, syllabus, specialization, showFees, status } = req.body;
        const result = await queryDb(
          `INSERT INTO courses (course_name, course_code, course_type, slug, duration, eligibility, fees, description, banner, syllabus, specialization, show_fees, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING id`,
          [courseName, courseCode, courseType, slug, duration, eligibility, fees, description, banner, JSON.stringify(syllabus || {}), specialization, showFees ?? true, status || 'published']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { courseName, courseCode, courseType, slug, duration, eligibility, fees, description, banner, syllabus, specialization, showFees, status } = req.body;
        await queryDb(
          `UPDATE courses SET course_name=$1, course_code=$2, course_type=$3, slug=$4, duration=$5, eligibility=$6, fees=$7, description=$8, banner=$9, syllabus=$10, specialization=$11, show_fees=$12, status=$13, updated_at=NOW() WHERE id=$14`,
          [courseName, courseCode, courseType, slug, duration, eligibility, fees, description, banner, JSON.stringify(syllabus || {}), specialization, showFees ?? true, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('DELETE FROM courses WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'notices') {
      if (method === 'POST') {
        const { title, description, image, pdfUrl, publishDate, expiryDate, priority, status } = req.body;
        const result = await queryDb(
          `INSERT INTO notices (title, description, image, pdf_url, publish_date, expiry_date, priority, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
          [title, description, image, pdfUrl, publishDate, expiryDate, priority || 'normal', status || 'published']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { title, description, image, pdfUrl, publishDate, expiryDate, priority, status } = req.body;
        await queryDb(
          `UPDATE notices SET title=$1, description=$2, image=$3, pdf_url=$4, publish_date=$5, expiry_date=$6, priority=$7, status=$8, updated_at=NOW() WHERE id=$9`,
          [title, description, image, pdfUrl, publishDate, expiryDate, priority, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('UPDATE notices SET deleted_at=NOW() WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'events') {
      if (method === 'POST') {
        const { title, description, banner, startDate, endDate, location, registrationLink, status } = req.body;
        const result = await queryDb(
          `INSERT INTO events (title, description, banner, start_date, end_date, location, registration_link, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
          [title, description, banner, startDate, endDate, location, registrationLink, status || 'published']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { title, description, banner, startDate, endDate, location, registrationLink, status } = req.body;
        await queryDb(
          `UPDATE events SET title=$1, description=$2, banner=$3, start_date=$4, end_date=$5, location=$6, registration_link=$7, status=$8, updated_at=NOW() WHERE id=$9`,
          [title, description, banner, startDate, endDate, location, registrationLink, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('UPDATE events SET deleted_at=NOW() WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'faculty') {
      if (method === 'POST') {
        const { name, departmentId, designation, photo, qualification, experience, email, phone, bio, sortOrder, status } = req.body;
        const result = await queryDb(
          `INSERT INTO faculty (name, department_id, designation, photo, qualification, experience, email, phone, bio, sort_order, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING id`,
          [name, departmentId, designation, photo, qualification, experience, email, phone, bio, sortOrder || 0, status || 'active']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { name, departmentId, designation, photo, qualification, experience, email, phone, bio, sortOrder, status } = req.body;
        await queryDb(
          `UPDATE faculty SET name=$1, department_id=$2, designation=$3, photo=$4, qualification=$5, experience=$6, email=$7, phone=$8, bio=$9, sort_order=$10, status=$11, updated_at=NOW() WHERE id=$12`,
          [name, departmentId, designation, photo, qualification, experience, email, phone, bio, sortOrder, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('UPDATE faculty SET deleted_at=NOW() WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'departments') {
      if (method === 'POST') {
        const { name, slug, description, hodId, status } = req.body;
        const result = await queryDb(
          `INSERT INTO departments (name, slug, description, hod_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [name, slug, description, hodId, status || 'active']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { name, slug, description, hodId, status } = req.body;
        await queryDb(
          `UPDATE departments SET name=$1, slug=$2, description=$3, hod_id=$4, status=$5, updated_at=NOW() WHERE id=$6`,
          [name, slug, description, hodId, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('UPDATE departments SET deleted_at=NOW() WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'placements') {
      if (method === 'POST') {
        const { studentName, companyName, companyLogo, package: pkg, year, course, studentImage, placementType, status } = req.body;
        const result = await queryDb(
          `INSERT INTO placements (student_name, company_name, company_logo, package, year, course, student_image, placement_type, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
          [studentName, companyName, companyLogo, pkg, year, course, studentImage, placementType || 'placement', status || 'published']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { studentName, companyName, companyLogo, package: pkg, year, course, studentImage, placementType, status } = req.body;
        await queryDb(
          `UPDATE placements SET student_name=$1, company_name=$2, company_logo=$3, package=$4, year=$5, course=$6, student_image=$7, placement_type=$8, status=$9, updated_at=NOW() WHERE id=$10`,
          [studentName, companyName, companyLogo, pkg, year, course, studentImage, placementType, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('DELETE FROM placements WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'infrastructures') {
      if (method === 'POST') {
        const { title, description, imageUrl, videoUrl, icon, category, sortOrder, status } = req.body;
        const result = await queryDb(
          `INSERT INTO infrastructures (title, description, image_url, video_url, icon, category, sort_order, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
          [title, description, imageUrl, videoUrl, icon, category, sortOrder || 0, status || 'published']
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && id) {
        const { title, description, imageUrl, videoUrl, icon, category, sortOrder, status } = req.body;
        await queryDb(
          `UPDATE infrastructures SET title=$1, description=$2, image_url=$3, video_url=$4, icon=$5, category=$6, sort_order=$7, status=$8, updated_at=NOW() WHERE id=$9`,
          [title, description, imageUrl, videoUrl, icon, category, sortOrder, status, id]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && id) {
        await queryDb('UPDATE infrastructures SET deleted_at=NOW() WHERE id=$1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'site-settings') {
      if (method === 'PUT' && subEndpoint !== 'bulk') {
        const { value } = req.body;
        const key = subEndpoint;
        const exists = await queryDb('SELECT key_name FROM site_settings WHERE key_name=$1', [key]);
        if (exists.length > 0) {
          await queryDb('UPDATE site_settings SET value=$1, updated_at=NOW() WHERE key_name=$2', [value, key]);
        } else {
          await queryDb('INSERT INTO site_settings (key_name, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())', [key, value]);
        }
        return res.status(200).json({ success: true });
      }
      if (method === 'PUT' && subEndpoint === 'bulk') { // /api/v1/site-settings/bulk
        const { settings } = req.body; // Array<{key, value}>
        if (Array.isArray(settings)) {
          for (const s of settings) {
            const exists = await queryDb('SELECT key_name FROM site_settings WHERE key_name=$1', [s.key]);
            if (exists.length > 0) {
              await queryDb('UPDATE site_settings SET value=$1, updated_at=NOW() WHERE key_name=$2', [s.value, s.key]);
            } else {
              await queryDb('INSERT INTO site_settings (key_name, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())', [s.key, s.value]);
            }
          }
        }
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'cms' && subEndpoint === 'page-sections') {
      if (method === 'POST') {
        const { pageKey, sectionKey, config, sortOrder } = req.body;
        const result = await queryDb(
          `INSERT INTO page_sections (page_key, section_key, config, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
          [pageKey, sectionKey, JSON.stringify(config || {}), sortOrder || 0]
        );
        return res.status(201).json({ success: true, data: { id: result[0].id } });
      }
      if (method === 'PUT' && req.query.id) {
        const sectionId = Number(req.query.id);
        const { pageKey, sectionKey, config, sortOrder, status } = req.body;
        await queryDb(
          `UPDATE page_sections SET page_key=$1, section_key=$2, config=$3, sort_order=$4, status=$5, updated_at=NOW() WHERE id=$6`,
          [pageKey, sectionKey, JSON.stringify(config || {}), sortOrder, status, sectionId]
        );
        return res.status(200).json({ success: true });
      }
      if (method === 'DELETE' && req.query.id) {
        await queryDb('DELETE FROM page_sections WHERE id=$1', [Number(req.query.id)]);
        return res.status(200).json({ success: true });
      }
    }

    if (endpoint === 'inquiries') {
      if (method === 'GET') {
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const offset = (page - 1) * limit;
        const search = (req.query.search as string) || '';
        const status = (req.query.status as string) || 'all';

        const rows = await queryDb(
          `SELECT i.*, c.course_name as course_interest
           FROM inquiries i
           LEFT JOIN courses c ON i.course_id = c.id
           WHERE ($1 = 'all' OR i.status = $1)
             AND ($2 = '' OR i.full_name ILIKE $3 OR i.email ILIKE $3)
           ORDER BY i.created_at DESC LIMIT $4 OFFSET $5`,
          [status, search, `%${search}%`, limit, offset]
        );
        const countRes = await queryDb(
          `SELECT count(*) FROM inquiries WHERE ($1 = 'all' OR status = $1) AND ($2 = '' OR full_name ILIKE $3 OR email ILIKE $3)`,
          [status, search, `%${search}%`]
        );
        const total = Number(countRes[0]?.count || 0);
        
        const mapped = rows.map(r => ({
          id: Number(r.id),
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          courseInterest: r.course_interest,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
        }));
        
        return res.status(200).json({
          success: true,
          data: mapped,
          items: mapped,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
        });
      }
      if (method === 'PUT' && id) {
        const { status } = req.body;
        await queryDb('UPDATE inquiries SET status=$1, updated_at=NOW() WHERE id=$2', [status, id]);
        return res.status(200).json({ success: true });
      }
    }

  } catch (error: any) {
    console.error(`[handleCrud] Error:`, error);
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
