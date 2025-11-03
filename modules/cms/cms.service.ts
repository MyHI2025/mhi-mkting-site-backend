import { contentRepository } from "../../repositories/implementations";
import { logUserAction } from "../../auth";
import {
  insertPageSchema,
  insertContentNodeSchema,
  insertContentSectionSchema,
  insertContentBlockSchema,
} from "@myhi2025/shared";
import { z } from "zod";
import { Request } from "express";
import { notFound, conflict } from "../common/errorHandlers";

export class CmsService {
  async getAllPublicPages() {
    return await contentRepository.getPublishedPages();
  }

  async getPublicPageNodes(pageId: string) {
    const page = await contentRepository.findPageById(pageId);

    if (!page) {
      throw notFound("Page", pageId);
    }

    if (!page.isPublished) {
      throw { status: 403, message: "Page is not published" };
    }

    return await contentRepository.getNodesByPageId(pageId);
  }

  async getAllPages() {
    return await contentRepository.getAllPages();
  }

  async getPage(id: string) {
    const page = await contentRepository.findPageById(id);
    if (!page) {
      throw notFound("Page", id);
    }
    return page;
  }

  async createPage(
    data: z.infer<typeof insertPageSchema>,
    currentUserId: string,
    req: Request
  ) {
    const existingPage = await contentRepository.findPageBySlug(data.slug);
    if (existingPage) {
      throw conflict("Page with this slug already exists");
    }

    const newPage = await contentRepository.createPage(data);

    await logUserAction(
      currentUserId,
      "create",
      "pages",
      newPage.id,
      { page_title: newPage.title },
      req
    );

    return newPage;
  }

  async updatePage(id: string, data: any, currentUserId: string, req: Request) {
    const updateData = { ...data, updatedBy: currentUserId };

    if (updateData.slug) {
      const existingPage = await contentRepository.findPageBySlug(
        updateData.slug
      );
      if (existingPage && existingPage.id !== id) {
        throw conflict("Page with this slug already exists");
      }
    }

    const updatedPage = await contentRepository.updatePage(id, updateData);

    await logUserAction(
      currentUserId,
      "update",
      "pages",
      id,
      { page_title: updatedPage.title },
      req
    );

    return updatedPage;
  }

  async deletePage(id: string, currentUserId: string, req: Request) {
    const page = await contentRepository.findPageById(id);
    if (!page) {
      throw notFound("Page", id);
    }

    await contentRepository.deletePage(id);

    await logUserAction(
      currentUserId,
      "delete",
      "pages",
      id,
      { page_title: page.title },
      req
    );

    return { message: "Page deleted successfully" };
  }

  async publishPage(
    id: string,
    isPublished: boolean,
    currentUserId: string,
    req: Request
  ) {
    const updatedPage = await contentRepository.updatePage(id, {
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      updatedBy: currentUserId,
    });

    await logUserAction(
      currentUserId,
      isPublished ? "publish" : "unpublish",
      "pages",
      id,
      {
        page_title: updatedPage.title,
      },
      req
    );

    return updatedPage;
  }

  async getPageNodes(pageId: string) {
    return await contentRepository.getNodesByPageId(pageId);
  }

  async createNode(
    data: z.infer<typeof insertContentNodeSchema>,
    currentUserId: string,
    req: Request
  ) {
    const newNode = await contentRepository.createNode(data);

    await logUserAction(
      currentUserId,
      "create",
      "content",
      newNode.id,
      {
        node_type: newNode.nodeType,
        page_id: newNode.pageId,
      },
      req
    );

    return newNode;
  }

  async getNode(id: string) {
    const node = await contentRepository.findNodeById(id);
    if (!node) {
      throw notFound("Content node", id);
    }
    return node;
  }

  async updateNode(id: string, data: any, currentUserId: string, req: Request) {
    const updatedNode = await contentRepository.updateNode(id, data);

    await logUserAction(
      currentUserId,
      "update",
      "content",
      id,
      {
        node_type: updatedNode.nodeType,
      },
      req
    );

    return updatedNode;
  }

  async deleteNode(id: string, currentUserId: string, req: Request) {
    await contentRepository.deleteNode(id);

    await logUserAction(currentUserId, "delete", "content", id, {}, req);

    return null;
  }

  async reorderNodes(pageId: string, nodeOrders: any[]) {
    if (!Array.isArray(nodeOrders)) {
      throw { status: 400, message: "nodeOrders must be an array" };
    }

    return { message: "Nodes reordered successfully" };
  }

  async getPageSections(pageId: string) {
    const nodes = await contentRepository.getNodesByPageId(pageId);
    const sections: any[] = [];
    for (const node of nodes) {
      const nodeSections = await contentRepository.getSectionsByNodeId(node.id);
      sections.push(...nodeSections);
    }
    return sections;
  }

  async createSection(
    data: z.infer<typeof insertContentSectionSchema>,
    currentUserId: string,
    req: Request
  ) {
    const newSection = await contentRepository.createSection(data);

    await logUserAction(
      currentUserId,
      "create",
      "content",
      newSection.id,
      {
        section_type: newSection.sectionType,
        page_id: newSection.pageId,
      },
      req
    );

    return newSection;
  }

  async updateSection(
    id: string,
    data: any,
    currentUserId: string,
    req: Request
  ) {
    const updatedSection = await contentRepository.updateSection(id, data);

    await logUserAction(
      currentUserId,
      "update",
      "content",
      id,
      {
        section_type: updatedSection.sectionType,
      },
      req
    );

    return updatedSection;
  }

  async deleteSection(id: string, currentUserId: string, req: Request) {
    const section = await contentRepository.findSectionById(id);
    if (!section) {
      throw notFound("Section", id);
    }

    await contentRepository.deleteSection(id);

    await logUserAction(
      currentUserId,
      "delete",
      "content",
      id,
      {
        section_type: section.sectionType,
      },
      req
    );

    return { message: "Section deleted successfully" };
  }

  async reorderSections(
    pageId: string,
    sectionOrders: any[],
    currentUserId: string,
    req: Request
  ) {
    await logUserAction(
      currentUserId,
      "reorder",
      "content",
      pageId,
      {
        action: "reorder_sections",
        count: sectionOrders.length,
      },
      req
    );

    return { message: "Sections reordered successfully" };
  }

  async getSectionBlocks(sectionId: string) {
    return await contentRepository.getBlocksBySectionId(sectionId);
  }

  async createBlock(
    data: z.infer<typeof insertContentBlockSchema>,
    currentUserId: string,
    req: Request
  ) {
    const newBlock = await contentRepository.createBlock(data);

    await logUserAction(
      currentUserId,
      "create",
      "content",
      newBlock.id,
      {
        block_type: newBlock.blockType,
        section_id: newBlock.sectionId,
      },
      req
    );

    return newBlock;
  }

  async updateBlock(
    id: string,
    data: any,
    currentUserId: string,
    req: Request
  ) {
    const updatedBlock = await contentRepository.updateBlock(id, data);

    await logUserAction(
      currentUserId,
      "update",
      "content",
      id,
      {
        block_type: updatedBlock.blockType,
      },
      req
    );

    return updatedBlock;
  }

  async deleteBlock(id: string, currentUserId: string, req: Request) {
    const block = await contentRepository.findBlockById(id);
    if (!block) {
      throw notFound("Block", id);
    }

    await contentRepository.deleteBlock(id);

    await logUserAction(
      currentUserId,
      "delete",
      "content",
      id,
      {
        block_type: block.blockType,
      },
      req
    );

    return { message: "Block deleted successfully" };
  }

  async reorderBlocks(
    sectionId: string,
    blockOrders: any[],
    currentUserId: string,
    req: Request
  ) {
    await logUserAction(
      currentUserId,
      "reorder",
      "content",
      sectionId,
      {
        action: "reorder_blocks",
        count: blockOrders.length,
      },
      req
    );

    return { message: "Blocks reordered successfully" };
  }

  // Version Control Methods
  async getPageVersions(pageId: string) {
    const page = await contentRepository.findPageById(pageId);
    if (!page) {
      throw notFound("Page", pageId);
    }

    return await contentRepository.getPageVersions(pageId);
  }

  async getPageVersion(versionId: string) {
    const version = await contentRepository.getPageVersionById(versionId);
    if (!version) {
      throw notFound("PageVersion", versionId);
    }

    return version;
  }

  async restoreVersion(
    pageId: string,
    versionId: string,
    currentUserId: string,
    req: Request
  ) {
    const restoredPage = await contentRepository.restorePageVersion(
      pageId,
      versionId,
      currentUserId
    );

    await logUserAction(
      currentUserId,
      "restore",
      "pages",
      pageId,
      {
        version_id: versionId,
        page_title: restoredPage.title,
      },
      req
    );

    return restoredPage;
  }

  async compareVersions(versionId1: string, versionId2: string) {
    return await contentRepository.compareVersions(versionId1, versionId2);
  }
}

export const cmsService = new CmsService();
