import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskDetails from "@/components/TaskDetails";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Loader2 } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import API from "../api";
import { Task } from "../types";

const STATUSES = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "completed" },
];

const Board = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchTasks(); }, []);

  const tasksByStatus = useMemo(() => ({
    "todo": tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    "completed": tasks.filter((t) => t.status === "completed"),
  }), [tasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task, sourceStatus: string) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.setData("sourceStatus", sourceStatus);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    if (sourceStatus === targetStatus) return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)));
    try {
      await API.put(`/tasks/${taskId}`, { status: targetStatus });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: sourceStatus } : t)));
    }
  };

  const openTaskDetails = (task: Task) => { setSelectedTask(task); setIsDetailsOpen(true); };
  const handleTaskCreated = () => { setIsNewTaskOpen(false); fetchTasks(); };
  const handleTaskUpdated = () => { setIsDetailsOpen(false); fetchTasks(); };

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Board</h1>
        <Button onClick={() => setIsNewTaskOpen(true)}><Plus className="mr-2 h-4 w-4" />New Task</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <Card key={status.value} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status.value)} className="h-full min-h-[200px]">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{status.label}</span>
                <span className="bg-accent/50 text-xs font-normal py-1 px-2 rounded-full">
                  {tasksByStatus[status.value as keyof typeof tasksByStatus]?.length || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasksByStatus[status.value as keyof typeof tasksByStatus]?.map((task) => (
                <div key={task.id} className="p-3 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent transition-colors" draggable onDragStart={(e) => handleDragStart(e, task, status.value)} onClick={() => openTaskDetails(task)}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openTaskDetails(task); }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>{task.priority}</span>
                    <span>{task.assignedToUser?.name || "Unassigned"}</span>
                  </div>
                  {task.dueDate && (<div className="text-xs text-muted-foreground mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</div>)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Task Details</DialogTitle></DialogHeader>
          {selectedTask && <TaskDetails task={selectedTask} onTaskUpdate={handleTaskUpdated} />}
        </DialogContent>
      </Dialog>
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
          <TaskForm onSubmit={handleTaskCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Board;
