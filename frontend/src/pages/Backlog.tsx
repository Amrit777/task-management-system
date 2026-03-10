import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ListTodo, Plus } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignee: string;
  project?: string;
  type: string;
  epic?: string;
}

const mockBacklogTasks: Task[] = [
  { id: 101, title: "Implement user authentication", priority: "High", status: "To Do", assignee: "Mike", project: "Dashboard Redesign", type: "Feature" },
  { id: 102, title: "Design user profile page", priority: "Medium", status: "To Do", assignee: "Sarah", project: "Dashboard Redesign", type: "Design" },
  { id: 103, title: "Implement API endpoints", priority: "High", status: "To Do", assignee: "John", project: "Mobile App", type: "Feature" },
  { id: 104, title: "Add notification system", priority: "Low", status: "To Do", assignee: "Emma", project: "Marketing Website", type: "Feature" },
  { id: 105, title: "Fix navigation bug on mobile", priority: "Medium", status: "To Do", assignee: "Mike", project: "Mobile App", type: "Bug" },
];

export default function Backlog() {
  const [backlogTasks, setBacklogTasks] = useState<Task[]>(mockBacklogTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockBacklogTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priority: "all",
    assignee: "all",
    type: "all",
    project: "all",
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const priorities = Array.from(new Set(backlogTasks.map(t => t.priority)));
  const assignees = Array.from(new Set(backlogTasks.map(t => t.assignee)));
  const types = Array.from(new Set(backlogTasks.map(t => t.type)));
  const projects = Array.from(new Set(backlogTasks.filter(t => t.project).map(t => t.project!)));

  const applyFilters = (
    tasks: Task[],
    search = searchTerm,
    currentF = filters
  ) => {
    let result = tasks;

    if (search) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (currentF.priority !== "all") {
      result = result.filter(t => t.priority === currentF.priority);
    }
    if (currentF.assignee !== "all") {
      result = result.filter(t => t.assignee === currentF.assignee);
    }
    if (currentF.type !== "all") {
      result = result.filter(t => t.type === currentF.type);
    }
    if (currentF.project !== "all") {
      result = result.filter(t => t.project === currentF.project);
    }

    setFilteredTasks(result);
  };

  const changeFilter = (key: keyof typeof filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    applyFilters(backlogTasks, searchTerm, next);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(backlogTasks, term, filters);
  };

  const handleCreateTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: Math.max(...backlogTasks.map(t => t.id)) + 1,
      status: "To Do",
      priority: data.priority || "Medium",
      type: data.type || "Feature",
      assignee: data.assignee || "Unassigned",
      title: data.title!,
      project: data.project,
      description: data.description,
      epic: data.epic,
    };
    const updated = [...backlogTasks, newTask];
    setBacklogTasks(updated);
    applyFilters(updated, searchTerm, filters);
    setIsNewTaskOpen(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Backlog</h1>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm">
            {filteredTasks.length} items
          </span>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />

            <Select
              value={filters.priority}
              onValueChange={v => changeFilter("priority", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.assignee}
              onValueChange={v => changeFilter("assignee", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {assignees.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={v => changeFilter("type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.project}
              onValueChange={v => changeFilter("project", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Card
              key={task.id}
              className="hover:bg-accent/30 cursor-pointer"
              onClick={() => { setSelectedTask(task); setIsDetailsOpen(true); }}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-start space-x-3">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                      <span>{task.project || 'No project'}</span>
                      <span>•</span>
                      <span>{task.type}</span>
                      <span>•</span>
                      <span>Assigned to {task.assignee}</span>
                    </div>
                  </div>
                </div>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${task.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                  ${task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${task.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {task.priority}
                </span>
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
                const reset = { priority: "all", assignee: "all", type: "all", project: "all" };
                setFilters(reset);
                setSearchTerm("");
                applyFilters(backlogTasks, "", reset);
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
}
