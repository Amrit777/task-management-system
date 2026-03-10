
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignee: string;
}

const TaskDetails = ({ task }: { task: Task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({ ...task });

  const handleChange = (field: keyof Task, value: string) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const handleSave = () => {
    // In a real app, you would update the task in the database
    // For now, we just toggle the editing state
    setIsEditing(false);
    // We would need to propagate this change to the parent component
    // onTaskUpdate(editedTask);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Input 
            value={editedTask.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="font-semibold"
          />
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <Textarea 
              value={editedTask.description || ''} 
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add description"
              className="text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Priority</h3>
              <Select 
                value={editedTask.priority} 
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Status</h3>
              <Select 
                value={editedTask.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Assignee</h3>
              <Input 
                value={editedTask.assignee} 
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{task.title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Priority</h3>
            <p className="text-muted-foreground">{task.priority}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="text-muted-foreground">{task.status}</p>
          </div>
          <div>
            <h3 className="font-semibold">Assignee</h3>
            <p className="text-muted-foreground">{task.assignee}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDetails;
