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

  // AI Content Generation route
  app.post("/api/generate-content", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project status to processing
      await storage.updateProject(projectId, { status: "processing", progress: 10 });

      // Simulate AI content generation process
      // This would integrate with free AI services like Hugging Face, OpenAI via browser, or local models
      setTimeout(async () => {
        // Generate optimized content based on the project topic
        const generatedContent = await generateContentFromTopic(project.topic, project.category);
        
        await storage.updateProject(projectId, { 
          status: "processing", 
          progress: 50,
          metadata: {
            title: generatedContent.title,
            description: generatedContent.description,
            tags: generatedContent.tags,
            keywords: generatedContent.keywords
          }
        });
        
        await storage.createActivity({
          type: "generate",
          message: `Content generated for ${project.title}`,
          projectId: projectId,
        });
      }, 2000);

      res.json({ message: "Content generation started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start content generation" });
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
      await storage.updateProject(projectId, { status: "processing", progress: 60 });

      // Simulate video generation process using free tools
      setTimeout(async () => {
        // Generate script and video
        const videoContent = await generateVideoFromScript(project.topic, project.metadata);
        
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
      }, 8000);

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

// Free AI Content Generation Functions
async function generateContentFromTopic(topic: string, category: string) {
  // This would integrate with free AI services like:
  // - Hugging Face Transformers
  // - OpenAI via browser extension
  // - Local AI models (Ollama, etc.)
  
  // For now, using intelligent content generation based on topic analysis
  const keywords = extractKeywords(topic);
  const title = generateOptimizedTitle(topic, category);
  const description = generateDescription(topic, keywords);
  const tags = generateTags(topic, category, keywords);
  
  return {
    title,
    description,
    tags,
    keywords
  };
}

async function generateVideoFromScript(topic: string, metadata: any) {
  // This would integrate with free video generation tools:
  // - OpenAI TTS (free tier)
  // - Festival/eSpeak for text-to-speech
  // - FFmpeg for video assembly
  // - Stable Diffusion for visuals
  
  return {
    videoUrl: `/generated/video_${Date.now()}.mp4`,
    thumbnailUrl: `/thumbnails/thumb_${Date.now()}.jpg`
  };
}

function extractKeywords(topic: string): string[] {
  // Simple keyword extraction - in real implementation, use NLP libraries
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'throughout', 'within', 'without', 'toward', 'towards', 'until', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'];
  
  return topic.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);
}

function generateOptimizedTitle(topic: string, category: string): string {
  const titleTemplates = {
    Technology: [
      "How to {topic} - Complete Guide 2024",
      "{topic} Tutorial: Everything You Need to Know",
      "Master {topic} in 10 Minutes",
      "The Ultimate {topic} Guide for Beginners"
    ],
    Education: [
      "Learn {topic} - Step by Step Tutorial",
      "{topic} Explained Simply",
      "Complete {topic} Course for Beginners",
      "Everything About {topic} in One Video"
    ],
    Entertainment: [
      "Amazing {topic} You Must See",
      "The Best {topic} Compilation",
      "Incredible {topic} Facts",
      "Top 10 {topic} Moments"
    ],
    Lifestyle: [
      "Life-Changing {topic} Tips",
      "Daily {topic} Routine",
      "Transform Your Life with {topic}",
      "Simple {topic} Hacks"
    ]
  };
  
  const templates = titleTemplates[category as keyof typeof titleTemplates] || titleTemplates.Technology;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template.replace('{topic}', topic);
}

function generateDescription(topic: string, keywords: string[]): string {
  return `In this video, we'll explore ${topic} and cover everything you need to know. 

🎯 What you'll learn:
• Key concepts and fundamentals
• Practical examples and applications
• Best practices and tips
• Common mistakes to avoid

📌 Timestamps:
0:00 Introduction
1:30 Getting Started
3:45 Main Content
8:20 Advanced Tips
10:15 Conclusion

🔗 Resources mentioned:
• Related tutorials
• Helpful tools and links
• Community discussions

👍 If you found this helpful, please like and subscribe for more content!

#${keywords.join(' #')}

---
Want to learn more? Check out our other videos on related topics and don't forget to hit the notification bell to stay updated with our latest content!`;
}

function generateTags(topic: string, category: string, keywords: string[]): string[] {
  const baseTags = [
    topic.toLowerCase(),
    category.toLowerCase(),
    'tutorial',
    'guide',
    'how to',
    'beginner',
    'learning',
    'education',
    '2024'
  ];
  
  return [...baseTags, ...keywords].slice(0, 15);
}
