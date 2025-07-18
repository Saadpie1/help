import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("draft"), // draft, processing, complete, scheduled, uploaded
  category: text("category").notNull(),
  videoLength: text("video_length").notNull(),
  progress: integer("progress").notNull().default(0),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  youtubeId: text("youtube_id"),
  scheduledDate: timestamp("scheduled_date"),
  metadata: jsonb("metadata").$type<{
    title?: string;
    description?: string;
    tags?: string[];
    keywords?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  service: text("service").notNull().unique(),
  status: text("status").notNull(), // online, offline, limited
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  message: text("message"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // upload, generate, schedule, etc.
  message: text("message").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  progress: true,
  thumbnailUrl: true,
  videoUrl: true,
  youtubeId: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  lastChecked: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type User = {
  id: number;
  username: string;
  password: string;
};

export type InsertUser = {
  username: string;
  password: string;
};
