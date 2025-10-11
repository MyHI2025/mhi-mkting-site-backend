import { mediaRepository, systemRepository } from "../../repositories/implementations";
import type { InsertMediaPosition, MediaPosition } from "@myhealthintegral/shared";
import { notFound } from "../common/errorHandlers";

export const mediaPositionsService = {
  async getAllMediaPositions(): Promise<MediaPosition[]> {
    return await mediaRepository.getAllMediaPositions();
  },

  async getActiveMediaPositions(): Promise<MediaPosition[]> {
    return await mediaRepository.getPublicMediaPositions();
  },

  async getMediaPositionsByCategory(category: string): Promise<MediaPosition[]> {
    const allPositions = await mediaRepository.getAllMediaPositions();
    return allPositions.filter(p => p.category === category);
  },

  async getMediaPosition(id: string): Promise<MediaPosition | undefined> {
    return await mediaRepository.findMediaPositionById(id) || undefined;
  },

  async getMediaPositionByKey(key: string): Promise<MediaPosition | undefined> {
    return await mediaRepository.findMediaPositionByKey(key) || undefined;
  },

  async createMediaPosition(
    data: InsertMediaPosition,
    userId: string,
    req: any
  ): Promise<MediaPosition> {
    const position = await mediaRepository.createMediaPosition(data);

    await systemRepository.createAuditLog({
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
  ): Promise<MediaPosition> {
    const position = await mediaRepository.updateMediaPosition(id, updates);

    await systemRepository.createAuditLog({
      userId,
      action: "update",
      resource: "media_positions",
      resourceId: position.id,
      details: {
        message: "Media position updated",
        positionKey: position.positionKey,
        updates,
      },
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.get("User-Agent") || "Unknown",
    });

    return position;
  },

  async deleteMediaPosition(id: string, userId: string, req: any): Promise<boolean> {
    const position = await mediaRepository.findMediaPositionById(id);
    
    if (!position) {
      throw notFound("Media position", id);
    }

    await mediaRepository.deleteMediaPosition(id);

    await systemRepository.createAuditLog({
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
