import { Request, Response, NextFunction } from 'express';
import serverConfig from '../config/server.config';
import { SystemError } from '../errors';
import Joi, { any } from 'joi';

class SystemMiddlewares {
  public async errorHandler(
    error: SystemError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    const isProduction = serverConfig.NODE_ENV === 'production';
    const errorCode = error.code || 500;
    let errorMessage: SystemError | object = {};

    if (res.headersSent) {
      next(error);
    }

    if (!isProduction) {
      serverConfig.DEBUG(error.stack);
      errorMessage = error;
    }

    if (serverConfig.NODE_ENV === 'development') console.log(error);

    if (error instanceof Joi.ValidationError) {
      return res.status(400).json({
        message: 'Validation error.',
        error: error.details,
      });
    }

    if (errorCode === 500 && isProduction) {
      return res.status(500).json({
        message: 'An unexpected error occurred. Please try again later.',
      });
    }

    return res.status(errorCode).json({
      message: error.message,
      error: {
        ...(error.errors && { error: error.errors }),
        ...(!isProduction && { trace: errorMessage }),
      },
    });
  }

  public formatRequestQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        query: { limit, offset, status, search, categoryId },
      } = req;
      req.queryOpts = {
        limit: Number(limit) ? Number(limit) : 10,
        offset: Number(offset) ? Number(offset) : 0,
        status: status ? String(status).split(',') : undefined,
        search: search ? String(search) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      return next();
    } catch (error) {
      serverConfig.DEBUG(`Error in system middleware format request query: ${error}`);
      next(error);
    }
  }
}

export default new SystemMiddlewares();
