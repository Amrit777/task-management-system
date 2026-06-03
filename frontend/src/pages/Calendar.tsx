import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import API from "@/api";
import { Task, displayStatus } from "@/types";

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

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

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  });

  const tasksForDate = (dateStr: string) =>
    filteredTasks.filter(
      (task) => task.dueDate && task.dueDate.split("T")[0] === dateStr
    );

  const dateHasTasks = (d: Date) => {
    const ds = format(d, "yyyy-MM-dd");
    return tasksForDate(ds).length > 0;
  };

  const handleDayClick = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setView("day");
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderTaskForDay = (task: Task) => (
    <div
      key={task.id}
      className={"p-3 rounded-md mb-2 cursor-pointer border-l-4 bg-card hover:bg-accent/50 " +
        (task.priority === "High" ? "border-red-500" :
         task.priority === "Medium" ? "border-yellow-500" : "border-green-500")}
      onClick={() => handleTaskClick(task)}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm truncate">{task.title}</h4>
        <Badge variant="outline">{displayStatus(task.status)}</Badge>
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{task.assignedToUser?.name || "Unassigned"}</span>
        <span>{task.priority}</span>
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
              : "Tasks for " + format(date, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
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
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger><SelectValue placeholder="All priorities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
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
                    DayContent: ({ date: d, ...props }) => (
                      <div className="relative">
                        <div {...props}>{d.getDate()}</div>
                        {tasksForDate(format(d, "yyyy-MM-dd")).length > 0 && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-primary/80 text-white rounded-full flex items-center justify-center text-[8px]">
                            {tasksForDate(format(d, "yyyy-MM-dd")).length}
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
                <CardHeader className="flex flex-row justify-between pb-2">
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
                      <Button variant="outline" className="mt-4" onClick={() => setIsNewTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
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
          {selectedTask && <TaskDetails task={selectedTask} onTaskUpdate={handleTaskUpdated} />}
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

export default Calendar;
