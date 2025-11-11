import { storage } from "../../storage";
import type { InsertMediaPosition, MediaPosition } from "@myhi2025/shared";
import { notFound } from "../common/errorHandlers";

export const mediaPositionsService = {
  async getAllMediaPositions(): Promise<MediaPosition[]> {
    return await storage.getAllMediaPositions();
  },

  async getActiveMediaPositions(): Promise<MediaPosition[]> {
    const position = await storage.getMediaPositionByKey("active");
    return position ? [position] : [];
  },

  async getMediaPositionsByCategory(
    category: string
  ): Promise<MediaPosition[]> {
    const allPositions = await storage.getAllMediaPositions();
    return allPositions.filter((p) => p.category === category);
  },

  async getMediaPosition(id: string): Promise<MediaPosition | undefined> {
    return (await storage.getMediaPosition(id)) || undefined;
  },

  async getMediaPositionByKey(key: string): Promise<MediaPosition | undefined> {
    return (await storage.getMediaPositionByKey(key)) || undefined;
  },

  async createMediaPosition(
    data: InsertMediaPosition,
    userId: string,
    req: any
  ): Promise<MediaPosition> {
    const position = await storage.createMediaPosition(data);

    await storage.createAuditLog({
      userId,
      action: "create",
      resource: "media_positions",
      resourceId: position.id,
      details: {
        message: "Media position created",
        positionKey: position.positionKey,
        category: position.category,
      },
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.get("User-Agent") || "Unknown",
    });

    return position;
  },

  async updateMediaPosition(
    id: string,
    updates: Partial<MediaPosition>,
    userId: string,
    req: any
  ): Promise<MediaPosition | null> {
    const position = await storage.updateMediaPosition(id, updates);

    await storage.createAuditLog({
      userId,
      action: "update",
      resource: "media_positions",
      resourceId: position?.id || null,
      details: {
        message: "Media position updated",
        positionKey: position?.positionKey,
        updates,
      },
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.get("User-Agent") || "Unknown",
    });

    return position || null;
  },

  async deleteMediaPosition(
    id: string,
    userId: string,
    req: any
  ): Promise<boolean> {
    const position = await storage.getMediaPosition(id);

    if (!position) {
      throw notFound("Media position", id);
    }

    await storage.deleteMediaPosition(id);

    await storage.createAuditLog({
      userId,
      action: "delete",
      resource: "media_positions",
      resourceId: id,
      details: {
        message: "Media position deleted",
        positionKey: position.positionKey,
      },
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.get("User-Agent") || "Unknown",
    });

    return true;
  },
};
