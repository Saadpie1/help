import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Image, Palette, Type } from "lucide-react";

export default function ThumbnailStudio() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [thumbnailText, setThumbnailText] = useState("");
  const [thumbnailStyle, setThumbnailStyle] = useState("modern");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const generateThumbnailMutation = useMutation({
    mutationFn: async ({ projectId, text, style }: { projectId: number; text: string; style: string }) => {
      const response = await apiRequest("POST", "/api/generate-thumbnail", { projectId, text, style });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Thumbnail generated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate thumbnail. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedProjectData = projects?.find(p => p.id === selectedProject);

  const handleGenerate = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    if (!thumbnailText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text for the thumbnail.",
        variant: "destructive",
      });
      return;
    }

    generateThumbnailMutation.mutate({
      projectId: selectedProject,
      text: thumbnailText,
      style: thumbnailStyle,
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Thumbnail Studio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create eye-catching thumbnails for your videos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Selection and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Project</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject === project.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedProject(project.id);
                          setThumbnailText(project.title);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-500">{project.category}</p>
                          </div>
                          <Badge variant="secondary">
                            {project.thumbnailUrl ? "Has Thumbnail" : "No Thumbnail"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No projects found. Create a project first to generate thumbnails.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thumbnail Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  {thumbnailText ? (
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2 max-w-lg px-4">
                        {thumbnailText}
                      </h2>
                      <div className="flex items-center justify-center space-x-2 text-white/80">
                        <Image className="h-4 w-4" />
                        <span className="text-sm">{thumbnailStyle} style</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white/60">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p>Select a project to preview thumbnail</p>
                    </div>
                  )}
                </div>
                {selectedProjectData?.thumbnailUrl && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Current thumbnail: {selectedProjectData.thumbnailUrl}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Thumbnail Customization */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="mr-2 h-5 w-5" />
                  Text Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="thumbnailText">Thumbnail Text</Label>
                  <Input
                    id="thumbnailText"
                    value={thumbnailText}
                    onChange={(e) => setThumbnailText(e.target.value)}
                    placeholder="Enter thumbnail text..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select defaultValue="large">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <Select defaultValue="white">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Style Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="style">Thumbnail Style</Label>
                  <Select value={thumbnailStyle} onValueChange={setThumbnailStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="background">Background</Label>
                  <Select defaultValue="gradient">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="image">Background Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="overlay">Text Overlay</Label>
                  <Select defaultValue="shadow">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="shadow">Drop Shadow</SelectItem>
                      <SelectItem value="outline">Text Outline</SelectItem>
                      <SelectItem value="background">Background Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateThumbnailMutation.isPending || !selectedProject}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {generateThumbnailMutation.isPending ? "Generating..." : "Generate Thumbnail"}
                </Button>
              </CardContent>
            </Card>

            {/* Template Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Template Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {["Tech", "Tutorial", "Review", "Lifestyle"].map((template) => (
                    <div
                      key={template}
                      className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => setThumbnailStyle(template.toLowerCase())}
                    >
                      <span className="text-xs font-medium text-gray-600">{template}</span>
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
}
