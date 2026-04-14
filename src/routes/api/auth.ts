import { Router } from "express";
import { loginController } from "../../controllers/authController";

const authRoutes = Router();

// Public endpoint: login with username/password, returns JWT token.
authRoutes.post("/auth/login", loginController);

export default authRoutes;
