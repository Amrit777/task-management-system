import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";

const TaskForm = ({ isEditing = false }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    estimatedTime: "",
    estimatedEndDate: "",
    actualEndDate: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
    projectId: "",
    status: "To Do",
    createdBy: "current_user_id", // TODO: pull from auth context
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assignType, setAssignType] = useState("Myself");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isEditing && id) {
      API.get(`/tasks/${id}`)
        .then((res) => {
          const task = res.data;
          setForm({
            ...task,
            startDate: task.startDate?.split("T")[0] || "",
            estimatedEndDate: task.estimatedEndDate?.split("T")[0] || "",
            actualEndDate: task.actualEndDate?.split("T")[0] || "",
            dueDate: task.dueDate?.split("T")[0] || "",
          });
        })
        .catch(console.error);
    }
  }, [isEditing, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("attachments", selectedFiles[i]);
      }

      if (isEditing && id) {
        await API.put(`/tasks/${id}`, formData);
      } else {
        await API.post("/tasks", formData);
      }

      navigate("/tasks");
    } catch (error) {
      console.error(error);
      alert("Error submitting task");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl mb-4 font-semibold">
        {isEditing ? "Edit Task" : "Create New Task"}
      </h2>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-4"
      >
        {/* Task Title */}
        <div>
          <label className="block mb-1 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block mb-1 font-medium">Attachments</label>
          <input
            type="file"
            name="attachments"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Estimated End Date</label>
            <input
              type="date"
              name="estimatedEndDate"
              value={form.estimatedEndDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Actual End Date</label>
            <input
              type="date"
              name="actualEndDate"
              value={form.actualEndDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block mb-1 font-medium">
            Estimated Time (hours)
          </label>
          <input
            type="number"
            name="estimatedTime"
            value={form.estimatedTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block mb-1 font-medium">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block mb-1 font-medium">Assign To</label>
          <select
            value={assignType}
            onChange={(e) => setAssignType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Myself">Myself</option>
            <option value="Others">Others</option>
          </select>

          {assignType === "Others" && (
            <input
              type="text"
              placeholder="Search & select user"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
          )}
        </div>

        {/* Project ID */}
        <div>
          <label className="block mb-1 font-medium">Project ID</label>
          <input
            type="text"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {isEditing ? "Update Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
