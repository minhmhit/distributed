import { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService";

export function healthController(_request: Request, response: Response): void {
  response.status(200).json(getHealthStatus());
}
