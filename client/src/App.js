import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import TaskBoard from "./components/tasks/TaskBoard";
import TaskForm from "./components/tasks/TaskForm";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes inside layout */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
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
          path="/tasks/create"
          element={
            <Layout>
              <TaskForm />
            </Layout>
          }
        />
        <Route
          path="/tasks/edit/:id"
          element={
            <Layout>
              <TaskForm isEditing={true} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
