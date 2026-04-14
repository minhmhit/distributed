import { NextFunction, Request, Response } from "express";
import {
  authorizeRequest,
  extractAuthContext,
  verifyToken,
} from "../services/common";

type AuthOptions = {
  enforceBranchScope?: boolean;
  branchKeys?: string[];
};

export function attachAuthContext(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authorization = request.header("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim();
    const verified = verifyToken(token);

    if (!verified) {
      response.status(401).json({ message: "Unauthorized: invalid token" });
      return;
    }

    request.auth = verified;
    next();
    return;
  }

  // Backward compatibility for internal tests and legacy callers.
  if (request.header("x-user-role")) {
    request.auth = extractAuthContext(request);
  }

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
