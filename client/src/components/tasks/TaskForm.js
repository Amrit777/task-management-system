// client/src/components/tasks/TaskForm.js
import React, { useState } from 'react';
import API from '../../api';
import { useNavigate } from 'react-router-dom';

const TaskForm = ({ initialData = {} }) => {
  // initialData can be used for editing an existing task (if provided)
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'To Do',
    priority: initialData.priority || 'Medium',
    dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
    assignedTo: initialData.assignedTo || '',
    projectId: initialData.projectId || '',
  });
  const history = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData.id) {
        // Update existing task
        await API.put(`/tasks/${initialData.id}`, form);
      } else {
        // Create new task
        await API.post('/tasks', form);
      }
      history.push('/tasks');
    } catch (error) {
      console.error('Task submission error:', error);
      alert('There was an error submitting the task');
    }
  };

  return (
    <div>
      <h2>{initialData.id ? 'Edit Task' : 'New Task'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          type="text"
          placeholder="Task Title"
          value={form.title}
          onChange={handleChange}
          required
        /><br/>
        <textarea
          name="description"
          placeholder="Task Description"
          value={form.description}
          onChange={handleChange}
        /><br/>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select><br/>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select><br/>
        <input
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        /><br/>
        <input
          name="assignedTo"
          type="text"
          placeholder="Assigned To (User ID)"
          value={form.assignedTo}
          onChange={handleChange}
        /><br/>
        <input
          name="projectId"
          type="text"
          placeholder="Project ID"
          value={form.projectId}
          onChange={handleChange}
        /><br/>
        <button type="submit">
          {initialData.id ? 'Update Task' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
