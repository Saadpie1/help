import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@shared/schema";
import { Check, Image, Clock } from "lucide-react";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Check className="text-green-600 h-3 w-3" />;
      case "generate":
        return <Image className="text-blue-600 h-3 w-3" />;
      case "schedule":
        return <Clock className="text-yellow-600 h-3 w-3" />;
      default:
        return <Check className="text-gray-600 h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-green-100";
      case "generate":
        return "bg-blue-100";
      case "schedule":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center mr-3`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(activity.createdAt)}</p>
            </div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}
