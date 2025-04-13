import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div>
    <Sidebar />
    <div className="ml-64">
      <Header />
      <main className="mt-16 p-6 min-h-screen bg-gray-50">{children}</main>
      <Footer />
    </div>
  </div>
);

export default Layout;
