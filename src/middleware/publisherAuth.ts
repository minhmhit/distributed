import { NextFunction, Request, Response } from "express";
import { AuthContext } from "../types/auth";

function pickBranchFromRequest(request: Request): string | undefined {
  const fromBody = request.body?.maChiNhanh as string | undefined;
  const fromQuery = request.query?.maChiNhanh as string | undefined;
  const fromParam = request.params?.maChiNhanh as string | undefined;

  return fromBody ?? fromQuery ?? fromParam;
}

export function attachAuthContext(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const role = request.header("x-user-role") ?? "viewer";
  const username = request.header("x-username") ?? "anonymous";
  const branchCode = request.header("x-user-branch") ?? undefined;

  request.auth = { role, username, branchCode };
  next();
}

export function requirePublisherRole(allowedRoles: string[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const auth = request.auth as AuthContext | undefined;

    if (!auth || !allowedRoles.includes(auth.role)) {
      response.status(403).json({
        message: "Forbidden: role is not allowed",
      });
      return;
    }

    next();
  };
}

export function requireNodeRole(allowedRoles: string[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const auth = request.auth as AuthContext | undefined;

    if (!auth || !allowedRoles.includes(auth.role)) {
      response.status(403).json({
        message: "Forbidden: node role is not allowed",
      });
      return;
    }

    next();
  };
}

export function enforceBranchScope(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const auth = request.auth;

  if (!auth) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (auth.role === "admin" || auth.role === "publisher_admin") {
    next();
    return;
  }

  const targetBranch = pickBranchFromRequest(request);

  if (!targetBranch || !auth.branchCode || targetBranch !== auth.branchCode) {
    response.status(403).json({
      message: "Forbidden: branch scope mismatch",
    });
    return;
  }

  next();
}
