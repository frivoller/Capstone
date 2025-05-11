import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home Page Component
 * Serves as the landing page for the library management system
 * Provides navigation cards to different sections of the application
 */
const Home: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Main title */}
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Kütüphane Yönetim Sistemine Hoş Geldiniz</h1>
      
      {/* Navigation cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Books section card */}
        <Link to="/books" className="bg-blue-100 hover:bg-blue-200 p-6 rounded-lg shadow-md transition-all">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">Kitaplar</h2>
          <p className="text-gray-700">Tüm kitapları görüntüleyin, yeni kitap ekleyin, düzenleyin veya silin.</p>
        </Link>
        
        {/* Authors section card */}
        <Link to="/authors" className="bg-green-100 hover:bg-green-200 p-6 rounded-lg shadow-md transition-all">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Yazarlar</h2>
          <p className="text-gray-700">Yazarları görüntüleyin, yeni yazar ekleyin, düzenleyin veya silin.</p>
        </Link>
        
        {/* Publishers section card */}
        <Link to="/publishers" className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-lg shadow-md transition-all">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Yayınevleri</h2>
          <p className="text-gray-700">Yayınevlerini görüntüleyin, yeni yayınevi ekleyin, düzenleyin veya silin.</p>
        </Link>
        
        {/* Categories section card */}
        <Link to="/categories" className="bg-purple-100 hover:bg-purple-200 p-6 rounded-lg shadow-md transition-all">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Kategoriler</h2>
          <p className="text-gray-700">Kitap kategorilerini görüntüleyin, yeni kategori ekleyin, düzenleyin veya silin.</p>
        </Link>
        
        {/* Borrows section card */}
        <Link to="/borrows" className="bg-red-100 hover:bg-red-200 p-6 rounded-lg shadow-md transition-all">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Ödünç Alma</h2>
          <p className="text-gray-700">Ödünç alınan kitapları görüntüleyin, yeni ödünç alma kaydı ekleyin, düzenleyin veya silin.</p>
        </Link>
        
        {/* System status card */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Sistem Durumu</h2>
          <p className="text-gray-700 mb-2">API Durumu: <span className="text-green-600 font-medium">Çevrimiçi</span></p>
          <p className="text-gray-700">Veritabanı: <span className="text-green-600 font-medium">Bağlı</span></p>
        </div>
      </div>
      
      {/* Quick start guide section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-700 mb-2">Hızlı Başlangıç</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Yeni kitap eklemek için "Kitaplar" sayfasına gidin ve "Yeni Kitap" butonuna tıklayın.</li>
          <li>Kitap ödünç vermek için "Ödünç Alma" sayfasına gidin ve "Yeni Ödünç" butonuna tıklayın.</li>
          <li>İstatistikleri görmek için ana sayfadaki "Sistem Durumu" kartına bakın.</li>
        </ul>
      </div>
    </div>
  );
};

export default Home; 