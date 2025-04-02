import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Server model for MCP servers
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("inactive"), // active, inactive, warning, error
  port: integer("port").notNull(),
  model: text("model").notNull(),
  autoStart: boolean("auto_start").default(false),
  cpuUsage: integer("cpu_usage").default(0),
  memory: integer("memory").default(0),
  uptime: integer("uptime").default(0), // in seconds
  lastActive: timestamp("last_active").defaultNow(),
  config: jsonb("config").notNull(),
  connectedApps: text("connected_apps").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServerSchema = createInsertSchema(servers).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Global configuration
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
  updatedAt: true,
});

// Command logs
export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  command: text("command").notNull(),
  output: text("output").notNull(),
  status: text("status").notNull(), // success, error, pending
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;

export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;

// Constants
export const SERVER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  WARNING: "warning",
  ERROR: "error",
} as const;

export const COMMAND_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  PENDING: "pending",
} as const;

export const DEFAULT_MODELS = [
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "claude-3.5-sonnet"
] as const;
