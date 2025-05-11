import React, { useState, useEffect } from 'react';
import { bookService, authorService, publisherService, categoryService } from '../services/api';
import { Book, Author, Publisher, Category } from '../types';
import toast from 'react-hot-toast';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    publisherId: '',
    categoryId: '',
    stock: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState({
    title: '',
    stock: '',
    authorId: '',
    publisherId: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, authorsRes, publishersRes, categoriesRes] = await Promise.all([
        bookService.getAll(),
        authorService.getAll(),
        publisherService.getAll(),
        categoryService.getAll(),
      ]);
      setBooks(booksRes.data);
      setAuthors(authorsRes.data);
      setPublishers(publishersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        ...formData,
        authorId: parseInt(formData.authorId),
        publisherId: parseInt(formData.publisherId),
        categoryId: parseInt(formData.categoryId),
        stock: parseInt(formData.stock),
      };

      if (editingId) {
        await bookService.update(editingId, bookData);
        toast.success('Kitap başarıyla güncellendi');
      } else {
        await bookService.create(bookData);
        toast.success('Kitap başarıyla eklendi');
      }
      setFormData({
        title: '',
        authorId: '',
        publisherId: '',
        categoryId: '',
        stock: '',
      });
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleEdit = (book: Book) => {
    setFormData({
      title: book.title,
      authorId: book.authorId.toString(),
      publisherId: book.publisherId.toString(),
      categoryId: book.categoryId.toString(),
      stock: book.stock.toString(),
    });
    setEditingId(book.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        await bookService.delete(id);
        toast.success('Kitap başarıyla silindi');
        loadData();
      } catch (error) {
        toast.error('Silme işlemi sırasında bir hata oluştu');
      }
    }
  };

  // Filtreleme
  const filteredBooks = books.filter((book) => {
    return (
      (filter.title === '' || book.title.toLowerCase().includes(filter.title.toLowerCase())) &&
      (filter.stock === '' || book.stock.toString() === filter.stock) &&
      (filter.authorId === '' || book.authorId.toString() === filter.authorId) &&
      (filter.publisherId === '' || book.publisherId.toString() === filter.publisherId) &&
      (filter.categoryId === '' || book.categoryId.toString() === filter.categoryId)
    );
  });

  if (loading) {
    return <div className="text-center">Yükleniyor...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kitaplar</h1>
        <button
          onClick={() => {
            setFormData({
              title: '',
              authorId: '',
              publisherId: '',
              categoryId: '',
              stock: '',
            });
            setEditingId(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Kitap Ekle
        </button>
      </div>

      {/* Filtre Alanları */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Kitap Adı"
            value={filter.title}
            onChange={e => setFilter({ ...filter, title: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Stok"
            value={filter.stock}
            onChange={e => setFilter({ ...filter, stock: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filter.authorId}
            onChange={e => setFilter({ ...filter, authorId: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Yazar Seçin</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select
            value={filter.publisherId}
            onChange={e => setFilter({ ...filter, publisherId: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Yayınevi Seçin</option>
            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filter.categoryId}
            onChange={e => setFilter({ ...filter, categoryId: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Kategori Seçin</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Ekleme/Düzenleme Formu */}
      {(editingId || formData.title) && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Kitap Düzenle' : 'Yeni Kitap Ekle'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Kitap Adı"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="number"
              placeholder="Stok"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              min="0"
            />
            <select
              value={formData.authorId}
              onChange={e => setFormData({ ...formData, authorId: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Yazar Seçin</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select
              value={formData.publisherId}
              onChange={e => setFormData({ ...formData, publisherId: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Yayınevi Seçin</option>
              {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="col-span-full flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    authorId: '',
                    publisherId: '',
                    categoryId: '',
                    stock: '',
                  });
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                {editingId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kitap Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yazar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yayınevi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.publisher?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.category?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Books; 