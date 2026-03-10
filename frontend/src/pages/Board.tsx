import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskDetails from "@/components/TaskDetails";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import API from "../api"; // Assuming you have API.js setup for API calls

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignee: string;
}

const STATUSES = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const Board = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    // Fetch tasks from the backend
    API.get("/tasks")
      .then((res) => {
        setTasks(res.data);
      })
      .catch(console.error);
  }, []);

  // Memoized tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      "todo": tasks.filter((t) => t.status === "todo"),
      "in-progress": tasks.filter((t) => t.status === "in-progress"),
      "completed": tasks.filter((t) => t.status === "completed"),
    };
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task, sourceColumnIndex: number) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.setData("sourceColumnIndex", sourceColumnIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnIndex: number) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const sourceColumnIndex = parseInt(e.dataTransfer.getData("sourceColumnIndex"));

    if (sourceColumnIndex === targetColumnIndex) return;

    const newColumns = [...columns];
    const taskIndex = newColumns[sourceColumnIndex].tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      const [task] = newColumns[sourceColumnIndex].tasks.splice(taskIndex, 1);
      task.status = newColumns[targetColumnIndex].title;
      newColumns[targetColumnIndex].tasks.push(task);
      setColumns(newColumns);

      // Optimistic update of the task status
      try {
        await API.put(`/tasks/${task.id}`, { status: task.status });
      } catch (error) {
        console.error("Error updating task status:", error);
        // Optionally revert state change if necessary
      }
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Project Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <Card
            key={status.value}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.value)}
            className="h-full"
          >
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{status.label}</span>
                <span className="bg-accent/50 text-xs font-normal py-1 px-2 rounded-full">
                  {tasksByStatus[status.value]?.length || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasksByStatus[status.value]?.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, status.value)}
                  onClick={() => openTaskDetails(task)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                      e.stopPropagation();
                      openTaskDetails(task);
                    }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {task.priority}
                    </span>
                    <span>{task.assignee}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetails task={selectedTask} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Board;
