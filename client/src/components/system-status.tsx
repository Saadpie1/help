import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemStatus } from "@shared/schema";

export default function SystemStatusCard() {
  const { data: statuses, isLoading } = useQuery<SystemStatus[]>({
    queryKey: ["/api/system-status"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "status-online";
      case "offline":
        return "status-offline";
      case "limited":
        return "status-limited";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "limited":
        return "Rate Limited";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-3 animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
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
        <CardTitle className="text-lg font-medium text-gray-900">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses?.map((status) => (
          <div key={status.service} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`status-dot ${getStatusColor(status.status)} mr-3`}></div>
              <span className="text-sm text-gray-900">{status.service}</span>
            </div>
            <span
              className={`text-sm font-medium ${
                status.status === "online"
                  ? "text-green-600"
                  : status.status === "limited"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {status.message || getStatusText(status.status)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
