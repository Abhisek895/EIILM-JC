import { Inquiry } from '@models/Inquiry';
import { Course } from '@models/Course';
import { User } from '@models/User';
import { Role } from '@models/Role';

export class DashboardService {
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
        'createdAt',
      ],
    });
  }
}
