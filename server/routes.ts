import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // System status routes
  app.get("/api/system-status", async (req, res) => {
    try {
      const statuses = await storage.getSystemStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Video generation route
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project status to processing
      await storage.updateProject(projectId, { status: "processing", progress: 10 });

      // Simulate video generation process
      // In a real implementation, this would trigger actual video generation services
      setTimeout(async () => {
        await storage.updateProject(projectId, { 
          status: "complete", 
          progress: 100,
          videoUrl: `/generated/${projectId}.mp4`,
          thumbnailUrl: `/thumbnails/${projectId}.jpg`
        });
        
        await storage.createActivity({
          type: "generate",
          message: `Video generation completed for ${project.title}`,
          projectId: projectId,
        });
      }, 5000);

      res.json({ message: "Video generation started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start video generation" });
    }
  });

  // Thumbnail generation route
  app.post("/api/generate-thumbnail", async (req, res) => {
    try {
      const { projectId, text, style } = req.body;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Simulate thumbnail generation
      const thumbnailUrl = `/thumbnails/${projectId}_${Date.now()}.jpg`;
      await storage.updateProject(projectId, { thumbnailUrl });

      await storage.createActivity({
        type: "generate",
        message: `Thumbnail generated for ${project.title}`,
        projectId: projectId,
      });

      res.json({ thumbnailUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate thumbnail" });
    }
  });

  // Upload to YouTube route
  app.post("/api/upload-youtube", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Simulate YouTube upload
      const youtubeId = `yt_${Date.now()}_${projectId}`;
      await storage.updateProject(projectId, { 
        status: "uploaded", 
        youtubeId 
      });

      await storage.createActivity({
        type: "upload",
        message: `Video uploaded to YouTube: ${project.title}`,
        projectId: projectId,
      });

      res.json({ youtubeId, message: "Video uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload to YouTube" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
