import { Request, Response } from "express";

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({
    message: "Route not found",
  });
}
