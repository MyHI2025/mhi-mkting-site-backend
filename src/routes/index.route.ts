import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { z } from "zod";
import {
  insertContactSchema,
  insertThemeSettingsSchema,
  insertSystemSettingSchema,
} from "@myhi2025/shared";
import { authenticateToken, requirePermission, logUserAction } from "../auth";
import { uploadDirectory } from "../modules/media/media.config";
import {
  asyncHandler,
  sendErrorResponse,
} from "../modules/common/errorHandlers";
import { storage } from "../storage";

import authRouter from "../modules/auth";
import usersRouter from "../modules/users";
import { cmsPublicRouter, cmsAdminRouter } from "../modules/cms";
import mediaRouter from "../modules/media";
import navigationRouter from "../modules/navigation";
import { teamPublicRouter, teamAdminRouter } from "../modules/team";
import {
  mediaPositionsPublicRouter,
  mediaPositionsAdminRouter,
} from "../modules/media-positions";
import { videosPublicRouter, videosAdminRouter } from "../modules/videos";
import dashboardAdminRouter from "../modules/dashboard/dashboard.admin.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    "/uploads",
    (req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(uploadDirectory)
  );

  app.use("/api/v1/auth", authRouter);

  app.use("/api/v1", cmsPublicRouter);
  app.use("/api/v1", teamPublicRouter);
  app.use("/api/v1/media-positions", mediaPositionsPublicRouter);
  app.use("/api/v1", videosPublicRouter);

  app.use("/api/v1/admin", cmsAdminRouter);
  app.use("/api/v1/admin/team", teamAdminRouter);
  app.use("/api/v1/admin/media-positions", mediaPositionsAdminRouter);
  app.use("/api/v1/admin/videos", videosAdminRouter);

  app.use("/api/v1/admin/users", usersRouter);
  app.use("/api/v1/admin/media", mediaRouter);
  app.use("/api/v1/admin/navigation", navigationRouter);
  app.use("/api/v1/admin/dashboard", dashboardAdminRouter);

  app.get(
    "/api/v1/public/settings/ga",
    asyncHandler(async (req, res) => {
      const setting = await storage.getSetting("ga_measurement_id");
      if (!setting || !setting.value) {
        return res
          .status(404)
          .json({ error: "GA measurement ID not configured" });
      }
      res.json({ value: setting.value });
    })
  );

  app.post(
    "/api/v1/public/contact",
    asyncHandler(async (req, res) => {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);

      // Sync to Zoho CRM asynchronously (don't block the response)
      import("../services/zoho.service").then(({ zohoCRM }) => {
        zohoCRM
          .createLead(contact)
          .then((result) => {
            if (result.success) {
              console.log(
                `✅ Zoho CRM lead created for ${contact.email} (ID: ${result.id})`
              );
            } else {
              console.warn(
                `⚠️ Failed to sync to Zoho CRM for ${contact.email}: ${result.error}`
              );
            }
          })
          .catch((error) => {
            console.error("Error syncing to Zoho CRM:", error);
          });
      });

      res.status(201).json({
        message: "Contact form submitted successfully",
        id: contact.id,
      });
    })
  );

  app.get(
    "/api/v1/admin/contacts",
    authenticateToken,
    requirePermission("content", "read"),
    asyncHandler(async (req, res) => {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    })
  );

  app.post(
    "/api/v1/admin/contacts/sync-zoho",
    authenticateToken,
    requirePermission("content", "update"),
    asyncHandler(async (req, res) => {
      const { zohoCRM } = await import("../services/zoho.service");

      if (!zohoCRM.isConfigured()) {
        return res.status(400).json({
          error: "Zoho CRM not configured. Please add credentials in Secrets.",
        });
      }

      const contactIds = req.body.contactIds as string[] | undefined;
      let contacts;

      if (contactIds && contactIds.length > 0) {
        // Sync specific contacts
        const contactPromises = await Promise.all(
          contactIds.map((id) => storage.getContactById(id))
        );
        contacts = contactPromises.filter(
          (c): c is NonNullable<typeof c> => c !== null
        );
      } else {
        // Sync all contacts
        contacts = await storage.getAllContacts();
      }

      const result = await zohoCRM.createLeads(contacts);

      res.json({
        message: `Synced ${result.success} contacts successfully, ${result.failed} failed`,
        success: result.success,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    })
  );

  const auditLogsQuerySchema = z.object({
    userId: z.string().uuid().optional(),
    resource: z.string().max(100).optional(),
    action: z.string().max(50).optional(),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n > 0 && n <= 1000, {
        message: "Limit must be between 1 and 1000",
      })
      .optional(),
  });

  app.get(
    "/api/v1/admin/audit-logs",
    authenticateToken,
    requirePermission("users", "read"),
    asyncHandler(async (req, res) => {
      const validatedQuery = auditLogsQuerySchema.parse(req.query);

      const filters: any = {};
      if (validatedQuery.userId) filters.userId = validatedQuery.userId;
      if (validatedQuery.resource) filters.resource = validatedQuery.resource;
      if (validatedQuery.action) filters.action = validatedQuery.action;
      if (validatedQuery.limit) filters.limit = validatedQuery.limit;

      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    })
  );

  app.get(
    "/api/v1/admin/settings",
    authenticateToken,
    requirePermission("users", "read"),
    asyncHandler(async (req, res) => {
      const settings = await storage.getAllSettings();
      res.json(settings);
    })
  );

  app.get(
    "/api/v1/admin/settings/:key",
    authenticateToken,
    requirePermission("users", "read"),
    asyncHandler(async (req, res) => {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    })
  );

  app.put(
    "/api/v1/admin/settings",
    authenticateToken,
    requirePermission("users", "update"),
    asyncHandler(async (req, res) => {
      const validatedData = insertSystemSettingSchema.parse(req.body);
      const currentUser = (req as any).user;

      const setting = await storage.upsertSetting({
        ...validatedData,
        updatedBy: currentUser.id,
      });

      await logUserAction(
        currentUser.id,
        "update",
        "settings",
        setting.id,
        {
          setting_key: setting.key,
          setting_value: setting.value,
        },
        req
      );

      res.json(setting);
    })
  );

  app.get(
    "/api/v1/admin/themes",
    authenticateToken,
    requirePermission("themes", "read"),
    asyncHandler(async (req, res) => {
      const themes = await storage.getAllThemes();
      res.json(themes);
    })
  );

  app.get(
    "/api/v1/admin/themes/active",
    authenticateToken,
    requirePermission("themes", "read"),
    asyncHandler(async (req, res) => {
      const activeTheme = await storage.getActiveTheme();
      res.json(activeTheme);
    })
  );

  app.post(
    "/api/v1/admin/themes",
    authenticateToken,
    requirePermission("themes", "create"),
    asyncHandler(async (req, res) => {
      const validatedData = insertThemeSettingsSchema.parse(req.body);
      const currentUser = (req as any).user;

      const newTheme = await storage.createTheme(validatedData);

      await logUserAction(
        currentUser.id,
        "create",
        "themes",
        newTheme.id,
        {
          theme_name: newTheme.name,
        },
        req
      );

      res.status(201).json(newTheme);
    })
  );

  app.put(
    "/api/v1/admin/themes/:id",
    authenticateToken,
    requirePermission("themes", "update"),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const updatedTheme = await storage.updateTheme(id, req.body);

      await logUserAction(
        currentUser.id,
        "update",
        "themes",
        id,
        {
          theme_name: updatedTheme?.name,
        },
        req
      );

      res.json(updatedTheme);
    })
  );

  app.delete(
    "/api/v1/admin/themes/:id",
    authenticateToken,
    requirePermission("themes", "delete"),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const result = await storage.deleteTheme(id);

      await logUserAction(currentUser.id, "delete", "themes", id, {}, req);

      res.json(result);
    })
  );

  app.patch(
    "/api/v1/admin/themes/:id/activate",
    authenticateToken,
    requirePermission("themes", "update"),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const activatedTheme = await storage.activateTheme(id);

      await logUserAction(
        currentUser.id,
        "activate",
        "themes",
        id,
        {
          theme_name: activatedTheme?.name,
        },
        req
      );

      res.json(activatedTheme);
    })
  );

  const httpServer = createServer(app);
  return httpServer;
}
