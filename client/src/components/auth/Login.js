import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom"; // Updated import
import "../../styles/Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // useNavigate instead of useNavigate

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token); // Store the token in localStorage
      navigate("/dashboard"); // Navigate to the dashboard after successful login
    } catch (error) {
      alert("Login failed");
      console.error(error); // Log error for debugging
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
