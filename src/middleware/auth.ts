import { NextFunction, Request, Response } from "express";
import { authorizeRequest, extractAuthContext } from "../services/common";

type AuthOptions = {
  enforceBranchScope?: boolean;
  branchKeys?: string[];
};

export function attachAuthContext(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  request.auth = extractAuthContext(request);
  next();
}

export function requireRoles(
  allowedRoles: string[],
  options: AuthOptions = {},
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const result = authorizeRequest(request, allowedRoles, options);

    if (!result.allowed) {
      response.status(result.statusCode ?? 403).json({
        message: result.message ?? "Forbidden",
      });
      return;
    }

    next();
  };
}
