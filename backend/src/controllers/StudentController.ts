import { Response } from 'express';
import { ApiResponse } from '@utils/responses';
import { AuthRequest } from '@middlewares/auth';
import { UserService } from '@services/UserService';
import { CourseService } from '@services/CourseService';
import { Grade, FeeRecord } from '@models/index';
import { parsePagination } from '@utils/pagination';

export class StudentController {
  private userService: UserService;
  private courseService: CourseService;

  constructor() {
    this.userService = new UserService();
    this.courseService = new CourseService();
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 401, 'Unauthorized');
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        ApiResponse.error(res, 404, 'Student not found');
        return;
      }

      ApiResponse.success(res, 200, 'Student profile fetched successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || req.user.role,
        status: user.status,
      });
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async courses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const result = await this.courseService.listCourses(page, limit, false);

      ApiResponse.paginated(
        res,
        200,
        'Student courses fetched successfully',
        result.data,
        {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async grades(req: AuthRequest, res: Response): Promise<void> {
    try {
      const grades = await Grade.findAll({
        where: { student_id: req.user!.id },
        order: [['semester', 'DESC']],
      });
      ApiResponse.success(res, 200, 'Grades fetched successfully', grades);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async fees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const fees = await FeeRecord.findAll({
        where: { student_id: req.user!.id },
        order: [['due_date', 'ASC']],
      });
      ApiResponse.success(res, 200, 'Fees fetched successfully', fees);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async payFee(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { feeId } = req.body;
      const fee = await FeeRecord.findOne({
        where: { id: feeId, student_id: req.user!.id }
      });
      
      if (!fee) {
        ApiResponse.error(res, 404, 'Fee record not found');
        return;
      }
      
      // Mock payment processing logic
      fee.status = 'Paid';
      fee.receipt_url = `/receipts/mock-receipt-${fee.id}.pdf`;
      await fee.save();

      ApiResponse.success(res, 200, 'Payment successful', fee);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }
}
