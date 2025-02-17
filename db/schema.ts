// db/schema.ts
import { pgTable, serial, text, timestamp, boolean, json, integer, uuid, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Enums for fixed values
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const SpaceType = {
  PROJECT: 'project',
  TEAM: 'team',
  DEPARTMENT: 'department',
} as const;

export const PageType = {
  DOC: 'doc',
  DATABASE: 'database',
  BOARD: 'board',
  CALENDAR: 'calendar',
} as const;

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const WorkspacePlan = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  image: text('image_url'),
  avatar: text('avatar_url'),
  role: text('role').default('user').notNull(),
  password: text('password').notNull(),
  preferences: json('preferences').$type<{
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
      mentions: boolean;
      updates: boolean;
    };
    defaultView: 'board' | 'list' | 'calendar' | 'timeline';
    shortcuts: Record<string, string>;
  }>(),
  isVerified: boolean('is_verified').default(false).notNull(),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  settings: json('settings').$type<{
    features: {
      tasks: boolean;
      wiki: boolean;
      files: boolean;
      calendar: boolean;
      timeTracking: boolean;
      automation: boolean;
    };
    branding: {
      logo?: string;
      favicon?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
    };
    security: {
      mfa: boolean;
      sso: boolean;
      passwordPolicy: {
        minLength: number;
        requireSpecialChars: boolean;
      };
    };
  }>(),
  plan: text('plan').default(WorkspacePlan.FREE).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isPersonal: boolean('is_personal').notNull().default(false),
  workspaceId: integer('workspace_id').references(() => workspaces.id),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
})

// Kanban board columns
export const kanbanColumns = pgTable('kanban_columns', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  kanbanColumnId: integer('kanban_column_id').references(() => kanbanColumns.id),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  priority: text('priority').default('medium').notNull(),
  status: text('status').default('todo').notNull(),
  assigneeId: integer('assignee_id').references(() => users.id),
  parentTaskId: integer('parent_task_id'), // For subtasks
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Task dependencies table
export const taskDependencies = pgTable('task_dependencies', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  dependsOnId: integer('depends_on_id').references(() => tasks.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Events table (for calendar integration)
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: text('location'),
  googleCalendarEventId: text('google_calendar_event_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Workspace Members junction table
export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(),
  permissions: json('permissions').$type<{
    access: 'full' | 'limited' | 'readonly';
    allowedActions: string[];
    restrictedSpaces?: string[];
  }>(),
  status: text('status').default('active').notNull(),
  invitedBy: text('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (t) => ({
  unq: primaryKey(t.workspaceId, t.userId)
}));

// Project Members junction table
export const projectMembers = pgTable('project_members', {
  projectId: integer('project_id').references(() => projects.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey(t.projectId, t.userId),
}));

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Activity Log table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: 'assignee' }),
  activityLogs: many(activityLogs),
  comments: many(comments),
}));

export const projectRelations = relations(projects, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id]
  }),
  tasks: many(tasks),
  events: many(events),
  activityLogs: many(activityLogs),
  members: many(projectMembers),
}));

export const kanbanColumnRelations = relations(kanbanColumns, ({ many }) => ({
  tasks: many(tasks),
}));

export const workspaceRelations = relations(workspaces, ({ many, one  }) => ({
  members: many(workspaceMembers),
  projects: many(projects),
  events: many(events),
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id]
  })
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  kanbanColumn: one(kanbanColumns, {
    fields: [tasks.kanbanColumnId],
    references: [kanbanColumns.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  subtasks: many(tasks, { relationName: 'parentTask' }),
  dependencies: many(taskDependencies, { relationName: 'taskDependencies' }),
  comments: many(comments),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
  }),
  dependsOn: one(tasks, {
    fields: [taskDependencies.dependsOnId],
    references: [tasks.id],
  }),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type NewKanbanColumn = typeof kanbanColumns.$inferInsert;

export type TaskDependency = typeof taskDependencies.$inferSelect;
export type NewTaskDependency = typeof taskDependencies.$inferInsert;