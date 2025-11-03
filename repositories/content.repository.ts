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

/**
 * Content Repository Interface
 * Handles all CMS content-related data operations
 */
export interface IContentRepository {
  // Pages
  findPageById(id: string): Promise<Page | null>;
  findPageBySlug(slug: string): Promise<Page | null>;
  getAllPages(): Promise<Page[]>;
  getPublishedPages(): Promise<Page[]>;
  getPagesByType(pageType: string): Promise<Page[]>;
  createPage(data: InsertPage): Promise<Page>;
  updatePage(id: string, data: Partial<Page>): Promise<Page>;
  deletePage(id: string): Promise<{ success: boolean; message: string }>;

  // Content Nodes
  findNodeById(id: string): Promise<ContentNode | null>;
  getNodesByPageId(pageId: string): Promise<ContentNode[]>;
  createNode(data: InsertContentNode): Promise<ContentNode>;
  updateNode(id: string, data: Partial<ContentNode>): Promise<ContentNode>;
  deleteNode(id: string): Promise<{ success: boolean; message: string }>;

  // Content Sections
  findSectionById(id: string): Promise<ContentSection | null>;
  getSectionsByNodeId(nodeId: string): Promise<ContentSection[]>;
  createSection(data: InsertContentSection): Promise<ContentSection>;
  updateSection(
    id: string,
    data: Partial<ContentSection>
  ): Promise<ContentSection>;
  deleteSection(id: string): Promise<{ success: boolean; message: string }>;

  // Content Blocks
  findBlockById(id: string): Promise<ContentBlock | null>;
  getBlocksBySectionId(sectionId: string): Promise<ContentBlock[]>;
  createBlock(data: InsertContentBlock): Promise<ContentBlock>;
  updateBlock(id: string, data: Partial<ContentBlock>): Promise<ContentBlock>;
  deleteBlock(id: string): Promise<{ success: boolean; message: string }>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  createContact(data: InsertContact): Promise<Contact>;

  // Page Versions
  getPageVersions(pageId: string): Promise<PageVersion[]>;
  getPageVersionById(versionId: string): Promise<PageVersion | null>;
  getLatestVersion(pageId: string): Promise<PageVersion | null>;
  createPageVersion(
    data: InsertPageVersion,
    createdBy?: string
  ): Promise<PageVersion>;
  restorePageVersion(
    pageId: string,
    versionId: string,
    userId?: string
  ): Promise<Page>;
  compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<{
    version1: PageVersion;
    version2: PageVersion;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  }>;
}
