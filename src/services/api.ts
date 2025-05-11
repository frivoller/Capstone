import axios from 'axios';
import { Book, Author, Publisher, Category, Borrow } from '../types';

const API_BASE = 'https://vocational-vivyan-frivoller-6b62a16b.koyeb.app/api/v1';

export const bookService = {
  getAll: () => axios.get<Book[]>(`${API_BASE}/books`),
  getById: (id: number) => axios.get<Book>(`${API_BASE}/books/${id}`),
  create: (data: Partial<Book>) => axios.post(`${API_BASE}/books`, data),
  update: (id: number, data: Partial<Book>) => axios.put(`${API_BASE}/books/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/books/${id}`),
};

export const authorService = {
  getAll: () => axios.get<Author[]>(`${API_BASE}/authors`),
  getById: (id: number) => axios.get<Author>(`${API_BASE}/authors/${id}`),
  create: (data: Partial<Author>) => axios.post(`${API_BASE}/authors`, data),
  update: (id: number, data: Partial<Author>) => axios.put(`${API_BASE}/authors/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/authors/${id}`),
};

export const publisherService = {
  getAll: () => axios.get<Publisher[]>(`${API_BASE}/publishers`),
  getById: (id: number) => axios.get<Publisher>(`${API_BASE}/publishers/${id}`),
  create: (data: Partial<Publisher>) => axios.post(`${API_BASE}/publishers`, data),
  update: (id: number, data: Partial<Publisher>) => axios.put(`${API_BASE}/publishers/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/publishers/${id}`),
};

export const categoryService = {
  getAll: () => axios.get<Category[]>(`${API_BASE}/categories`),
  getById: (id: number) => axios.get<Category>(`${API_BASE}/categories/${id}`),
  create: (data: Partial<Category>) => axios.post(`${API_BASE}/categories`, data),
  update: (id: number, data: Partial<Category>) => axios.put(`${API_BASE}/categories/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/categories/${id}`),
};

export const borrowService = {
  getAll: () => axios.get<Borrow[]>(`${API_BASE}/borrows`),
  getById: (id: number) => axios.get<Borrow>(`${API_BASE}/borrows/${id}`),
  create: (data: Partial<Borrow>) => axios.post(`${API_BASE}/borrows`, data),
  update: (id: number, data: Partial<Borrow>) => axios.put(`${API_BASE}/borrows/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/borrows/${id}`),
}; 