// Define the Project type
export interface Project {
id: number;
name: string;
description: string;
deadline: string; // ISO date format (e.g., "2023-12-01")
status?: 'Not Started' | 'In Progress' | 'Completed'; // Optional status field
teamMembers?: string[]; // Optional array of team members
createdAt?: string; // Optional creation timestamp
updatedAt?: string; // Optional update timestamp
}

// Define the Task type (if you plan to add tasks to projects)
export interface Task {
id: number;
projectId: number; // Links the task to a project
title: string;
description: string;
assignedTo?: string; // Optional assigned team member
dueDate?: string; // Optional due date
completed?: boolean; // Optional completion status
}

// Define the User type (if you plan to add user authentication)
export interface User {
id: number;
name: string;
email: string;
role: 'Admin' | 'Member'; // User role
avatarUrl?: string; // Optional profile picture URL
}

// Define the CalendarEvent type (for Google Calendar integration)
export interface CalendarEvent {
id: string;
title: string;
start: string; // ISO date format (e.g., "2023-12-01T09:00:00")
end: string; // ISO date format (e.g., "2023-12-01T10:00:00")
description?: string; // Optional event description
location?: string; // Optional event location
}

// Define the SheetRow type (for Google Sheets integration)
export interface SheetRow {
id: string;
projectId: number; // Links the row to a project
data: Record<string, string | number>; // Key-value pairs for sheet data
}