import api from './api';
import categoriesData from '../data/categories.json';

/**
 * Category entity interface
 * Represents a book category in the library system
 */
export interface Category {
  id: number;
  name: string;
  description: string;
}

/**
 * Interface for tracking pending changes when offline
 * Used for synchronization when connection is restored
 */
interface PendingChange {
  type: 'add' | 'update' | 'delete';
  data: Partial<Category>;
  id?: number;
  timestamp: number;
}

/**
 * Service class for managing category operations
 * Handles CRUD operations for categories with offline support
 */
class CategoryService {
  private categories: Category[] = categoriesData;
  private pendingChanges: PendingChange[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.checkApiStatus();
  }

  /**
   * Checks API availability and syncs pending changes if online
   * @returns Promise<void>
   */
  private async checkApiStatus(): Promise<void> {
    try {
      await api.get('/health');
      this.isOnline = true;
      this.syncPendingChanges();
    } catch (error) {
      this.isOnline = false;
    }
  }

  /**
   * Synchronizes pending changes with the API when connection is available
   * @returns Promise<void>
   */
  private async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.pendingChanges.length === 0) return;

    for (const change of this.pendingChanges) {
      try {
        switch (change.type) {
          case 'add':
            await api.post('/categories', change.data);
            break;
          case 'update':
            if (change.id) {
              await api.put(`/categories/${change.id}`, change.data);
            }
            break;
          case 'delete':
            if (change.id) {
              await api.delete(`/categories/${change.id}`);
            }
            break;
        }
        this.pendingChanges = this.pendingChanges.filter(pc => pc.timestamp !== change.timestamp);
      } catch (error) {
        console.error('Senkronizasyon hatası:', error);
      }
    }
  }

  /**
   * Retrieves all categories from API or local data
   * @returns Promise<Category[]> List of all categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      if (this.isOnline) {
        const response = await api.get<Category[]>('/categories');
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.categories;
  }

  /**
   * Gets a category by its ID
   * @param id Category ID to find
   * @returns Promise<Category | undefined> Found category or undefined
   */
  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      if (this.isOnline) {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.categories.find(category => category.id === id);
  }

  /**
   * Adds a new category to the system
   * @param category Category data without ID
   * @returns Promise<Category> Added category with generated ID
   */
  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory = {
      ...category,
      id: Math.max(...this.categories.map(c => c.id)) + 1
    };

    if (this.isOnline) {
      try {
        const response = await api.post<Category>('/categories', newCategory);
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'add',
          data: newCategory,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'add',
        data: newCategory,
        timestamp: Date.now()
      });
    }

    this.categories.push(newCategory);
    return newCategory;
  }

  /**
   * Updates an existing category
   * @param id Category ID to update
   * @param category Partial category data to update
   * @returns Promise<Category | undefined> Updated category or undefined if not found
   */
  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updatedCategory = {
      ...this.categories[index],
      ...category,
      id
    };

    if (this.isOnline) {
      try {
        const response = await api.put<Category>(`/categories/${id}`, updatedCategory);
        this.categories[index] = response.data;
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'update',
          data: updatedCategory,
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'update',
        data: updatedCategory,
        id,
        timestamp: Date.now()
      });
    }

    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  /**
   * Deletes a category by ID
   * @param id Category ID to delete
   * @returns Promise<boolean> Success status
   */
  async deleteCategory(id: number): Promise<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    if (this.isOnline) {
      try {
        await api.delete(`/categories/${id}`);
        this.categories.splice(index, 1);
        return true;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'delete',
          data: {},
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'delete',
        data: {},
        id,
        timestamp: Date.now()
      });
    }

    this.categories.splice(index, 1);
    return true;
  }
}

export const categoryService = new CategoryService(); 