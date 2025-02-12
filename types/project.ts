// app/types/project.ts

export interface Project {
    id: string;
    title: string;
    description: string;
    progress: number;
    dueDate: Date;
    members: TeamMember[];
    status: 'active' | 'completed' | 'on-hold';
  }
  
  export interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }
  
  export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType;
  }