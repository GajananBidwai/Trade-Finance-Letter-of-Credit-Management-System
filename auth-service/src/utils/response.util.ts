import { Response } from 'express';

export const sendSuccess = (res: Response, status: number, data: any, message: string = 'Success') => {
  return res.status(status).json({
    status: status,
    data,
    message
  });
};

export const sendError = (res: Response, status: number, message: string) => {
  return res.status(status).json({
    status: 'error',
    message
  });
};
