import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <aside className="w-64 h-screen bg-gray-800 text-white flex-shrink-0">
    <div className="p-4 text-xl font-bold border-b border-gray-700">
      Task Manager
    </div>
    <nav className="flex flex-col mt-4 space-y-2 p-4">
      <Link to="/dashboard" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
      <Link to="/tasks" className="hover:bg-gray-700 p-2 rounded">Tasks</Link>
      <Link to="/projects" className="hover:bg-gray-700 p-2 rounded">Projects</Link>
    </nav>
  </aside>
);

export default Sidebar;
