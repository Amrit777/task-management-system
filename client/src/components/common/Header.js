// client/src/components/common/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

const Header = () => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#ddd' }}>
      <div>
        <Link to="/">Task Manager</Link>
      </div>
      <nav>
        <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/projects" style={{ marginRight: '1rem' }}>Projects</Link>
        <Link to="/tasks" style={{ marginRight: '1rem' }}>Tasks</Link>
      </nav>
      <NotificationBell />
    </header>
  );
};

export default Header;
