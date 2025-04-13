// client/src/components/tasks/TaskDetail.js
import React, { useEffect, useState } from 'react';
import API from '../../api';
import { useParams } from 'react-router-dom';

const TaskDetail = () => {
  const { id } = useParams(); // Task ID
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await API.get('/tasks');
        // Assuming res.data is an array of tasks. Ideally, you would have an endpoint for a single task detail.
        const foundTask = res.data.find((t) => t.id === Number(id));
        setTask(foundTask);
      } catch (error) {
        console.error('Error fetching task', error);
      }
    };
    fetchTask();
  }, [id]);

  if (!task) return <p>Loading task details...</p>;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
      {task.dueDate && (
        <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
      )}
      {/* Additional details like assigned user, comments, attachments can be added here */}
    </div>
  );
};

export default TaskDetail;
