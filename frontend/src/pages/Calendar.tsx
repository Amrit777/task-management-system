import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignee: string;
  dueDate: string;
}

const mockTasks: Task[] = [
  { id: 1, title: "Design new dashboard", priority: "High", status: "To Do", assignee: "Sarah", description: "Create wireframes for the new dashboard layout", dueDate: "2025-04-28" },
  { id: 2, title: "Update documentation", priority: "Medium", status: "To Do", assignee: "John", description: "Update the API documentation for the new endpoints", dueDate: "2025-04-27" },
  { id: 3, title: "Implement authentication", priority: "High", status: "In Progress", assignee: "Mike", description: "Add OAuth support and email verification", dueDate: "2025-04-25" },
  { id: 4, title: "Setup project repository", priority: "Low", status: "Done", assignee: "Sarah", description: "Initialize git repository and setup CI/CD", dueDate: "2025-04-24" },
  { id: 5, title: "Fix responsive layout", priority: "Medium", status: "To Do", assignee: "Emma", description: "Fix layout issues on mobile devices", dueDate: "2025-04-26" },
];

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // sentinel "all" means no filter
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // kept for future use

  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));
  const statuses = ["To Do", "In Progress", "Done"];
  const types = ["Task", "Bug"];

  // filter out by sentinel "all"
  const filteredTasks = tasks.filter(task =>
    (assigneeFilter === "all" || task.assignee === assigneeFilter) &&
    (statusFilter === "all" || task.status === statusFilter)
    // typeFilter is unused for now
  );

  const tasksForDate = (dateStr: string) =>
    filteredTasks.filter(task => task.dueDate === dateStr);

  const dateHasTasks = (d: Date) => {
    const ds = format(d, "yyyy-MM-dd");
    return tasksForDate(ds).length > 0;
  };

  const handleDayClick = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setView("day");
  };

  const handleCreateTask = (data: any) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      ...data,
      dueDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    };
    setTasks(prev => [...prev, newTask]);
    setIsNewTaskOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const renderTaskForDay = (task: Task) => (
    <div
      key={task.id}
      className={`p-2 rounded-md mb-2 cursor-pointer ${task.priority === "High" ? "bg-red-100 border-l-4 border-red-500" :
        task.priority === "Medium" ? "bg-yellow-100 border-l-4 border-yellow-500" :
          "bg-green-100 border-l-4 border-green-500"
        }`}
      onClick={() => handleTaskClick(task)}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm truncate">{task.title}</h4>
        <span className="text-xs bg-white/50 rounded-full px-2 py-0.5">
          {task.status}
        </span>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs">{task.assignee}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {view === "month"
              ? "Monthly Overview"
              : `Tasks for ${format(date, "MMMM d, yyyy")}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
          >
            Month View
          </Button>
          {view === "day" && (
            <Button onClick={() => setIsNewTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Assignee</label>
                <Select
                  value={assigneeFilter}
                  onValueChange={setAssigneeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All assignees</SelectItem>
                    {assignees.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {types.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAssigneeFilter("all");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Calendar / Day View */}
        <div className="md:col-span-3">
          {view === "month" ? (
            <Card>
              <CardContent className="p-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDayClick}
                  className="rounded-md"
                  modifiers={{ hasTasks: dateHasTasks }}
                  modifiersStyles={{
                    hasTasks: {
                      backgroundColor: "rgba(147, 51, 234, 0.1)",
                      fontWeight: "bold",
                    },
                  }}
                  components={{
                    DayContent: ({ date, ...props }) => (
                      <div className="relative">
                        <div {...props}>{date.getDate()}</div>
                        {tasksForDate(format(date, "yyyy-MM-dd")).length > 0 && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-primary/80 text-white rounded-full flex items-center justify-center text-[8px]">
                            {tasksForDate(format(date, "yyyy-MM-dd")).length}
                          </div>
                        )}
                      </div>
                    ),
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle>{format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
                  <Button variant="ghost" onClick={() => setView("month")}>
                    Back to Month
                  </Button>
                </CardHeader>
                <CardContent>
                  {tasksForDate(format(date, "yyyy-MM-dd")).length > 0 ? (
                    tasksForDate(format(date, "yyyy-MM-dd")).map(renderTaskForDay)
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tasks for this day</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsNewTaskOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

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

export default Calendar;
