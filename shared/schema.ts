import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// MCP Server schema
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // local, remote, docker, cloud
  address: text("address").notNull(),
  port: integer("port").notNull(),
  status: text("status").notNull().default("inactive"), // active, inactive, warning, error
  cpuUsage: integer("cpu_usage").default(0),
  memoryUsage: integer("memory_usage").default(0),
  totalMemory: integer("total_memory").default(8),
  models: text("models").array(),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
  isWorker: boolean("is_worker").default(false),
});

export const insertServerSchema = createInsertSchema(servers)
  .omit({ id: true, createdAt: true, lastActive: true })
  .extend({
    port: z.coerce.number().min(1).max(65535),
    cpuUsage: z.coerce.number().min(0).max(100).optional(),
    memoryUsage: z.coerce.number().min(0).optional(),
    totalMemory: z.coerce.number().min(1).optional(),
  });

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

// MCP Tool schema
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  serverId: integer("server_id").notNull(),
  installed: boolean("installed").default(false),
  active: boolean("active").default(false),
  categories: text("categories").array().default([]),
  inputSchema: jsonb("input_schema").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const insertToolSchema = createInsertSchema(tools)
  .omit({ id: true, createdAt: true, lastUsed: true });

export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;

// Connected Applications schema
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // desktop, cli, web, ide
  version: text("version"),
  serverId: integer("server_id").notNull(),
  status: text("status").notNull().default("inactive"), // active, inactive, warning, error
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertAppSchema = createInsertSchema(apps)
  .omit({ id: true, lastActive: true });

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

// Activity Log schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // info, success, warning, error
  message: text("message").notNull(),
  serverId: integer("server_id"),
  appId: integer("app_id"),
  toolId: integer("tool_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, createdAt: true });

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
