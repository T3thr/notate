// types/project.ts
interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface KanbanColumn {
  id: number;
  projectId: number;
  name: string;
  position: number;
  tasks: Task[];
}

interface Task {
  id: number;
  projectId: number;
  kanbanColumnId: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  assigneeId: number | null;
}