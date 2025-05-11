export interface Author {
  id: number;
  name: string;
  birthDate?: string;
  country?: string;
}

export interface Publisher {
  id: number;
  name: string;
  establishmentYear?: number;
  address?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  name: string;
  publicationYear: number;
  stock: number;
  author: Author;
  publisher: Publisher;
  categories?: Category[];
}

export interface Borrow {
  id: number;
  borrowerName: string;
  borrowerMail: string;
  borrowingDate: string;
  returnDate: string | null;
  book: Book;
} 