import { NextApiRequest, NextApiResponse } from 'next';
import { queryDb } from '@/lib/db';
import { hashPassword, verifyAccessToken, normalizeRoleName } from '@/lib/auth';

export async function handleUsers(req: NextApiRequest, res: NextApiResponse, subEndpoint: string, pathParts: string[]) {
  const method = req.method;

  // Middleware simulation for auth check
  const authHeader = req.headers.authorization;
  let currentUser: any = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      currentUser = verifyAccessToken(authHeader.split(' ')[1]);
    } catch (e) {
      // Invalid token, just proceed without currentUser or throw 401
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Helper to ensure user has enough privileges for user management
  const isSuperAdminOrAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  if (!isSuperAdminOrAdmin && method !== 'GET') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // GET /api/v1/users/:id
  if (method === 'GET' && subEndpoint) {
    const rows = await queryDb(
      `SELECT u.id, u.tenant_id, u.name, u.email, u.role_id, u.status, u.permissions, u.created_at, u.updated_at, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 LIMIT 1`,
      [subEndpoint]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const user = rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        roleId: Number(user.role_id),
        role: normalizeRoleName(user.role_name),
        status: user.status,
        tenantId: user.tenant_id ? Number(user.tenant_id) : 1,
        permissions: user.permissions || null,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  }

  // GET /api/v1/users
  if (method === 'GET') {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;

    const rows = await queryDb(
      `SELECT u.id, u.tenant_id, u.name, u.email, u.role_id, u.status, u.permissions, u.created_at, u.updated_at, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRes = await queryDb('SELECT count(*) FROM users');
    const total = Number(countRes[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const mapped = rows.map((user) => ({
      id: Number(user.id),
      name: user.name,
      email: user.email,
      roleId: Number(user.role_id),
      role: normalizeRoleName(user.role_name),
      status: user.status,
      tenantId: user.tenant_id ? Number(user.tenant_id) : 1,
      permissions: user.permissions || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    return res.status(200).json({
      success: true,
      data: mapped,
      items: mapped,
      rows: mapped,
      pagination: { page, limit, total, totalPages },
      meta: { page, limit, total, totalPages },
    });
  }

  // POST /api/v1/users
  if (method === 'POST') {
    const { name, email, password, roleId, roleName, permissions } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await queryDb('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email is already registered' });

    const roleTarget = normalizeRoleName(roleName || 'student');
    let rId = roleId;
    if (!rId) {
      const roleRows = await queryDb('SELECT id FROM roles WHERE LOWER(name) = $1 LIMIT 1', [roleTarget]);
      rId = roleRows.length > 0 ? roleRows[0].id : 4;
    }

    const hashedPassword = password ? await hashPassword(password) : null;
    // Note: if no password, they have to use forgot password to set one

    const result = await queryDb(
      `INSERT INTO users (tenant_id, name, email, password, role_id, status, permissions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
      [1, String(name).trim(), cleanEmail, hashedPassword, rId, 'active', permissions || null]
    );

    return res.status(201).json({ success: true, message: 'User created successfully', data: { id: result[0].id } });
  }

  // PUT /api/v1/users/:id
  if (method === 'PUT' && subEndpoint) {
    const userId = Number(subEndpoint);
    const { name, email, password, roleId, roleName, status, permissions } = req.body;

    const existingUser = await queryDb('SELECT id FROM users WHERE id = $1', [userId]);
    if (existingUser.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    let query = 'UPDATE users SET updated_at = NOW()';
    const params: any[] = [];
    let paramIndex = 1;

    if (name) {
      query += `, name = $${paramIndex++}`;
      params.push(String(name).trim());
    }
    if (email) {
      query += `, email = $${paramIndex++}`;
      params.push(String(email).toLowerCase().trim());
    }
    if (password) {
      query += `, password = $${paramIndex++}`;
      params.push(await hashPassword(password));
    }
    if (roleId) {
      query += `, role_id = $${paramIndex++}`;
      params.push(roleId);
    } else if (roleName) {
      const roleTarget = normalizeRoleName(roleName);
      const roleRows = await queryDb('SELECT id FROM roles WHERE LOWER(name) = $1 LIMIT 1', [roleTarget]);
      if (roleRows.length > 0) {
        query += `, role_id = $${paramIndex++}`;
        params.push(roleRows[0].id);
      }
    }
    if (status) {
      query += `, status = $${paramIndex++}`;
      params.push(status);
    }
    if (permissions !== undefined) {
      query += `, permissions = $${paramIndex++}`;
      params.push(permissions);
    }

    query += ` WHERE id = $${paramIndex}`;
    params.push(userId);

    await queryDb(query, params);

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  }

  // DELETE /api/v1/users/:id
  if (method === 'DELETE' && subEndpoint) {
    const userId = Number(subEndpoint);
    if (currentUser.id === userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const existingUser = await queryDb('SELECT id FROM users WHERE id = $1', [userId]);
    if (existingUser.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await queryDb('DELETE FROM users WHERE id = $1', [userId]);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
