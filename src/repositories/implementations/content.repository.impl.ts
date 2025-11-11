import { IContentRepository } from "../content.repository";
import { NotFoundError, DuplicateError } from "../base.repository";
import type {
  Page,
  InsertPage,
  ContentNode,
  InsertContentNode,
  ContentSection,
  InsertContentSection,
  ContentBlock,
  InsertContentBlock,
  Contact,
  InsertContact,
  PageVersion,
  InsertPageVersion,
} from "@myhi2025/shared";
import {
  pages,
  contentNodes,
  contentSections,
  contentBlocks,
  contacts,
  pageVersions,
} from "@myhi2025/shared";
import { db } from "../../db";
import { desc, eq, and, isNull, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ContentRepositoryImpl implements IContentRepository {
  // ===== PAGE OPERATIONS =====
  async findPageById(id: string): Promise<Page | null> {
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findPageBySlug(slug: string): Promise<Page | null> {
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);
    return result[0] || null;
  }

  async getAllPages(): Promise<Page[]> {
    return await db.select().from(pages);
  }

  async getPublishedPages(): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.isPublished, true));
  }

  async getPagesByType(pageType: string): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(eq(pages.pageType, pageType))
      .orderBy(desc(pages.createdAt));
  }

  async createPage(data: InsertPage): Promise<Page> {
    const existing = await this.findPageBySlug(data.slug as string);
    if (existing) {
      throw new DuplicateError("Page", "slug");
    }

    const id = randomUUID();
    const now = new Date();

    const [page] = await db
      .insert(pages)
      .values({
        id,
        slug: data.slug as string,
        title: data.title as string,
        description: data.description as string || null,
        pageType: data.pageType as string || "marketing",
        category: data.category as string || null,
        metaTitle: data.metaTitle as string || null,
        metaDescription: data.metaDescription as string || null,
        featuredImage: data.featuredImage as string || null,
        author: null,
        isPublished: data.isPublished as boolean ?? false,
        publishedAt: null,
        metadata: data.metadata || null,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        updatedBy: null,
      } satisfies typeof pages.$inferInsert)
      .returning();

    // Create initial version
    await this.createPageVersion({
      pageId: id,
      versionNumber: 1,
      title: page.title,
      description: page.description || undefined,
      pageType: page.pageType,
      category: page.category || undefined,
      metaTitle: page.metaTitle || undefined,
      metaDescription: page.metaDescription || undefined,
      featuredImage: page.featuredImage || undefined,
      metadata: page.metadata || undefined,
      isPublished: page.isPublished || false,
      changeType: "create",
      changeSummary: "Initial version",
    });

    return page;
  }

  async updatePage(id: string, data: Partial<Page>): Promise<Page> {
    const page = await this.findPageById(id);
    if (!page) {
      throw new NotFoundError("Page", id);
    }

    // Determine the change type
    let changeType: string = "update";
    let changeSummary: string = "Content updated";

    if (
      data.isPublished !== undefined &&
      data.isPublished !== page.isPublished
    ) {
      changeType = data.isPublished ? "publish" : "unpublish";
      changeSummary = data.isPublished ? "Page published" : "Page unpublished";
    }

    // Create version snapshot before updating
    const currentVersionNumber =
      (await this.getLatestVersion(id))?.versionNumber || 0;
    await this.createPageVersion({
      pageId: id,
      versionNumber: currentVersionNumber + 1,
      title: data.title || page.title,
      description:
        data.description !== undefined
          ? data.description
          : page.description || undefined,
      pageType: page.pageType,
      category:
        data.category !== undefined
          ? data.category
          : page.category || undefined,
      metaTitle:
        data.metaTitle !== undefined
          ? data.metaTitle
          : page.metaTitle || undefined,
      metaDescription:
        data.metaDescription !== undefined
          ? data.metaDescription
          : page.metaDescription || undefined,
      featuredImage:
        data.featuredImage !== undefined
          ? data.featuredImage
          : page.featuredImage || undefined,
      metadata:
        data.metadata !== undefined
          ? data.metadata
          : page.metadata || undefined,
      isPublished:
        data.isPublished !== undefined
          ? data.isPublished
          : page.isPublished || false,
      changeType,
      changeSummary,
    });

    // Exclude user reference fields since users are in-memory only
    const { updatedBy, createdBy, ...updateData } = data;

    const [updatedPage] = await db
      .update(pages)
      .set({
        ...updateData,
        updatedAt: new Date(),
        updatedBy: null, // Set to null since users are in-memory only
      })
      .where(eq(pages.id, id))
      .returning();

    return updatedPage;
  }

  async deletePage(id: string): Promise<{ success: boolean; message: string }> {
    const page = await this.findPageById(id);
    if (!page) {
      throw new NotFoundError("Page", id);
    }

    // Delete cascades will handle sections, blocks, nodes, and versions
    await db.delete(pages).where(eq(pages.id, id));

    return { success: true, message: "Page deleted successfully" };
  }

  // ===== CONTENT NODE OPERATIONS =====
  async findNodeById(id: string): Promise<ContentNode | null> {
    const result = await db
      .select()
      .from(contentNodes)
      .where(eq(contentNodes.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getNodesByPageId(pageId: string): Promise<ContentNode[]> {
    return await db
      .select()
      .from(contentNodes)
      .where(
        and(eq(contentNodes.pageId, pageId), isNull(contentNodes.parentId))
      )
      .orderBy(asc(contentNodes.displayOrder));
  }

  async createNode(data: InsertContentNode): Promise<ContentNode> {
    const id = randomUUID();
    const now = new Date();

    const [node] = await db
      .insert(contentNodes)
      .values({
        id,
        pageId: data.pageId as string,
        nodeType: data.nodeType as string,
        content: data.content as string || {},
        displayOrder: data.displayOrder as number || null,
        parentId: data.parentId as string || null,
        styles: data.styles || {},
        isVisible: true,
        createdAt: now,
        updatedAt: now,
      } satisfies typeof contentNodes.$inferInsert)
      .returning();

    return node;
  }

  async updateNode(
    id: string,
    data: Partial<ContentNode>
  ): Promise<ContentNode> {
    const [updatedNode] = await db
      .update(contentNodes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contentNodes.id, id))
      .returning();

    if (!updatedNode) {
      throw new NotFoundError("ContentNode", id);
    }

    return updatedNode;
  }

  async deleteNode(id: string): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(contentNodes)
      .where(eq(contentNodes.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("ContentNode", id);
    }

    return { success: true, message: "Content node deleted successfully" };
  }

  // ===== CONTENT SECTION OPERATIONS =====
  async findSectionById(id: string): Promise<ContentSection | null> {
    const result = await db
      .select()
      .from(contentSections)
      .where(eq(contentSections.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getSectionsByNodeId(nodeId: string): Promise<ContentSection[]> {
    return await db
      .select()
      .from(contentSections)
      .where(eq(contentSections.pageId, nodeId))
      .orderBy(asc(contentSections.displayOrder));
  }

  async createSection(data: InsertContentSection): Promise<ContentSection> {
    const id = randomUUID();
    const now = new Date();

    const [section] = await db
      .insert(contentSections)
      .values({
        id,
        pageId: data.pageId as string,
        sectionType: data.sectionType as string,
        title: data.title as string || null,
        subtitle: data.subtitle as string || null,
        content: data.content as string || {},
        displayOrder: data.displayOrder as number || null,
        isVisible: true,
        createdAt: now,
        updatedAt: now,
      } satisfies typeof contentSections.$inferInsert)
      .returning();

    return section;
  }

  async updateSection(
    id: string,
    data: Partial<ContentSection>
  ): Promise<ContentSection> {
    const [updatedSection] = await db
      .update(contentSections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contentSections.id, id))
      .returning();

    if (!updatedSection) {
      throw new NotFoundError("ContentSection", id);
    }

    return updatedSection;
  }

  async deleteSection(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(contentSections)
      .where(eq(contentSections.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("ContentSection", id);
    }

    return { success: true, message: "Content section deleted successfully" };
  }

  // ===== CONTENT BLOCK OPERATIONS =====
  async findBlockById(id: string): Promise<ContentBlock | null> {
    const result = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getBlocksBySectionId(sectionId: string): Promise<ContentBlock[]> {
    return await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.sectionId, sectionId))
      .orderBy(asc(contentBlocks.displayOrder));
  }

  async createBlock(data: InsertContentBlock): Promise<ContentBlock> {
    const id = randomUUID();
    const now = new Date();

    const [block] = await db
      .insert(contentBlocks)
      .values({
        id,
        sectionId: data.sectionId as string,
        blockType: data.blockType as string,
        title: data.title as string || null,
        content: data.content as string || {},
        displayOrder: data.displayOrder as number || null,
        isVisible: true,
        createdAt: now,
        updatedAt: now,
      } satisfies typeof contentBlocks.$inferInsert)
      .returning();

    return block;
  }

  async updateBlock(
    id: string,
    data: Partial<ContentBlock>
  ): Promise<ContentBlock> {
    const [updatedBlock] = await db
      .update(contentBlocks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contentBlocks.id, id))
      .returning();

    if (!updatedBlock) {
      throw new NotFoundError("ContentBlock", id);
    }

    return updatedBlock;
  }

  async deleteBlock(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(contentBlocks)
      .where(eq(contentBlocks.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("ContentBlock", id);
    }

    return { success: true, message: "Content block deleted successfully" };
  }

  // ===== CONTACT OPERATIONS =====
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContactById(id: string): Promise<Contact | null> {
    const result = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(data as any).returning();
    return contact;
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();

    if (!updatedContact) {
      throw new NotFoundError("Contact", id);
    }

    return updatedContact;
  }

  async deleteContact(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("Contact", id);
    }

    return { success: true, message: "Contact deleted successfully" };
  }

  // ===== PAGE VERSION OPERATIONS =====
  async getPageVersions(pageId: string): Promise<PageVersion[]> {
    return await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.versionNumber));
  }

  async getVersionsByPageId(pageId: string): Promise<PageVersion[]> {
    return this.getPageVersions(pageId);
  }

  async getPageVersionById(versionId: string): Promise<PageVersion | null> {
    const result = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.id, versionId))
      .limit(1);

    return result[0] || null;
  }

  async getLatestVersion(pageId: string): Promise<PageVersion | null> {
    const result = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.versionNumber))
      .limit(1);

    return result[0] || null;
  }

  async createPageVersion(
    data: InsertPageVersion,
    createdBy?: string
  ): Promise<PageVersion> {
    const id = randomUUID();
    const now = new Date();

    const [version] = await db
      .insert(pageVersions)
      .values({
        id,
        pageId: data.pageId as string,
        versionNumber: data.versionNumber as number,
        title: data.title as string,
        description: data.description as string  || null,
        pageType: data.pageType as string,
        category: data.category as string || null,
        metaTitle: data.metaTitle as string || null,
        metaDescription: data.metaDescription as string || null,
        featuredImage: data.featuredImage as string || null,
        metadata: data.metadata as string || null,
        isPublished: data.isPublished as boolean || false,
        changeType: data.changeType as string,
        changeSummary: data.changeSummary as string || null,
        createdAt: now,
        createdBy: createdBy || null,
      } satisfies typeof pageVersions.$inferInsert)
      .returning();

    return version;
  }

  async restorePageVersion(
    pageId: string,
    versionId: string,
    userId?: string
  ): Promise<Page> {
    const version = await this.getPageVersionById(versionId);

    if (!version || version.pageId !== pageId) {
      throw new NotFoundError("PageVersion", versionId);
    }

    return await this.updatePage(pageId, {
      title: version.title,
      description: version.description || undefined,
      category: version.category || undefined,
      metaTitle: version.metaTitle || undefined,
      metaDescription: version.metaDescription || undefined,
      featuredImage: version.featuredImage || undefined,
      metadata: version.metadata || undefined,
      isPublished: version.isPublished,
      updatedBy: userId || undefined,
    });
  }

  async restoreVersion(pageId: string, versionNumber: number): Promise<Page> {
    const version = await db
      .select()
      .from(pageVersions)
      .where(
        and(
          eq(pageVersions.pageId, pageId),
          eq(pageVersions.versionNumber, versionNumber)
        )
      )
      .limit(1);

    if (!version[0]) {
      throw new NotFoundError("PageVersion", `${pageId}:${versionNumber}`);
    }

    const v = version[0];
    return await this.updatePage(pageId, {
      title: v.title,
      description: v.description || undefined,
      category: v.category || undefined,
      metaTitle: v.metaTitle || undefined,
      metaDescription: v.metaDescription || undefined,
      featuredImage: v.featuredImage || undefined,
      metadata: v.metadata || undefined,
      isPublished: v.isPublished,
    });
  }

  async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<{
    version1: PageVersion;
    version2: PageVersion;
    changes: Array<{ field: string; oldValue: any; newValue: any }>;
  }> {
    const v1 = await this.getPageVersionById(versionId1);
    const v2 = await this.getPageVersionById(versionId2);

    if (!v1) {
      throw new NotFoundError("PageVersion", versionId1);
    }
    if (!v2) {
      throw new NotFoundError("PageVersion", versionId2);
    }

    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const fields = [
      "title",
      "description",
      "category",
      "metaTitle",
      "metaDescription",
      "featuredImage",
      "isPublished",
    ];

    for (const field of fields) {
      if (v1[field as keyof PageVersion] !== v2[field as keyof PageVersion]) {
        changes.push({
          field,
          oldValue: v1[field as keyof PageVersion],
          newValue: v2[field as keyof PageVersion],
        });
      }
    }

    return { version1: v1, version2: v2, changes };
  }
}

export const contentRepository = new ContentRepositoryImpl();
