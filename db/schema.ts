// db/schema.ts
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  json,
  integer,
  uuid,
  primaryKey,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  isVerified: boolean('is_verified').default(false).notNull(), // Changed to boolean
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
  .$onUpdate(() => new Date()),
});

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  content: json('content').$type<any>(), // Store rich text content as JSON
  type: text('type').notNull(), // 'note' or 'todo'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdById: integer('created_by_id').references(() => users.id),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id').references(() => pages.id).notNull(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false).notNull(),
  dueDate: timestamp('due_date'),
  priority: text('priority').default('medium'), // 'low', 'medium', 'high'
  assignedToId: integer('assigned_to_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().
  $onUpdate(() => new Date()),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type'), // 'note' or 'todo'
  isPersonal: boolean('is_personal').default(false).notNull(),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().
  $onUpdate(() => new Date()),
});

// Kanban board columns
export const kanbanColumns = pgTable('kanban_columns', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),  // Column name like "To Do", "In Progress", etc.
  position: integer('position').default(0).notNull(),  // Order of the column
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
  .$onUpdate(() => new Date()),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
  .$onUpdate(() => new Date()),
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
  updatedAt: timestamp('updated_at').defaultNow().notNull().
  $onUpdate(() => new Date()),
});

// Workspace Members junction table
export const workspaceMembers = pgTable('workspace_members', {
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey(t.workspaceId, t.userId),
}));

export const projectMembers = pgTable('project_members', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(), // 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().
  $onUpdate(() => new Date()),
});

// Activity Log table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  entityType: text('entity_type').notNull(), // 'task', 'project', 'event', etc.
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(), // 'created', 'updated', 'deleted', etc.
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: 'assignee' }),
  activityLogs: many(activityLogs),
}));

export const projectRelations = relations(projects, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(tasks),
  events: many(events),
  activityLogs: many(activityLogs),
}));

export const kanbanColumnRelations = relations(kanbanColumns, ({ many }) => ({
  tasks: many(tasks),
}));

export const workspaceRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  projects: many(projects),
  events: many(events),
}));

// Relations
export const projectsRelations = relations(projects, ({ many, one }) => ({
  members: many(projectMembers),
  pages: many(pages),
  creator: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ many, one }) => ({
  project: one(projects, {
    fields: [pages.projectId],
    references: [projects.id],
  }),
  todos: many(todos),
  creator: one(users, {
    fields: [pages.createdById],
    references: [users.id],
  }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  page: one(pages, {
    fields: [todos.pageId],
    references: [pages.id],
  }),
  assignedTo: one(users, {
    fields: [todos.assignedToId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;