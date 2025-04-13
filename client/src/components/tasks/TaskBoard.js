// client/src/components/tasks/TaskBoard.js
import React, { useEffect, useState } from 'react';
import API from '../../api';
import '../../styles/TaskBoard.css';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      const res = await API.get('/tasks');
      setTasks(res.data);
    }
    loadTasks();
  }, []);

  return (
    <div>
      <h2>Task Board</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {['To Do', 'In Progress', 'Done'].map((status) => (
          <div key={status}>
            <h3>{status}</h3>
            <ul>
              {tasks.filter((task) => task.status === status).map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
