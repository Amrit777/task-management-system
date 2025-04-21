// client/src/components/tasks/TaskForm.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";
import ReactQuill from "react-quill";
import { useDropzone } from "react-dropzone";
import { formatDistanceToNow } from "date-fns";
import "react-quill/dist/quill.snow.css";

const TaskForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    startDate: "",
    estimatedEndDate: "",
    estimatedTime: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
  });

  // Attachment state
  const [existingAttachments, setExistingAttachments] = useState([]); // loaded from backend
  const [newFiles, setNewFiles] = useState([]);

  // Lists
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // History
  const [history, setHistory] = useState([]);

  // Load projects & users on mount
  useEffect(() => {
    API.get("/projects").then((res) => setProjects(res.data));
    API.get("/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  // If editing, fetch task details
  useEffect(() => {
    if (isEditing && id) {
      API.get(`/tasks/${id}`)
        .then(({ data }) => {
          setForm({
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            startDate: data.startDate?.split("T")[0] || "",
            estimatedEndDate: data.estimatedEndDate?.split("T")[0] || "",
            estimatedTime: data.estimatedTime,
            priority: data.priority,
            assignedTo: data.assignedTo || "",
            dueDate: data.dueDate?.split("T")[0] || "",
          });
          setExistingAttachments(data.Attachments || []);
          setHistory(data.TaskHistories || []);
        })
        .catch(console.error);
    }
  }, [isEditing, id]);

  // Input change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleDescriptionChange = (val) =>
    setForm((f) => ({ ...f, description: val }));

  // Dropzone for new files
  const onDrop = useCallback((files) => {
    setNewFiles((prev) => [...prev, ...files]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Remove an existing attachment
  const removeAttachment = (attachId) => {
    setExistingAttachments((prev) => prev.filter((att) => att.id !== attachId));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append form fields
    Object.entries(form).forEach(([k, v]) => data.append(k, v || ""));

    // Keep track of which existing attachments remain
    data.append(
      "keepAttachments",
      JSON.stringify(existingAttachments.map((a) => a.id))
    );
    // Append new files
    newFiles.forEach((file) => data.append("attachments", file));

    try {
      if (isEditing) await API.put(`/tasks/${id}`, data);
      else await API.post("/tasks", data);
      navigate("/tasks");
    } catch (err) {
      console.error(err);
      alert("Failed to submit task");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-semibold mb-6">
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

        {/* Title */}
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
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <ReactQuill
            theme="snow"
            value={form.description}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block mb-1 font-medium">Attachments</label>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <ul className="list-disc list-inside mb-2">
              {existingAttachments.map((att) => (
                <li key={att.id} className="flex justify-between">
                  <a
                    href={att.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    {att.fileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-red-600 ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Dropzone for New Files */}
          <div
            {...getRootProps()}
            className={`p-4 border-2 border-dashed rounded text-center cursor-pointer ${
              isDragActive ? "bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? "Drop files here…"
                : "Drag & drop files or click to browse"}
            </p>
          </div>
          {newFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {newFiles.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Start Date (edit only) */}
        {isEditing && (
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
        )}

        {/* Estimated End Date */}
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

        {/* Due Date */}
        <div>
          <label className="block mb-1 font-medium">Due Date (optional)</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block mb-1 font-medium">Estimated Time (hrs)</label>
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
        {/* <div>
          <label className="block mb-1 font-medium">Assign To</label>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">— Select User —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label className="block mb-1 font-medium">Assign To</label>
          <select
            name="assignedTo"
            value={form.assignedTo || ""}
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

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? "Update Task" : "Create Task"}
        </button>
      </form>

      {/* Change History */}
      {isEditing && history.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Change History</h3>
          <ul className="space-y-4">
            {history.map((h) => (
              <li key={h.id} className="border-l-2 pl-4">
                <p className="text-sm text-gray-600">
                  {h.changedByUser?.name || "Unknown"}{" "}
                  <span className="italic text-xs">
                    {formatDistanceToNow(new Date(h.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
                <p className="mt-1">{h.changeLog}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
