import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/stats-card";
import ProjectCard from "@/components/project-card";
import QuickActions from "@/components/quick-actions";
import SystemStatusCard from "@/components/system-status";
import RecentActivity from "@/components/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FolderOpen, Eye, Clock } from "lucide-react";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface Stats {
  totalVideos: number;
  activeProjects: number;
  totalViews: string;
  queueCount: number;
}

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your YouTube automation projects and monitor performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Videos"
            value={statsLoading ? "..." : stats?.totalVideos || 0}
            icon={<Video className="text-primary h-5 w-5" />}
            change="+12%"
            bgColor="bg-primary"
          />
          <StatsCard
            title="Active Projects"
            value={statsLoading ? "..." : stats?.activeProjects || 0}
            icon={<FolderOpen className="text-secondary h-5 w-5" />}
            subtitle="3 scheduled for today"
            bgColor="bg-secondary"
          />
          <StatsCard
            title="Total Views"
            value={statsLoading ? "..." : stats?.totalViews || "0"}
            icon={<Eye className="text-accent h-5 w-5" />}
            change="+24%"
            bgColor="bg-accent"
          />
          <StatsCard
            title="In Queue"
            value={statsLoading ? "..." : stats?.queueCount || 0}
            icon={<Clock className="text-gray-500 h-5 w-5" />}
            subtitle="2 processing"
            bgColor="bg-gray-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Recent Projects</CardTitle>
              </CardHeader>
              <div className="divide-y divide-gray-200">
                {projectsLoading ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="flex-1">
                            <div className="w-48 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No projects yet. Create your first project to get started!</p>
                  </div>
                )}
              </div>
              {projects && projects.length > 3 && (
                <CardContent className="pt-0 pb-3 bg-gray-50 border-t border-gray-200">
                  <Button variant="link" className="text-sm text-primary hover:text-primary/80 p-0">
                    View all projects
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            <QuickActions />
            <SystemStatusCard />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
