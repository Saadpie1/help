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
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // For now, return undefined as we haven't implemented user authentication
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // For now, return undefined as we haven't implemented user authentication
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // For now, throw an error as we haven't implemented user authentication
    throw new Error("User creation not implemented");
  }

  async getProjects(): Promise<Project[]> {
    const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return result;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [result] = await db.select().from(projects).where(eq(projects.id, id));
    return result || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [result] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return result;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [result] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return result || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSystemStatuses(): Promise<SystemStatus[]> {
    const result = await db.select().from(systemStatus);
    return result;
  }

  async updateSystemStatus(service: string, status: InsertSystemStatus): Promise<SystemStatus> {
    const [existingStatus] = await db
      .select()
      .from(systemStatus)
      .where(eq(systemStatus.service, service));

    if (existingStatus) {
      const [result] = await db
        .update(systemStatus)
        .set({
          status: status.status,
          message: status.message,
          lastChecked: new Date(),
        })
        .where(eq(systemStatus.service, service))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(systemStatus)
        .values({
          service,
          status: status.status,
          message: status.message,
        })
        .returning();
      return result;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const result = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    return result;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [result] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return result;
  }

  async getStats(): Promise<{
    totalVideos: number;
    activeProjects: number;
    totalViews: string;
    queueCount: number;
  }> {
    const allProjects = await db.select().from(projects);
    const completedProjects = allProjects.filter(p => p.status === 'complete' || p.status === 'uploaded');
    const activeProjects = allProjects.filter(p => p.status === 'processing' || p.status === 'draft');
    const queuedProjects = allProjects.filter(p => p.status === 'scheduled');

    return {
      totalVideos: completedProjects.length,
      activeProjects: activeProjects.length,
      totalViews: "125.6K", // This would be calculated from YouTube API data
      queueCount: queuedProjects.length,
    };
  }
}

// Initialize database with sample data
async function initializeDatabaseWithSampleData() {
  try {
    // Check if we already have data
    const existingProjects = await db.select().from(projects);
    const existingStatuses = await db.select().from(systemStatus);
    
    if (existingProjects.length === 0) {
      // Add sample project
      await db.insert(projects).values({
        title: "Tech Reviews Series - Episode 1",
        topic: "Latest smartphone reviews and comparisons",
        category: "Technology",
        videoLength: "10-15 minutes",
        status: "draft",
        metadata: {
          title: "iPhone 15 Pro vs Samsung Galaxy S24 Ultra - Complete Comparison 2024",
          description: "In this video, we'll explore latest smartphone reviews and comparisons and cover everything you need to know. \n\n🎯 What you'll learn:\n• Key concepts and fundamentals\n• Practical examples and applications\n• Best practices and tips\n• Common mistakes to avoid\n\n📌 Timestamps:\n0:00 Introduction\n1:30 Getting Started\n3:45 Main Content\n8:20 Advanced Tips\n10:15 Conclusion\n\n🔗 Resources mentioned:\n• Related tutorials\n• Helpful tools and links\n• Community discussions\n\n👍 If you found this helpful, please like and subscribe for more content!\n\n#smartphone #reviews #comparisons #technology #tutorial #guide #2024\n\n---\nWant to learn more? Check out our other videos on related topics and don't forget to hit the notification bell to stay updated with our latest content!",
          tags: ["smartphone", "technology", "tutorial", "guide", "how to", "beginner", "learning", "education", "2024", "reviews", "comparisons"],
          keywords: ["smartphone", "reviews", "comparisons", "technology", "tutorial", "guide", "how to", "beginner", "learning", "education"]
        }
      });
    }
    
    if (existingStatuses.length === 0) {
      // Add sample system statuses
      await db.insert(systemStatus).values([
        { service: "TTS Service", status: "online", message: null },
        { service: "Video Generator", status: "online", message: null },
        { service: "YouTube API", status: "limited", message: "Rate limited" },
        { service: "Storage", status: "online", message: "2.1GB / 5GB" },
      ]);
    }
    
    // Add sample activities
    const existingActivities = await db.select().from(activities);
    if (existingActivities.length === 0) {
      await db.insert(activities).values([
        { type: "generate", message: "Content generation completed for tech review project", projectId: 1 },
        { type: "upload", message: "Video uploaded to YouTube successfully", projectId: 1 },
        { type: "schedule", message: "Video scheduled for 2:00 PM today", projectId: 1 },
      ]);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data
initializeDatabaseWithSampleData();
