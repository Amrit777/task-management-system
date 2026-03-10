
import { useState, useEffect } from "react";
import { Users, LineChart, ArrowUpRight, Boxes, Calendar, ListTodo } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import Confetti from "@/components/Confetti";
import Navigation from "@/components/Navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: number;
  name: string;
  tasksCompleted: number;
  totalTasks: number;
}

interface UserStats {
  id: number;
  name: string;
  tasksCompleted: number;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: "Marketing Website", tasksCompleted: 8, totalTasks: 12 },
    { id: 2, name: "Mobile App", tasksCompleted: 5, totalTasks: 15 },
    { id: 3, name: "Dashboard Redesign", tasksCompleted: 12, totalTasks: 20 }
  ]);

  const [userStats, setUserStats] = useState<UserStats[]>([
    { id: 1, name: "Sarah", tasksCompleted: 12 },
    { id: 2, name: "John", tasksCompleted: 8 },
    { id: 3, name: "Mike", tasksCompleted: 15 },
    { id: 4, name: "Emma", tasksCompleted: 7 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      <Confetti />
      
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8 mt-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value="1,234"
            description="+12% from last month"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Revenue"
            value="$45,231"
            description="+8% from last month"
            icon={<LineChart className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Projects"
            value={projects.length.toString()}
            description={`${projects.reduce((acc, curr) => acc + curr.tasksCompleted, 0)} tasks completed`}
            icon={<Boxes className="h-4 w-4" />}
          />
          <StatsCard
            title="Upcoming Tasks"
            value="24"
            description="5 due today"
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id}>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium">{project.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {project.tasksCompleted} / {project.totalTasks}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={(project.tasksCompleted / project.totalTasks) * 100} className="h-2" />
                        <span className="text-sm font-medium">
                          {Math.round((project.tasksCompleted / project.totalTasks) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ThemeSwitcher />
            
            <Card>
              <CardHeader>
                <CardTitle>Team Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <span>{user.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${(user.tasksCompleted / Math.max(...userStats.map(u => u.tasksCompleted))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{user.tasksCompleted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
