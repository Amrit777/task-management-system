import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import API from "@/api";
import { Task, displayStatus } from "@/types";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleTaskCreated = () => {
    setIsNewTaskOpen(false);
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    setIsDetailsOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "outline";
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "default";
      case "in-progress": return "secondary";
      default: return "outline";
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setIsNewTaskOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tasks yet. Create your first task!</p>
            <Button onClick={() => setIsNewTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleTaskClick(task)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={priorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(task.status) as any}>
                      {displayStatus(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assignedToUser?.name || "Unassigned"}</TableCell>
                  <TableCell>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Task Details Dialog */}
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
};

export default Tasks;
