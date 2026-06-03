import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Save, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import API from "../api";
import { Task, displayStatus } from "../types";

interface TaskDetailsProps {
  task: Task;
  onTaskUpdate?: () => void;
}

const TaskDetails = ({ task, onTaskUpdate }: TaskDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get("/comments/" + task.id);
        setComments(res.data);
      } catch {}
    };
    fetchComments();
  }, [task.id]);

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.put("/tasks/" + task.id, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        status: editedTask.status,
        assignedTo: editedTask.assignedTo,
        dueDate: editedTask.dueDate,
      });
      toast({ title: "Task updated successfully" });
      setIsEditing(false);
      onTaskUpdate?.();
    } catch (err: any) {
      toast({
        title: "Failed to update task",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await API.delete("/tasks/" + task.id);
      toast({ title: "Task deleted" });
      onTaskUpdate?.();
    } catch (err: any) {
      toast({ title: "Failed to delete task", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await API.post("/comments", { text: newComment.trim(), taskId: task.id });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={editedTask.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea value={editedTask.description || ""} onChange={(e) => handleChange("description", e.target.value)} placeholder="Add description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={editedTask.priority} onValueChange={(v) => handleChange("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={editedTask.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save
          </Button>
          <Button variant="outline" onClick={() => { setIsEditing(false); setEditedTask({ ...task }); }}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {task.description && (<div><h4 className="text-sm font-medium text-muted-foreground">Description</h4><p className="text-sm mt-1">{task.description}</p></div>)}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="font-medium text-muted-foreground">Priority</span><p>{task.priority}</p></div>
        <div><span className="font-medium text-muted-foreground">Status</span><p>{displayStatus(task.status)}</p></div>
        <div><span className="font-medium text-muted-foreground">Assignee</span><p>{task.assignedToUser?.name || "Unassigned"}</p></div>
        <div><span className="font-medium text-muted-foreground">Created by</span><p>{task.createdByUser?.name || "Unknown"}</p></div>
        {task.dueDate && (<div><span className="font-medium text-muted-foreground">Due Date</span><p>{new Date(task.dueDate).toLocaleDateString()}</p></div>)}
      </div>

      {/* Comments */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Comments ({comments.length})</h4>
        <div className="space-y-2 max-h-40 overflow-auto mb-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-accent/50 rounded-lg p-2 text-sm">
              <div className="flex justify-between"><span className="font-medium">{c.User?.name || "User"}</span><span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span></div>
              <p className="mt-1">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }} />
          <Button size="sm" onClick={handleAddComment}>Post</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
