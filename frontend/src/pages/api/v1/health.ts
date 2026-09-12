import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    success: true,
    status: 'OK',
    message: 'EIILM Jalpaiguri Campus API is operational',
    dynamic: true,
    timestamp: new Date().toISOString(),
  });
}
