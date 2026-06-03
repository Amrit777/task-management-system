import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ListTodo, Plus, Loader2 } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import API from "@/api";
import { Task, displayStatus } from "@/types";

export default function Backlog() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.data ?? res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !task.title.toLowerCase().includes(q) &&
          !(task.description || "").toLowerCase().includes(q)
        )
          return false;
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      return true;
    });
  }, [tasks, searchTerm, priorityFilter, statusFilter]);

  const handleTaskCreated = () => {
    setIsNewTaskOpen(false);
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    setIsDetailsOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Backlog</h1>
          <Badge variant="secondary">{filteredTasks.length} items</Badge>
        </div>
        <Button onClick={() => setIsNewTaskOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Done</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="hover:bg-accent/30 cursor-pointer"
              onClick={() => {
                setSelectedTask(task);
                setIsDetailsOpen(true);
              }}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-start space-x-3">
                  <ListTodo className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                      <span>{task.assignedToUser?.name || "Unassigned"}</span>
                      <span>~</span>
                      <Badge variant="outline" className="text-xs">
                        {displayStatus(task.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {task.priority}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No tasks match your filters</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskDetails task={selectedTask} onTaskUpdate={handleTaskUpdated} />
          )}
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleTaskCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
