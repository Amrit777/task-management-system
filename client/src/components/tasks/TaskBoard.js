import React, { useEffect, useMemo, useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../../api";
import TaskCard from "./TaskCard";
import { useNavigate } from "react-router-dom";

const STATUSES = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks on mount
  useEffect(() => {
    API.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(console.error);
  }, []);

  // Memoized tasks by status (prevents unmounts on re-render)
  const tasksByStatus = useMemo(() => {
    return {
      "todo": tasks.filter((t) => t.status === "todo"),
      "in-progress": tasks.filter((t) => t.status === "in-progress"),
      "completed": tasks.filter((t) => t.status === "completed"),
    };
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const task = tasks.find((t) => t.id.toString() === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const updatedTask = { ...task, status: newStatus };

    // Optimistically update local state
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
    );

    try {
      await API.put(`/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      // Optionally revert here if needed
    }
  };

  const handleEdit = (task) => {
    navigate(`/tasks/edit/${task.id}`);
  };

  const handleDelete = (task) => {
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
        onClick={() => navigate("/tasks/create")}
      >
        Add Task
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {STATUSES.map(({ label, value }) => (
            <Droppable droppableId={value} key={value}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded w-80 min-h-[300px]"
                >
                  <h2 className="text-xl font-bold mb-2">{label}</h2>
                  {tasksByStatus[value].length === 0 ? (
                    <div className="text-gray-500 text-sm">No tasks</div>
                  ) : (
                    tasksByStatus[value].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
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
                    ))
                  )}
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
