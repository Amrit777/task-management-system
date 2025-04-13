import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TaskBoard from './components/tasks/TaskBoard';
import Register from './components/auth/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Protect these routes later with PrivateRoute or auth logic */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={<div>Welcome to Task Manager! Please Login.</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
