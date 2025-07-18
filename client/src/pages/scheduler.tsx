import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Calendar as CalendarIcon, Clock, Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const scheduleProjectMutation = useMutation({
    mutationFn: async ({ projectId, scheduledDate }: { projectId: number; scheduledDate: Date }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}`, { 
        status: "scheduled",
        scheduledDate: scheduledDate.toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Video scheduled successfully!",
      });
      setSelectedProject(null);
      setSelectedDate(undefined);
      setSelectedTime("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeProjects = projects?.filter(p => p.status === "complete") || [];
  const scheduledProjects = projects?.filter(p => p.status === "scheduled") || [];

  const handleSchedule = () => {
    if (!selectedProject || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a project, date, and time.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    scheduleProjectMutation.mutate({
      projectId: selectedProject,
      scheduledDate: scheduledDateTime,
    });
  };

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Scheduler</h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule your videos for optimal posting times
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule New Video */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Schedule New Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project">Select Video</Label>
                  <Select value={selectedProject?.toString() || ""} onValueChange={(value) => setSelectedProject(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a completed video" />
                    </SelectTrigger>
                    <SelectContent>
                      {completeProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Publication Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Publication Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={scheduleProjectMutation.isPending || !selectedProject || !selectedDate || !selectedTime}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {scheduleProjectMutation.isPending ? "Scheduling..." : "Schedule Video"}
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Scheduled Videos ({scheduledProjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : scheduledProjects.length > 0 ? (
                  <div className="space-y-3">
                    {scheduledProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {project.scheduledDate 
                                ? format(new Date(project.scheduledDate), "PPP 'at' HH:mm")
                                : "No date set"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Scheduled
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No scheduled videos yet.</p>
                    <p className="text-sm">Schedule your first video above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scheduling Tips & Calendar View */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Times to Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Weekdays</span>
                    <span className="text-sm text-green-600">2 PM - 4 PM</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Higher engagement rates</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">Saturdays</span>
                    <span className="text-sm text-blue-600">9 AM - 11 AM</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Weekend peak time</p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-800">Sundays</span>
                    <span className="text-sm text-yellow-600">2 PM - 4 PM</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Afternoon leisure time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule for tomorrow 2 PM
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule for this weekend
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule for next week
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduling Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Post consistently at the same times</p>
                <p>• Consider your audience's time zone</p>
                <p>• Avoid major holidays and events</p>
                <p>• Test different times to find your optimal schedule</p>
                <p>• Schedule 1-2 weeks in advance for best results</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
