import type { NavigationItem, InsertNavigationItem } from "@myhi2025/shared";

/**
 * Navigation Repository Interface
 * Handles all navigation-related data operations
 */
export interface INavigationRepository {
  findNavigationById(id: string): Promise<NavigationItem | null>;
  getAllNavigationItems(): Promise<NavigationItem[]>;
  getPublishedNavigationItems(): Promise<NavigationItem[]>;
  getNavigationItemsByParent(
    parentId: string | null
  ): Promise<NavigationItem[]>;
  createNavigationItem(data: InsertNavigationItem): Promise<NavigationItem>;
  updateNavigationItem(
    id: string,
    data: Partial<NavigationItem>
  ): Promise<NavigationItem>;
  deleteNavigationItem(
    id: string
  ): Promise<{ success: boolean; message: string }>;
  reorderNavigationItems(
    items: { id: string; order: number }[]
  ): Promise<{ success: boolean; message: string }>;
}
