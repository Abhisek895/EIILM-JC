import { Inquiry } from '@models/Inquiry';
import { Course } from '@models/Course';
import { User } from '@models/User';
import { Role } from '@models/Role';
import { Faculty } from '@models/Faculty';
import { AuditLog } from '@models/AuditLog';
import { PageView } from '@models/PageView';
import { fn, col, Op, literal } from 'sequelize';
import geoip from 'geoip-lite';

export class DashboardService {
  async trackPageView(path: string, userAgent: string | null, ipAddress: string | null) {
    if (!path) return;
    try {
      let country = null;
      let region = null;
      let city = null;

      if (ipAddress) {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          country = geo.country;
          region = geo.region;
          city = geo.city;
        }
      }

      await PageView.create({ path, userAgent, ipAddress, country, region, city });
    } catch (err) {
      console.error('PageView track error:', err);
    }
  }

  async getStats() {
    const [totalUsers, totalCourses, totalInquiries, totalStudents] =
      await Promise.all([
        User.count(),
        Course.count(),
        Inquiry.count(),
        User.count({
          include: [
            {
              model: Role,
              as: 'role',
              where: { name: 'student' },
            },
          ],
        }),
      ]);

    return {
      totalUsers,
      totalStudents,
      totalCourses,
      totalInquiries,
    };
  }

  async getRecentInquiries(limit: number = 5) {
    return Inquiry.findAll({
      order: [['id', 'DESC']],
      limit,
      attributes: [
        'id',
        'fullName',
        'email',
        'status',
        'courseId',
        ['created_at', 'createdAt'],
      ],
    });
  }

  async getAnalytics() {
    // Extract data from concurrent database queries
    const [
      _ts, _ti, _ci, _tf, _lt, _fc, _cs, _ac, locationData
    ] = await Promise.all([
      User.count({ include: [{ model: Role, as: 'role', where: { name: 'student' } }] }),
      Inquiry.count(),
      Inquiry.count({ where: { status: ['converted', 'enrolled'] } }),
      Faculty.count(),
      PageView.count({ where: literal("created_at >= NOW() - INTERVAL 30 DAY") }),
      Inquiry.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      Inquiry.findAll({ where: { status: ['converted', 'enrolled'] }, attributes: ['courseId', [fn('COUNT', col('id')), 'count']], group: ['courseId'], raw: true }),
      Course.findAll({ attributes: ['id', 'courseName', 'courseCode'], raw: true }),
      PageView.findAll({
        where: literal("created_at >= NOW() - INTERVAL 30 DAY AND country IS NOT NULL"),
        attributes: ['country', 'city', [fn('COUNT', col('id')), 'count']],
        group: ['country', 'city'],
        order: [[literal('count'), 'DESC']],
        limit: 5,
        raw: true,
      }) as unknown as Promise<Array<{ country: string; city: string; count: number | string }>>
    ]);

    const conversionRate = _ti > 0 ? ((_ci / _ti) * 100).toFixed(1) : '0.0';
    
    // Parse funnel stats
    const countsByStatus = (_fc as any[]).reduce((acc, curr) => {
      acc[curr.status] = Number(curr.count);
      return acc;
    }, {} as Record<string, number>);

    const newCount = countsByStatus['new'] || 0;
    const contactedCount = countsByStatus['contacted'] || 0;
    const interestedCount = countsByStatus['interested'] || 0;
    const followUpCount = countsByStatus['follow_up'] || 0;
    const convertedCount = countsByStatus['converted'] || 0;
    const enrolledCount = countsByStatus['enrolled'] || 0;

    const totalLeads = _ti;
    const leadsContacted = totalLeads - newCount;
    const highlyInterested = interestedCount + followUpCount + convertedCount + enrolledCount;
    const studentsEnrolled = convertedCount + enrolledCount;

    const funnelSteps = [
      { stepName: 'Total Leads Received', count: totalLeads, percentage: 100, color: 'bg-primary-600' },
      { stepName: 'Leads Successfully Contacted', count: leadsContacted, percentage: totalLeads > 0 ? Math.round((leadsContacted / totalLeads) * 100) : 0, color: 'bg-indigo-500' },
      { stepName: 'Highly Interested Prospects', count: highlyInterested, percentage: totalLeads > 0 ? Math.round((highlyInterested / totalLeads) * 100) : 0, color: 'bg-violet-500' },
      { stepName: 'Students Officially Enrolled', count: studentsEnrolled, percentage: totalLeads > 0 ? Math.round((studentsEnrolled / totalLeads) * 100) : 0, color: 'bg-emerald-500' },
    ];

    const courseMap = (_ac as any[]).reduce((acc, curr: any) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<number, any>);

    const courses = (_cs as any[]).map(stat => {
      const c = courseMap[stat.courseId];
      return {
        name: c?.courseName || 'Unknown Course',
        code: c?.courseCode || 'UNK',
        students: Number(stat.count),
        percentage: _ci > 0 ? Math.round((Number(stat.count) / _ci) * 100) : 0
      };
    }).sort((a, b) => b.students - a.students);
    
    const locations = locationData.map(loc => ({
      country: loc.country,
      city: loc.city || 'Unknown',
      count: Number(loc.count),
      percentage: _lt > 0 ? Math.round((Number(loc.count) / _lt) * 100) : 0
    }));

    return {
      kpiCards: [
        { label: 'Total Enrolled Students', value: _ci.toString(), trend: 'Live inquiries data', isPositive: true, icon: '🎓', color: 'from-primary-500 to-indigo-600' },
        { label: 'Admission Conversion Rate', value: `${conversionRate}%`, trend: 'Overall', isPositive: true, icon: '🎯', color: 'from-emerald-400 to-teal-500' },
        { label: 'Live Platform Traffic', value: _lt.toString(), trend: 'Last 30 Days (Internal)', isPositive: true, icon: '⚡', color: 'from-violet-500 to-fuchsia-600' },
      ],
      courses,
      funnelSteps,
      locations
    };
  }
}
