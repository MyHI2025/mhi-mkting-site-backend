import { Router } from 'express';
import { cmsService } from './cms.service';
import { authenticateToken, requirePermission } from '../common';
import { insertPageSchema, insertContentNodeSchema, insertContentSectionSchema, insertContentBlockSchema } from '@myhealthintegral/shared';
import { z } from 'zod';

const router = Router();

router.get("/public/pages", async (req, res) => {
  try {
    const pages = await cmsService.getAllPublicPages();
    res.json(pages);
  } catch (error) {
    console.error("Get public pages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/pages/:pageId/nodes", async (req, res) => {
  try {
    const { pageId } = req.params;
    const nodes = await cmsService.getPublicPageNodes(pageId);
    res.json(nodes);
  } catch (error: any) {
    console.error("Get public page nodes error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.get("/pages", authenticateToken, requirePermission("pages", "read"), async (req, res) => {
  try {
    const pages = await cmsService.getAllPages();
    res.json(pages);
  } catch (error) {
    console.error("Get pages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pages/:id", authenticateToken, requirePermission("pages", "read"), async (req, res) => {
  try {
    const { id } = req.params;
    const page = await cmsService.getPage(id);
    res.json(page);
  } catch (error: any) {
    console.error("Get page error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.post("/pages", authenticateToken, requirePermission("pages", "create"), async (req, res) => {
  try {
    const validatedData = insertPageSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newPage = await cmsService.createPage(validatedData, currentUser.id, req);
    res.status(201).json(newPage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    const err = error as any;
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("Create page error:", error);
    res.status(status).json({ error: message });
  }
});

router.put("/pages/:id", authenticateToken, requirePermission("pages", "update"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const updatedPage = await cmsService.updatePage(id, req.body, currentUser.id, req);
    res.json(updatedPage);
  } catch (error: any) {
    console.error("Update page error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.delete("/pages/:id", authenticateToken, requirePermission("pages", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const result = await cmsService.deletePage(id, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Delete page error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.patch("/pages/:id/publish", authenticateToken, requirePermission("pages", "publish"), async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const currentUser = (req as any).user;
    
    const updatedPage = await cmsService.publishPage(id, isPublished, currentUser.id, req);
    res.json(updatedPage);
  } catch (error: any) {
    console.error("Publish page error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.get("/pages/:pageId/nodes", authenticateToken, requirePermission("content", "read"), async (req, res) => {
  try {
    const { pageId } = req.params;
    const nodes = await cmsService.getPageNodes(pageId);
    res.json(nodes);
  } catch (error) {
    console.error("Get nodes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/nodes", authenticateToken, requirePermission("content", "create"), async (req, res) => {
  try {
    const validatedData = insertContentNodeSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newNode = await cmsService.createNode(validatedData, currentUser.id, req);
    res.status(201).json(newNode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    console.error("Create node error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/nodes/:id", authenticateToken, requirePermission("content", "read"), async (req, res) => {
  try {
    const { id } = req.params;
    const node = await cmsService.getNode(id);
    res.json(node);
  } catch (error: any) {
    console.error("Get node error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.put("/nodes/:id", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const updatedNode = await cmsService.updateNode(id, req.body, currentUser.id, req);
    res.json(updatedNode);
  } catch (error: any) {
    console.error("Update node error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.delete("/nodes/:id", authenticateToken, requirePermission("content", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    await cmsService.deleteNode(id, currentUser.id, req);
    res.status(204).send();
  } catch (error: any) {
    console.error("Delete node error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.patch("/pages/:pageId/nodes/reorder", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { nodeOrders } = req.body;
    
    const result = await cmsService.reorderNodes(pageId, nodeOrders);
    res.json(result);
  } catch (error: any) {
    console.error("Reorder nodes error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.get("/pages/:pageId/sections", authenticateToken, requirePermission("content", "read"), async (req, res) => {
  try {
    const { pageId } = req.params;
    const sections = await cmsService.getPageSections(pageId);
    res.json(sections);
  } catch (error) {
    console.error("Get sections error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sections", authenticateToken, requirePermission("content", "create"), async (req, res) => {
  try {
    const validatedData = insertContentSectionSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newSection = await cmsService.createSection(validatedData, currentUser.id, req);
    res.status(201).json(newSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    console.error("Create section error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/sections/:id", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const updatedSection = await cmsService.updateSection(id, req.body, currentUser.id, req);
    res.json(updatedSection);
  } catch (error: any) {
    console.error("Update section error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.delete("/sections/:id", authenticateToken, requirePermission("content", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const result = await cmsService.deleteSection(id, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Delete section error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.patch("/pages/:pageId/sections/reorder", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { sectionOrders } = req.body;
    const currentUser = (req as any).user;
    
    const result = await cmsService.reorderSections(pageId, sectionOrders, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Reorder sections error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.get("/sections/:sectionId/blocks", authenticateToken, requirePermission("content", "read"), async (req, res) => {
  try {
    const { sectionId } = req.params;
    const blocks = await cmsService.getSectionBlocks(sectionId);
    res.json(blocks);
  } catch (error) {
    console.error("Get blocks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/blocks", authenticateToken, requirePermission("content", "create"), async (req, res) => {
  try {
    const validatedData = insertContentBlockSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newBlock = await cmsService.createBlock(validatedData, currentUser.id, req);
    res.status(201).json(newBlock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    console.error("Create block error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/blocks/:id", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const updatedBlock = await cmsService.updateBlock(id, req.body, currentUser.id, req);
    res.json(updatedBlock);
  } catch (error: any) {
    console.error("Update block error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.delete("/blocks/:id", authenticateToken, requirePermission("content", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const result = await cmsService.deleteBlock(id, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Delete block error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.patch("/sections/:sectionId/blocks/reorder", authenticateToken, requirePermission("content", "update"), async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { blockOrders } = req.body;
    const currentUser = (req as any).user;
    
    const result = await cmsService.reorderBlocks(sectionId, blockOrders, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Reorder blocks error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

export default router;
