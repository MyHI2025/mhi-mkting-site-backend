import { Router } from "express";
import { teamService } from "./team.service";
import { authenticateToken, requirePermission } from "../common";
import { insertTeamMemberSchema } from "@myhi2025/shared";
import { asyncHandler } from "../common/errorHandlers";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const members = await teamService.getAllTeamMembers();
    res.json(members);
  })
);

router.get(
  "/:id",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const member = await teamService.getTeamMember(id);
    res.json(member);
  })
);

router.post(
  "/",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertTeamMemberSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newMember = await teamService.createTeamMember(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newMember);
  })
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updateSchema = insertTeamMemberSchema.partial();
    const validatedData = updateSchema.parse(req.body);

    const updatedMember = await teamService.updateTeamMember(
      id,
      validatedData,
      currentUser.id,
      req
    );
    res.json(updatedMember);
  })
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const result = await teamService.deleteTeamMember(id, currentUser.id, req);
    res.json(result);
  })
);

export default router;
