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

/**
 * System Repository Interface
 * Handles system-level data operations (themes, sessions, audit logs, dashboard widgets)
 */
export interface ISystemRepository {
  // Theme Settings
  getActiveTheme(): Promise<ThemeSettings | null>;
  getAllThemes(): Promise<ThemeSettings[]>;
  createTheme(data: InsertThemeSettings): Promise<ThemeSettings>;
  updateTheme(id: string, data: Partial<ThemeSettings>): Promise<ThemeSettings>;
  activateTheme(id: string): Promise<ThemeSettings>;
  deleteTheme(id: string): Promise<{ success: boolean; message: string }>;

  // Sessions
  findSessionById(id: string): Promise<AdminSession | null>;
  findSessionByToken(token: string): Promise<AdminSession | null>;
  createSession(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<AdminSession>;
  deleteSession(id: string): Promise<{ success: boolean }>;
  deleteExpiredSessions(): Promise<number>;

  // Audit Logs
  getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLog[]>;
  createAuditLog(data: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog>;

  // Dashboard Widgets
  getUserWidgets(userId: string): Promise<DashboardWidget[]>;
  createWidget(data: InsertDashboardWidget): Promise<DashboardWidget>;
  updateWidget(
    id: string,
    data: Partial<DashboardWidget>
  ): Promise<DashboardWidget>;
  deleteWidget(id: string): Promise<{ success: boolean }>;
  resetUserWidgets(userId: string): Promise<DashboardWidget[]>;
  updateWidgetLayout(
    userId: string,
    widgets: Array<{ id: string; displayOrder: number; gridPosition?: any }>
  ): Promise<DashboardWidget[]>;

  // System Settings
  getSetting(key: string): Promise<SystemSetting | null>;
  getAllSettings(): Promise<SystemSetting[]>;
  getSettingsByCategory(category: string): Promise<SystemSetting[]>;
  upsertSetting(data: InsertSystemSetting): Promise<SystemSetting>;
  deleteSetting(key: string): Promise<{ success: boolean }>;
}
