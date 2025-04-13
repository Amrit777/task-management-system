// client/src/components/tasks/TaskForm.js
import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";

const TaskForm = ({ isEditing = false }) => {
  // initialData can be used for editing an existing task (if provided)
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    estimatedTime: "",
    estimatedEndDate: "",
    actualEndDate: "",
    assignedTo: "",
    priority: "",
    dueDate: "",
    projectId: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // local file objects
  const navigate = useNavigate();
  const { id } = useParams(); // used if editing

  // If editing, fetch task details
  useEffect(() => {
    if (isEditing && id) {
      API.get(`/tasks/${id}`)
        .then((res) => {
          const task = res.data;
          setForm({
            title: task.title,
            description: task.description,
            startDate: task.startDate?.split("T")[0] || "",
            estimatedTime: task.estimatedTime || "",
            estimatedEndDate: task.estimatedEndDate?.split("T")[0] || "",
            actualEndDate: task.actualEndDate?.split("T")[0] || "",
            assignedTo: task.assignedTo || "",
            priority: "",
            dueDate: "",
            projectId: "",
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
      // Create a FormData to send multipart/form-data
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("startDate", form.startDate);
      formData.append("estimatedTime", form.estimatedTime);
      formData.append("estimatedEndDate", form.estimatedEndDate);
      formData.append("actualEndDate", form.actualEndDate);
      formData.append("assignedTo", form.assignedTo);

      // Append files
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("attachments", selectedFiles[i]);
      }

      if (isEditing && id) {
        await API.put(`/tasks/${id}`, formData);
      } else {
        await API.post("/tasks", formData);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error submitting task");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl mb-4">
        {" "}
        {isEditing ? "Edit Task" : "Create New Task"}{" "}
      </h2>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <div>
          <label className="block mb-1"> Task Title </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1"> Description </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {" "}
          </textarea>
        </div>
        <div>
          <label className="block mb-1"> Attachments </label>
          <input
            type="file"
            name="attachments"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label className="block mb-1"> Start Date </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1"> Estimated Time(hours) </label>
          <input
            type="number"
            name="estimatedTime"
            value={form.estimatedTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1"> Estimated End Date </label>
          <input
            type="date"
            name="estimatedEndDate"
            value={form.estimatedEndDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1"> Actual Task Ended On </label>
          <input
            type="date"
            name="actualEndDate"
            value={form.actualEndDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <br />
        <input
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />
        <br />
        <input
          name="assignedTo"
          type="text"
          placeholder="Assigned To (User ID)"
          value={form.assignedTo}
          onChange={handleChange}
        />
        <br />
        <input
          name="projectId"
          type="text"
          placeholder="Project ID"
          value={form.projectId}
          onChange={handleChange}
        />
        <br />
        <div>
          <label className="block mb-1"> Assigned To: </label>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value=""> Myself </option>
            <option value="other"> Others </option>
          </select>
          {/* For "Others", you might implement an additional component to search/select a user */}
        </div>
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
