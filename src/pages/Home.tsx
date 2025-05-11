import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Kütüphane Yönetim Sistemine Hoş Geldiniz
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Link to="/publishers" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Yayımcılar</h2>
          <p className="text-gray-600">Yayımcı bilgilerini yönetin</p>
        </Link>
        <Link to="/categories" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Kategoriler</h2>
          <p className="text-gray-600">Kitap kategorilerini yönetin</p>
        </Link>
        <Link to="/books" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Kitaplar</h2>
          <p className="text-gray-600">Kitap bilgilerini yönetin</p>
        </Link>
        <Link to="/authors" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Yazarlar</h2>
          <p className="text-gray-600">Yazar bilgilerini yönetin</p>
        </Link>
        <Link to="/borrows" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Kitap Ödünç</h2>
          <p className="text-gray-600">Kitap ödünç alma işlemlerini yönetin</p>
        </Link>
      </div>
    </div>
  );
};

export default Home; 