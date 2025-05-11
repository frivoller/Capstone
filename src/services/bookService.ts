import api from './api';
import booksData from '../data/books.json';

export interface Book {
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
}

interface PendingChange {
  type: 'add' | 'update' | 'delete';
  data: Partial<Book>;
  id?: number;
  timestamp: number;
}

/**
 * Service class for managing book operations
 * Handles CRUD operations for books with offline support
 */
class BookService {
  private books: Book[] = booksData;
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
            await api.post('/books', change.data);
            break;
          case 'update':
            if (change.id) {
              await api.put(`/books/${change.id}`, change.data);
            }
            break;
          case 'delete':
            if (change.id) {
              await api.delete(`/books/${change.id}`);
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
   * Retrieves all books from API or local data
   * @returns Promise<Book[]> List of all books
   */
  async getAllBooks(): Promise<Book[]> {
    try {
      if (this.isOnline) {
        const response = await api.get<Book[]>('/books');
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.books;
  }

  /**
   * Gets a book by its ID
   * @param id Book ID to find
   * @returns Promise<Book | undefined> Found book or undefined
   */
  async getBookById(id: number): Promise<Book | undefined> {
    try {
      if (this.isOnline) {
        const response = await api.get<Book>(`/books/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('API hatası:', error);
      this.isOnline = false;
    }
    return this.books.find(book => book.id === id);
  }

  /**
   * Adds a new book to the system
   * @param book Book data without ID
   * @returns Promise<Book> Added book with generated ID
   */
  async addBook(book: Omit<Book, 'id'>): Promise<Book> {
    const newBook = {
      ...book,
      id: Math.max(...this.books.map(b => b.id)) + 1
    };

    if (this.isOnline) {
      try {
        const response = await api.post<Book>('/books', newBook);
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'add',
          data: newBook,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'add',
        data: newBook,
        timestamp: Date.now()
      });
    }

    this.books.push(newBook);
    return newBook;
  }

  /**
   * Updates an existing book
   * @param id Book ID to update
   * @param book Partial book data to update
   * @returns Promise<Book | undefined> Updated book or undefined if not found
   */
  async updateBook(id: number, book: Partial<Book>): Promise<Book | undefined> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    const updatedBook = {
      ...this.books[index],
      ...book,
      id
    };

    if (this.isOnline) {
      try {
        const response = await api.put<Book>(`/books/${id}`, updatedBook);
        this.books[index] = response.data;
        return response.data;
      } catch (error) {
        this.isOnline = false;
        this.pendingChanges.push({
          type: 'update',
          data: updatedBook,
          id,
          timestamp: Date.now()
        });
      }
    } else {
      this.pendingChanges.push({
        type: 'update',
        data: updatedBook,
        id,
        timestamp: Date.now()
      });
    }

    this.books[index] = updatedBook;
    return updatedBook;
  }

  /**
   * Deletes a book by ID
   * @param id Book ID to delete
   * @returns Promise<boolean> Success status
   */
  async deleteBook(id: number): Promise<boolean> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return false;

    if (this.isOnline) {
      try {
        await api.delete(`/books/${id}`);
        this.books.splice(index, 1);
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

    this.books.splice(index, 1);
    return true;
  }

  /**
   * Filters books by author ID
   * @param authorId Author ID to filter by
   * @returns Book[] List of books by the specified author
   */
  getBooksByAuthor(authorId: number): Book[] {
    return this.books.filter(book => book.author.id === authorId);
  }

  /**
   * Filters books by publisher ID
   * @param publisherId Publisher ID to filter by
   * @returns Book[] List of books by the specified publisher
   */
  getBooksByPublisher(publisherId: number): Book[] {
    return this.books.filter(book => book.publisher.id === publisherId);
  }

  /**
   * Filters books by category ID
   * @param categoryId Category ID to filter by
   * @returns Book[] List of books in the specified category
   */
  getBooksByCategory(categoryId: number): Book[] {
    return this.books.filter(book => 
      book.categories.some(category => category.id === categoryId)
    );
  }
}

export const bookService = new BookService(); 