import React, { useState, useRef, useEffect } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b h-16 px-6 flex justify-between items-center shadow">
      <div className="text-lg font-semibold">Welcome Back!</div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-2 text-sm font-medium focus:outline-none"
        >
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
          <span>User</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded border z-10">
            <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
              Profile
            </a>
            <a href="/projects" className="block px-4 py-2 hover:bg-gray-100">
              Projects
            </a>
            <a href="/tasks" className="block px-4 py-2 hover:bg-gray-100">
              Tasks
            </a>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
