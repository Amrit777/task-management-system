// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import TaskBoard from "./components/tasks/TaskBoard";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} /> {/* Use element instead of component */}
          {/* Protect these routes appropriately */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Use element */}
          <Route path="/tasks" element={<TaskBoard />} /> {/* Use element */}
          <Route path="/" element={<div>Welcome to Task Manager! Please Login.</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
