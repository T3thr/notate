import { Project } from '@/backend/lib/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h2>
      <p className="text-gray-600 mb-4">{project.description}</p>
      <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
      <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300">
        View Project
      </button>
    </div>
  );
}