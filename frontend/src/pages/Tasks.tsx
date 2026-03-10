
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design new dashboard", priority: "High", status: "To Do", assignee: "Sarah" },
    { id: 2, title: "Update documentation", priority: "Medium", status: "To Do", assignee: "John" },
    { id: 3, title: "Implement authentication", priority: "High", status: "In Progress", assignee: "Mike", description: "Add user authentication with OAuth" },
    { id: 4, title: "Setup project repository", priority: "Low", status: "Done", assignee: "Sarah" },
  ]);

  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const handleCreateTask = (data: any) => {
    const newTask = {
      id: tasks.length + 1,
      ...data,
    };
    setTasks([...tasks, newTask]);
    setIsNewTaskOpen(false);
  };

  const handleTaskClick = (task: typeof tasks[0]) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setIsNewTaskOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow 
                key={task.id} 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTaskClick(task)}
              >
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.assignee}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetails task={selectedTask} />}
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleCreateTask} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
