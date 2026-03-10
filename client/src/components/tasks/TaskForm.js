// client/src/components/tasks/TaskForm.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { useDropzone } from "react-dropzone";
import API from "../../api";
import "react-quill/dist/quill.snow.css";

const TaskForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [titleAvailable, setTitleAvailable] = useState(true);
  const [checkingTitle, setCheckingTitle] = useState(false);
  const [lastCheckedTitle, setLastCheckedTitle] = useState("");

  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    attachments: [],
    estimatedEndDate: "",
    estimatedTime: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
  });

  // Fetch projects
  useEffect(() => {
    API.get("/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error);
  }, []);

  // Fetch users
  useEffect(() => {
    API.get("/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  // Load task for edit
  useEffect(() => {
    if (isEditing && id) {
      API.get(`/tasks/${id}`)
        .then((res) => {
          const t = res.data;
          setForm({
            projectId: t.projectId,
            title: t.title,
            description: t.description,
            attachments: [],
            estimatedEndDate: t.estimatedEndDate?.split("T")[0] || "",
            estimatedTime: t.estimatedTime,
            priority: t.priority,
            assignedTo: t.assignedTo || "",
            dueDate: t.dueDate?.split("T")[0] || "",
          });
          setExistingAttachments(t.attachments || []);
        })
        .catch(console.error);
    }
  }, [isEditing, id]);

  // Dropzone config
  const onDrop = useCallback((acceptedFiles) => {
    setForm((f) => ({
      ...f,
      attachments: [...f.attachments, ...acceptedFiles],
    }));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setForm((f) => ({ ...f, description: value }));
  };

  const handleBlurTitle = () => {
    const { projectId, title } = form;
    if (!projectId || !title || title === lastCheckedTitle) return;

    setCheckingTitle(true);
    setLastCheckedTitle(title);

    API.get(`/projects/${projectId}/tasks/title-check`, {
      params: { title },
    })
      .then((res) => {
        setTitleAvailable(
          isEditing
            ? res.data.available || res.data.taskId === parseInt(id)
            : res.data.available
        );
      })
      .catch(() => setTitleAvailable(false))
      .finally(() => setCheckingTitle(false));
  };

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
          {isEditing ? (
            <p className="p-2 border rounded bg-gray-100 text-gray-800">
              {projects.find((p) => p.id === form.projectId)?.title || "—"}
            </p>
          ) : (
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
          )}
        </div>

        {/* Task Title */}
        <div>
          <label className="block mb-1 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlurTitle}
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

          {existingAttachments.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {existingAttachments.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {url.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          )}

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
            required
            className="w-full p-2 border rounded"
          >
            <option value="">— Select User —</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
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
            This is a soft deadline used for reminders, not progress
            enforcement.
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
