import { NextApiRequest, NextApiResponse } from 'next';
import { queryDb } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function handleDashboard(req: NextApiRequest, res: NextApiResponse, subEndpoint: string) {
  const method = req.method;

  // GET /api/v1/dashboard/stats
  if (method === 'GET' && subEndpoint === 'stats') {
    try {
      const [
        totalStudents,
        totalFaculty,
        totalCourses,
        recentInquiries,
        activeEvents,
        recentPlacements
      ] = await Promise.all([
        queryDb("SELECT count(*) FROM users WHERE role_id = 4 AND status = 'active'"),
        queryDb("SELECT count(*) FROM faculty WHERE status = 'active' AND deleted_at IS NULL"),
        queryDb("SELECT count(*) FROM courses WHERE status = 'published'"),
        queryDb("SELECT count(*) FROM inquiries WHERE status = 'new'"),
        queryDb("SELECT count(*) FROM events WHERE status = 'published' AND end_date >= NOW() AND deleted_at IS NULL"),
        queryDb("SELECT count(*) FROM placements WHERE status = 'published'")
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalStudents: Number(totalStudents[0]?.count || 0),
          totalFaculty: Number(totalFaculty[0]?.count || 0),
          totalCourses: Number(totalCourses[0]?.count || 0),
          recentInquiries: Number(recentInquiries[0]?.count || 0),
          activeEvents: Number(activeEvents[0]?.count || 0),
          recentPlacements: Number(recentPlacements[0]?.count || 0)
        }
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // GET /api/v1/dashboard/recent-inquiries
  if (method === 'GET' && subEndpoint === 'recent-inquiries') {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const rows = await queryDb(
      'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    const mapped = rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    }));
    return res.status(200).json({ success: true, data: mapped });
  }

  // GET /api/v1/dashboard/analytics
  if (method === 'GET' && subEndpoint === 'analytics') {
    const rows = await queryDb(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM page_views 
      WHERE created_at >= NOW() - INTERVAL '30 days' 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `).catch(() => []); // Fallback if page_views table doesn't exist
    return res.status(200).json({ success: true, data: { pageViews: rows } });
  }

  // POST /api/v1/dashboard/track
  if (method === 'POST' && subEndpoint === 'track') {
    const { path } = req.body;
    if (path) {
      await queryDb('INSERT INTO page_views (path, created_at) VALUES ($1, NOW())', [path]).catch(() => {});
    }
    return res.status(200).json({ success: true });
  }

  return res.status(404).json({ success: false, message: 'Dashboard endpoint not found' });
}
