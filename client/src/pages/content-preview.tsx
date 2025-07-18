import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, FileText, Hash, Video, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";

export default function ContentPreview() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const selectedProjectData = projects?.find(p => p.id === selectedProject);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!",
    });
  };

  const projectsWithContent = projects?.filter(p => p.metadata && Object.keys(p.metadata).length > 0) || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Preview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review AI-generated content before publishing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Project Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Projects with Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : projectsWithContent.length > 0 ? (
                  <div className="space-y-3">
                    {projectsWithContent.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject === project.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <h3 className="font-medium text-gray-900 text-sm">{project.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{project.category}</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Content Ready
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No projects with generated content yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Preview */}
          <div className="lg:col-span-3">
            {selectedProjectData && selectedProjectData.metadata ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="title">Title & Tags</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Title</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProjectData.title}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Generated Title</label>
                          <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">{selectedProjectData.metadata.title}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProjectData.category}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video Length</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProjectData.videoLength}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Original Topic</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedProjectData.topic}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {selectedProjectData.status}
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                          <div className="flex items-center space-x-2">
                            <div className="progress-bar flex-1">
                              <div className="progress-fill" style={{ width: `${selectedProjectData.progress}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600">{selectedProjectData.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="title" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Title & Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Optimized Title</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(selectedProjectData.metadata?.title || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-900">{selectedProjectData.metadata?.title}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Tags</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(selectedProjectData.metadata?.tags?.join(", ") || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedProjectData.metadata?.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="description" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Video Description
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedProjectData.metadata?.description || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 border rounded-lg">
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                          {selectedProjectData.metadata?.description}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Hash className="mr-2 h-5 w-5" />
                        SEO Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedProjectData.metadata?.keywords?.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
                            onClick={() => copyToClipboard(keyword)}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          💡 Click on any keyword to copy it to your clipboard
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a project to preview content</p>
                    <p className="text-sm">Choose a project from the sidebar to see generated content</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}