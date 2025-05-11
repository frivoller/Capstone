import api from './api';
import borrowsData from '../data/borrows.json';

/**
 * Borrow entity interface
 * Represents a book borrowing record in the library system
 */
export interface Borrow {
  id: number;
  borrowerName: string;
  borrowerMail: string;
  borrowingDate: string;
  returnDate: string;
  book: {
    id: number;
    name: string;
    publicationYear: number;
    stock: number;
    author: {
      id: number;
      name: string;
      birthDate: string;
      country: string;
    };
    publisher: {
      id: number;
      name: string;
      establishmentYear: number;
      address: string;
    };
    categories: Array<{
      id: number;
      name: string;
      description: string;
    }>;
  };
}

/**
 * Interface for tracking pending changes when offline
 * Used for synchronization when connection is restored
 */
interface PendingChange {
  type: 'add' | 'update' | 'delete';
  data: Partial<Borrow>;
  id?: number;
  timestamp: number;
}

/**
 * Service class for managing borrow operations
 * Handles CRUD operations for book borrowings with offline support
 */
class BorrowService {
  private borrows: Borrow[] = borrowsData;
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
            await api.post('/borrows', change.data);
            break;
          case 'update':
            if (change.id) {
              await api.put(`/borrows/${change.id}`, change.data);
            }
            break;
          case 'delete':
            if (change.id) {
              await api.delete(`/borrows/${change.id}`);
            }
            break;
        }
        // Remove synchronized change from pending list
        this.pendingChanges = this.pendingChanges.filter(pc => pc.timestamp !== change.timestamp);
      } catch (error) {
        console.error('Senkronizasyon hatası:', error);
      }
    }
  }

  /**
   * Retrieves all borrows from API or local data
   * @returns Promise<Borrow[]> List of all borrow records
   */
  async getAllBorrows(): Promise<Borrow[]> {
    try {
      if (this.isOnline) {
        const response = await api.get<Borrow[]>('/borrows');
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.borrows;
  }

  /**
   * Gets a borrow record by its ID
   * @param id Borrow ID to find
   * @returns Promise<Borrow | undefined> Found borrow record or undefined
   */
  async getBorrowById(id: number): Promise<Borrow | undefined> {
    try {
      if (this.isOnline) {
        const response = await api.get<Borrow>(`/borrows/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.borrows.find(borrow => borrow.id === id);
  }

  /**
   * Adds a new borrow record to the system
   * @param borrow Borrow data without ID
   * @returns Promise<Borrow> Added borrow record with generated ID
   */
  async addBorrow(borrow: Omit<Borrow, 'id'>): Promise<Borrow> {
    const newBorrow = {
      ...borrow,
      id: Math.max(...this.borrows.map(b => b.id)) + 1
    };

    if (this.isOnline) {
      try {
        const response = await api.post<Borrow>('/borrows', newBorrow);
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'add',
          data: newBorrow,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'add',
        data: newBorrow,
        timestamp: Date.now()
      });
    }

    this.borrows.push(newBorrow);
    return newBorrow;
  }

  /**
   * Updates an existing borrow record
   * @param id Borrow ID to update
   * @param borrow Partial borrow data to update
   * @returns Promise<Borrow | undefined> Updated borrow record or undefined if not found
   */
  async updateBorrow(id: number, borrow: Partial<Borrow>): Promise<Borrow | undefined> {
    const index = this.borrows.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    const updatedBorrow = {
      ...this.borrows[index],
      ...borrow,
      id
    };

    if (this.isOnline) {
      try {
        const response = await api.put<Borrow>(`/borrows/${id}`, updatedBorrow);
        this.borrows[index] = response.data;
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'update',
          data: updatedBorrow,
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'update',
        data: updatedBorrow,
        id,
        timestamp: Date.now()
      });
    }

    this.borrows[index] = updatedBorrow;
    return updatedBorrow;
  }

  /**
   * Deletes a borrow record by ID
   * @param id Borrow ID to delete
   * @returns Promise<boolean> Success status
   */
  async deleteBorrow(id: number): Promise<boolean> {
    const index = this.borrows.findIndex(b => b.id === id);
    if (index === -1) return false;

    if (this.isOnline) {
      try {
        await api.delete(`/borrows/${id}`);
        this.borrows.splice(index, 1);
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

    this.borrows.splice(index, 1);
    return true;
  }

  /**
   * Filters borrows by book ID
   * @param bookId Book ID to filter by
   * @returns Borrow[] List of borrows for the specified book
   */
  getBorrowsByBook(bookId: number): Borrow[] {
    return this.borrows.filter(borrow => borrow.book.id === bookId);
  }

  /**
   * Filters borrows by borrower email
   * @param borrowerMail Borrower email to filter by
   * @returns Borrow[] List of borrows for the specified borrower
   */
  getBorrowsByBorrower(borrowerMail: string): Borrow[] {
    return this.borrows.filter(borrow => borrow.borrowerMail === borrowerMail);
  }
}

export const borrowService = new BorrowService(); 