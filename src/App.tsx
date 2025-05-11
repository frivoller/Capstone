import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Publishers from './pages/Publishers';
import Categories from './pages/Categories';
import Borrows from './pages/Borrows';
import './App.css';

/**
 * Main Application Component
 * Sets up routing for the entire application
 * Wraps all routes in the MainLayout component
 */
const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />
          {/* Books management route */}
          <Route path="/books" element={<Books />} />
          {/* Authors management route */}
          <Route path="/authors" element={<Authors />} />
          {/* Publishers management route */}
          <Route path="/publishers" element={<Publishers />} />
          {/* Categories management route */}
          <Route path="/categories" element={<Categories />} />
          {/* Borrows management route */}
          <Route path="/borrows" element={<Borrows />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
 