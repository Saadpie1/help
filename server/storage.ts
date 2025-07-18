import { 
  projects, 
  systemStatus, 
  activities, 
  type Project, 
  type InsertProject,
  type SystemStatus,
  type InsertSystemStatus,
  type Activity,
  type InsertActivity,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // System status methods
  getSystemStatuses(): Promise<SystemStatus[]>;
  updateSystemStatus(service: string, status: InsertSystemStatus): Promise<SystemStatus>;

  // Activity methods
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Stats methods
  getStats(): Promise<{
    totalVideos: number;
    activeProjects: number;
    totalViews: string;
    queueCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private systemStatuses: Map<string, SystemStatus>;
  private activities: Activity[];
  private currentUserId: number;
  private currentProjectId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.systemStatuses = new Map();
    this.activities = [];
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentActivityId = 1;

    // Initialize system statuses
    this.initializeSystemStatuses();
    this.initializeSampleData();
  }

  private initializeSystemStatuses() {
    const statuses = [
      { service: "TTS Service", status: "online", message: null },
      { service: "Video Generator", status: "online", message: null },
      { service: "YouTube API", status: "limited", message: "Rate limited" },
      { service: "Storage", status: "online", message: "2.1GB / 5GB" },
    ];

    statuses.forEach((status) => {
      this.systemStatuses.set(status.service, {
        id: this.systemStatuses.size + 1,
        service: status.service,
        status: status.status,
        lastChecked: new Date(),
        message: status.message,
      });
    });
  }

  private initializeSampleData() {
    // Create sample projects
    const sampleProjects = [
      {
        title: "Tech Reviews Series - Episode 12",
        topic: "Latest smartphone review and comparison",
        status: "processing",
        category: "Technology",
        videoLength: "Medium (1-5 min)",
        progress: 65,
        metadata: {},
        scheduledDate: null,
        thumbnailUrl: null,
        videoUrl: null,
        youtubeId: null,
      },
      {
        title: "How to Code React - Beginner Guide",
        topic: "Complete React tutorial for beginners",
        status: "complete",
        category: "Education",
        videoLength: "Long (5+ min)",
        progress: 100,
        metadata: {},
        scheduledDate: null,
        thumbnailUrl: null,
        videoUrl: null,
        youtubeId: null,
      },
      {
        title: "Daily Motivation - Day 5",
        topic: "Morning motivation and productivity tips",
        status: "scheduled",
        category: "Lifestyle",
        videoLength: "Short (< 1 min)",
        progress: 100,
        metadata: {},
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        thumbnailUrl: null,
        videoUrl: null,
        youtubeId: null,
      },
    ];

    sampleProjects.forEach((project) => {
      const id = this.currentProjectId++;
      this.projects.set(id, {
        id,
        ...project,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Create sample activities
    const sampleActivities = [
      {
        type: "upload",
        message: "Video uploaded successfully",
        projectId: 1,
      },
      {
        type: "generate",
        message: "Thumbnail generated",
        projectId: 3,
      },
      {
        type: "schedule",
        message: "Video scheduled",
        projectId: 2,
      },
    ];

    sampleActivities.forEach((activity) => {
      this.activities.push({
        id: this.currentActivityId++,
        ...activity,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      id,
      title: insertProject.title,
      topic: insertProject.topic,
      status: insertProject.status || "draft",
      category: insertProject.category,
      videoLength: insertProject.videoLength,
      scheduledDate: insertProject.scheduledDate || null,
      progress: 0,
      thumbnailUrl: null,
      videoUrl: null,
      youtubeId: null,
      metadata: insertProject.metadata as Project['metadata'] || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    
    // Create activity
    await this.createActivity({
      type: "create",
      message: `Project created: ${project.title}`,
      projectId: id,
    });

    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getSystemStatuses(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatuses.values());
  }

  async updateSystemStatus(service: string, status: InsertSystemStatus): Promise<SystemStatus> {
    const existingStatus = this.systemStatuses.get(service);
    const id = existingStatus?.id || this.systemStatuses.size + 1;
    
    const updatedStatus: SystemStatus = {
      id,
      service,
      status: status.status,
      message: status.message || null,
      lastChecked: new Date(),
    };
    
    this.systemStatuses.set(service, updatedStatus);
    return updatedStatus;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return this.activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      id: this.currentActivityId++,
      type: activity.type,
      message: activity.message,
      projectId: activity.projectId || null,
      createdAt: new Date(),
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  async getStats(): Promise<{
    totalVideos: number;
    activeProjects: number;
    totalViews: string;
    queueCount: number;
  }> {
    const allProjects = Array.from(this.projects.values());
    const completedProjects = allProjects.filter(p => p.status === "complete" || p.status === "uploaded");
    const activeProjects = allProjects.filter(p => p.status === "processing" || p.status === "draft");
    const queueProjects = allProjects.filter(p => p.status === "processing");

    return {
      totalVideos: completedProjects.length,
      activeProjects: activeProjects.length,
      totalViews: "1.2M", // Mock data
      queueCount: queueProjects.length,
    };
  }
}

export const storage = new MemStorage();
