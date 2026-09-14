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
      fullName: r.full_name,
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
    try {
      // 1. Page Views for the trend chart
      const pageViews = await queryDb(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM page_views 
        WHERE created_at >= NOW() - INTERVAL '30 days' 
        GROUP BY DATE(created_at) 
        ORDER BY date ASC
      `).catch(() => []);

      // 2. KPI Metrics
      const totalInquiriesRes = await queryDb(`SELECT COUNT(*) as count FROM inquiries`);
      const totalApplications = parseInt(totalInquiriesRes[0]?.count || '0', 10);
      
      const admissionsOfferedRes = await queryDb(`SELECT COUNT(*) as count FROM inquiries WHERE status IN ('converted', 'enrolled')`);
      const admissionsOffered = parseInt(admissionsOfferedRes[0]?.count || '0', 10);
      
      const enrollmentRate = totalApplications > 0 ? ((admissionsOffered / totalApplications) * 100).toFixed(1) : '0';
      
      const activeStudentsRes = await queryDb(`SELECT COUNT(*) as count FROM inquiries WHERE status = 'enrolled'`);
      const activeStudents = parseInt(activeStudentsRes[0]?.count || '0', 10);

      // 3. Course Popularity
      const coursesRes = await queryDb(`
        SELECT c.course_name as name, c.course_code as code, COUNT(i.id) as students
        FROM courses c
        LEFT JOIN inquiries i ON c.id = i.course_id
        GROUP BY c.id
        HAVING COUNT(i.id) > 0
        ORDER BY students DESC
        LIMIT 5
      `);
      
      const coursesWithPercentages = coursesRes.map((c: any) => ({
        name: c.name,
        code: c.code || 'UNK',
        students: parseInt(c.students, 10),
        percentage: totalApplications > 0 ? Math.round((parseInt(c.students, 10) / totalApplications) * 100) : 0
      }));

      // 4. Funnel Metrics
      const websiteVisitsRes = await queryDb(`SELECT COUNT(*) as count FROM page_views`);
      const websiteVisits = parseInt(websiteVisitsRes[0]?.count || '0', 10);
      
      const appsStartedRes = await queryDb(`SELECT COUNT(*) as count FROM inquiries WHERE status NOT IN ('new')`);
      const appsStarted = parseInt(appsStartedRes[0]?.count || '0', 10);

      const funnelSteps = [
        { stepName: 'Website Visits', count: websiteVisits, percentage: 100, color: 'bg-blue-500' },
        { stepName: 'Inquiries Submitted', count: totalApplications, percentage: websiteVisits > 0 ? Math.round((totalApplications / websiteVisits) * 100) : 0, color: 'bg-indigo-500' },
        { stepName: 'Applications Started', count: appsStarted, percentage: websiteVisits > 0 ? Math.round((appsStarted / websiteVisits) * 100) : 0, color: 'bg-violet-500' },
        { stepName: 'Completed Applications', count: admissionsOffered, percentage: websiteVisits > 0 ? Math.round((admissionsOffered / websiteVisits) * 100) : 0, color: 'bg-emerald-500' }
      ];

      // 5. Traffic Locations (using city instead of country since most traffic is local/domestic)
      const locationsRes = await queryDb(`
        SELECT country, city, COUNT(*) as count
        FROM page_views
        WHERE country IS NOT NULL AND country != ''
        GROUP BY country, city
        ORDER BY count DESC
        LIMIT 5
      `).catch(() => []);

      const locationsWithPercentages = locationsRes.map((loc: any) => ({
        country: loc.country,
        city: loc.city || 'Unknown',
        count: parseInt(loc.count, 10),
        percentage: websiteVisits > 0 ? Math.round((parseInt(loc.count, 10) / websiteVisits) * 100) : 0
      }));

      return res.status(200).json({ 
        success: true, 
        data: { 
          pageViews,
          kpiCards: [
            { label: 'Total Applications', value: totalApplications.toLocaleString(), trend: '0%', isPositive: true, icon: '📄', color: 'from-blue-500 to-cyan-400' },
            { label: 'Admissions Offered', value: admissionsOffered.toLocaleString(), trend: '0%', isPositive: true, icon: '🎓', color: 'from-emerald-500 to-teal-400' },
            { label: 'Enrollment Rate', value: `${enrollmentRate}%`, trend: '0%', isPositive: true, icon: '📈', color: 'from-purple-500 to-indigo-400' },
            { label: 'Active Students', value: activeStudents.toLocaleString(), trend: '0%', isPositive: true, icon: '👥', color: 'from-orange-500 to-amber-400' }
          ],
          courses: coursesWithPercentages,
          funnelSteps,
          locations: locationsWithPercentages
        } 
      });
    } catch (err: any) {
      console.error('Analytics Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
    }
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
