import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: "positive" | "neutral";
  subtitle?: string;
  bgColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "positive", 
  subtitle,
  bgColor = "bg-primary"
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden shadow">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${bgColor} bg-opacity-10 rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {(change || subtitle) && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            {change && (
              <>
                <span className={`font-medium ${changeType === "positive" ? "text-secondary" : "text-gray-500"}`}>
                  {change}
                </span>
                <span className="text-gray-500"> from last month</span>
              </>
            )}
            {subtitle && (
              <span className="text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
