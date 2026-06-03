import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import API from "../api";
import { getApiErrorMessage } from "@/lib/utils";

interface TaskFormProps {
  onSubmit: () => void;
  initialData?: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: number;
    projectId?: number;
    dueDate?: string;
  };
}

const TaskForm = ({ onSubmit, initialData }: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState(initialData?.priority || "Medium");
  const [status, setStatus] = useState(initialData?.status || "todo");
  const [assignedTo, setAssignedTo] = useState<string>(initialData?.assignedTo?.toString() || "");
  const [projectId, setProjectId] = useState<string>(initialData?.projectId?.toString() || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.split("T")[0] || "");
  const [projects, setProjects] = useState<{id: number; title: string}[]>([]);
  const [users, setUsers] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          API.get("/projects"),
          API.get("/users"),
        ]);
        setProjects(projRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error("Failed to load form data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
        projectId: projectId ? parseInt(projectId) : undefined,
        dueDate: dueDate || undefined,
      });
      toast({ title: "Task created successfully" });
      onSubmit();
    } catch (err) {
      toast({
        title: "Failed to create task",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Enter task description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              {projects.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
            <SelectContent>
              {users.map(u => (<SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Task"}
      </Button>
    </form>
  );
};

export default TaskForm;
