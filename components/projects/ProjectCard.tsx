// components/projects/ProjectCard.tsx
import { Project } from '@/types/project';
import { motion } from 'framer-motion';
import { Folder, MoreVertical, Calendar, Users } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onEdit: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onDelete,
  onEdit,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-lg shadow-sm p-4 cursor-pointer"
      onClick={() => onSelect(project)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{project.name}</h3>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add dropdown menu logic here
            }}
            className="p-1 rounded-full hover:bg-accent"
            aria-label='add'
          >
            <MoreVertical className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted mb-4 line-clamp-2">
        {project.description || 'No description'}
      </p>
      <div className="flex items-center justify-between text-sm text-muted">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Team</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};
