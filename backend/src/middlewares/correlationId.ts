import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const correlationId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const existing = req.headers['x-correlation-id'];
  const id =
    typeof existing === 'string' && existing.trim().length > 0
      ? existing
      : uuidv4();

  req.headers['x-correlation-id'] = id;
  res.setHeader('x-correlation-id', id);
  next();
};
