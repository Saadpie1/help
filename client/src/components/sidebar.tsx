import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Video, 
  Image, 
  Hash, 
  Upload, 
  Calendar, 
  BarChart3,
  Play,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Video Creator", href: "/video-creator", icon: Video },
  { name: "Thumbnail Studio", href: "/thumbnail-studio", icon: Image },
  { name: "Content Optimizer", href: "/content-optimizer", icon: Hash },
  { name: "Content Preview", href: "/content-preview", icon: Play },
  { name: "Upload Manager", href: "/upload-manager", icon: Upload },
  { name: "Scheduler", href: "/scheduler", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0 md:w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col w-full">
        {/* Logo and Brand */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Play className="text-white h-4 w-4" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">YT Studio</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="flex items-center px-4 py-4 border-t border-gray-200">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 h-4 w-4" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Creator Pro</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
