import { navigationRepository } from '../../repositories/implementations';
import { logUserAction } from '../../auth';
import { insertNavigationItemSchema } from '@myhealthintegral/shared';
import { z } from 'zod';
import { Request } from 'express';
import { notFound } from '../common/errorHandlers';

export class NavigationService {
  async getAllNavigationItems() {
    return await navigationRepository.getAllNavigationItems();
  }

  async getNavigationTree() {
    const items = await navigationRepository.getAllNavigationItems();
    const buildTree = (parentId: string | null = null): any[] => {
      return items
        .filter(item => item.parentId === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => ({
          ...item,
          children: buildTree(item.id)
        }));
    };
    return buildTree();
  }

  async createNavigationItem(data: z.infer<typeof insertNavigationItemSchema>, currentUserId: string, req: Request) {
    const newItem = await navigationRepository.createNavigationItem(data);
    
    await logUserAction(currentUserId, "create", "navigation", newItem.id, { 
      item_label: newItem.label,
      parent_id: newItem.parentId 
    }, req);
    
    return newItem;
  }

  async updateNavigationItem(id: string, data: any, currentUserId: string, req: Request) {
    const updatedItem = await navigationRepository.updateNavigationItem(id, data);
    
    await logUserAction(currentUserId, "update", "navigation", id, { 
      item_label: updatedItem.label 
    }, req);
    
    return updatedItem;
  }

  async deleteNavigationItem(id: string, currentUserId: string, req: Request) {
    const item = await navigationRepository.findNavigationById(id);
    if (!item) {
      throw notFound("Navigation item", id);
    }
    
    await navigationRepository.deleteNavigationItem(id);
    
    await logUserAction(currentUserId, "delete", "navigation", id, { 
      item_label: item.label 
    }, req);
    
    return { message: "Navigation item deleted successfully" };
  }

  async reorderNavigationItems(itemOrders: any[], currentUserId: string, req: Request) {
    await navigationRepository.reorderNavigationItems(itemOrders);
    
    await logUserAction(currentUserId, "reorder", "navigation", null, { 
      action: "reorder_items", 
      count: itemOrders.length 
    }, req);
    
    return { message: "Navigation items reordered successfully" };
  }
}

export const navigationService = new NavigationService();
