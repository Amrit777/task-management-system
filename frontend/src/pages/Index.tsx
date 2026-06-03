import { useState, useEffect } from "react";
import { Boxes, Calendar, ListTodo, Users } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/api";

interface Project {
  id: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
}

interface Stats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  // Admin-only: the backend returns these only for admins.
  totalProjects?: number;
  totalUsers?: number;
}

const Index = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          API.get("/tasks/stats"),
          API.get("/projects"),
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-1">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Tasks"
          value={stats?.totalTasks?.toString() || "0"}
          description={stats?.completedCount + " completed"}
          icon={<ListTodo className="h-4 w-4" />}
        />
        <StatsCard
          title="To Do"
          value={stats?.todoCount?.toString() || "0"}
          description="Waiting to be picked up"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgressCount?.toString() || "0"}
          description="Currently being worked on"
          icon={<Boxes className="h-4 w-4" />}
        />
        {user?.role === "admin" ? (
          <StatsCard
            title="Team Members"
            value={stats?.totalUsers?.toString() || "0"}
            description={(stats?.totalProjects ?? 0) + " active projects"}
            icon={<Users className="h-4 w-4" />}
          />
        ) : (
          <StatsCard
            title="My Projects"
            value={projects.length.toString()}
            description={projects.length === 1 ? "1 project" : `${projects.length} projects`}
            icon={<Users className="h-4 w-4" />}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No projects yet</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const total = project.totalTasks || 0;
                  const done = project.completedTasks || 0;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={project.id}>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium">{project.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {done} / {total}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={pct} className="h-2" />
                        <span className="text-sm font-medium w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-medium">
                  {stats && stats.totalTasks > 0
                    ? Math.round((stats.completedCount / stats.totalTasks) * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                value={
                  stats && stats.totalTasks > 0
                    ? (stats.completedCount / stats.totalTasks) * 100
                    : 0
                }
                className="h-2"
              />
              <div className="grid grid-cols-3 gap-4 pt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats?.todoCount || 0}</p>
                  <p className="text-xs text-muted-foreground">To Do</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats?.inProgressCount || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats?.completedCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
