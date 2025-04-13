import React from "react";

const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h3 className="font-bold text-lg">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <p className="text-sm mt-2">
        Status: <span className="font-semibold">{task.status}</span>
      </p>
      {/* Add details such as assignedTo, startDate, etc. as needed */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
