import { Router } from "express";
import { navigationService } from "./navigation.service";
import { authenticateToken, requirePermission } from "../common";
import { insertNavigationItemSchema } from "@myhi2025/shared";
import { z } from "zod";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requirePermission("navigation", "read"),
  async (req, res) => {
    try {
      const items = await navigationService.getAllNavigationItems();
      res.json(items);
    } catch (error) {
      console.error("Get navigation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/tree",
  authenticateToken,
  requirePermission("navigation", "read"),
  async (req, res) => {
    try {
      const tree = await navigationService.getNavigationTree();
      res.json(tree);
    } catch (error) {
      console.error("Get navigation tree error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  requirePermission("navigation", "create"),
  async (req, res) => {
    try {
      const validatedData = insertNavigationItemSchema.parse(req.body);
      const currentUser = (req as any).user;

      const newItem = await navigationService.createNavigationItem(
        validatedData,
        currentUser.id,
        req
      );
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      console.error("Create navigation item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission("navigation", "update"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const updatedItem = await navigationService.updateNavigationItem(
        id,
        req.body,
        currentUser.id,
        req
      );
      res.json(updatedItem);
    } catch (error: any) {
      console.error("Update navigation item error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("navigation", "delete"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const result = await navigationService.deleteNavigationItem(
        id,
        currentUser.id,
        req
      );
      res.json(result);
    } catch (error: any) {
      console.error("Delete navigation item error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

router.patch(
  "/reorder",
  authenticateToken,
  requirePermission("navigation", "update"),
  async (req, res) => {
    try {
      const { itemOrders } = req.body;
      const currentUser = (req as any).user;

      const result = await navigationService.reorderNavigationItems(
        itemOrders,
        currentUser.id,
        req
      );
      res.json(result);
    } catch (error: any) {
      console.error("Reorder navigation error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

export default router;
