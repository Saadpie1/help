import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Hash, Target, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentOptimizer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();

  // Mock data for demonstration
  const keywordSuggestions = [
    { keyword: "how to code", volume: "12K", difficulty: "Medium", trend: "+15%" },
    { keyword: "react tutorial", volume: "8.5K", difficulty: "High", trend: "+8%" },
    { keyword: "javascript basics", volume: "15K", difficulty: "Low", trend: "+22%" },
    { keyword: "web development", volume: "25K", difficulty: "High", trend: "+5%" },
  ];

  const titleSuggestions = [
    "How to Code React - Complete Beginner's Guide 2024",
    "React Tutorial: Build Your First App in 30 Minutes",
    "Learn React Fast - Zero to Hero in One Video",
    "React for Beginners - Step by Step Tutorial",
  ];

  const hashtagSuggestions = [
    "#ReactJS", "#WebDevelopment", "#Coding", "#Tutorial", "#JavaScript",
    "#Programming", "#Frontend", "#Developer", "#Tech", "#Learn"
  ];

  const handleKeywordResearch = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Research Complete",
        description: "Keyword analysis has been completed!",
      });
    }, 2000);
  };

  const handleGenerateTitles = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Titles Generated",
        description: "New title suggestions are ready!",
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!",
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Optimizer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Optimize your video content for maximum reach and engagement
          </p>
        </div>

        <Tabs defaultValue="keywords" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keywords">Keyword Research</TabsTrigger>
            <TabsTrigger value="titles">Title Generator</TabsTrigger>
            <TabsTrigger value="description">Description Builder</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtag Optimizer</TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="mr-2 h-5 w-5" />
                      Keyword Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter your main topic or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleKeywordResearch}
                        disabled={isAnalyzing}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isAnalyzing ? "Analyzing..." : "Research"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {keywordSuggestions.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{keyword.keyword}</span>
                              <Badge variant="outline" className="text-xs">
                                {keyword.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>Volume: {keyword.volume}</span>
                              <span className="text-green-600">{keyword.trend}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(keyword.keyword)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["AI Programming", "React 19", "TypeScript", "Next.js 15"].map((topic, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <span className="text-sm font-medium">{topic}</span>
                        <div className="text-xs text-gray-500 mt-1">🔥 Trending</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="titles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Title Generator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Main Topic</Label>
                    <Input
                      id="topic"
                      placeholder="Enter your video topic..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateTitles}
                    disabled={isAnalyzing}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isAnalyzing ? "Generating..." : "Generate Titles"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Title Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {titleSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <span className="text-sm flex-1">{suggestion}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(suggestion)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="description" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Video Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your video content..."
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-primary hover:bg-primary/90">
                    Optimize Description
                  </Button>
                  <Button variant="outline">
                    Add Call-to-Action
                  </Button>
                  <Button variant="outline">
                    Insert Timestamps
                  </Button>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Optimization Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include your main keyword in the first 25 words</li>
                    <li>• Add timestamps for longer videos</li>
                    <li>• Include relevant links and social media</li>
                    <li>• End with a strong call-to-action</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hash className="mr-2 h-5 w-5" />
                    Hashtag Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Video Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., technology, education, tutorial"
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Generate Hashtags
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hashtagSuggestions.map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => copyToClipboard(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                    <p className="text-sm text-gray-600">
                      Click on any hashtag to copy it to your clipboard
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
