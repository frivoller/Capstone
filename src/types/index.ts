export interface Author {
  id: number;
  name: string;
}

export interface Publisher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  authorId: number;
  publisherId: number;
  categoryId: number;
  stock: number;
  author?: Author;
  publisher?: Publisher;
  category?: Category;
}

export interface Borrow {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string;
  returnDate: string | null;
  book?: Book;
  user?: { id: number; name: string };
} 