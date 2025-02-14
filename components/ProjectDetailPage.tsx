import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Calendar, ClipboardList, Users, AlertCircle,
  Plus, ChevronDown, Search, Filter, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types based on schema.ts
interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: string;
  status: string;
  assigneeId?: number;
}

interface KanbanColumn {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
}

interface Project {
  id: number;
  name: string;
  description?: string;
  isPersonal: boolean;
}

const ProjectDetailPage = ({ projectId }: { projectId: number }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Example data - replace with actual API calls
  const mockProject = {
    id: 1,
    name: "Marketing Campaign",
    description: "Q1 2025 Marketing Initiatives",
    isPersonal: false
  };

  const mockColumns = [
    {
      id: 1,
      name: "To Do",
      position: 0,
      tasks: [
        {
          id: 1,
          title: "Create social media calendar",
          description: "Plan content for next month",
          priority: "high",
          status: "todo",
          dueDate: new Date("2025-03-01")
        }
      ]
    },
    {
      id: 2,
      name: "In Progress",
      position: 1,
      tasks: []
    },
    {
      id: 3,
      name: "Done",
      position: 2,
      tasks: []
    }
  ];

  useEffect(() => {
    if (!user) return;
    setProject(mockProject);
    setColumns(mockColumns);
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Project Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
            <p className="mt-1 text-gray-600">{project?.description}</p>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Add Task
            </button>
            <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
              <Filter className="mr-2 h-5 w-5" />
              Filter
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-4 py-2"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            aria-label='filterPriority'
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-600">
                  {column.tasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <button className="text-gray-400 hover:text-gray-600" aria-label='more'>
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-xs
                        ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-3 text-gray-500 hover:border-gray-400 hover:text-gray-600">
                <Plus className="mr-2 h-5 w-5" />
                Add Task
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectDetailPage;