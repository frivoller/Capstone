import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Publishers from './pages/Publishers';
import Categories from './pages/Categories';
import Authors from './pages/Authors';
import Books from './pages/Books';
import Borrows from './pages/Borrows';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="publishers" element={<Publishers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="authors" element={<Authors />} />
          <Route path="books" element={<Books />} />
          <Route path="borrows" element={<Borrows />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
