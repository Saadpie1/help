import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Clock, 
  ThumbsUp, 
  MessageSquare,
  Share2,
  Play,
  Youtube
} from "lucide-react";
import { Project } from "@shared/schema";

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalSubscribers: number;
    avgWatchTime: string;
    engagementRate: string;
    totalVideos: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  performance: {
    viewsGrowth: string;
    subscriberGrowth: string;
    watchTimeGrowth: string;
    engagementGrowth: string;
  };
  topVideos: {
    title: string;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string;
  }[];
  recentMetrics: {
    date: string;
    views: number;
    subscribers: number;
    watchTime: number;
  }[];
}

export default function Analytics() {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Mock analytics data - in a real app, this would come from YouTube Analytics API
  const analyticsData: AnalyticsData = {
    overview: {
      totalViews: 1250000,
      totalSubscribers: 45200,
      avgWatchTime: "3:45",
      engagementRate: "5.2%",
      totalVideos: 247,
      totalLikes: 89500,
      totalComments: 12300,
      totalShares: 5600,
    },
    performance: {
      viewsGrowth: "+24.5%",
      subscriberGrowth: "+12.3%",
      watchTimeGrowth: "+18.7%",
      engagementGrowth: "+8.9%",
    },
    topVideos: [
      {
        title: "React Tutorial: Complete Guide for Beginners",
        views: 125000,
        likes: 8500,
        comments: 1200,
        publishedAt: "2024-01-15",
      },
      {
        title: "JavaScript ES6 Features You Must Know",
        views: 98000,
        likes: 6200,
        comments: 890,
        publishedAt: "2024-01-10",
      },
      {
        title: "Building Your First Web App",
        views: 87000,
        likes: 5800,
        comments: 745,
        publishedAt: "2024-01-05",
      },
    ],
    recentMetrics: [
      { date: "2024-01-20", views: 15000, subscribers: 120, watchTime: 2800 },
      { date: "2024-01-19", views: 12500, subscribers: 95, watchTime: 2350 },
      { date: "2024-01-18", views: 18000, subscribers: 140, watchTime: 3200 },
      { date: "2024-01-17", views: 14000, subscribers: 110, watchTime: 2900 },
      { date: "2024-01-16", views: 16500, subscribers: 125, watchTime: 3100 },
    ],
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    growth, 
    color = "text-primary" 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    growth?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
              {icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {growth && (
            <div className="text-right">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {growth}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your YouTube channel performance and growth
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="30days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Views"
                value={formatNumber(analyticsData.overview.totalViews)}
                icon={<Eye className="h-5 w-5 text-primary" />}
                growth={analyticsData.performance.viewsGrowth}
                color="text-primary"
              />
              <MetricCard
                title="Subscribers"
                value={formatNumber(analyticsData.overview.totalSubscribers)}
                icon={<Users className="h-5 w-5 text-secondary" />}
                growth={analyticsData.performance.subscriberGrowth}
                color="text-secondary"
              />
              <MetricCard
                title="Watch Time"
                value={analyticsData.overview.avgWatchTime}
                icon={<Clock className="h-5 w-5 text-accent" />}
                growth={analyticsData.performance.watchTimeGrowth}
                color="text-accent"
              />
              <MetricCard
                title="Engagement Rate"
                value={analyticsData.overview.engagementRate}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                growth={analyticsData.performance.engagementGrowth}
                color="text-green-600"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.recentMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm font-medium">{formatDate(metric.date)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatNumber(metric.views)} views</span>
                          <span>+{metric.subscribers} subs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Views Growth</span>
                      <span className="text-sm text-green-600">{analyticsData.performance.viewsGrowth}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subscriber Growth</span>
                      <span className="text-sm text-green-600">{analyticsData.performance.subscriberGrowth}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Watch Time Growth</span>
                      <span className="text-sm text-green-600">{analyticsData.performance.watchTimeGrowth}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Growth</span>
                      <span className="text-sm text-green-600">{analyticsData.performance.engagementGrowth}</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topVideos.map((video, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatNumber(video.views)}
                            </span>
                            <span className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {formatNumber(video.likes)}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {formatNumber(video.comments)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Published {formatDate(video.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analyticsData.overview.totalLikes)}
                      </p>
                      <p className="text-sm text-gray-500">Total Likes</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analyticsData.overview.totalComments)}
                      </p>
                      <p className="text-sm text-gray-500">Total Comments</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Share2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analyticsData.overview.totalShares)}
                      </p>
                      <p className="text-sm text-gray-500">Total Shares</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Play className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.totalVideos}
                      </p>
                      <p className="text-sm text-gray-500">Total Videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Age 18-24</span>
                      <span className="text-sm text-gray-500">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Age 25-34</span>
                      <span className="text-sm text-gray-500">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Age 35-44</span>
                      <span className="text-sm text-gray-500">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Age 45+</span>
                      <span className="text-sm text-gray-500">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { country: "United States", percentage: 45 },
                    { country: "United Kingdom", percentage: 12 },
                    { country: "Canada", percentage: 8 },
                    { country: "Australia", percentage: 7 },
                    { country: "Germany", percentage: 6 },
                    { country: "India", percentage: 5 },
                    { country: "Others", percentage: 17 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.country}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { category: "Technology", videos: 89, avgViews: "15.2K", engagement: "6.8%" },
                    { category: "Education", videos: 67, avgViews: "12.5K", engagement: "5.4%" },
                    { category: "Entertainment", videos: 45, avgViews: "18.7K", engagement: "7.2%" },
                    { category: "Lifestyle", videos: 32, avgViews: "9.8K", engagement: "4.9%" },
                    { category: "Review", videos: 28, avgViews: "22.1K", engagement: "8.1%" },
                    { category: "Tutorial", videos: 56, avgViews: "16.3K", engagement: "6.5%" },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{item.category}</h3>
                        <Badge variant="secondary">{item.videos} videos</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Avg Views:</span>
                          <span className="font-medium">{item.avgViews}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Engagement:</span>
                          <span className="font-medium text-green-600">{item.engagement}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
