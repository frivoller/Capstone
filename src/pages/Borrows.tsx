import React, { useState, useEffect } from 'react';
import { borrowService, bookService } from '../services/api';
import { Borrow, Book } from '../types';
import toast from 'react-hot-toast';

const Borrows: React.FC = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState({
    bookId: '',
    userId: '',
    borrowDate: '',
    returnDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [borrowsRes, booksRes] = await Promise.all([
        borrowService.getAll(),
        bookService.getAll(),
      ]);
      setBorrows(borrowsRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const borrowData = {
        bookId: parseInt(formData.bookId),
        userId: parseInt(formData.userId),
        borrowingDate: formData.borrowDate,
        returnDate: formData.returnDate || null
      };

      if (editingId) {
        await borrowService.update(editingId, borrowData);
        toast.success('Ödünç kaydı başarıyla güncellendi');
      } else {
        await borrowService.create(borrowData);
        toast.success('Ödünç kaydı başarıyla eklendi');
      }
      setFormData({
        bookId: '',
        userId: '',
        borrowDate: new Date().toISOString().split('T')[0],
        returnDate: '',
      });
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleEdit = (borrow: Borrow) => {
    setFormData({
      bookId: borrow.book.id.toString(),
      userId: borrow.user.id.toString(),
      borrowDate: borrow.borrowingDate.split('T')[0],
      returnDate: borrow.returnDate ? borrow.returnDate.split('T')[0] : '',
    });
    setEditingId(borrow.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ödünç kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await borrowService.delete(id);
        toast.success('Ödünç kaydı başarıyla silindi');
        loadData();
      } catch (error) {
        toast.error('Silme işlemi sırasında bir hata oluştu');
      }
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await borrowService.update(id, { returnDate: new Date().toISOString() });
      toast.success('Kitap başarıyla iade edildi');
      loadData();
    } catch (error) {
      toast.error('İade işlemi sırasında bir hata oluştu');
    }
  };

  const filteredBorrows = borrows.filter((borrow) => {
    return (
      (filter.bookId === '' || borrow.book.id.toString() === filter.bookId) &&
      (filter.userId === '' || borrow.user.id.toString() === filter.userId) &&
      (filter.borrowDate === '' || borrow.borrowingDate.startsWith(filter.borrowDate)) &&
      (filter.returnDate === '' || (borrow.returnDate && borrow.returnDate.startsWith(filter.returnDate)))
    );
  });

  if (loading) {
    return <div className="text-center">Yükleniyor...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ödünç Kayıtları</h1>
        <button
          onClick={() => {
            setFormData({
              bookId: '',
              userId: '',
              borrowDate: new Date().toISOString().split('T')[0],
              returnDate: '',
            });
            setEditingId(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Ödünç Kaydı
        </button>
      </div>

      {/* Filtre Alanları */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filter.bookId}
            onChange={e => setFilter({ ...filter, bookId: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Kitap Seçin</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>{book.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Kullanıcı ID"
            value={filter.userId}
            onChange={e => setFilter({ ...filter, userId: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={filter.borrowDate}
            onChange={e => setFilter({ ...filter, borrowDate: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={filter.returnDate}
            onChange={e => setFilter({ ...filter, returnDate: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Ekleme/Düzenleme Formu */}
      {(editingId || formData.bookId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Ödünç Kaydı Düzenle' : 'Yeni Ödünç Kaydı'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={formData.bookId}
              onChange={e => setFormData({ ...formData, bookId: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Kitap Seçin</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>{book.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Kullanıcı ID"
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="date"
              value={formData.borrowDate}
              onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="date"
              value={formData.returnDate}
              onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="col-span-full flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    bookId: '',
                    userId: '',
                    borrowDate: new Date().toISOString().split('T')[0],
                    returnDate: '',
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kitap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödünç Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İade Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBorrows.map((borrow) => (
                <tr key={borrow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{borrow.book?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{borrow.user?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(borrow.borrowingDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      {!borrow.returnDate && (
                        <button
                          onClick={() => handleReturn(borrow.id)}
                          className="text-green-600 hover:text-green-900"
                          title="İade Et"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(borrow)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Düzenle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(borrow.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
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

export default Borrows; 