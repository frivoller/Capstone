import React, { useState, useEffect } from 'react';
import { bookService, Book } from '../services/bookService';
import { authorService, Author } from '../services/authorService';
import { publisherService, Publisher } from '../services/publisherService';
import { categoryService, Category } from '../services/categoryService';
import { toast } from 'react-hot-toast';

/**
 * Interface for book form data
 * Contains all fields needed to create or update a book
 */
interface BookFormData {
  name: string;
  publicationYear: number;
  stock: number;
  authorId: number;
  publisherId: number;
  categoryIds: number[];
}

// Initial empty form data with default values
const initialFormData: BookFormData = {
  name: '',
  publicationYear: new Date().getFullYear(),
  stock: 0,
  authorId: 0,
  publisherId: 0,
  categoryIds: []
};

/**
 * Books component for managing books in the library
 * Handles listing, adding, editing and deleting books
 */
const Books: React.FC = () => {
  // State for books and related entities
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load all required data on component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads all necessary data for the books page
   * Fetches books, authors, publishers and categories
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, authorsData, publishersData, categoriesData] = await Promise.all([
        bookService.getAllBooks(),
        authorService.getAllAuthors(),
        publisherService.getAllPublishers(),
        categoryService.getAllCategories()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission for creating or updating a book
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const author = authors.find(a => a.id === formData.authorId);
      const publisher = publishers.find(p => p.id === formData.publisherId);
      const selectedCategories = categories.filter(c => formData.categoryIds.includes(c.id));

      // Validate required fields
      if (!author || !publisher || selectedCategories.length === 0) {
        toast.error('Lütfen tüm alanları doldurun.');
        return;
      }

      // Prepare book data object
      const bookData = {
        name: formData.name,
        publicationYear: formData.publicationYear,
        stock: formData.stock,
        author,
        publisher,
        categories: selectedCategories
      };

      // Update existing book or create new one
      if (editingId) {
        const updated = await bookService.updateBook(editingId, bookData);
        if (updated) {
          toast.success('Kitap başarıyla güncellendi.');
          await loadData();
          resetForm();
        }
      } else {
        await bookService.addBook(bookData);
        toast.success('Kitap başarıyla eklendi.');
        await loadData();
        resetForm();
      }
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  /**
   * Sets up form for editing an existing book
   * @param book - Book object to edit
   */
  const handleEdit = (book: Book) => {
    setFormData({
      name: book.name,
      publicationYear: book.publicationYear,
      stock: book.stock,
      authorId: book.author.id,
      publisherId: book.publisher.id,
      categoryIds: book.categories.map(c => c.id)
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  /**
   * Handles book deletion with confirmation
   * @param id - ID of book to delete
   */
  const handleDelete = async (id: number) => {
    if (window.confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        const success = await bookService.deleteBook(id);
        if (success) {
          toast.success('Kitap başarıyla silindi.');
          await loadData();
        } else {
          toast.error('Kitap silinirken bir hata oluştu.');
        }
      } catch (error) {
        toast.error('Kitap silinirken bir hata oluştu.');
      }
    }
  };

  /**
   * Resets form state and closes the form
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  // Show loading indicator while data is being fetched
  if (loading) {
    return <div className="flex justify-center items-center h-full">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kitaplar</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'İptal' : 'Yeni Kitap'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Kitabı Düzenle' : 'Yeni Kitap'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kitap Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yayın Yılı</label>
                <input
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stok</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yazar</label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Yazar Seçin</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yayınevi</label>
                <select
                  value={formData.publisherId}
                  onChange={(e) => setFormData({ ...formData, publisherId: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Yayınevi Seçin</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategoriler</label>
                <select
                  multiple
                  value={formData.categoryIds.map(id => id.toString())}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryIds: Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Kitap Adı</th>
              <th className="px-4 py-2 border">Yazar</th>
              <th className="px-4 py-2 border">Yayınevi</th>
              <th className="px-4 py-2 border">Yayın Yılı</th>
              <th className="px-4 py-2 border">Stok</th>
              <th className="px-4 py-2 border">Kategoriler</th>
              <th className="px-4 py-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{book.id}</td>
                <td className="px-4 py-2 border">{book.name}</td>
                <td className="px-4 py-2 border">{book.author.name}</td>
                <td className="px-4 py-2 border">{book.publisher.name}</td>
                <td className="px-4 py-2 border">{book.publicationYear}</td>
                <td className="px-4 py-2 border">{book.stock}</td>
                <td className="px-4 py-2 border">
                  {book.categories.map(c => c.name).join(', ')}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books; 