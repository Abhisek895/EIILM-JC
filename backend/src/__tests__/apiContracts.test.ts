import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';
import { Response } from 'express';

describe('API Contract & Response Standardization', () => {
  let mockRes: () => { res: Partial<Response>; statusMock: jest.Mock; jsonMock: jest.Mock };

  beforeEach(() => {
    mockRes = () => {
      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res: Partial<Response> = {
        status: statusMock as any,
        json: jsonMock as any,
      };
      return { res, statusMock, jsonMock };
    };
  });

  describe('ApiResponse', () => {
    it('should format success responses with success: true and standardized payload', () => {
      const { res, statusMock, jsonMock } = mockRes();
      const payload = { id: 10, name: 'Sample' };

      ApiResponse.success(res as Response, 200, 'Fetched item', payload);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Fetched item',
        data: payload,
      });
    });

    it('should format error responses with success: false and error message', () => {
      const { res, statusMock, jsonMock } = mockRes();

      ApiResponse.error(res as Response, 400, 'Invalid parameters', { field: 'email' });

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid parameters',
        errors: { field: 'email' },
      });
    });

    it('should format paginated responses with both data and pagination metadata', () => {
      const { res, statusMock, jsonMock } = mockRes();
      const items = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 20, totalPages: 2 };

      ApiResponse.paginated(res as Response, 200, 'Items fetched', items, pagination);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Items fetched',
        data: items,
        pagination,
      });
    });
  });

  describe('parsePagination', () => {
    it('should parse valid string integers', () => {
      const { page, limit } = parsePagination('2', '25');
      expect(page).toBe(2);
      expect(limit).toBe(25);
    });

    it('should fallback to defaults when given invalid or missing params', () => {
      const { page, limit } = parsePagination(undefined, undefined);
      expect(page).toBe(1);
      expect(limit).toBe(10);
    });

    it('should sanitize negative or zero page and limit numbers', () => {
      const { page, limit } = parsePagination('-5', '0');
      expect(page).toBe(1);
      expect(limit).toBe(10);
    });

    it('should cap max limit to prevent denial of service', () => {
      const { limit } = parsePagination('1', '500');
      expect(limit).toBeLessThanOrEqual(100);
    });
  });
});
