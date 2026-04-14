import { Request } from "express";
import sql from "mssql";
import { getCurrentDbPool } from "../config/database";
import { AuthContext } from "../types/auth";

type BranchScopeOptions = {
  enforceBranchScope?: boolean;
  branchKeys?: string[];
};

type AuthorizationResult = {
  allowed: boolean;
  statusCode?: number;
  message?: string;
};

const DEFAULT_BRANCH_KEYS = ["maChiNhanh"];

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

export function extractAuthContext(request: Request): AuthContext {
  const username = request.header("x-username") ?? "anonymous";
  const role = normalizeRole(request.header("x-user-role") ?? "viewer");
  const branchCode = request.header("x-user-branch") ?? undefined;

  return { username, role, branchCode };
}

export function pickBranchFromRequest(
  request: Request,
  branchKeys: string[] = DEFAULT_BRANCH_KEYS,
): string | undefined {
  for (const key of branchKeys) {
    const fromBody = request.body?.[key] as string | undefined;
    const fromQuery = request.query?.[key] as string | undefined;
    const fromParam = request.params?.[key] as string | undefined;

    const value = fromBody ?? fromQuery ?? fromParam;
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function authorizeRequest(
  request: Request,
  allowedRoles: string[],
  options: BranchScopeOptions = {},
): AuthorizationResult {
  const auth = request.auth;

  if (!auth) {
    return {
      allowed: false,
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  if (!normalizedAllowedRoles.includes(normalizeRole(auth.role))) {
    return {
      allowed: false,
      statusCode: 403,
      message: "Forbidden: role is not allowed",
    };
  }

  if (!options.enforceBranchScope) {
    return { allowed: true };
  }

  if (["admin", "publisher_admin"].includes(normalizeRole(auth.role))) {
    return { allowed: true };
  }

  const targetBranch = pickBranchFromRequest(
    request,
    options.branchKeys ?? DEFAULT_BRANCH_KEYS,
  );

  if (!targetBranch || !auth.branchCode || targetBranch !== auth.branchCode) {
    return {
      allowed: false,
      statusCode: 403,
      message: "Forbidden: branch scope mismatch",
    };
  }

  return { allowed: true };
}

export async function authenticateUser(input: {
  username: string;
  password: string;
}): Promise<AuthContext | null> {
  const pool = getCurrentDbPool();

  const result = await pool
    .request()
    .input("Username", sql.VarChar(50), input.username)
    .input("Password", sql.VarChar(100), input.password)
    .query(
      `SELECT u.Username, r.TenRole, u.MaChiNhanh
       FROM Users u
       LEFT JOIN Role r ON r.MaRole = u.MaRole
       WHERE u.Username = @Username AND u.Password = @Password`,
    );

  const user = result.recordset[0];
  if (!user) {
    return null;
  }

  return {
    username: user.Username as string,
    role: normalizeRole((user.TenRole as string) ?? "viewer"),
    branchCode: (user.MaChiNhanh as string | null) ?? undefined,
  };
}
