import api from './api';
import authorsData from '../data/authors.json';

/**
 * Author entity interface
 * Represents an author in the library system
 */
export interface Author {
  id: number;
  name: string;
  birthDate: string;
  country: string;
  biography: string;
}

/**
 * Interface for tracking pending changes when offline
 * Used for synchronization when connection is restored
 */
interface PendingChange {
  type: 'add' | 'update' | 'delete';
  data: Partial<Author>;
  id?: number;
  timestamp: number;
}

/**
 * Service class for managing author operations
 * Handles CRUD operations for authors with offline support
 */
class AuthorService {
  private authors: Author[] = authorsData;
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
            await api.post('/authors', change.data);
            break;
          case 'update':
            if (change.id) {
              await api.put(`/authors/${change.id}`, change.data);
            }
            break;
          case 'delete':
            if (change.id) {
              await api.delete(`/authors/${change.id}`);
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
   * Retrieves all authors from API or local data
   * @returns Promise<Author[]> List of all authors
   */
  async getAllAuthors(): Promise<Author[]> {
    try {
      if (this.isOnline) {
        const response = await api.get<Author[]>('/authors');
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.authors;
  }

  /**
   * Gets an author by their ID
   * @param id Author ID to find
   * @returns Promise<Author | undefined> Found author or undefined
   */
  async getAuthorById(id: number): Promise<Author | undefined> {
    try {
      if (this.isOnline) {
        const response = await api.get<Author>(`/authors/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.authors.find(author => author.id === id);
  }

  /**
   * Adds a new author to the system
   * @param author Author data without ID
   * @returns Promise<Author> Added author with generated ID
   */
  async addAuthor(author: Omit<Author, 'id'>): Promise<Author> {
    const newAuthor = {
      ...author,
      id: Math.max(...this.authors.map(a => a.id)) + 1
    };

    if (this.isOnline) {
      try {
        const response = await api.post<Author>('/authors', newAuthor);
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'add',
          data: newAuthor,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'add',
        data: newAuthor,
        timestamp: Date.now()
      });
    }

    this.authors.push(newAuthor);
    return newAuthor;
  }

  /**
   * Updates an existing author
   * @param id Author ID to update
   * @param author Partial author data to update
   * @returns Promise<Author | undefined> Updated author or undefined if not found
   */
  async updateAuthor(id: number, author: Partial<Author>): Promise<Author | undefined> {
    const index = this.authors.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    const updatedAuthor = {
      ...this.authors[index],
      ...author,
      id
    };

    if (this.isOnline) {
      try {
        const response = await api.put<Author>(`/authors/${id}`, updatedAuthor);
        this.authors[index] = response.data;
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'update',
          data: updatedAuthor,
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'update',
        data: updatedAuthor,
        id,
        timestamp: Date.now()
      });
    }

    this.authors[index] = updatedAuthor;
    return updatedAuthor;
  }

  /**
   * Deletes an author by ID
   * @param id Author ID to delete
   * @returns Promise<boolean> Success status
   */
  async deleteAuthor(id: number): Promise<boolean> {
    const index = this.authors.findIndex(a => a.id === id);
    if (index === -1) return false;

    if (this.isOnline) {
      try {
        await api.delete(`/authors/${id}`);
        this.authors.splice(index, 1);
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

    this.authors.splice(index, 1);
    return true;
  }

  /**
   * Filters authors by country
   * @param country Country name to filter by
   * @returns Author[] List of authors from the specified country
   */
  getAuthorsByCountry(country: string): Author[] {
    return this.authors.filter(author => author.country === country);
  }
}

export const authorService = new AuthorService(); 