// components/ProjectManagement.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  Plus, X, ChevronRight, Edit2, Trash2
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface KanbanColumn {
  id: number;
  name: string;
  tasks: Task[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface ProjectManagementProps {
  selectedProjectId: number | null;
}

const ProjectManagement = ({ selectedProjectId }: ProjectManagementProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      setSelectedProject(project || null);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, projects]);

  useEffect(() => {
    const fetchKanbanColumns = async () => {
      if (!selectedProject) return;
      try {
        const response = await fetch(`/api/projects/${selectedProject.id}/columns`);
        const data = await response.json();
        setKanbanColumns(data.columns);
      } catch (error) {
        console.error('Error fetching kanban columns:', error);
      }
    };

    if (selectedProject) {
      fetchKanbanColumns();
    }
  }, [selectedProject]);

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome to Project Management
          </h2>
          <p className="text-secondary mb-8">
            Please sign in to access your projects and tasks.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {selectedProject ? selectedProject.name : 'Your Projects'}
          </h1>
          <p className="text-secondary">
            {selectedProject ? selectedProject.description : `Welcome back, ${user.name}`}
          </p>
        </div>

        {/* Project Grid or Kanban Board */}
        {!selectedProject ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Project Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-accent/10 rounded-xl p-6 flex items-center justify-center cursor-pointer border-2 border-dashed border-accent/20 hover:border-primary/30"
            >
              <div className="text-center">
                <Plus className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Create New Project</h3>
              </div>
            </motion.div>

            {/* Project Cards */}
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                  <div className="flex space-x-2">
                    <Edit2 className="h-5 w-5 text-secondary hover:text-primary" />
                    <Trash2 className="h-5 w-5 text-secondary hover:text-red-500" />
                  </div>
                </div>
                <p className="text-secondary mb-4 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="h-5 w-5 text-secondary" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Kanban Board */}
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {kanbanColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-80 bg-accent/10 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground">{column.name}</h3>
                    <span className="text-sm text-secondary">
                      {column.tasks.length} tasks
                    </span>
                  </div>
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-card rounded-lg p-4 shadow-sm"
                      >
                        <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
                        <p className="text-sm text-secondary mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-secondary" />
                            <span className="text-xs text-secondary">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : 'No due date'}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {/* Add Task Button */}
                    <button className="w-full py-2 flex items-center justify-center space-x-2 text-secondary hover:text-primary">
                      <Plus className="h-5 w-5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              ))}
              {/* Add Column Button */}
              <div className="flex-shrink-0 w-80 flex items-center justify-center">
                <button className="w-full h-full rounded-xl border-2 border-dashed border-accent/20 hover:border-primary/30 flex items-center justify-center space-x-2 text-secondary hover:text-primary">
                  <Plus className="h-5 w-5" />
                  <span>Add Column</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;