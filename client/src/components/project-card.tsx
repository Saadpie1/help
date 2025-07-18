import { Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Video } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "processing":
        return "In Progress";
      case "scheduled":
        return "Scheduled";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const getStatusMessage = (project: Project) => {
    switch (project.status) {
      case "processing":
        return "Processing video...";
      case "complete":
        return "Ready for upload";
      case "scheduled":
        return project.scheduledDate 
          ? `Scheduled for ${new Date(project.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : "Scheduled";
      default:
        return "Draft";
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <Video className="text-gray-500 h-5 w-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">{project.title}</p>
            <p className="text-sm text-gray-500">{getStatusMessage(project)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {project.status === "processing" && (
        <div className="mt-3">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
        </div>
      )}
    </div>
  );
}
