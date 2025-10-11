import { INavigationRepository } from '../navigation.repository';
import { NotFoundError } from '../base.repository';
import type { NavigationItem, InsertNavigationItem } from '@myhealthintegral/shared';
import { randomUUID } from 'crypto';

export class NavigationRepositoryImpl implements INavigationRepository {
  private navigationItems: Map<string, NavigationItem>;

  constructor() {
    this.navigationItems = new Map();
  }

  async findNavigationById(id: string): Promise<NavigationItem | null> {
    return this.navigationItems.get(id) || null;
  }

  async getAllNavigationItems(): Promise<NavigationItem[]> {
    return Array.from(this.navigationItems.values())
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getPublishedNavigationItems(): Promise<NavigationItem[]> {
    return Array.from(this.navigationItems.values())
      .filter(item => item.isVisible)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getNavigationItemsByParent(parentId: string | null): Promise<NavigationItem[]> {
    return Array.from(this.navigationItems.values())
      .filter(item => item.parentId === parentId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createNavigationItem(data: InsertNavigationItem): Promise<NavigationItem> {
    const id = randomUUID();
    const item: NavigationItem = {
      ...data,
      id,
      href: data.href || null,
      target: data.target || '_self',
      displayOrder: data.displayOrder || 0,
      parentId: data.parentId || null,
      isVisible: true,
      createdAt: new Date(),
    };
    this.navigationItems.set(id, item);
    return item;
  }

  async updateNavigationItem(id: string, data: Partial<NavigationItem>): Promise<NavigationItem> {
    const item = this.navigationItems.get(id);
    if (!item) {
      throw new NotFoundError('NavigationItem', id);
    }
    
    const updatedItem: NavigationItem = { ...item, ...data, id };
    this.navigationItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteNavigationItem(id: string): Promise<{ success: boolean; message: string }> {
    const item = this.navigationItems.get(id);
    if (!item) {
      throw new NotFoundError('NavigationItem', id);
    }

    const children = Array.from(this.navigationItems.values())
      .filter(navItem => navItem.parentId === id);
    
    children.forEach(child => {
      this.navigationItems.delete(child.id);
    });
    
    this.navigationItems.delete(id);
    return { success: true, message: 'Navigation item deleted successfully' };
  }

  async reorderNavigationItems(items: { id: string; order: number }[]): Promise<{ success: boolean; message: string }> {
    items.forEach(({ id, order }) => {
      const item = this.navigationItems.get(id);
      if (item) {
        const updatedItem: NavigationItem = {
          ...item,
          displayOrder: order,
        };
        this.navigationItems.set(id, updatedItem);
      }
    });
    return { success: true, message: 'Navigation items reordered successfully' };
  }
}

export const navigationRepository = new NavigationRepositoryImpl();
