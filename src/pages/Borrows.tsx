import React, { useState, useEffect } from 'react';
import { borrowService, Borrow } from '../services/borrowService';
import { bookService, Book } from '../services/bookService';
import { toast } from 'react-hot-toast';

interface BorrowFormData {
  borrowerName: string;
  borrowerMail: string;
  borrowingDate: string;
  returnDate: string;
  bookId: number;
}

const initialFormData: BorrowFormData = {
  borrowerName: '',
  borrowerMail: '',
  borrowingDate: new Date().toISOString().split('T')[0],
  returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bookId: 0
};

const Borrows: React.FC = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BorrowFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [borrowsData, booksData] = await Promise.all([
        borrowService.getAllBorrows(),
        bookService.getAllBooks()
      ]);
      setBorrows(borrowsData);
      setBooks(booksData);
    } catch (error) {
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Seçilen kitabı bul
    const selectedBook = books.find(book => book.id === formData.bookId);
    if (!selectedBook) {
      toast.error('Lütfen geçerli bir kitap seçin.');
      return;
    }

    try {
      if (editingId) {
        const borrowToUpdate = {
          borrowerName: formData.borrowerName,
          borrowerMail: formData.borrowerMail,
          borrowingDate: formData.borrowingDate,
          returnDate: formData.returnDate,
          book: selectedBook
        };
        
        const updated = await borrowService.updateBorrow(editingId, borrowToUpdate);
        if (updated) {
          toast.success('Ödünç alma kaydı başarıyla güncellendi.');
          await loadData();
          resetForm();
        }
      } else {
        if (selectedBook.stock <= 0) {
          toast.error('Bu kitap stokta yok.');
          return;
        }
        
        const newBorrow = {
          borrowerName: formData.borrowerName,
          borrowerMail: formData.borrowerMail,
          borrowingDate: formData.borrowingDate,
          returnDate: formData.returnDate,
          book: selectedBook
        };
        
        await borrowService.addBorrow(newBorrow);
        
        // Kitap stoğunu güncelle
        await bookService.updateBook(selectedBook.id, {
          ...selectedBook,
          stock: selectedBook.stock - 1
        });
        
        toast.success('Kitap başarıyla ödünç alındı.');
        await loadData();
        resetForm();
      }
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleEdit = (borrow: Borrow) => {
    setFormData({
      borrowerName: borrow.borrowerName,
      borrowerMail: borrow.borrowerMail,
      borrowingDate: borrow.borrowingDate,
      returnDate: borrow.returnDate,
      bookId: borrow.book.id
    });
    setEditingId(borrow.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ödünç alma kaydını silmek istediğinizden emin misiniz?')) {
      try {
        // Ödünç kaydını bul
        const borrowToDelete = borrows.find(b => b.id === id);
        if (!borrowToDelete) return;
        
        const success = await borrowService.deleteBorrow(id);
        if (success) {
          // Kitap stoğunu güncelle
          const book = books.find(b => b.id === borrowToDelete.book.id);
          if (book) {
            await bookService.updateBook(book.id, {
              ...book,
              stock: book.stock + 1
            });
          }
          
          toast.success('Ödünç alma kaydı başarıyla silindi.');
          await loadData();
        } else {
          toast.error('Ödünç alma kaydı silinirken bir hata oluştu.');
        }
      } catch (error) {
        toast.error('Ödünç alma kaydı silinirken bir hata oluştu.');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ödünç Alma İşlemleri</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'İptal' : 'Yeni Ödünç'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Ödünç Kaydını Düzenle' : 'Yeni Ödünç Alma'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ödünç Alan Adı</label>
                <input
                  type="text"
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <input
                  type="email"
                  value={formData.borrowerMail}
                  onChange={(e) => setFormData({ ...formData, borrowerMail: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ödünç Alma Tarihi</label>
                <input
                  type="date"
                  value={formData.borrowingDate}
                  onChange={(e) => setFormData({ ...formData, borrowingDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">İade Tarihi</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Kitap</label>
                <select
                  value={formData.bookId}
                  onChange={(e) => setFormData({ ...formData, bookId: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Kitap Seçin</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id} disabled={book.stock <= 0 && !editingId}>
                      {book.name} - {book.author.name} ({book.stock} adet stokta)
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
                {editingId ? 'Güncelle' : 'Ödünç Al'}
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
              <th className="px-4 py-2 border">Ödünç Alan</th>
              <th className="px-4 py-2 border">E-posta</th>
              <th className="px-4 py-2 border">Kitap</th>
              <th className="px-4 py-2 border">Yazar</th>
              <th className="px-4 py-2 border">Ödünç Alma Tarihi</th>
              <th className="px-4 py-2 border">İade Tarihi</th>
              <th className="px-4 py-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow) => (
              <tr key={borrow.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{borrow.id}</td>
                <td className="px-4 py-2 border">{borrow.borrowerName}</td>
                <td className="px-4 py-2 border">{borrow.borrowerMail}</td>
                <td className="px-4 py-2 border">{borrow.book.name}</td>
                <td className="px-4 py-2 border">{borrow.book.author.name}</td>
                <td className="px-4 py-2 border">{borrow.borrowingDate}</td>
                <td className="px-4 py-2 border">{borrow.returnDate}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(borrow)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(borrow.id)}
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

export default Borrows;