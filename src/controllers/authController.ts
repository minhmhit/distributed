import { Request, Response } from "express";
import { authenticateUser, generateToken } from "../services/common";

export async function loginController(
  request: Request,
  response: Response,
): Promise<void> {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    response.status(400).json({
      success: false,
      message: "username va password la bat buoc",
    });
    return;
  }

  const authUser = await authenticateUser({ username, password });
  if (!authUser) {
    response.status(401).json({
      success: false,
      message: "Thong tin dang nhap khong hop le",
    });
    return;
  }

  const token = generateToken(authUser);

  response.status(200).json({
    success: true,
    token,
    user: {
      username: authUser.username,
      maRole: authUser.maRole ?? null,
      maChiNhanh: authUser.branchCode ?? null,
    },
  });
}
