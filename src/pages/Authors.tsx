import React, { useState, useEffect } from 'react';
import { authorService, Author } from '../services/authorService';
import { toast } from 'react-hot-toast';

interface AuthorFormData {
  name: string;
  birthDate: string;
  country: string;
  biography: string;
}

const initialFormData: AuthorFormData = {
  name: '',
  birthDate: '',
  country: '',
  biography: ''
};

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AuthorFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await authorService.getAllAuthors();
      setAuthors(data);
    } catch (error) {
      toast.error('Yazarlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await authorService.updateAuthor(editingId, formData);
        if (updated) {
          toast.success('Yazar başarıyla güncellendi.');
          await loadData();
          resetForm();
        }
      } else {
        await authorService.addAuthor(formData);
        toast.success('Yazar başarıyla eklendi.');
        await loadData();
        resetForm();
      }
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleEdit = (author: Author) => {
    setFormData({
      name: author.name,
      birthDate: author.birthDate,
      country: author.country,
      biography: author.biography
    });
    setEditingId(author.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu yazarı silmek istediğinizden emin misiniz?')) {
      try {
        const success = await authorService.deleteAuthor(id);
        if (success) {
          toast.success('Yazar başarıyla silindi.');
          await loadData();
        } else {
          toast.error('Yazar silinirken bir hata oluştu.');
        }
      } catch (error) {
        toast.error('Yazar silinirken bir hata oluştu.');
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
        <h1 className="text-2xl font-bold">Yazarlar</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'İptal' : 'Yeni Yazar'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Yazarı Düzenle' : 'Yeni Yazar'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ülke</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Biyografi</label>
                <textarea
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
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
              <th className="px-4 py-2 border">Ad Soyad</th>
              <th className="px-4 py-2 border">Doğum Tarihi</th>
              <th className="px-4 py-2 border">Ülke</th>
              <th className="px-4 py-2 border">Biyografi</th>
              <th className="px-4 py-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{author.id}</td>
                <td className="px-4 py-2 border">{author.name}</td>
                <td className="px-4 py-2 border">{author.birthDate}</td>
                <td className="px-4 py-2 border">{author.country}</td>
                <td className="px-4 py-2 border">{author.biography}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(author)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(author.id)}
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

export default Authors; 