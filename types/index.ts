// types/index.ts
export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'user' | 'admin';
  }
  
export interface Project {
    id: number;
    name: string;
    description: string | null;
    type: string | null;
    isPersonal: boolean;
    createdById: number | null;
    workspaceId: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Page {
    id: string;
    title: string;
    content: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    order: number;
  }