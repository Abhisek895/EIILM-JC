import type { NextApiRequest, NextApiResponse } from 'next';
import { queryDb } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  normalizeRoleName,
} from '@/lib/auth';
import { handleUsers } from './handlers/users';
import { handleDashboard } from './handlers/dashboard';
import { handleCrud } from './handlers/crud';
import { handleMedia } from './handlers/media';

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
    // ── 0. Health ─────────────────────────────────────────────────────────────
    if (endpoint === 'health') {
      return res.status(200).json({
        success: true,
        status: 'OK',
        message: 'EIILM Jalpaiguri Campus API is operational',
        dynamic: true,
        timestamp: new Date().toISOString(),
      });
    }

    // ── 1. Authentication ─────────────────────────────────────────────────────
    if (endpoint === 'auth') {
      // POST /api/v1/auth/forgot-password/request-otp
      if (subEndpoint === 'forgot-password' && pathParts[2] === 'request-otp') {
        if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
        const { email } = req.body || {};
        if (!email) {
          return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const rows = await queryDb(
          'SELECT id, name, email, status FROM users WHERE LOWER(email) = $1 LIMIT 1',
          [cleanEmail]
        );
        if (rows.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'If that email address is in our database, we will send you an OTP to reset your password.',
            data: { message: 'If that email address is in our database, we will send you an OTP to reset your password.' },
          });
        }
        const user = rows[0];
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await queryDb(
          'UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3',
          [otpCode, otpExpiresAt, user.id]
        );

        await sendOtpEmail(user.email, user.name, otpCode);

        const hasSmtp = Boolean(process.env.SMTP_USER || process.env.GMAIL_USER);
        const successNotice = hasSmtp
          ? 'If that email address is in our database, we will send you an OTP to reset your password.'
          : `If that email address is in our database, we will send you an OTP to reset your password. (Demo OTP: ${otpCode})`;

        return res.status(200).json({
          success: true,
          message: successNotice,
          data: {
            message: successNotice,
            ...(!hasSmtp ? { demoOtp: otpCode } : {}),
          },
        });
      }

      // POST /api/v1/auth/forgot-password/verify-otp
      if (subEndpoint === 'forgot-password' && pathParts[2] === 'verify-otp') {
        if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
        const { email, otpCode, newPassword } = req.body || {};
        if (!email || !otpCode || !newPassword) {
          return res.status(400).json({
            success: false,
            message: 'Email, OTP code, and new password are required.',
          });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const cleanOtp = String(otpCode).trim();
        const rows = await queryDb(
          'SELECT id, name, email, otp_code, otp_expires_at FROM users WHERE LOWER(email) = $1 LIMIT 1',
          [cleanEmail]
        );
        if (rows.length === 0 || !rows[0].otp_code || rows[0].otp_code !== cleanOtp) {
          return res.status(400).json({
            success: false,
            message: 'Invalid verification code.',
          });
        }
        const user = rows[0];
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
          return res.status(400).json({
            success: false,
            message: 'Verification code has expired. Please request a new one.',
          });
        }

        const hashedPassword = await hashPassword(newPassword);
        await queryDb(
          'UPDATE users SET password = $1, otp_code = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = $2',
          [hashedPassword, user.id]
        );

        return res.status(200).json({
          success: true,
          message: 'Password reset successfully. You can now login.',
          data: { message: 'Password reset successfully. You can now login.' },
        });
      }

      // POST /api/v1/auth/login
      if (subEndpoint === 'login') {
        if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
        const { email, password } = req.body || {};
        if (!email || !password) {
          return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const rows = await queryDb(
          `SELECT u.id, u.tenant_id, u.name, u.email, u.password, u.role_id, u.status, u.permissions, r.name as role_name
           FROM users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE LOWER(u.email) = $1
           LIMIT 1`,
          [cleanEmail]
        );
        if (rows.length === 0) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const user = rows[0];
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        if (user.status !== 'active') {
          return res.status(403).json({ success: false, message: 'Your account is inactive or pending approval' });
        }

        const roleName = normalizeRoleName(
          user.role_name || (user.role_id === '1' ? 'super_admin' : user.role_id === '2' ? 'admin' : user.role_id === '3' ? 'faculty' : 'student')
        );
        const safeUser = {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          roleId: Number(user.role_id),
          role: roleName,
          status: user.status,
          tenantId: user.tenant_id ? Number(user.tenant_id) : 1,
          permissions: user.permissions || null,
        };

        const token = signAccessToken(safeUser);
        const refreshToken = signRefreshToken({ id: Number(user.id), email: user.email });

        await queryDb('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]).catch(() => {});

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: safeUser,
            token,
            refreshToken,
          },
        });
      }

      // GET /api/v1/auth/me
      if (subEndpoint === 'me') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        try {
          const decoded = verifyAccessToken(authHeader.split(' ')[1]);
          const rows = await queryDb(
            `SELECT u.id, u.tenant_id, u.name, u.email, u.role_id, u.status, u.permissions, r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1 LIMIT 1`,
            [decoded.id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
          const user = rows[0];
          const roleName = normalizeRoleName(user.role_name || decoded.role);
          return res.status(200).json({
            success: true,
            data: {
              id: Number(user.id),
              name: user.name,
              email: user.email,
              roleId: Number(user.role_id),
              role: roleName,
              status: user.status,
              tenantId: user.tenant_id ? Number(user.tenant_id) : 1,
              permissions: user.permissions || null,
            },
          });
        } catch (err: any) {
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
      }

      // POST /api/v1/auth/refresh
      if (subEndpoint === 'refresh') {
        const { refreshToken } = req.body || {};
        if (!refreshToken) {
          return res.status(400).json({ success: false, message: 'Refresh token is required' });
        }
        try {
          const decoded = verifyRefreshToken(refreshToken);
          const rows = await queryDb(
            `SELECT u.id, u.tenant_id, u.name, u.email, u.role_id, u.status, u.permissions, r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1 LIMIT 1`,
            [decoded.id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
          const user = rows[0];
          if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'User account is not active' });
          }
          const roleName = normalizeRoleName(user.role_name);
          const safeUser = {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            roleId: Number(user.role_id),
            role: roleName,
            status: user.status,
            tenantId: user.tenant_id ? Number(user.tenant_id) : 1,
            permissions: user.permissions || null,
          };
          const newToken = signAccessToken(safeUser);
          const newRefreshToken = signRefreshToken({ id: Number(user.id), email: user.email });
          return res.status(200).json({
            success: true,
            message: 'Token refreshed',
            data: {
              token: newToken,
              refreshToken: newRefreshToken,
              user: safeUser,
            },
          });
        } catch (err: any) {
          return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }
      }

      // POST /api/v1/auth/logout
      if (subEndpoint === 'logout') {
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
      }

      // POST /api/v1/auth/register
      if (subEndpoint === 'register') {
        const { name, email, password, roleName } = req.body || {};
        if (!name || !email || !password) {
          return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const existing = await queryDb('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
        if (existing.length > 0) {
          return res.status(409).json({ success: false, message: 'Email is already registered' });
        }
        const roleTarget = normalizeRoleName(roleName || 'student');
        const roleRows = await queryDb('SELECT id FROM roles WHERE LOWER(name) = $1 LIMIT 1', [roleTarget]);
        const roleId = roleRows.length > 0 ? roleRows[0].id : 4;
        const hashedPassword = await hashPassword(password);
        await queryDb(
          `INSERT INTO users (tenant_id, name, email, password, role_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [1, name.trim(), cleanEmail, hashedPassword, roleId, 'active']
        );
        return res.status(201).json({ success: true, message: 'User registered successfully' });
      }

      // POST /api/v1/auth/setup-password
      if (subEndpoint === 'setup-password') {
        const { token, password } = req.body || {};
        if (!token || !password) {
          return res.status(400).json({ success: false, message: 'Token and password are required' });
        }
        try {
          const decoded = verifyAccessToken(token);
          const hashedPassword = await hashPassword(password);
          await queryDb('UPDATE users SET password = $1, status = $2, updated_at = NOW() WHERE id = $3', [
            hashedPassword,
            'active',
            decoded.id,
          ]);
          return res.status(200).json({ success: true, message: 'Password setup successfully. You can now login.' });
        } catch (err: any) {
          return res.status(400).json({ success: false, message: 'Invalid or expired setup token' });
        }
      }

      // POST /api/v1/auth/change-password/request-otp
      if (subEndpoint === 'change-password' && pathParts[2] === 'request-otp') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        try {
          const decoded = verifyAccessToken(authHeader.split(' ')[1]);
          const userRows = await queryDb('SELECT id, name, email FROM users WHERE id = $1 LIMIT 1', [decoded.id]);
          if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
          const user = userRows[0];
          const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
          await queryDb('UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3', [
            otpCode,
            otpExpiresAt,
            user.id,
          ]);
          await sendOtpEmail(user.email, user.name, otpCode);
          const hasSmtp = Boolean(process.env.SMTP_USER || process.env.GMAIL_USER);
          return res.status(200).json({
            success: true,
            message: hasSmtp ? 'OTP sent successfully' : `OTP sent successfully (Demo OTP: ${otpCode})`,
          });
        } catch (err: any) {
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
      }

      // POST /api/v1/auth/change-password/verify-otp
      if (subEndpoint === 'change-password' && pathParts[2] === 'verify-otp') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { otpCode, newPassword } = req.body || {};
        if (!otpCode || !newPassword) {
          return res.status(400).json({ success: false, message: 'OTP code and new password are required' });
        }
        try {
          const decoded = verifyAccessToken(authHeader.split(' ')[1]);
          const userRows = await queryDb('SELECT id, otp_code, otp_expires_at FROM users WHERE id = $1 LIMIT 1', [decoded.id]);
          if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
          const user = userRows[0];
          if (!user.otp_code || user.otp_code !== String(otpCode).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
          }
          if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ success: false, message: 'Verification code has expired' });
          }
          const hashedPassword = await hashPassword(newPassword);
          await queryDb('UPDATE users SET password = $1, otp_code = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = $2', [
            hashedPassword,
            user.id,
          ]);
          return res.status(200).json({ success: true, message: 'Password updated successfully' });
        } catch (err: any) {
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
      }
    }
    
    // ── 1.5. New Handlers ──────────────────────────────────────────────────────
    if (endpoint === 'users') {
      return handleUsers(req, res, subEndpoint, pathParts);
    }
    if (endpoint === 'dashboard') {
      return handleDashboard(req, res, subEndpoint);
    }
    if (endpoint === 'media') {
      return handleMedia(req, res, subEndpoint, pathParts);
    }
    if (endpoint === 'chatbot') {
      return res.status(200).json({ success: true, message: 'Chatbot endpoint stubbed' });
    }

    const crudEndpoints = ['courses', 'notices', 'events', 'faculty', 'departments', 'placements', 'infrastructures', 'site-settings'];
    if (crudEndpoints.includes(endpoint) && req.method !== 'GET') {
      return handleCrud(req, res, endpoint, subEndpoint);
    }
    if (endpoint === 'inquiries' && req.method !== 'POST') {
      return handleCrud(req, res, endpoint, subEndpoint);
    }

    // ── 2. CMS Page Sections ───────────────────────────────────────────────────
    if (endpoint === 'cms' && subEndpoint === 'page-sections') {
      if (req.method !== 'GET') {
        return handleCrud(req, res, endpoint, subEndpoint);
      }
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

      const totalPages = Math.ceil(total / limit) || 1;
      return res.status(200).json({
        success: true,
        data: mapped,
        items: mapped,
        rows: mapped,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        meta: {
          page,
          limit,
          total,
          totalPages,
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

      const totalPages = Math.ceil(total / limit) || 1;
      return res.status(200).json({
        success: true,
        data: mapped,
        items: mapped,
        rows: mapped,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        meta: {
          page,
          limit,
          total,
          totalPages,
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

      const totalPages = Math.ceil(total / limit) || 1;
      return res.status(200).json({
        success: true,
        data: mapped,
        items: mapped,
        rows: mapped,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    }

    // ── 6. Faculty ────────────────────────────────────────────────────────────
    if (endpoint === 'faculty') {
      if (subEndpoint) {
        const rows = await queryDb(
          `SELECT f.*, d.name as department_name, d.slug as department_slug 
           FROM faculty f 
           LEFT JOIN departments d ON f.department_id = d.id 
           WHERE f.id::text = $1 AND f.deleted_at IS NULL LIMIT 1`,
          [subEndpoint]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
        const r = rows[0];
        return res.status(200).json({
          success: true,
          data: {
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
          }
        });
      }

      const deptId = Number(req.query.departmentId) || 0;
      const search = (req.query.search as string) || '';

      const rows = await queryDb(
        `SELECT f.*, d.name as department_name, d.slug as department_slug 
         FROM faculty f 
         LEFT JOIN departments d ON f.department_id = d.id 
         WHERE f.deleted_at IS NULL 
           AND ($1 = 0 OR f.department_id = $1)
           AND ($2 = '' OR f.name ILIKE $3)
         ORDER BY f.sort_order DESC, f.id ASC`,
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

      const totalPages = Math.ceil(total / limit) || 1;
      return res.status(200).json({
        success: true,
        data: mapped,
        items: mapped,
        rows: mapped,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        meta: {
          page,
          limit,
          total,
          totalPages,
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
        "SELECT * FROM infrastructures WHERE (status = 'active' OR status = 'published') AND deleted_at IS NULL ORDER BY sort_order ASC"
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
      const b = req.body || {};
      await queryDb(
        `INSERT INTO inquiries (
          full_name, phone, email, course_id, city, message, source, source_name, status,
          first_name, last_name, gender, blood_group, caste, dob, place_of_birth,
          address, state, pin, alt_phone, whatsapp, father_name, father_occupation,
          mother_name, mother_occupation, annual_income, board_12th, stream_12th,
          year_of_passing_12th, aggregate_marks_12th, school_name, mba_college_name,
          mba_degree_name, mba_specialization, mba_graduation_year, mba_university,
          mba_score, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, NOW(), NOW()
        )`,
        [
          b.fullName || '', b.phone || '', b.email || '', b.courseId ? Number(b.courseId) : null,
          b.city || '', b.message || '', b.source || 'website', b.sourceName || '', 'new',
          b.firstName || '', b.lastName || '', b.gender || '', b.bloodGroup || '', b.caste || '',
          b.dob || '', b.placeOfBirth || '', b.address || '', b.state || '', b.pin || '',
          b.altPhone || '', b.whatsapp || '', b.fatherName || '', b.fatherOccupation || '',
          b.motherName || '', b.motherOccupation || '', b.annualIncome || '', b.board12th || '',
          b.stream12th || '', b.yearOfPassing12th || '', b.aggregateMarks12th || '', b.schoolName || '',
          b.mbaCollegeName || '', b.mbaDegreeName || '', b.mbaSpecialization || '', b.mbaGraduationYear || '',
          b.mbaUniversity || '', b.mbaScore || ''
        ]
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
