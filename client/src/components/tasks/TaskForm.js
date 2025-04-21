// client/src/components/tasks/TaskForm.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { useDropzone } from "react-dropzone";
import API from "../../api";
import "react-quill/dist/quill.snow.css";

const TaskForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // TODO: Replace with real auth context / token decode
  const currentUserId = 1;

  const [projects, setProjects] = useState([]);
  const [titleAvailable, setTitleAvailable] = useState(true);
  const [checkingTitle, setCheckingTitle] = useState(false);

  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    attachments: [], // array of File objects
    estimatedEndDate: "",
    estimatedTime: "",
    priority: "Medium",
    assignedTo: currentUserId,
    dueDate: "",
  });

  // Load list of projects
  useEffect(() => {
    API.get("/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error);
  }, []);

  // If editing, load existing task
  useEffect(() => {
    if (isEditing && id) {
      API.get(`/tasks/${id}`)
        .then((res) => {
          const t = res.data;
          setForm({
            projectId: t.projectId,
            title: t.title,
            description: t.description,
            attachments: [], // we won't preload existing attachments into dropzone
            estimatedEndDate: t.estimatedEndDate?.split("T")[0] || "",
            estimatedTime: t.estimatedTime,
            priority: t.priority,
            assignedTo: t.assignedTo || currentUserId,
            dueDate: t.dueDate?.split("T")[0] || "",
          });
        })
        .catch(console.error);
    }
  }, [isEditing, id]);

  // Title uniqueness check
  useEffect(() => {
    const { projectId, title } = form;
    if (!projectId || !title) return setTitleAvailable(true);

    setCheckingTitle(true);
    // You need an endpoint: GET /projects/:projectId/tasks/title-check?title=...
    API.get(`/projects/${projectId}/tasks/title-check`, {
      params: { title },
    })
      .then((res) => {
        setTitleAvailable(res.data.available);
      })
      .catch(() => {
        setTitleAvailable(false);
      })
      .finally(() => setCheckingTitle(false));
  }, [form.projectId, form.title]);

  // Dropzone for attachments
  const onDrop = useCallback((acceptedFiles) => {
    setForm((f) => ({
      ...f,
      attachments: [...f.attachments, ...acceptedFiles],
    }));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Rich-text handler
  const handleDescriptionChange = (value) => {
    setForm((f) => ({ ...f, description: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleAvailable) {
      alert("Task title already exists in this project.");
      return;
    }
    try {
      const data = new FormData();
      Object.entries({
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        estimatedEndDate: form.estimatedEndDate,
        estimatedTime: form.estimatedTime,
        priority: form.priority,
        assignedTo: form.assignedTo,
        dueDate: form.dueDate,
      }).forEach(([k, v]) => data.append(k, v));

      form.attachments.forEach((file) => data.append("attachments", file));

      if (isEditing) await API.put(`/tasks/${id}`, data);
      else await API.post("/tasks", data);

      navigate("/tasks");
    } catch (err) {
      console.error(err);
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
        className="space-y-6"
      >
        {/* Project */}
        <div>
          <label className="block mb-1 font-medium">Project</label>
          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">— Select Project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Task Title */}
        <div>
          <label className="block mb-1 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          {checkingTitle ? (
            <p className="text-sm text-gray-500">Checking title…</p>
          ) : !titleAvailable ? (
            <p className="text-sm text-red-600">
              Title already used in this project
            </p>
          ) : null}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <ReactQuill
            theme="snow"
            value={form.description}
            onChange={handleDescriptionChange}
            className="bg-white"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block mb-1 font-medium">Attachments</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-6 text-center rounded cursor-pointer ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? "Drop files here…"
                : "Drag & drop files here, or click to browse"}
            </p>
          </div>
          {form.attachments.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {form.attachments.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Estimated End Date */}
        <div>
          <label className="block mb-1 font-medium">Estimated End Date</label>
          <input
            type="date"
            name="estimatedEndDate"
            value={form.estimatedEndDate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
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

        {/* Assign To */}
        <div>
          <label className="block mb-1 font-medium">Assign To</label>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value={currentUserId}>Myself</option>
            {/* You can populate other users here if needed */}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block mb-1 font-medium">
            Due Date <span className="text-sm text-gray-500">(optional)</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use as a reminder deadline for notifications—does not affect
            progress.
          </p>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
