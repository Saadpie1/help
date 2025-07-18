import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

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

      // Generate video using free tools
      setTimeout(async () => {
        try {
          console.log('Starting video generation for project:', projectId);
          
          // Generate script and video
          const videoContent = await generateVideoFromScript(project.topic, project.metadata, projectId);
          
          await storage.updateProject(projectId, { 
            status: "complete", 
            progress: 100,
            videoUrl: videoContent.videoUrl,
            thumbnailUrl: videoContent.thumbnailUrl
          });
          
          await storage.createActivity({
            type: "generate",
            message: `Video generation completed for ${project.title}`,
            projectId: projectId,
          });
          
          console.log('Video generation completed successfully');
        } catch (error: any) {
          console.error('Video generation failed:', error);
          
          await storage.updateProject(projectId, { 
            status: "draft", 
            progress: 0
          });
          
          await storage.createActivity({
            type: "error",
            message: `Video generation failed for ${project.title}: ${error?.message || 'Unknown error'}`,
            projectId: projectId,
          });
        }
      }, 3000);

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

async function generateVideoFromScript(topic: string, metadata: any, projectId: number): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  try {
    // Generate script content
    const script = generateVideoScript(topic, metadata);
    
    // Create audio using text-to-speech (using system TTS for free)
    const audioPath = await generateAudio(script, projectId);
    
    // Create video with visuals
    const videoPath = await createVideoWithFFmpeg(audioPath, topic, projectId);
    
    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(topic, projectId);
    
    return {
      videoUrl: `/generated/video_${projectId}.mp4`,
      thumbnailUrl: `/thumbnails/thumb_${projectId}.jpg`
    };
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error('Failed to generate video');
  }
}

function generateVideoScript(topic: string, metadata: any): string {
  const keywords = extractKeywords(topic);
  const categoryContent = generateCategorySpecificContent(topic, metadata?.category || 'Technology');
  
  return `Welcome to our channel! I'm excited to share this comprehensive guide on ${topic}.

${categoryContent.introduction}

Let me break this down into digestible sections that will help you master ${topic}.

Section One: Getting Started
${categoryContent.section1}

Section Two: Core Concepts  
${categoryContent.section2}

Section Three: Practical Applications
${categoryContent.section3}

Pro Tips and Best Practices:
${categoryContent.tips}

Common Mistakes to Avoid:
${categoryContent.mistakes}

Advanced Techniques:
${categoryContent.advanced}

Conclusion:
${categoryContent.conclusion}

That's everything you need to know about ${topic}. If this helped you, please give it a thumbs up and subscribe for more content. Drop your questions in the comments below, and I'll see you in the next video!`;
}

function generateCategorySpecificContent(topic: string, category: string) {
  const templates = {
    Technology: {
      introduction: `${topic} is revolutionizing how we approach modern technology. Whether you're a beginner or looking to expand your skills, this guide covers everything from basics to advanced techniques.`,
      section1: `First, let's understand what ${topic} actually is and why it matters in today's digital landscape. We'll start with the fundamental concepts that form the foundation.`,
      section2: `Now that we understand the basics, let's explore the core principles that make ${topic} so powerful and widely adopted across industries.`,
      section3: `Here's where it gets practical. I'll show you real-world examples of how ${topic} is being used to solve actual problems and create value.`,
      tips: `Always start with the documentation. Keep your implementations simple and readable. Test frequently and iterate based on feedback.`,
      mistakes: `Don't overcomplicate your initial approach. Avoid skipping the learning fundamentals. Never ignore security considerations.`,
      advanced: `For those ready to go deeper, we'll explore optimization techniques, advanced patterns, and integration strategies that professionals use.`,
      conclusion: `${topic} opens up incredible possibilities. Start with small projects, practice regularly, and don't be afraid to experiment.`
    },
    Education: {
      introduction: `Learning ${topic} effectively requires the right approach and understanding. This comprehensive guide will take you from beginner to confident practitioner.`,
      section1: `Let's establish a strong foundation by understanding the key concepts and terminology you'll encounter throughout your ${topic} journey.`,
      section2: `Building on our foundation, we'll explore the essential skills and knowledge areas that every learner should master.`,
      section3: `Theory meets practice as we work through examples and exercises that demonstrate real-world application of ${topic} principles.`,
      tips: `Set clear learning goals. Practice consistently. Connect new knowledge to what you already know. Use multiple learning resources.`,
      mistakes: `Don't rush through fundamentals. Avoid passive learning without practice. Don't study in isolation without seeking feedback.`,
      advanced: `Advanced learners can explore specialized techniques, research methodologies, and ways to teach others what they've learned.`,
      conclusion: `Mastering ${topic} is a journey, not a destination. Stay curious, keep practicing, and remember that everyone learns at their own pace.`
    },
    Entertainment: {
      introduction: `Get ready for an amazing exploration of ${topic}! We're diving into the most fascinating aspects that will entertain and inform you.`,
      section1: `Let's start with the most interesting and surprising facts about ${topic} that most people don't know.`,
      section2: `Here are the coolest features and most impressive examples that showcase why ${topic} is so captivating.`,
      section3: `Now for the fun part - let's see ${topic} in action with some incredible examples and demonstrations.`,
      tips: `Keep an open mind. Look for connections to things you enjoy. Share interesting discoveries with friends.`,
      mistakes: `Don't take everything too seriously. Avoid getting overwhelmed by information. Don't forget to have fun while learning.`,
      advanced: `For enthusiasts, we'll explore the deeper mysteries and most impressive achievements in the world of ${topic}.`,
      conclusion: `${topic} continues to amaze and inspire. Keep exploring, stay curious, and remember that the best discoveries often come from asking simple questions.`
    },
    Lifestyle: {
      introduction: `Transform your daily life with ${topic}. This practical guide shows you how to integrate powerful concepts into your everyday routine.`,
      section1: `Let's start with simple changes you can make today that will have an immediate positive impact on your ${topic} journey.`,
      section2: `Building sustainable habits around ${topic} requires understanding the psychology and practical steps that actually work.`,
      section3: `See how real people have successfully implemented ${topic} strategies and the results they've achieved.`,
      tips: `Start small and build consistency. Track your progress. Celebrate small wins. Adjust strategies based on what works for you.`,
      mistakes: `Don't try to change everything at once. Avoid comparing your journey to others. Don't give up after temporary setbacks.`,
      advanced: `Advanced practitioners can explore optimization techniques, long-term planning strategies, and ways to help others on their journey.`,
      conclusion: `${topic} is about creating a life you love. Be patient with yourself, stay consistent, and remember that small changes compound over time.`
    }
  };
  
  return templates[category as keyof typeof templates] || templates.Technology;
}

async function generateAudio(script: string, projectId: number): Promise<string> {
  const audioPath = path.join(process.cwd(), 'public', 'generated', `audio_${projectId}.wav`);
  
  // Use espeak (free text-to-speech) to generate audio
  return new Promise((resolve, reject) => {
    const espeak = spawn('espeak', [
      '-s', '150', // Speech rate (words per minute)
      '-v', 'en', // Voice (English)
      '-w', audioPath, // Output file
      script
    ]);
    
    espeak.on('close', (code) => {
      if (code === 0) {
        resolve(audioPath);
      } else {
        // Fallback: create a silent audio file if espeak fails
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'lavfi',
          '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
          '-t', '30', // 30 seconds duration
          '-y',
          audioPath
        ]);
        
        ffmpeg.on('close', (fallbackCode) => {
          if (fallbackCode === 0) {
            resolve(audioPath);
          } else {
            reject(new Error('Failed to generate audio'));
          }
        });
      }
    });
    
    espeak.on('error', () => {
      // Fallback if espeak is not available
      const ffmpeg = spawn('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-t', '30',
        '-y',
        audioPath
      ]);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(audioPath);
        } else {
          reject(new Error('Failed to generate audio'));
        }
      });
    });
  });
}

async function createVideoWithFFmpeg(audioPath: string, topic: string, projectId: number): Promise<string> {
  const videoPath = path.join(process.cwd(), 'public', 'generated', `video_${projectId}.mp4`);
  
  return new Promise((resolve, reject) => {
    // Create a simple video with colored background and text overlay
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=0x2563eb:size=1920x1080:duration=30', // Blue background
      '-i', audioPath,
      '-vf', `drawtext=fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='${topic.replace(/'/g, "\\'")}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
      '-y',
      videoPath
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(videoPath);
      } else {
        reject(new Error('Failed to create video'));
      }
    });
    
    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

async function generateThumbnail(topic: string, projectId: number): Promise<string> {
  const thumbnailPath = path.join(process.cwd(), 'public', 'thumbnails', `thumb_${projectId}.jpg`);
  
  return new Promise((resolve, reject) => {
    // Create thumbnail using ImageMagick
    const convert = spawn('convert', [
      '-size', '1280x720',
      'xc:#2563eb', // Blue background
      '-gravity', 'center',
      '-fill', 'white',
      '-pointsize', '72',
      '-font', 'DejaVu-Sans-Bold',
      '-annotate', '0', topic,
      thumbnailPath
    ]);
    
    convert.on('close', (code) => {
      if (code === 0) {
        resolve(thumbnailPath);
      } else {
        // Fallback with FFmpeg if ImageMagick fails
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'lavfi',
          '-i', 'color=c=0x2563eb:size=1280x720:duration=1',
          '-vf', `drawtext=fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='${topic.replace(/'/g, "\\'")}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
          '-frames:v', '1',
          '-y',
          thumbnailPath
        ]);
        
        ffmpeg.on('close', (fallbackCode) => {
          if (fallbackCode === 0) {
            resolve(thumbnailPath);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        });
      }
    });
    
    convert.on('error', () => {
      // Fallback with FFmpeg
      const ffmpeg = spawn('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'color=c=0x2563eb:size=1280x720:duration=1',
        '-vf', `drawtext=fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='${topic.replace(/'/g, "\\'")}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
        '-frames:v', '1',
        '-y',
        thumbnailPath
      ]);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(thumbnailPath);
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      });
    });
  });
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
