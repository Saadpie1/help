import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Play, Clock, CheckCircle } from "lucide-react";

export default function VideoCreator() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const generateContentMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", "/api/generate-content", { projectId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "AI content generation started! This will create title, description, tags, and keywords.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start content generation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateVideoMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", "/api/generate-video", { projectId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Video generation started! This will create the actual video file and thumbnail.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start video generation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

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
        return "Processing";
      case "scheduled":
        return "Scheduled";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const canGenerateContent = (project: Project) => {
    return project.status === "draft";
  };

  const canGenerateVideo = (project: Project) => {
    return project.status === "processing" && project.progress >= 50;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Video Creator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate videos automatically using AI and text-to-speech
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Project to Generate Video</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="w-48 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject === project.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(project.status)}
                            <div>
                              <h3 className="font-medium text-gray-900">{project.title}</h3>
                              <p className="text-sm text-gray-500">{project.topic}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-400">{project.category}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{project.videoLength}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                            {project.status === "processing" && (
                              <div className="text-sm text-gray-500">{project.progress}%</div>
                            )}
                          </div>
                        </div>
                        {project.status === "processing" && (
                          <div className="mt-3">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No projects found. Create a project first to generate videos.</p>
                  </div>
                )}

                {selectedProject && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Automation Pipeline</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p>1. <strong>Generate Content:</strong> AI creates title, description, tags, keywords</p>
                        <p>2. <strong>Generate Video:</strong> Creates video file with TTS and visuals</p>
                        <p>3. <strong>Generate Thumbnail:</strong> Creates eye-catching thumbnail</p>
                        <p>4. <strong>Schedule/Upload:</strong> Post to YouTube automatically</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => generateContentMutation.mutate(selectedProject)}
                        disabled={
                          generateContentMutation.isPending ||
                          !projects?.find(p => p.id === selectedProject && canGenerateContent(p))
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {generateContentMutation.isPending ? "Generating..." : "1. Generate Content"}
                      </Button>
                      
                      <Button
                        onClick={() => generateVideoMutation.mutate(selectedProject)}
                        disabled={
                          generateVideoMutation.isPending ||
                          !projects?.find(p => p.id === selectedProject && canGenerateVideo(p))
                        }
                        className="bg-primary hover:bg-primary/90"
                      >
                        {generateVideoMutation.isPending ? "Generating..." : "2. Generate Video"}
                      </Button>
                    </div>
                    
                    {selectedProject && !canGenerateContent(projects?.find(p => p.id === selectedProject)!) && (
                      <p className="text-sm text-gray-500">
                        Start with content generation for draft projects, then proceed to video generation.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Generation Settings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="voice">Voice Settings</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Voice</SelectItem>
                      <SelectItem value="male">Male Voice</SelectItem>
                      <SelectItem value="female">Female Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="speed">Speech Speed</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="background">Background Style</Label>
                  <Select defaultValue="gradient">
                    <SelectTrigger>
                      <SelectValue placeholder="Select background" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="music">Background Music</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Select music" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Music</SelectItem>
                      <SelectItem value="upbeat">Upbeat</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Generation Process Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                  <p>Script generation based on your topic</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                  <p>Text-to-speech conversion using free TTS</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                  <p>Video assembly with visuals and audio</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">4</div>
                  <p>Final video processing and optimization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
