import { ISystemRepository } from "../system.repository";
import { NotFoundError, RepositoryError } from "../base.repository";
import type {
  ThemeSettings,
  InsertThemeSettings,
  AdminSession,
  AuditLog,
  DashboardWidget,
  InsertDashboardWidget,
  SystemSetting,
  InsertSystemSetting,
} from "@myhi2025/shared";
import { randomUUID } from "crypto";

export class SystemRepositoryImpl implements ISystemRepository {
  private themeSettings: Map<string, ThemeSettings>;
  private sessions: Map<string, AdminSession>;
  private auditLogs: AuditLog[];
  private dashboardWidgets: Map<string, DashboardWidget>;
  private systemSettings: Map<string, SystemSetting>;

  constructor() {
    this.themeSettings = new Map();
    this.sessions = new Map();
    this.auditLogs = [];
    this.dashboardWidgets = new Map();
    this.systemSettings = new Map();
  }

  async getActiveTheme(): Promise<ThemeSettings | null> {
    return (
      Array.from(this.themeSettings.values()).find((theme) => theme.isActive) ||
      null
    );
  }

  async getAllThemes(): Promise<ThemeSettings[]> {
    return Array.from(this.themeSettings.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async createTheme(data: InsertThemeSettings): Promise<ThemeSettings> {
    const id = randomUUID();
    const now = new Date();
    const theme: ThemeSettings = {
      ...data as ThemeSettings,
      id,
      settings: data.settings || {},
      isActive: false,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
    };
    this.themeSettings.set(id, theme);
    return theme;
  }

  async updateTheme(
    id: string,
    data: Partial<ThemeSettings>
  ): Promise<ThemeSettings> {
    const theme = this.themeSettings.get(id);
    if (!theme) {
      throw new NotFoundError("ThemeSettings", id);
    }

    const updatedTheme: ThemeSettings = {
      ...theme,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.themeSettings.set(id, updatedTheme);
    return updatedTheme;
  }

  async activateTheme(id: string): Promise<ThemeSettings> {
    const theme = this.themeSettings.get(id);
    if (!theme) {
      throw new NotFoundError("ThemeSettings", id);
    }

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

    const activatedTheme: ThemeSettings = {
      ...theme,
      isActive: true,
      updatedAt: new Date(),
    };
    this.themeSettings.set(id, activatedTheme);
    return activatedTheme;
  }

  async deleteTheme(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const theme = this.themeSettings.get(id);
    if (!theme) {
      throw new NotFoundError("ThemeSettings", id);
    }

    if (theme.isActive) {
      throw new RepositoryError("Cannot delete active theme", "CONFLICT", 409);
    }

    this.themeSettings.delete(id);
    return { success: true, message: "Theme deleted successfully" };
  }

  async findSessionById(id: string): Promise<AdminSession | null> {
    return Array.from(this.sessions.values()).find((s) => s.id === id) || null;
  }

  async findSessionByToken(token: string): Promise<AdminSession | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

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

  async deleteSession(id: string): Promise<{ success: boolean }> {
    const session = Array.from(this.sessions.values()).find((s) => s.id === id);
    if (!session) {
      throw new NotFoundError("AdminSession", id);
    }

    this.sessions.delete(session.token);
    return { success: true };
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    Array.from(this.sessions.entries()).forEach(([token, session]) => {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
        deletedCount++;
      }
    });

    return deletedCount;
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

  async createAuditLog(
    data: Omit<AuditLog, "id" | "timestamp">
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.auditLogs.push(auditLog);
    return auditLog;
  }

  // Dashboard Widget Methods
  async getUserWidgets(userId: string): Promise<DashboardWidget[]> {
    const widgets = Array.from(this.dashboardWidgets.values())
      .filter((w) => w.userId === userId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    // If no widgets exist for user, create default layout
    if (widgets.length === 0) {
      return this.resetUserWidgets(userId);
    }

    return widgets;
  }

  async createWidget(data: InsertDashboardWidget): Promise<DashboardWidget> {
    const id = randomUUID();
    const now = new Date();
    const widget: DashboardWidget = {
      ...data as DashboardWidget,
      id,
      displayOrder: data.displayOrder as number ?? null,
      gridPosition: data.gridPosition as string || {},
      settings: data.settings as string || {},
      isVisible: data.isVisible as boolean ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.dashboardWidgets.set(id, widget);
    return widget;
  }

  async updateWidget(
    id: string,
    data: Partial<DashboardWidget>
  ): Promise<DashboardWidget> {
    const widget = this.dashboardWidgets.get(id);
    if (!widget) {
      throw new NotFoundError("DashboardWidget", id);
    }

    const updatedWidget: DashboardWidget = {
      ...widget,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.dashboardWidgets.set(id, updatedWidget);
    return updatedWidget;
  }

  async deleteWidget(id: string): Promise<{ success: boolean }> {
    const deleted = this.dashboardWidgets.delete(id);
    if (!deleted) {
      throw new NotFoundError("DashboardWidget", id);
    }
    return { success: true };
  }

  async resetUserWidgets(userId: string): Promise<DashboardWidget[]> {
    // Delete all existing widgets for this user
    Array.from(this.dashboardWidgets.values())
      .filter((w) => w.userId === userId)
      .forEach((w) => this.dashboardWidgets.delete(w.id));

    // Create default widget layout
    const defaultWidgets: InsertDashboardWidget[] = [
      {
        userId,
        widgetType: "quick_stats",
        displayOrder: 0,
        gridPosition: { row: 0, col: 0, width: 2, height: 1 },
        settings: {},
        isVisible: true,
      },
      {
        userId,
        widgetType: "recent_pages",
        displayOrder: 1,
        gridPosition: { row: 1, col: 0, width: 1, height: 2 },
        settings: { limit: 5 },
        isVisible: true,
      },
      {
        userId,
        widgetType: "recent_contacts",
        displayOrder: 2,
        gridPosition: { row: 1, col: 1, width: 1, height: 2 },
        settings: { limit: 5 },
        isVisible: true,
      },
      {
        userId,
        widgetType: "quick_actions",
        displayOrder: 3,
        gridPosition: { row: 3, col: 0, width: 2, height: 1 },
        settings: {},
        isVisible: true,
      },
    ];

    const widgets: DashboardWidget[] = [];
    for (const widgetData of defaultWidgets) {
      const widget = await this.createWidget(widgetData);
      widgets.push(widget);
    }

    return widgets;
  }

  async updateWidgetLayout(
    userId: string,
    widgets: Array<{ id: string; displayOrder: number; gridPosition?: any }>
  ): Promise<DashboardWidget[]> {
    const updatedWidgets: DashboardWidget[] = [];

    for (const widgetUpdate of widgets) {
      const widget = this.dashboardWidgets.get(widgetUpdate.id);
      if (widget && widget.userId === userId) {
        const updated = await this.updateWidget(widgetUpdate.id, {
          displayOrder: widgetUpdate.displayOrder,
          gridPosition: widgetUpdate.gridPosition ?? widget.gridPosition,
        });
        updatedWidgets.push(updated);
      }
    }

    return updatedWidgets.sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }

  // System Settings Methods
  async getSetting(key: string): Promise<SystemSetting | null> {
    return this.systemSettings.get(key) || null;
  }

  async getAllSettings(): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values());
  }

  async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values()).filter(
      (setting) => setting.category === category
    );
  }

  async upsertSetting(data: InsertSystemSetting): Promise<SystemSetting> {
    const existing = this.systemSettings.get(data.key as string);
    const id = existing?.id ?? randomUUID();
    const now = new Date();

    const setting: SystemSetting = {
      ...data as SystemSetting,
      id,
      value: data.value as string ?? null,
      category: data.category as string ?? "general",
      description: data.description as string ?? null,
      updatedAt: now,
      updatedBy: data.updatedBy as string ?? null,
    };

    this.systemSettings.set(data.key as string, setting);
    return setting;
  }

  async deleteSetting(key: string): Promise<{ success: boolean }> {
    const deleted = this.systemSettings.delete(key);
    if (!deleted) {
      throw new NotFoundError("SystemSetting", key);
    }
    return { success: true };
  }
}

export const systemRepository = new SystemRepositoryImpl();
