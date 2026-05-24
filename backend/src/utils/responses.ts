import { Response } from 'express';

export class ApiResponse {
  static success(
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data || null,
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || null,
    });
  }

  static paginated(
    res: Response,
    statusCode: number,
    message: string,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}
