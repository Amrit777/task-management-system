import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TaskBoard from './components/tasks/TaskBoard';
import ProjectList from './components/projects/ProjectList';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/tasks"
          element={
            <Layout>
              <TaskBoard />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <ProjectList />
            </Layout>
          }
        />
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-2xl">Welcome to Task Manager! Please Login.</div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
