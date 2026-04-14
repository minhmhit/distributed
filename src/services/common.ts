import { Request } from "express";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCurrentDbPool } from "../config/database";
import { getAppEnv } from "../config/env";
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
const BCRYPT_SALT_ROUNDS = 10;

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

export function extractAuthContext(request: Request): AuthContext {
  const username = request.header("x-username") ?? "anonymous";
  const role = normalizeRole(request.header("x-user-role") ?? "viewer");
  const branchCode = request.header("x-user-branch") ?? undefined;

  return { username, role, branchCode };
}

export function generateToken(auth: AuthContext): string {
  const env = getAppEnv();

  return jwt.sign(
    {
      username: auth.username,
      role: auth.role,
      maRole: auth.maRole,
      maChiNhanh: auth.branchCode,
    },
    env.jwtSecret,
    { expiresIn: "8h" },
  );
}

export function verifyToken(token: string): AuthContext | null {
  try {
    const env = getAppEnv();
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

    if (!payload?.username || !payload?.role) {
      return null;
    }

    return {
      username: String(payload.username),
      role: normalizeRole(String(payload.role)),
      maRole: payload.maRole ? String(payload.maRole) : undefined,
      branchCode: payload.maChiNhanh ? String(payload.maChiNhanh) : undefined,
    };
  } catch {
    return null;
  }
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
    .query(
      `SELECT u.Username, u.Password, r.TenRole, u.MaChiNhanh
              ,u.MaRole
       FROM Users u
       LEFT JOIN Role r ON r.MaRole = u.MaRole
       WHERE u.Username = @Username`,
    );

  const user = result.recordset[0];
  if (!user) {
    return null;
  }

  const matched = await verifyPassword(input.password, user.Password as string);
  if (!matched) {
    return null;
  }

  return {
    username: user.Username as string,
    role: normalizeRole((user.TenRole as string) ?? "viewer"),
    maRole: (user.MaRole as string | null) ?? undefined,
    branchCode: (user.MaChiNhanh as string | null) ?? undefined,
  };
}

// Hash password truoc khi luu DB, khong luu plain text.
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
