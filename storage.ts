import {
  type User,
  type InsertUser,
  type Contact,
  type InsertContact,
  type Role,
  type InsertRole,
  type UserRole,
  type AdminSession,
  type Page,
  type InsertPage,
  type ContentSection,
  type InsertContentSection,
  type ContentNode,
  type InsertContentNode,
  type ContentBlock,
  type InsertContentBlock,
  type MediaAsset,
  type InsertMediaAsset,
  type NavigationItem,
  type InsertNavigationItem,
  type ThemeSettings,
  type InsertThemeSettings,
  type TeamMember,
  type InsertTeamMember,
  type MediaPosition,
  type InsertMediaPosition,
  type VideoContent,
  type InsertVideoContent,
  type AuditLog,
  type SystemSetting,
  type InsertSystemSetting,
} from "@myhi2025/shared";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Roles and permissions
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, updates: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;
  getAllRoles(): Promise<Role[]>;
  getUserRoles(userId: string): Promise<UserRole[]>;
  getAUserRole(userId: string): Promise<Role[]>;
  assignUserRole(userId: string, roleId: string): Promise<UserRole>;
  removeUserRole(userId: string, roleId: string): Promise<boolean>;

  // Admin sessions
  createSession(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<AdminSession>;
  getSession(token: string): Promise<AdminSession | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteUserSessions(userId: string): Promise<boolean>;

  // Contact management
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;

  // Page management
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
  getAllPages(): Promise<Page[]>;
  getPublishedPages(): Promise<Page[]>;
  publishPage(id: string, userId: string): Promise<Page | undefined>;
  unpublishPage(id: string): Promise<Page | undefined>;

  // Content Nodes (WordPress-like flexible content blocks)
  getContentNode(id: string): Promise<ContentNode | undefined>;
  getPageNodes(pageId: string): Promise<ContentNode[]>;
  createContentNode(node: InsertContentNode): Promise<ContentNode>;
  updateContentNode(
    id: string,
    updates: Partial<ContentNode>
  ): Promise<ContentNode | undefined>;
  deleteContentNode(id: string): Promise<boolean>;
  reorderContentNodes(
    pageId: string,
    nodeOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean>;
  getPagesByType(pageType: string): Promise<Page[]>;

  // Content Sections (legacy - keeping for backward compatibility)
  getContentSection(id: string): Promise<ContentSection | undefined>;
  getPageSections(pageId: string): Promise<ContentSection[]>;
  createContentSection(section: InsertContentSection): Promise<ContentSection>;
  updateContentSection(
    id: string,
    updates: Partial<ContentSection>
  ): Promise<ContentSection | undefined>;
  deleteContentSection(id: string): Promise<boolean>;
  reorderContentSections(
    pageId: string,
    sectionOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean>;

  getContentBlock(id: string): Promise<ContentBlock | undefined>;
  getSectionBlocks(sectionId: string): Promise<ContentBlock[]>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(
    id: string,
    updates: Partial<ContentBlock>
  ): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: string): Promise<boolean>;
  reorderContentBlocks(
    sectionId: string,
    blockOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean>;

  // Media management
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  updateMediaAsset(
    id: string,
    updates: Partial<MediaAsset>
  ): Promise<MediaAsset | undefined>;
  deleteMediaAsset(id: string): Promise<boolean>;
  getAllMediaAssets(): Promise<MediaAsset[]>;
  searchMediaAssets(query: string): Promise<MediaAsset[]>;

  // Navigation management
  getNavigationItem(id: string): Promise<NavigationItem | undefined>;
  createNavigationItem(item: InsertNavigationItem): Promise<NavigationItem>;
  updateNavigationItem(
    id: string,
    updates: Partial<NavigationItem>
  ): Promise<NavigationItem | undefined>;
  deleteNavigationItem(id: string): Promise<boolean>;
  getAllNavigationItems(): Promise<NavigationItem[]>;
  getNavigationTree(): Promise<NavigationItem[]>;
  reorderNavigationItems(
    itemOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean>;

  // Theme management
  getThemeSettings(id: string): Promise<ThemeSettings | undefined>;
  getActiveTheme(): Promise<ThemeSettings | undefined>;
  createThemeSettings(theme: InsertThemeSettings): Promise<ThemeSettings>;
  updateThemeSettings(
    id: string,
    updates: Partial<ThemeSettings>
  ): Promise<ThemeSettings | undefined>;
  deleteThemeSettings(id: string): Promise<boolean>;
  getAllThemes(): Promise<ThemeSettings[]>;
  activateTheme(id: string): Promise<ThemeSettings | undefined>;

  // Team member management
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(
    id: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  getVisibleTeamMembers(): Promise<TeamMember[]>;

  // Media position management
  getMediaPosition(id: string): Promise<MediaPosition | undefined>;
  getMediaPositionByKey(key: string): Promise<MediaPosition | undefined>;
  createMediaPosition(position: InsertMediaPosition): Promise<MediaPosition>;
  updateMediaPosition(
    id: string,
    updates: Partial<MediaPosition>
  ): Promise<MediaPosition | undefined>;
  deleteMediaPosition(id: string): Promise<boolean>;
  getAllMediaPositions(): Promise<MediaPosition[]>;
  getMediaPositionsByCategory(category: string): Promise<MediaPosition[]>;
  getActiveMediaPositions(): Promise<MediaPosition[]>;

  // Video content management
  getVideo(id: string): Promise<VideoContent | undefined>;
  createVideo(video: InsertVideoContent): Promise<VideoContent>;
  updateVideo(
    id: string,
    updates: Partial<VideoContent>
  ): Promise<VideoContent | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  getAllVideos(): Promise<VideoContent[]>;
  getPublishedVideos(): Promise<VideoContent[]>;

  // Audit logging
  createAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLog[]>;

  // System settings
  getSetting(key: string): Promise<SystemSetting | undefined>;
  getAllSettings(): Promise<SystemSetting[]>;
  getSettingsByCategory(category: string): Promise<SystemSetting[]>;
  upsertSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  deleteSetting(key: string): Promise<boolean>;
}

// PostgreSQL Storage Implementation
import { db } from "./db";
import { eq, and, desc, asc, sql as drizzleSql } from "drizzle-orm";
import {
  users as usersTable,
  roles as rolesTable,
  userRoles as userRolesTable,
  adminSessions as adminSessionsTable,
  contacts as contactsTable,
  pages as pagesTable,
  contentNodes as contentNodesTable,
  contentSections as contentSectionsTable,
  contentBlocks as contentBlocksTable,
  mediaAssets as mediaAssetsTable,
  navigationItems as navigationItemsTable,
  themeSettings as themeSettingsTable,
  teamMembers as teamMembersTable,
  mediaPositions as mediaPositionsTable,
  videoContent as videoContentTable,
  auditLogs as auditLogsTable,
  systemSettings as systemSettingsTable,
} from "@myhi2025/shared";

export class DbStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values(
        user as {
          username: string;
          email: string;
          password: string;
          firstName?: string;
          lastName?: string;
        }
      )
      .returning();
    return result[0];
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const result = await db
      .update(usersTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(usersTable);
  }

  // Roles and permissions
  async getRole(id: string): Promise<Role | undefined> {
    const result = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, id))
      .limit(1);
    return result[0];
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.name, name))
      .limit(1);
    return result[0];
  }

  async createRole(role: InsertRole): Promise<Role> {
    const result = await db
      .insert(rolesTable)
      .values(
        role as { name: string; description?: string; permissions?: string }
      )
      .returning();
    return result[0];
  }

  async updateRole(
    id: string,
    updates: Partial<Role>
  ): Promise<Role | undefined> {
    const result = await db
      .update(rolesTable)
      .set(updates)
      .where(eq(rolesTable.id, id))
      .returning();
    return result[0];
  }

  async deleteRole(id: string): Promise<boolean> {
    await db.delete(rolesTable).where(eq(rolesTable.id, id));
    return true;
  }

  async getAllRoles(): Promise<Role[]> {
    return db.select().from(rolesTable);
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId));
  }

  async getAUserRole(userId: string): Promise<Role[]> {
    return db
      .select({
      id: rolesTable.id,
      name: rolesTable.name,
      description: rolesTable.description,
      permissions: rolesTable.permissions,
      createdAt: rolesTable.createdAt,
    })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, userId));
  }

  async assignUserRole(userId: string, roleId: string): Promise<UserRole> {
    const result = await db
      .insert(userRolesTable)
      .values({ userId, roleId })
      .returning();
    return result[0];
  }

  async removeUserRole(userId: string, roleId: string): Promise<boolean> {
    await db
      .delete(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.roleId, roleId)
        )
      );
    return true;
  }

  // Admin sessions
  async createSession(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<AdminSession> {
    const result = await db
      .insert(adminSessionsTable)
      .values({ userId, token, expiresAt })
      .returning();
    return result[0];
  }

  async getSession(token: string): Promise<AdminSession | undefined> {
    const result = await db
      .select()
      .from(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .limit(1);
    return result[0];
  }

  async deleteSession(token: string): Promise<boolean> {
    await db
      .delete(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token));
    return true;
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    await db
      .delete(adminSessionsTable)
      .where(eq(adminSessionsTable.userId, userId));
    return true;
  }

  // Contact management
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db
      .insert(contactsTable)
      .values(
        contact as {
          email: string;
          firstName: string;
          lastName: string;
          title?: string;
          phone?: string;
          city?: string;
          country?: string;
          organization?: string;
          userType: string;
          message: string;
        }
      )
      .returning();
    return result[0];
  }

  async getAllContacts(): Promise<Contact[]> {
    return db
      .select()
      .from(contactsTable)
      .orderBy(desc(contactsTable.createdAt));
  }

  // Page management
  async getPage(id: string): Promise<Page | undefined> {
    const result = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, id))
      .limit(1);
    return result[0];
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, slug))
      .limit(1);
    return result[0];
  }

  async createPage(page: InsertPage): Promise<Page> {
    const result = await db
      .insert(pagesTable)
      .values(page as any)
      .returning();
    return result[0];
  }

  async updatePage(
    id: string,
    updates: Partial<Page>
  ): Promise<Page | undefined> {
    const result = await db
      .update(pagesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pagesTable.id, id))
      .returning();
    return result[0];
  }

  async deletePage(id: string): Promise<boolean> {
    await db.delete(pagesTable).where(eq(pagesTable.id, id));
    return true;
  }

  async getAllPages(): Promise<Page[]> {
    return db.select().from(pagesTable).orderBy(desc(pagesTable.createdAt));
  }

  async getPublishedPages(): Promise<Page[]> {
    return db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.isPublished, true))
      .orderBy(desc(pagesTable.publishedAt));
  }

  async publishPage(id: string, userId: string): Promise<Page | undefined> {
    const result = await db
      .update(pagesTable)
      .set({
        isPublished: true,
        publishedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(pagesTable.id, id))
      .returning();
    return result[0];
  }

  async unpublishPage(id: string): Promise<Page | undefined> {
    const result = await db
      .update(pagesTable)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(eq(pagesTable.id, id))
      .returning();
    return result[0];
  }

  async getPagesByType(pageType: string): Promise<Page[]> {
    return db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.pageType, pageType))
      .orderBy(desc(pagesTable.createdAt));
  }

  // Navigation items
  async getNavigationItem(id: string): Promise<NavigationItem | undefined> {
    const result = await db
      .select()
      .from(navigationItemsTable)
      .where(eq(navigationItemsTable.id, id))
      .limit(1);
    return result[0];
  }

  async getAllNavigationItems(): Promise<NavigationItem[]> {
    return db
      .select()
      .from(navigationItemsTable)
      .orderBy(asc(navigationItemsTable.displayOrder));
  }

  async createNavigationItem(
    item: InsertNavigationItem
  ): Promise<NavigationItem> {
    const result = await db
      .insert(navigationItemsTable)
      .values(
        item as {
          isplayOrder?: string;
          parentId?: string;
          label: string;
          href?: string;
          target?: string;
        }
      )
      .returning();
    return result[0];
  }

  async updateNavigationItem(
    id: string,
    updates: Partial<NavigationItem>
  ): Promise<NavigationItem | undefined> {
    const result = await db
      .update(navigationItemsTable)
      .set(updates)
      .where(eq(navigationItemsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteNavigationItem(id: string): Promise<boolean> {
    await db
      .delete(navigationItemsTable)
      .where(eq(navigationItemsTable.id, id));
    return true;
  }

  // Team members
  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const result = await db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.id, id))
      .limit(1);
    return result[0];
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembersTable)
      .orderBy(asc(teamMembersTable.displayOrder));
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const result = await db
      .insert(teamMembersTable)
      .values({
        firstName: member.firstName as string,
        lastName: member.lastName as string,
        title: member.title as string,
        displayOrder: Number(member.displayOrder),
        isVisible: member.isVisible === "true",
        role: member.role as string,
        bio: member.bio as string,
        photoUrl: member.photoUrl as string,
        photoAlt: member.photoAlt as string,
        linkedin: member.linkedin as string,
        achievements: member.achievements as string,
      })
      .returning();
    return result[0];
  }

  async updateTeamMember(
    id: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember | undefined> {
    const result = await db
      .update(teamMembersTable)
      .set(updates)
      .where(eq(teamMembersTable.id, id))
      .returning();
    return result[0];
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    return true;
  }

  // Media positions
  async getMediaPosition(id: string): Promise<MediaPosition | undefined> {
    const result = await db
      .select()
      .from(mediaPositionsTable)
      .where(eq(mediaPositionsTable.id, id))
      .limit(1);
    return result[0];
  }

  async getMediaPositionByKey(key: string): Promise<MediaPosition | undefined> {
    const result = await db
      .select()
      .from(mediaPositionsTable)
      .where(eq(mediaPositionsTable.positionKey, key))
      .limit(1);
    return result[0];
  }

  async getAllMediaPositions(): Promise<MediaPosition[]> {
    return db
      .select()
      .from(mediaPositionsTable)
      .orderBy(asc(mediaPositionsTable.positionKey));
  }

  async createMediaPosition(
    position: InsertMediaPosition
  ): Promise<MediaPosition> {
    const validPosition: typeof mediaPositionsTable.$inferInsert = {
      positionKey: position.positionKey as string,
      label: position.label as string,
      category: position.category as string,
      description: (position.description as string) ?? null,
      mediaUrl: (position.mediaUrl as string) ?? null,
      mediaAlt: (position.mediaAlt as string) ?? null,
      mediaAssetId: (position.mediaAssetId as string) ?? null,
      isActive: (position.isActive as boolean) ?? false,
      displayOrder: (position.displayOrder as number) ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: position.updatedBy ?? null,
    };

    const [result] = await db
      .insert(mediaPositionsTable)
      .values(validPosition)
      .returning();
    return result;
  }

  async updateMediaPosition(
    id: string,
    updates: Partial<MediaPosition>
  ): Promise<MediaPosition | undefined> {
    const result = await db
      .update(mediaPositionsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mediaPositionsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteMediaPosition(id: string): Promise<boolean> {
    await db.delete(mediaPositionsTable).where(eq(mediaPositionsTable.id, id));
    return true;
  }

  // Audit logs
  async createAuditLog(
    log: Omit<AuditLog, "id" | "createdAt">
  ): Promise<AuditLog> {
    const result = await db.insert(auditLogsTable).values(log).returning();
    return result[0];
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogsTable);

    const conditions = [];
    if (filters?.userId)
      conditions.push(eq(auditLogsTable.userId, filters.userId));
    if (filters?.action)
      conditions.push(eq(auditLogsTable.action, filters.action));
    if (filters?.resource)
      conditions.push(eq(auditLogsTable.resource, filters.resource));
    if (filters?.startDate)
      conditions.push(
        drizzleSql`${auditLogsTable.createdAt} >= ${filters.startDate}`
      );
    if (filters?.endDate)
      conditions.push(
        drizzleSql`${auditLogsTable.createdAt} <= ${filters.endDate}`
      );

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(auditLogsTable.createdAt)) as any;

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }

    return query;
  }

  // System settings
  async getSetting(key: string): Promise<SystemSetting | undefined> {
    const result = await db
      .select()
      .from(systemSettingsTable)
      .where(eq(systemSettingsTable.key, key))
      .limit(1);
    return result[0];
  }

  async getAllSettings(): Promise<SystemSetting[]> {
    return db.select().from(systemSettingsTable);
  }

  async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return db
      .select()
      .from(systemSettingsTable)
      .where(eq(systemSettingsTable.category, category));
  }

  async upsertSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const result = await db
      .insert(systemSettingsTable)
      .values({ ...(setting as any), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: systemSettingsTable.key,
        set: { ...(setting as any), updatedAt: new Date() },
      })
      .returning();
    return result[0];
  }

  async deleteSetting(key: string): Promise<boolean> {
    await db
      .delete(systemSettingsTable)
      .where(eq(systemSettingsTable.key, key));
    return true;
  }

  // Videos
  async getVideo(id: string): Promise<VideoContent | undefined> {
    const result = await db
      .select()
      .from(videoContentTable)
      .where(eq(videoContentTable.id, id))
      .limit(1);
    return result[0];
  }

  async getAllVideos(): Promise<VideoContent[]> {
    return db
      .select()
      .from(videoContentTable)
      .orderBy(desc(videoContentTable.createdAt));
  }

  async getPublishedVideos(): Promise<VideoContent[]> {
    return db
      .select()
      .from(videoContentTable)
      .where(eq(videoContentTable.isPublished, true))
      .orderBy(desc(videoContentTable.createdAt));
  }

  async createVideo(video: InsertVideoContent): Promise<VideoContent> {
    const result = await db
      .insert(videoContentTable)
      .values(video as any)
      .returning();
    return result[0];
  }

  async updateVideo(
    id: string,
    updates: Partial<VideoContent>
  ): Promise<VideoContent | undefined> {
    const result = await db
      .update(videoContentTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videoContentTable.id, id))
      .returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<boolean> {
    await db.delete(videoContentTable).where(eq(videoContentTable.id, id));
    return true;
  }

  // Additional helper methods
  async getVisibleTeamMembers(): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.isVisible, true))
      .orderBy(asc(teamMembersTable.displayOrder));
  }

  async getMediaPositionsByCategory(
    category: string
  ): Promise<MediaPosition[]> {
    return db
      .select()
      .from(mediaPositionsTable)
      .where(eq(mediaPositionsTable.category, category))
      .orderBy(asc(mediaPositionsTable.positionKey));
  }

  async getActiveMediaPositions(): Promise<MediaPosition[]> {
    return db
      .select()
      .from(mediaPositionsTable)
      .where(eq(mediaPositionsTable.isActive, true))
      .orderBy(asc(mediaPositionsTable.positionKey));
  }

  // Stub implementations for methods not needed by init-admin or current features
  // (These can be implemented later if needed)
  async getContactById(id: string): Promise<Contact | null> {
    const result = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createTheme(settings: InsertThemeSettings): Promise<ThemeSettings> {
    const result = await db
      .insert(themeSettingsTable)
      .values(settings as any)
      .returning();
    return result[0];
  }

  async updateTheme(
    id: string,
    updates: Partial<ThemeSettings>
  ): Promise<ThemeSettings | undefined> {
    const result = await db
      .update(themeSettingsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themeSettingsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteTheme(id: string): Promise<boolean> {
    await db.delete(themeSettingsTable).where(eq(themeSettingsTable.id, id));
    return true;
  }

  async reorderContentSections(
    pageId: string,
    sectionOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async reorderContentBlocks(
    sectionId: string,
    blockOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async searchMediaAssets(query: string): Promise<MediaAsset[]> {
    return [];
  }

  async getNavigationTree(): Promise<NavigationItem[]> {
    return this.getAllNavigationItems();
  }

  async reorderNavigationItems(
    items: { id: string; displayOrder: number; parentId?: string }[]
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async getContentNode(id: string): Promise<ContentNode | undefined> {
    throw new Error("Not implemented");
  }
  async getPageNodes(pageId: string): Promise<ContentNode[]> {
    return [];
  }
  async createContentNode(node: InsertContentNode): Promise<ContentNode> {
    throw new Error("Not implemented");
  }
  async updateContentNode(
    id: string,
    updates: Partial<ContentNode>
  ): Promise<ContentNode | undefined> {
    throw new Error("Not implemented");
  }
  async deleteContentNode(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async reorderContentNodes(
    pageId: string,
    nodeOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async getContentSection(id: string): Promise<ContentSection | undefined> {
    throw new Error("Not implemented");
  }
  async getPageSections(pageId: string): Promise<ContentSection[]> {
    return [];
  }
  async createContentSection(
    section: InsertContentSection
  ): Promise<ContentSection> {
    throw new Error("Not implemented");
  }
  async updateContentSection(
    id: string,
    updates: Partial<ContentSection>
  ): Promise<ContentSection | undefined> {
    throw new Error("Not implemented");
  }
  async deleteContentSection(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async getContentBlock(id: string): Promise<ContentBlock | undefined> {
    throw new Error("Not implemented");
  }
  async getSectionBlocks(sectionId: string): Promise<ContentBlock[]> {
    return [];
  }
  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    throw new Error("Not implemented");
  }
  async updateContentBlock(
    id: string,
    updates: Partial<ContentBlock>
  ): Promise<ContentBlock | undefined> {
    throw new Error("Not implemented");
  }
  async deleteContentBlock(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    throw new Error("Not implemented");
  }
  async getAllMediaAssets(): Promise<MediaAsset[]> {
    return [];
  }
  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    throw new Error("Not implemented");
  }
  async updateMediaAsset(
    id: string,
    updates: Partial<MediaAsset>
  ): Promise<MediaAsset | undefined> {
    throw new Error("Not implemented");
  }
  async deleteMediaAsset(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async getThemeSettings(id: string): Promise<ThemeSettings | undefined> {
    throw new Error("Not implemented");
  }
  async getActiveTheme(): Promise<ThemeSettings | undefined> {
    throw new Error("Not implemented");
  }
  async createThemeSettings(
    settings: InsertThemeSettings
  ): Promise<ThemeSettings> {
    throw new Error("Not implemented");
  }
  async updateThemeSettings(
    id: string,
    updates: Partial<ThemeSettings>
  ): Promise<ThemeSettings | undefined> {
    throw new Error("Not implemented");
  }
  async deleteThemeSettings(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async activateTheme(id: string): Promise<ThemeSettings | undefined> {
    throw new Error("Not implemented");
  }
  async getAllThemes(): Promise<ThemeSettings[]> {
    return [];
  }
  async getVideoContent(id: string): Promise<VideoContent | undefined> {
    throw new Error("Not implemented");
  }
  async getAllVideoContent(): Promise<VideoContent[]> {
    return [];
  }
  async createVideoContent(video: InsertVideoContent): Promise<VideoContent> {
    throw new Error("Not implemented");
  }
  async updateVideoContent(
    id: string,
    updates: Partial<VideoContent>
  ): Promise<VideoContent | undefined> {
    throw new Error("Not implemented");
  }
  async deleteVideoContent(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
  async incrementVideoViews(id: string): Promise<void> {
    await db
      .update(videoContentTable)
      .set({ views: drizzleSql`${videoContentTable.views} + 1` })
      .where(eq(videoContentTable.id, id));
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contacts: Map<string, Contact>;
  private roles: Map<string, Role>;
  private userRoles: Map<string, UserRole>;
  private sessions: Map<string, AdminSession>;
  private pages: Map<string, Page>;
  private contentNodes: Map<string, ContentNode>;
  private contentSections: Map<string, ContentSection>;
  private contentBlocks: Map<string, ContentBlock>;
  private mediaAssets: Map<string, MediaAsset>;
  private navigationItems: Map<string, NavigationItem>;
  private themeSettings: Map<string, ThemeSettings>;
  private teamMembers: Map<string, TeamMember>;
  private mediaPositions: Map<string, MediaPosition>;
  private videoContent: Map<string, VideoContent>;
  private auditLogs: AuditLog[];
  private systemSettings: Map<string, SystemSetting>;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.roles = new Map();
    this.userRoles = new Map();
    this.sessions = new Map();
    this.pages = new Map();
    this.contentNodes = new Map();
    this.contentSections = new Map();
    this.contentBlocks = new Map();
    this.mediaAssets = new Map();
    this.navigationItems = new Map();
    this.themeSettings = new Map();
    this.teamMembers = new Map();
    this.mediaPositions = new Map();
    this.videoContent = new Map();
    this.auditLogs = [];
    this.systemSettings = new Map();

    // Initialize default roles
    this.initializeDefaultRoles();
  }

  private async initializeDefaultRoles() {
    // Super Admin role
    const superAdminRole: Role = {
      id: randomUUID(),
      name: "super_admin",
      description: "Full system access",
      permissions: [
        { resource: "users", actions: ["create", "read", "update", "delete"] },
        {
          resource: "pages",
          actions: ["create", "read", "update", "delete", "publish"],
        },
        {
          resource: "content",
          actions: ["create", "read", "update", "delete", "publish"],
        },
        { resource: "media", actions: ["create", "read", "update", "delete"] },
        {
          resource: "navigation",
          actions: ["create", "read", "update", "delete"],
        },
        { resource: "themes", actions: ["create", "read", "update", "delete"] },
      ],
      createdAt: new Date(),
    };

    // Content Editor role
    const contentEditorRole: Role = {
      id: randomUUID(),
      name: "content_editor",
      description: "Can edit content and media",
      permissions: [
        { resource: "pages", actions: ["read", "update"] },
        {
          resource: "content",
          actions: ["create", "read", "update", "delete"],
        },
        { resource: "media", actions: ["create", "read", "update", "delete"] },
      ],
      createdAt: new Date(),
    };

    // Content Viewer role
    const contentViewerRole: Role = {
      id: randomUUID(),
      name: "content_viewer",
      description: "Read-only access to content",
      permissions: [
        { resource: "pages", actions: ["read"] },
        { resource: "content", actions: ["read"] },
        { resource: "media", actions: ["read"] },
      ],
      createdAt: new Date(),
    };

    this.roles.set(superAdminRole.id, superAdminRole);
    this.roles.set(contentEditorRole.id, contentEditorRole);
    this.roles.set(contentViewerRole.id, contentViewerRole);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser as any,
      id,
      firstName: insertUser.firstName as string || null,
      lastName: insertUser.lastName as string || null,
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    // Remove user roles and sessions
    const userRoles = await this.getUserRoles(id);
    userRoles.forEach((userRole) => this.userRoles.delete(userRole.id));

    await this.deleteUserSessions(id);

    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Role management - basic implementation
  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return Array.from(this.roles.values()).find((role) => role.name === name);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = randomUUID();
    const role: Role = {
      ...insertRole as Role,
      id,
      description: insertRole.description as string || null,
      permissions: insertRole.permissions as [] || [],
      createdAt: new Date(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(
    id: string,
    updates: Partial<Role>
  ): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;

    const updatedRole: Role = { ...role, ...updates, id };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: string): Promise<boolean> {
    // Remove all user-role mappings for this role first
    const roleAssignments = Array.from(this.userRoles.values()).filter(
      (userRole) => userRole.roleId === id
    );

    roleAssignments.forEach((userRole) => {
      this.userRoles.delete(userRole.id);
    });

    return this.roles.delete(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(
      (ur) => ur.userId === userId
    );
  }
  async getAUserRole(userId: string): Promise<Role[]> {
    const userRoleIds = Array.from(this.userRoles.values())
      .filter((ur) => ur.userId === userId)
      .map((ur) => ur.roleId);
    return Array.from(this.roles.values()).filter((role) =>
      userRoleIds.includes(role.id)
    );
  }

  async assignUserRole(userId: string, roleId: string): Promise<UserRole> {
    const id = randomUUID();
    const userRole: UserRole = {
      id,
      userId,
      roleId,
      createdAt: new Date(),
    };
    this.userRoles.set(id, userRole);
    return userRole;
  }

  async removeUserRole(userId: string, roleId: string): Promise<boolean> {
    const userRole = Array.from(this.userRoles.values()).find(
      (ur) => ur.userId === userId && ur.roleId === roleId
    );
    if (!userRole) return false;
    return this.userRoles.delete(userRole.id);
  }

  // Session management
  async createSession(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<AdminSession> {
    const id = randomUUID();
    const session: AdminSession = {
      id,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(token, session);
    return session;
  }

  async getSession(token: string): Promise<AdminSession | undefined> {
    const session = this.sessions.get(token);
    if (!session) return undefined;

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return undefined;
    }

    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    const userSessions = Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId
    );

    userSessions.forEach((session) => {
      this.sessions.delete(session.token);
    });

    return true;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact as Contact,
      id,
      phone: insertContact.phone as string || null,
      organization: insertContact.organization as string || null,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  // Stub implementations for remaining interface methods
  // TODO: Implement these incrementally as needed

  async getPage(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find((page) => page.slug === slug);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const now = new Date();
    const page: Page = {
      ...insertPage as Page,
      id,
      pageType: insertPage.pageType as string || "marketing",
      description: insertPage.description as string || null,
      category: insertPage.category as string || null,
      metaTitle: insertPage.metaTitle as string || null,
      metaDescription: insertPage.metaDescription as string || null,
      featuredImage: insertPage.featuredImage as string || null,
      author: null,
      isPublished: insertPage.isPublished as boolean ?? false,
      publishedAt: null,
      metadata: insertPage.metadata as string || null,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(
    id: string,
    updates: Partial<Page>
  ): Promise<Page | undefined> {
    const page = this.pages.get(id);
    if (!page) return undefined;

    const updatedPage: Page = {
      ...page,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.pages.set(id, updatedPage);
    return updatedPage;
  }

  async deletePage(id: string): Promise<boolean> {
    // Delete all content sections and their blocks first
    const sections = await this.getPageSections(id);
    for (const section of sections) {
      await this.deleteContentSection(section.id);
    }

    return this.pages.delete(id);
  }

  async getAllPages(): Promise<Page[]> {
    return Array.from(this.pages.values());
  }

  async getPublishedPages(): Promise<Page[]> {
    return Array.from(this.pages.values()).filter((page) => page.isPublished);
  }

  async publishPage(id: string, userId: string): Promise<Page | undefined> {
    const page = this.pages.get(id);
    if (!page) return undefined;

    const publishedPage: Page = {
      ...page,
      isPublished: true,
      publishedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    };
    this.pages.set(id, publishedPage);
    return publishedPage;
  }

  async unpublishPage(id: string): Promise<Page | undefined> {
    const page = this.pages.get(id);
    if (!page) return undefined;

    const unpublishedPage: Page = {
      ...page,
      isPublished: false,
      publishedAt: null,
      updatedAt: new Date(),
    };
    this.pages.set(id, unpublishedPage);
    return unpublishedPage;
  }

  // Placeholder implementations for other methods (to be implemented incrementally)
  async getContentSection(id: string): Promise<ContentSection | undefined> {
    return this.contentSections.get(id);
  }

  async getPageSections(pageId: string): Promise<ContentSection[]> {
    return Array.from(this.contentSections.values())
      .filter((section) => section.pageId === pageId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createContentSection(
    insertSection: InsertContentSection
  ): Promise<ContentSection> {
    const id = randomUUID();
    const now = new Date();
    const section: ContentSection = {
      ...insertSection as ContentSection,
      id,
      title: insertSection.title as string || null,
      subtitle: insertSection.subtitle as string || null,
      content: insertSection.content || {},
      displayOrder: insertSection.displayOrder as number || null,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    };
    this.contentSections.set(id, section);
    return section;
  }

  async updateContentSection(
    id: string,
    updates: Partial<ContentSection>
  ): Promise<ContentSection | undefined> {
    const section = this.contentSections.get(id);
    if (!section) return undefined;

    const updatedSection: ContentSection = {
      ...section,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.contentSections.set(id, updatedSection);
    return updatedSection;
  }

  async deleteContentSection(id: string): Promise<boolean> {
    // Delete all content blocks in this section first
    const blocks = await this.getSectionBlocks(id);
    for (const block of blocks) {
      this.contentBlocks.delete(block.id);
    }

    return this.contentSections.delete(id);
  }

  async reorderContentSections(
    pageId: string,
    sectionOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    sectionOrders.forEach(({ id, displayOrder }) => {
      const section = this.contentSections.get(id);
      if (section && section.pageId === pageId) {
        const updatedSection: ContentSection = {
          ...section,
          displayOrder,
          updatedAt: new Date(),
        };
        this.contentSections.set(id, updatedSection);
      }
    });
    return true;
  }

  // Content Nodes management (WordPress-like blocks)
  async getContentNode(id: string): Promise<ContentNode | undefined> {
    return this.contentNodes.get(id);
  }

  async getPageNodes(pageId: string): Promise<ContentNode[]> {
    return Array.from(this.contentNodes.values())
      .filter((node) => node.pageId === pageId && !node.parentId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createContentNode(insertNode: InsertContentNode): Promise<ContentNode> {
    const id = randomUUID();
    const now = new Date();
    const node: ContentNode = {
      ...insertNode as ContentNode,
      id,
      content: insertNode.content || {},
      displayOrder: insertNode.displayOrder || null as any,
      parentId: insertNode.parentId || null as any,
      styles: insertNode.styles || {},
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    };
    this.contentNodes.set(id, node);
    return node;
  }

  async updateContentNode(
    id: string,
    updates: Partial<ContentNode>
  ): Promise<ContentNode | undefined> {
    const node = this.contentNodes.get(id);
    if (!node) return undefined;

    const updatedNode: ContentNode = {
      ...node,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.contentNodes.set(id, updatedNode);
    return updatedNode;
  }

  async deleteContentNode(id: string): Promise<boolean> {
    // Delete all child nodes first
    const childNodes = Array.from(this.contentNodes.values()).filter(
      (n) => n.parentId === id
    );
    for (const child of childNodes) {
      this.contentNodes.delete(child.id);
    }

    return this.contentNodes.delete(id);
  }

  async reorderContentNodes(
    pageId: string,
    nodeOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    nodeOrders.forEach(({ id, displayOrder }) => {
      const node = this.contentNodes.get(id);
      if (node && node.pageId === pageId) {
        const updatedNode: ContentNode = {
          ...node,
          displayOrder,
          updatedAt: new Date(),
        };
        this.contentNodes.set(id, updatedNode);
      }
    });
    return true;
  }

  async getPagesByType(pageType: string): Promise<Page[]> {
    return Array.from(this.pages.values())
      .filter((page) => page.pageType === pageType)
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
      );
  }

  // Content blocks management
  async getContentBlock(id: string): Promise<ContentBlock | undefined> {
    return this.contentBlocks.get(id);
  }

  async getSectionBlocks(sectionId: string): Promise<ContentBlock[]> {
    return Array.from(this.contentBlocks.values())
      .filter((block) => block.sectionId === sectionId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createContentBlock(
    insertBlock: InsertContentBlock
  ): Promise<ContentBlock> {
    const id = randomUUID();
    const now = new Date();
    const block: ContentBlock = {
      ...insertBlock as ContentBlock,
      id,
      title: insertBlock.title as string || null,
      content: insertBlock.content || {},
      displayOrder: insertBlock.displayOrder as number || null,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    };
    this.contentBlocks.set(id, block);
    return block;
  }

  async updateContentBlock(
    id: string,
    updates: Partial<ContentBlock>
  ): Promise<ContentBlock | undefined> {
    const block = this.contentBlocks.get(id);
    if (!block) return undefined;

    const updatedBlock: ContentBlock = {
      ...block,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.contentBlocks.set(id, updatedBlock);
    return updatedBlock;
  }

  async deleteContentBlock(id: string): Promise<boolean> {
    return this.contentBlocks.delete(id);
  }

  async reorderContentBlocks(
    sectionId: string,
    blockOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    blockOrders.forEach(({ id, displayOrder }) => {
      const block = this.contentBlocks.get(id);
      if (block && block.sectionId === sectionId) {
        const updatedBlock: ContentBlock = {
          ...block,
          displayOrder,
          updatedAt: new Date(),
        };
        this.contentBlocks.set(id, updatedBlock);
      }
    });
    return true;
  }
  // Media management
  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    return this.mediaAssets.get(id);
  }

  async createMediaAsset(insertAsset: InsertMediaAsset): Promise<MediaAsset> {
    const id = randomUUID();
    const asset: MediaAsset = {
      ...insertAsset as MediaAsset,
      id,
      altText: insertAsset.altText as string || null,
      caption: insertAsset.caption as string || null,
      createdAt: new Date(),
      uploadedBy: null,
    };
    this.mediaAssets.set(id, asset);
    return asset;
  }

  async updateMediaAsset(
    id: string,
    updates: Partial<MediaAsset>
  ): Promise<MediaAsset | undefined> {
    const asset = this.mediaAssets.get(id);
    if (!asset) return undefined;

    const updatedAsset: MediaAsset = { ...asset, ...updates, id };
    this.mediaAssets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteMediaAsset(id: string): Promise<boolean> {
    return this.mediaAssets.delete(id);
  }

  async getAllMediaAssets(): Promise<MediaAsset[]> {
    return Array.from(this.mediaAssets.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async searchMediaAssets(query: string): Promise<MediaAsset[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.mediaAssets.values())
      .filter(
        (asset) =>
          asset.originalName.toLowerCase().includes(lowerQuery) ||
          asset.filename.toLowerCase().includes(lowerQuery) ||
          (asset.altText && asset.altText.toLowerCase().includes(lowerQuery)) ||
          (asset.caption && asset.caption.toLowerCase().includes(lowerQuery))
      )
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
      );
  }
  // Navigation management
  async getNavigationItem(id: string): Promise<NavigationItem | undefined> {
    return this.navigationItems.get(id);
  }

  async createNavigationItem(
    insertItem: InsertNavigationItem
  ): Promise<NavigationItem> {
    const id = randomUUID();
    const item: NavigationItem = {
      ...insertItem as NavigationItem,
      id,
      href: insertItem.href as string || null,
      target: insertItem.target as string || "_self",
      displayOrder: insertItem.displayOrder as number || 0,
      parentId: insertItem.parentId as string || null,
      isVisible: true,
      createdAt: new Date(),
    };
    this.navigationItems.set(id, item);
    return item;
  }

  async updateNavigationItem(
    id: string,
    updates: Partial<NavigationItem>
  ): Promise<NavigationItem | undefined> {
    const item = this.navigationItems.get(id);
    if (!item) return undefined;

    const updatedItem: NavigationItem = { ...item, ...updates, id };
    this.navigationItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteNavigationItem(id: string): Promise<boolean> {
    // Delete children first
    const children = Array.from(this.navigationItems.values()).filter(
      (item) => item.parentId === id
    );

    children.forEach((child) => {
      this.navigationItems.delete(child.id);
    });

    return this.navigationItems.delete(id);
  }

  async getAllNavigationItems(): Promise<NavigationItem[]> {
    return Array.from(this.navigationItems.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }

  async getNavigationTree(): Promise<NavigationItem[]> {
    const allItems = await this.getAllNavigationItems();
    const parentItems = allItems.filter(
      (item) => !item.parentId && item.isVisible
    );

    // Note: In a real implementation, you'd build a proper tree structure
    // For simplicity, returning flat list of parent items
    return parentItems;
  }

  async reorderNavigationItems(
    itemOrders: { id: string; displayOrder: number }[]
  ): Promise<boolean> {
    itemOrders.forEach(({ id, displayOrder }) => {
      const item = this.navigationItems.get(id);
      if (item) {
        const updatedItem: NavigationItem = {
          ...item,
          displayOrder,
        };
        this.navigationItems.set(id, updatedItem);
      }
    });
    return true;
  }
  // Theme management
  async getThemeSettings(id: string): Promise<ThemeSettings | undefined> {
    return this.themeSettings.get(id);
  }

  async getActiveTheme(): Promise<ThemeSettings | undefined> {
    return Array.from(this.themeSettings.values()).find(
      (theme) => theme.isActive
    );
  }

  async createThemeSettings(
    insertTheme: InsertThemeSettings
  ): Promise<ThemeSettings> {
    const id = randomUUID();
    const now = new Date();
    const theme: ThemeSettings = {
      ...insertTheme as ThemeSettings,
      id,
      settings: insertTheme.settings || {},
      isActive: false,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
    };
    this.themeSettings.set(id, theme);
    return theme;
  }

  async updateThemeSettings(
    id: string,
    updates: Partial<ThemeSettings>
  ): Promise<ThemeSettings | undefined> {
    const theme = this.themeSettings.get(id);
    if (!theme) return undefined;

    const updatedTheme: ThemeSettings = {
      ...theme,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.themeSettings.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteThemeSettings(id: string): Promise<boolean> {
    return this.themeSettings.delete(id);
  }

  async getAllThemes(): Promise<ThemeSettings[]> {
    return Array.from(this.themeSettings.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async activateTheme(id: string): Promise<ThemeSettings | undefined> {
    const theme = this.themeSettings.get(id);
    if (!theme) return undefined;

    // Deactivate all other themes
    this.themeSettings.forEach((existingTheme, existingId) => {
      if (existingTheme.isActive) {
        const deactivatedTheme: ThemeSettings = {
          ...existingTheme,
          isActive: false,
          updatedAt: new Date(),
        };
        this.themeSettings.set(existingId, deactivatedTheme);
      }
    });

    // Activate the target theme
    const activatedTheme: ThemeSettings = {
      ...theme,
      isActive: true,
      updatedAt: new Date(),
    };
    this.themeSettings.set(id, activatedTheme);
    return activatedTheme;
  }

  // Team member management
  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const now = new Date();
    const member: TeamMember = {
      firstName: insertMember.firstName as string,
      lastName: insertMember.lastName as string,
      role: insertMember.role as string,
      id,
      bio: insertMember.bio as string ?? null,
      photoUrl: insertMember.photoUrl as string ?? null,
      photoAlt: insertMember.photoAlt as string ?? null,
      linkedin: insertMember.linkedin as string ?? null,
      achievements: insertMember.achievements as string || [],
      displayOrder: insertMember.displayOrder as number ?? 0,
      isVisible: insertMember.isVisible as boolean ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      title: insertMember.title as string ?? null,
    };
    this.teamMembers.set(id, member);
    return member;
  }

  async updateTeamMember(
    id: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    if (!member) return undefined;

    const updatedMember: TeamMember = {
      ...member,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }

  async getVisibleTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter((member) => member.isVisible)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  // Media position management
  async getMediaPosition(id: string): Promise<MediaPosition | undefined> {
    return this.mediaPositions.get(id);
  }

  async getMediaPositionByKey(key: string): Promise<MediaPosition | undefined> {
    return Array.from(this.mediaPositions.values()).find(
      (position) => position.positionKey === key
    );
  }

  async createMediaPosition(
    position: InsertMediaPosition
  ): Promise<MediaPosition> {
    const id = randomUUID();
    const now = new Date();
    const newPosition: MediaPosition = {
      positionKey: position.positionKey as string,
      label: position.label as string,
      category: position.category as string,
      id,
      description: position.description as string ?? null,
      mediaUrl: position.mediaUrl as string ?? null,
      mediaAlt: position.mediaAlt as string ?? null,
      mediaAssetId: position.mediaAssetId as string ?? null,
      isActive: position.isActive as boolean ?? true,
      displayOrder: position.displayOrder as number ?? 0,
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
    };
    this.mediaPositions.set(id, newPosition);
    return newPosition;
  }

  async updateMediaPosition(
    id: string,
    updates: Partial<MediaPosition>
  ): Promise<MediaPosition | undefined> {
    const position = this.mediaPositions.get(id);
    if (!position) return undefined;

    const updatedPosition: MediaPosition = {
      ...position,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.mediaPositions.set(id, updatedPosition);
    return updatedPosition;
  }

  async deleteMediaPosition(id: string): Promise<boolean> {
    return this.mediaPositions.delete(id);
  }

  async getAllMediaPositions(): Promise<MediaPosition[]> {
    return Array.from(this.mediaPositions.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }

  async getMediaPositionsByCategory(
    category: string
  ): Promise<MediaPosition[]> {
    return Array.from(this.mediaPositions.values())
      .filter((position) => position.category === category)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getActiveMediaPositions(): Promise<MediaPosition[]> {
    return Array.from(this.mediaPositions.values())
      .filter((position) => position.isActive)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getVideo(id: string): Promise<VideoContent | undefined> {
    return this.videoContent.get(id);
  }

  async createVideo(video: InsertVideoContent): Promise<VideoContent> {
    const id = randomUUID();
    const now = new Date();
    const newVideo: VideoContent = {
      ...video as VideoContent,
      id,
      description: video.description as string ?? null,
      thumbnailUrl: video.thumbnailUrl as string ?? null,
      duration: video.duration as string ?? null,
      category: video.category as string ?? "Webinar",
      isPublished: video.isPublished as boolean ?? false,
      views: video.views as number ?? 0,
      displayOrder: video.displayOrder as number ?? 0,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
    };
    this.videoContent.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(
    id: string,
    updates: Partial<VideoContent>
  ): Promise<VideoContent | undefined> {
    const video = this.videoContent.get(id);
    if (!video) return undefined;

    const updatedVideo: VideoContent = {
      ...video,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.videoContent.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videoContent.delete(id);
  }

  async getAllVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContent.values()).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }

  async getPublishedVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContent.values())
      .filter((video) => video.isPublished)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createAuditLog(
    log: Omit<AuditLog, "id" | "createdAt">
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...log,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.auditLogs.push(auditLog);
    return auditLog;
  }
  async getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters?.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters?.resource) {
      logs = logs.filter((log) => log.resource === filters.resource);
    }
    if (filters?.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    logs.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  async getSetting(key: string): Promise<SystemSetting | undefined> {
    return this.systemSettings.get(key);
  }

  async getAllSettings(): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values());
  }

  async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values()).filter(
      (setting) => setting.category === category
    );
  }

  async upsertSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = this.systemSettings.get(setting.key as string);
    const id = existing?.id ?? randomUUID();
    const now = new Date();

    const newSetting: SystemSetting = {
      ...setting as SystemSetting,
      id,
      value: setting.value as string ?? null ,
      category: setting.category as string ?? "general",
      description: setting.description as string ?? null,
      updatedAt: now,
      updatedBy: setting.updatedBy as string ?? null,
    };

    this.systemSettings.set(setting.key as string, newSetting);
    return newSetting;
  }

  async deleteSetting(key: string): Promise<boolean> {
    return this.systemSettings.delete(key);
  }
}

// Switch to PostgreSQL storage
export const storage = new DbStorage();
