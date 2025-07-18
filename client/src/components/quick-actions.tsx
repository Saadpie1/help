import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Image, Search, Upload } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Create New Video",
      icon: Plus,
      action: () => setLocation("/video-creator"),
      primary: true,
    },
    {
      title: "Generate Thumbnail",
      icon: Image,
      action: () => setLocation("/thumbnail-studio"),
    },
    {
      title: "Keyword Research",
      icon: Search,
      action: () => setLocation("/content-optimizer"),
    },
    {
      title: "Bulk Upload",
      icon: Upload,
      action: () => setLocation("/upload-manager"),
    },
  ];

  return (
    <Card className="shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              onClick={action.action}
              className={`w-full justify-start font-medium transition-colors ${
                action.primary
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              size="lg"
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.title}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
