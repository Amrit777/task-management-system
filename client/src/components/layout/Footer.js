import React from 'react';

const Footer = () => (
  <footer className="fixed bottom-0 left-64 w-[calc(100%-16rem)] bg-white text-center py-2 border-t">
    <p className="text-sm text-gray-500">© {new Date().getFullYear()} Task Management System</p>
  </footer>
);

export default Footer;
