import { Router } from "express";
import { z } from "zod";
import { systemRepository } from "../../repositories/implementations/system.repository.impl";
import { asyncHandler } from "../common/errorHandlers";
import { authenticateToken } from "../common";
import { insertDashboardWidgetSchema } from "@myhealthintegral/shared";

const router = Router();

// Get user's dashboard widgets
router.get("/widgets", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const widgets = await systemRepository.getUserWidgets(userId);
  res.json(widgets);
}));

// Create a new widget
router.post("/widgets", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const validatedData = insertDashboardWidgetSchema.parse({ ...req.body, userId });

  const widget = await systemRepository.createWidget(validatedData);
  res.status(201).json(widget);
}));

// Update a widget
router.patch("/widgets/:id", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updateSchema = insertDashboardWidgetSchema.partial();
  const validatedData = updateSchema.parse(req.body);

  const widget = await systemRepository.updateWidget(id, validatedData);
  
  // Verify ownership
  if (widget.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(widget);
}));

// Delete a widget
router.delete("/widgets/:id", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  await systemRepository.deleteWidget(id);
  res.json({ success: true, message: "Widget deleted successfully" });
}));

// Update widget layout (batch update for drag-and-drop)
router.post("/widgets/layout", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const layoutSchema = z.object({
    widgets: z.array(z.object({
      id: z.string(),
      displayOrder: z.number(),
      gridPosition: z.any().optional(),
    })),
  });

  const { widgets } = layoutSchema.parse(req.body);
  const updatedWidgets = await systemRepository.updateWidgetLayout(userId, widgets);
  res.json(updatedWidgets);
}));

// Reset to default layout
router.post("/widgets/reset", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const defaultWidgets = await systemRepository.resetUserWidgets(userId);
  res.json(defaultWidgets);
}));

export default router;
