// types/index.ts
export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'user' | 'admin';
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    type: 'personal' | 'team';
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