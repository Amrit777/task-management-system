import React from "react";

const Header = () => (
  <header className="sticky top-0 z-10 bg-white border-b h-16 px-6 shadow flex justify-between items-center">
    <div className="text-lg font-semibold">Welcome Back!</div>

    {/* Group container for hover effect */}
    <div className="relative group">
      <button className="flex items-center space-x-2 text-sm font-medium">
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
        <span>User</span>
      </button>

      {/* Dropdown menu - shown on hover */}
      <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded border z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200">
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
    </div>
  </header>
);

export default Header;
