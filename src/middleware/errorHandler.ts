import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  logger.error("Unhandled error", {
    message: error.message,
    stack: error.stack,
  });

  response.status(500).json({
    message: "Internal server error",
  });
}
