import api from './api';
import publishersData from '../data/publishers.json';

/**
 * Publisher entity interface
 * Represents a publisher in the library system
 */
export interface Publisher {
  id: number;
  name: string;
  establishmentYear: number;
  address: string;
  phone: string;
  email: string;
}

/**
 * Interface for tracking pending changes when offline
 * Used for synchronization when connection is restored
 */
interface PendingChange {
  type: 'add' | 'update' | 'delete';
  data: Partial<Publisher>;
  id?: number;
  timestamp: number;
}

/**
 * Service class for managing publisher operations
 * Handles CRUD operations for publishers with offline support
 */
class PublisherService {
  private publishers: Publisher[] = publishersData;
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
            await api.post('/publishers', change.data);
            break;
          case 'update':
            if (change.id) {
              await api.put(`/publishers/${change.id}`, change.data);
            }
            break;
          case 'delete':
            if (change.id) {
              await api.delete(`/publishers/${change.id}`);
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
   * Retrieves all publishers from API or local data
   * @returns Promise<Publisher[]> List of all publishers
   */
  async getAllPublishers(): Promise<Publisher[]> {
    try {
      if (this.isOnline) {
        const response = await api.get<Publisher[]>('/publishers');
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.publishers;
  }

  /**
   * Gets a publisher by its ID
   * @param id Publisher ID to find
   * @returns Promise<Publisher | undefined> Found publisher or undefined
   */
  async getPublisherById(id: number): Promise<Publisher | undefined> {
    try {
      if (this.isOnline) {
        const response = await api.get<Publisher>(`/publishers/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.publishers.find(publisher => publisher.id === id);
  }

  /**
   * Adds a new publisher to the system
   * @param publisher Publisher data without ID
   * @returns Promise<Publisher> Added publisher with generated ID
   */
  async addPublisher(publisher: Omit<Publisher, 'id'>): Promise<Publisher> {
    const newPublisher = {
      ...publisher,
      id: Math.max(...this.publishers.map(p => p.id)) + 1
    };

    if (this.isOnline) {
      try {
        const response = await api.post<Publisher>('/publishers', newPublisher);
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'add',
          data: newPublisher,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'add',
        data: newPublisher,
        timestamp: Date.now()
      });
    }

    this.publishers.push(newPublisher);
    return newPublisher;
  }

  /**
   * Updates an existing publisher
   * @param id Publisher ID to update
   * @param publisher Partial publisher data to update
   * @returns Promise<Publisher | undefined> Updated publisher or undefined if not found
   */
  async updatePublisher(id: number, publisher: Partial<Publisher>): Promise<Publisher | undefined> {
    const index = this.publishers.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updatedPublisher = {
      ...this.publishers[index],
      ...publisher,
      id
    };

    if (this.isOnline) {
      try {
        const response = await api.put<Publisher>(`/publishers/${id}`, updatedPublisher);
        this.publishers[index] = response.data;
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'update',
          data: updatedPublisher,
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'update',
        data: updatedPublisher,
        id,
        timestamp: Date.now()
      });
    }

    this.publishers[index] = updatedPublisher;
    return updatedPublisher;
  }

  /**
   * Deletes a publisher by ID
   * @param id Publisher ID to delete
   * @returns Promise<boolean> Success status
   */
  async deletePublisher(id: number): Promise<boolean> {
    const index = this.publishers.findIndex(p => p.id === id);
    if (index === -1) return false;

    if (this.isOnline) {
      try {
        await api.delete(`/publishers/${id}`);
        this.publishers.splice(index, 1);
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

    this.publishers.splice(index, 1);
    return true;
  }
}

export const publisherService = new PublisherService(); 