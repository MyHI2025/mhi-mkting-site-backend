import { Router } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { authenticateToken } from '../common';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

router.post("/login", asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData.username, validatedData.password, req);
  res.json(result);
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const validatedData = refreshSchema.parse(req.body);
  const result = await authService.refreshToken(validatedData.refreshToken);
  res.json(result);
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const validatedData = logoutSchema.parse(req.body);
  const result = await authService.logout(validatedData.refreshToken);
  res.json(result);
}));

router.get("/me", authenticateToken, asyncHandler(async (req, res) => {
  const user = (req as any).user;
  const result = await authService.getCurrentUser(user.id);
  res.json(result);
}));

export default router;
