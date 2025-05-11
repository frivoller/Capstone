import React, { useState, useEffect } from 'react';
import { publisherService, Publisher } from '../services/publisherService';
import { toast } from 'react-hot-toast';

interface PublisherFormData {
  name: string;
  establishmentYear: number;
  address: string;
  email: string;
  phone: string;
}

const initialFormData: PublisherFormData = {
  name: '',
  establishmentYear: new Date().getFullYear(),
  address: '',
  email: '',
  phone: ''
};

const Publishers: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PublisherFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await publisherService.getAllPublishers();
      setPublishers(data);
    } catch (error) {
      toast.error('Yayınevleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await publisherService.updatePublisher(editingId, formData);
        if (updated) {
          toast.success('Yayınevi başarıyla güncellendi.');
          await loadData();
          resetForm();
        }
      } else {
        await publisherService.addPublisher(formData);
        toast.success('Yayınevi başarıyla eklendi.');
        await loadData();
        resetForm();
      }
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleEdit = (publisher: Publisher) => {
    setFormData({
      name: publisher.name,
      establishmentYear: publisher.establishmentYear,
      address: publisher.address,
      email: publisher.email || '',
      phone: publisher.phone || ''
    });
    setEditingId(publisher.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu yayınevini silmek istediğinizden emin misiniz?')) {
      try {
        const success = await publisherService.deletePublisher(id);
        if (success) {
          toast.success('Yayınevi başarıyla silindi.');
          await loadData();
        } else {
          toast.error('Yayınevi silinirken bir hata oluştu.');
        }
      } catch (error) {
        toast.error('Yayınevi silinirken bir hata oluştu.');
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
        <h1 className="text-2xl font-bold">Yayınevleri</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'İptal' : 'Yeni Yayınevi'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Yayınevini Düzenle' : 'Yeni Yayınevi'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Yayınevi Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kuruluş Yılı</label>
                <input
                  type="number"
                  value={formData.establishmentYear}
                  onChange={(e) => setFormData({ ...formData, establishmentYear: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adres</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <th className="px-4 py-2 border">Yayınevi Adı</th>
              <th className="px-4 py-2 border">Kuruluş Yılı</th>
              <th className="px-4 py-2 border">Adres</th>
              <th className="px-4 py-2 border">E-posta</th>
              <th className="px-4 py-2 border">Telefon</th>
              <th className="px-4 py-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((publisher) => (
              <tr key={publisher.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{publisher.id}</td>
                <td className="px-4 py-2 border">{publisher.name}</td>
                <td className="px-4 py-2 border">{publisher.establishmentYear}</td>
                <td className="px-4 py-2 border">{publisher.address}</td>
                <td className="px-4 py-2 border">{publisher.email}</td>
                <td className="px-4 py-2 border">{publisher.phone}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(publisher)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(publisher.id)}
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

export default Publishers; 