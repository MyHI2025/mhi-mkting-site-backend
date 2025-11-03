import { Router } from "express";
import { cmsService } from "./cms.service";
import { authenticateToken, requirePermission } from "../common";
import {
  insertPageSchema,
  insertContentNodeSchema,
  insertContentSectionSchema,
  insertContentBlockSchema,
} from "@myhi2025/shared";
import { asyncHandler, sendErrorResponse } from "../common/errorHandlers";

const router = Router();

router.get(
  "/pages",
  authenticateToken,
  requirePermission("pages", "read"),
  asyncHandler(async (req, res) => {
    const pages = await cmsService.getAllPages();
    res.json(pages);
  })
);

router.get(
  "/pages/:id",
  authenticateToken,
  requirePermission("pages", "read"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = await cmsService.getPage(id);
    res.json(page);
  })
);

router.post(
  "/pages",
  authenticateToken,
  requirePermission("pages", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertPageSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newPage = await cmsService.createPage(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newPage);
  })
);

router.put(
  "/pages/:id",
  authenticateToken,
  requirePermission("pages", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updatedPage = await cmsService.updatePage(
      id,
      req.body,
      currentUser.id,
      req
    );
    res.json(updatedPage);
  })
);

router.delete(
  "/pages/:id",
  authenticateToken,
  requirePermission("pages", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const result = await cmsService.deletePage(id, currentUser.id, req);
    res.json(result);
  })
);

router.patch(
  "/pages/:id/publish",
  authenticateToken,
  requirePermission("pages", "publish"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPublished } = req.body;
    const currentUser = (req as any).user;

    const updatedPage = await cmsService.publishPage(
      id,
      isPublished,
      currentUser.id,
      req
    );
    res.json(updatedPage);
  })
);

router.get(
  "/pages/:pageId/nodes",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    // Disable HTTP caching for CMS content to ensure real-time updates
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const nodes = await cmsService.getPageNodes(pageId);
    res.json(nodes);
  })
);

router.post(
  "/pages/:pageId/nodes",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const validatedData = insertContentNodeSchema.parse({
      ...req.body,
      pageId,
    });
    const currentUser = (req as any).user;

    const newNode = await cmsService.createNode(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newNode);
  })
);

router.post(
  "/nodes",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertContentNodeSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newNode = await cmsService.createNode(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newNode);
  })
);

router.get(
  "/nodes/:id",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const node = await cmsService.getNode(id);
    res.json(node);
  })
);

router.put(
  "/nodes/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updatedNode = await cmsService.updateNode(
      id,
      req.body,
      currentUser.id,
      req
    );
    res.json(updatedNode);
  })
);

router.patch(
  "/nodes/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updatedNode = await cmsService.updateNode(
      id,
      req.body,
      currentUser.id,
      req
    );
    res.json(updatedNode);
  })
);

router.delete(
  "/nodes/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    await cmsService.deleteNode(id, currentUser.id, req);
    res.status(204).send();
  })
);

router.patch(
  "/pages/:pageId/nodes/reorder",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const { nodeOrders } = req.body;

    const result = await cmsService.reorderNodes(pageId, nodeOrders);
    res.json(result);
  })
);

router.get(
  "/pages/:pageId/sections",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const sections = await cmsService.getPageSections(pageId);
    res.json(sections);
  })
);

router.post(
  "/sections",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertContentSectionSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newSection = await cmsService.createSection(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newSection);
  })
);

router.put(
  "/sections/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updatedSection = await cmsService.updateSection(
      id,
      req.body,
      currentUser.id,
      req
    );
    res.json(updatedSection);
  })
);

router.delete(
  "/sections/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const result = await cmsService.deleteSection(id, currentUser.id, req);
    res.json(result);
  })
);

router.patch(
  "/pages/:pageId/sections/reorder",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const { sectionOrders } = req.body;
    const currentUser = (req as any).user;

    const result = await cmsService.reorderSections(
      pageId,
      sectionOrders,
      currentUser.id,
      req
    );
    res.json(result);
  })
);

router.get(
  "/sections/:sectionId/blocks",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const blocks = await cmsService.getSectionBlocks(sectionId);
    res.json(blocks);
  })
);

router.post(
  "/blocks",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertContentBlockSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newBlock = await cmsService.createBlock(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newBlock);
  })
);

router.put(
  "/blocks/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const updatedBlock = await cmsService.updateBlock(
      id,
      req.body,
      currentUser.id,
      req
    );
    res.json(updatedBlock);
  })
);

router.delete(
  "/blocks/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const result = await cmsService.deleteBlock(id, currentUser.id, req);
    res.json(result);
  })
);

router.patch(
  "/sections/:sectionId/blocks/reorder",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { blockOrders } = req.body;
    const currentUser = (req as any).user;

    const result = await cmsService.reorderBlocks(
      sectionId,
      blockOrders,
      currentUser.id,
      req
    );
    res.json(result);
  })
);

// Version Control Routes
router.get(
  "/pages/:pageId/versions",
  authenticateToken,
  requirePermission("pages", "read"),
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const versions = await cmsService.getPageVersions(pageId);
    res.json(versions);
  })
);

router.get(
  "/pages/:pageId/versions/:versionId",
  authenticateToken,
  requirePermission("pages", "read"),
  asyncHandler(async (req, res) => {
    const { versionId } = req.params;
    const version = await cmsService.getPageVersion(versionId);
    res.json(version);
  })
);

router.post(
  "/pages/:pageId/versions/:versionId/restore",
  authenticateToken,
  requirePermission("pages", "update"),
  asyncHandler(async (req, res) => {
    const { pageId, versionId } = req.params;
    const currentUser = (req as any).user;

    const restoredPage = await cmsService.restoreVersion(
      pageId,
      versionId,
      currentUser.id,
      req
    );
    res.json(restoredPage);
  })
);

router.get(
  "/pages/versions/compare",
  authenticateToken,
  requirePermission("pages", "read"),
  asyncHandler(async (req, res) => {
    const { version1, version2 } = req.query;

    if (!version1 || !version2) {
      return res
        .status(400)
        .json({
          error: "Both version1 and version2 query parameters are required",
        });
    }

    const comparison = await cmsService.compareVersions(
      version1 as string,
      version2 as string
    );
    res.json(comparison);
  })
);

export default router;
