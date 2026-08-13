import type { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (

  fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<any>

): RequestHandler => {
  
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

};

export default asyncHandler;
