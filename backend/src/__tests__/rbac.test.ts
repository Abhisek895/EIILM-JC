import { authorizeRole, authorizePermission, AuthRequest } from '@middlewares/auth';
import { Response, NextFunction } from 'express';

describe('RBAC & Permission Middleware', () => {
  let mockResponse: () => { res: Partial<Response>; statusMock: jest.Mock; jsonMock: jest.Mock };
  let nextMock: NextFunction;

  beforeEach(() => {
    nextMock = jest.fn();
    mockResponse = () => {
      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res: Partial<Response> = {
        status: statusMock as any,
        json: jsonMock as any,
      };
      return { res, statusMock, jsonMock };
    };
  });

  describe('authorizeRole', () => {
    it('should allow user with matching role', () => {
      const middleware = authorizeRole(['admin', 'super_admin']);
      const req: Partial<AuthRequest> = {
        user: { id: 1, email: 'admin@eiilm.edu', roleId: 2, role: 'admin' },
      };
      const { res } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    it('should reject user with non-matching role with 403 Forbidden', () => {
      const middleware = authorizeRole(['admin', 'super_admin']);
      const req: Partial<AuthRequest> = {
        user: { id: 99, email: 'student@eiilm.edu', roleId: 4, role: 'student' },
      };
      const { res, statusMock, jsonMock } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.stringContaining('Forbidden') })
      );
    });

    it('should reject unauthenticated request with 401 Unauthorized', () => {
      const middleware = authorizeRole(['admin']);
      const req: Partial<AuthRequest> = {};
      const { res, statusMock } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('authorizePermission', () => {
    it('should grant super_admin automatic access to any module and action', () => {
      const middleware = authorizePermission('courses', 'delete');
      const req: Partial<AuthRequest> = {
        user: { id: 1, email: 'super@eiilm.edu', roleId: 1, role: 'super_admin' },
      };
      const { res } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    it('should allow user if explicit permission is granted in permissions JSON', () => {
      const middleware = authorizePermission('courses', 'write');
      const req: Partial<AuthRequest> = {
        user: {
          id: 5,
          email: 'staff@eiilm.edu',
          roleId: 2,
          role: 'admin',
          permissions: {
            modules: {
              courses: ['read', 'write'],
            },
          },
        },
      };
      const { res } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    it('should deny user if action is not permitted', () => {
      const middleware = authorizePermission('courses', 'delete');
      const req: Partial<AuthRequest> = {
        user: {
          id: 5,
          email: 'staff@eiilm.edu',
          roleId: 2,
          role: 'admin',
          permissions: {
            modules: {
              courses: ['read', 'write'], // write only, not delete
            },
          },
        },
      };
      const { res, statusMock } = mockResponse();

      middleware(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });
});
