import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import API from "../../api";
import TaskCard from "./TaskCard";
import { useNavigate } from "react-router-dom";

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks on mount
  useEffect(() => {
    API.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(console.error);
  }, []);

  // Filter tasks by status
  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  // Handle drag and drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Find task
    const task = tasks.find((t) => t.id.toString() === draggableId);
    if (!task) return;

    // Update status based on destination droppableId
    const newStatus = destination.droppableId;
    // Optimistic update
    const updatedTask = { ...task, status: newStatus };
    setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

    // Call API to update task and log history
    try {
      await API.put(`/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      // Optionally revert UI change here
    }
  };

  const handleEdit = (task) => {
    navigate(`/tasks/edit/${task.id}`);
  };

  const handleDelete = (task) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this task?")) {
      API.delete(`/tasks/${task.id}`)
        .then(() => setTasks(tasks.filter((t) => t.id !== task.id)))
        .catch(console.error);
    }
  };

  return (
    <div>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => navigate("/tasks/new")}
      >
        Add Task
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {["To Do", "In Progress", "Completed"].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded w-80 min-h-[300px]"
                >
                  <h2 className="text-xl font-bold mb-2">{status}</h2>
                  {getTasksByStatus(status).map((task, index) => (
                    <Draggable
                      draggableId={task.id.toString()}
                      index={index}
                      key={task.id}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          <TaskCard
                            task={task}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
