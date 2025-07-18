import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Upload, Youtube, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function UploadManager() {
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [uploadPrivacy, setUploadPrivacy] = useState("public");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", "/api/upload-youtube", { projectId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Upload Successful",
        description: `Video uploaded with ID: ${data.youtubeId}`,
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video to YouTube. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completedProjects = projects?.filter(p => p.status === "complete") || [];
  const scheduledProjects = projects?.filter(p => p.status === "scheduled") || [];
  const uploadedProjects = projects?.filter(p => p.status === "uploaded") || [];

  const handleSelectProject = (projectId: number, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const handleSelectAll = (projects: Project[], checked: boolean) => {
    const projectIds = projects.map(p => p.id);
    if (checked) {
      setSelectedProjects([...new Set([...selectedProjects, ...projectIds])]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => !projectIds.includes(id)));
    }
  };

  const handleUpload = (projectId: number) => {
    uploadMutation.mutate(projectId);
  };

  const handleBulkUpload = () => {
    if (selectedProjects.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one project to upload.",
        variant: "destructive",
      });
      return;
    }

    selectedProjects.forEach(projectId => {
      uploadMutation.mutate(projectId);
    });
    setSelectedProjects([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "uploaded":
        return <Youtube className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "uploaded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ProjectList = ({ 
    projects, 
    title, 
    showUpload = false, 
    showScheduled = false,
    showUploaded = false 
  }: { 
    projects: Project[]; 
    title: string;
    showUpload?: boolean;
    showScheduled?: boolean;
    showUploaded?: boolean;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {showUpload && <Upload className="mr-2 h-5 w-5" />}
            {showScheduled && <Clock className="mr-2 h-5 w-5" />}
            {showUploaded && <Youtube className="mr-2 h-5 w-5" />}
            {title} ({projects.length})
          </CardTitle>
          {(showUpload || showScheduled) && projects.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={projects.every(p => selectedProjects.includes(p.id))}
                onCheckedChange={(checked) => handleSelectAll(projects, checked as boolean)}
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {(showUpload || showScheduled) && (
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)}
                    />
                  )}
                  {getStatusIcon(project.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.category}</p>
                    {showUploaded && project.youtubeId && (
                      <p className="text-xs text-blue-600">ID: {project.youtubeId}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getStatusColor(project.status)}>
                    {project.status === "complete" ? "Ready" : 
                     project.status === "scheduled" ? "Scheduled" : "Uploaded"}
                  </Badge>
                  {showUpload && (
                    <Button
                      size="sm"
                      onClick={() => handleUpload(project.id)}
                      disabled={uploadMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Youtube className="mr-1 h-3 w-3" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {title.toLowerCase()} found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and upload your completed videos to YouTube
          </p>
        </div>

        {/* Upload Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                <Select value={uploadPrivacy} onValueChange={setUploadPrivacy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select defaultValue="education">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="howto">How-to & Style</SelectItem>
                    <SelectItem value="science">Science & Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleBulkUpload}
                  disabled={selectedProjects.length === 0 || uploadMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload ({selectedProjects.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Lists */}
        <div className="space-y-6">
          <ProjectList 
            projects={completedProjects} 
            title="Ready to Upload" 
            showUpload={true}
          />
          
          <ProjectList 
            projects={scheduledProjects} 
            title="Scheduled Videos" 
            showScheduled={true}
          />
          
          <ProjectList 
            projects={uploadedProjects} 
            title="Uploaded Videos" 
            showUploaded={true}
          />
        </div>

        {/* Upload Status */}
        {uploadMutation.isPending && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span className="text-sm text-gray-600">Uploading to YouTube...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
