// types/index.ts
export interface User {
  id: string
  email: string
  name: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: number
  name: string
  slug: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: number
  name: string
  description: string | null
  isPersonal: boolean
  workspaceId: number | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMember {
  id: number
  workspaceId: number
  userId: string
  role: 'ADMIN' | 'MEMBER'
  createdAt: Date
  updatedAt: Date
}