import { storage } from "../../storage";
import { logUserAction } from "../../auth";
import { insertNavigationItemSchema } from "@myhi2025/shared";
import { z } from "zod";
import { Request } from "express";
import { notFound } from "../common/errorHandlers";

export class NavigationService {
  async getAllNavigationItems() {
    return await storage.getAllNavigationItems();
  }

  async getNavigationTree() {
    return await storage.getNavigationTree();
  }

  async createNavigationItem(
    data: z.infer<typeof insertNavigationItemSchema>,
    currentUserId: string,
    req: Request
  ) {
    const newItem = await storage.createNavigationItem(data);

    await logUserAction(
      currentUserId,
      "create",
      "navigation",
      newItem.id,
      {
        item_label: newItem.label,
        parent_id: newItem.parentId,
      },
      req
    );

    return newItem;
  }

  async updateNavigationItem(
    id: string,
    data: any,
    currentUserId: string,
    req: Request
  ) {
    const updatedItem = await storage.updateNavigationItem(id, data);
    if (!updatedItem) {
      throw notFound("Navigation item", id);
    }

    await logUserAction(
      currentUserId,
      "update",
      "navigation",
      id,
      {
        item_label: updatedItem.label,
      },
      req
    );

    return updatedItem;
  }

  async deleteNavigationItem(id: string, currentUserId: string, req: Request) {
    const deleted = await storage.deleteNavigationItem(id);
    if (!deleted) {
      throw notFound("Navigation item", id);
    }

    await logUserAction(currentUserId, "delete", "navigation", id, {}, req);

    return { message: "Navigation item deleted successfully" };
  }

  async reorderNavigationItems(
    itemOrders: any[],
    currentUserId: string,
    req: Request
  ) {
    await storage.reorderNavigationItems(itemOrders);

    await logUserAction(
      currentUserId,
      "reorder",
      "navigation",
      null,
      {
        action: "reorder_items",
        count: itemOrders.length,
      },
      req
    );

    return { message: "Navigation items reordered successfully" };
  }
}

export const navigationService = new NavigationService();
