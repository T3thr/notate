'use client'

import { useState, useEffect } from 'react';
import { 
  User, Settings as SettingsIcon, 
  Folder, Home, Users, PersonStanding,
  Calendar, Bell, LogOut, Building
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useGlobal } from '@/context/GlobalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsWindow from '@/components/SettingsWindow';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Session } from 'next-auth';

// Types based on your schema
interface Project {
  id: number;
  name: string;
  description: string | null;
  isPersonal: boolean;
  workspaceId: number | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: {
    features: {
      tasks: boolean;
      wiki: boolean;
      files: boolean;
      calendar: boolean;
      timeTracking: boolean;
      automation: boolean;
    };
    branding: {
      logo?: string;
      favicon?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
    };
  };
  plan: 'free' | 'pro' | 'enterprise';
}

interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: string;
  permissions: {
    access: 'full' | 'limited' | 'readonly';
    allowedActions: string[];
    restrictedSpaces?: string[];
  };
}

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
  session: Session | null;
}

const SideBar: React.FC<SideBarProps> = ({ isOpen, onToggle, session }) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'personal' | 'workspace'>('personal');
  const { screenSize } = useGlobal();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, loading } = useAuth();
  const [personalProjects, setPersonalProjects] = useState<Project[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceProjects, setWorkspaceProjects] = useState<Project[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  const isMobile = screenSize === 'mobile';

  // Fetch personal projects
  useEffect(() => {
    const fetchPersonalProjects = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/projects/personal');
        if (!response.ok) throw new Error('Failed to fetch personal projects');
        
        const data = await response.json();
        setPersonalProjects(data.projects);
      } catch (error) {
        toast.error('Error loading personal projects');
      }
    };

    fetchPersonalProjects();
  }, [user]);

  // Fetch workspaces and their projects
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/projects/workspace');
        if (!response.ok) throw new Error('Failed to fetch workspace data');
        
        const data = await response.json();
        setWorkspaces(data.workspaces);
        
        if (data.workspaces.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data.workspaces[0].id);
        }
      } catch (error) {
        toast.error('Error loading workspaces');
      }
    };

    fetchWorkspaceData();
  }, [user]);

  // Fetch projects for selected workspace
  useEffect(() => {
    const fetchWorkspaceProjects = async () => {
      if (!selectedWorkspace) return;
      
      try {
        const response = await fetch(`/api/projects/workspace/${selectedWorkspace}`);
        if (!response.ok) throw new Error('Failed to fetch workspace projects');
        
        const data = await response.json();
        setWorkspaceProjects(data.projects);
      } catch (error) {
        toast.error('Error loading workspace projects');
      }
    };

    fetchWorkspaceProjects();
  }, [selectedWorkspace]);

  const handleSignOut = async () => {
    try {
      window.location.href = '/api/auth/signout?callbackUrl=/';
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const sidebarVariants = {
    open: isMobile ? {
      x: 0,
      width: '100%',
      height: 'calc(100vh - 4rem)',
      top: '4rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    } : {
      x: 0,
      width: '16rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: isMobile ? {
      x: '-100%',
      width: '100%',
      height: 'calc(100vh - 4rem)',
      top: '4rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    } : {
      x: '-16rem',
      width: '16rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const renderAuthSection = () => {
    if (loading) {
      return (
        <motion.div className="mb-6 rounded-lg bg-container p-4 animate-pulse">
          <div className="h-10 w-full bg-accent rounded-md"></div>
        </motion.div>
      );
    }

    if (!user) {
      return (
        <motion.div 
          className="mb-6 rounded-lg bg-container p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col space-y-2">
            <Link
              href="/signin"
              className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="w-full rounded-md bg-accent px-4 py-2 text-center text-sm font-medium text-secondary hover:bg-accent/90"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="mb-6 rounded-lg bg-container p-4"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user ? (
              <img
                src={user?.avatar?.url || user.image || '/images/default.png'}
                alt={user.name || 'User'}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{user.name}</h3>
            <p className="text-sm text-foreground">{user.role}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderProjects = () => {
    if (activeTab === 'personal') {
      return personalProjects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className={`flex items-center space-x-3 rounded-md p-2 transition-colors
            ${pathname === `/projects/${project.id}` 
              ? 'bg-accent text-foreground' 
              : 'text-secondary hover:bg-accent hover:text-foreground'}`}
        >
          <PersonStanding className="h-5 w-5" />
          <span>{project.name}</span>
        </Link>
      ));
    }

    return (
      <div>
        <select
          value={selectedWorkspace || ''}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="mb-4 w-full rounded-md border border-divider bg-background p-2 text-sm"
          aria-label='select'
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>

        {workspaceProjects.map((project) => (
          <Link
            key={project.id}
            href={`/workspace/${selectedWorkspace}/projects/${project.id}`}
            className={`flex items-center space-x-3 rounded-md p-2 transition-colors
              ${pathname === `/workspace/${selectedWorkspace}/projects/${project.id}` 
                ? 'bg-accent text-foreground' 
                : 'text-secondary hover:bg-accent hover:text-foreground'}`}
          >
            <Folder className="h-5 w-5" />
            <span>{project.name}</span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside 
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            variants={sidebarVariants}
            className={`fixed left-0 z-30 h-full bg-background shadow-xl ${
              isMobile ? 'top-16' : 'top-0'
            }`}
          >
            <div className="flex h-full flex-col">
              {!isMobile && (
                <div className="flex h-16 items-center justify-center border-b border-divider">
                  <motion.h1 
                    className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
                    whileHover={{ scale: 1.05 }}
                  >
                    NOTATE
                  </motion.h1>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                {renderAuthSection()}

                <div className="mb-4 flex space-x-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'personal' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent text-secondary hover:bg-accent'}`}
                  >
                    <PersonStanding className="mb-1 mx-auto h-5 w-5" />
                    Personal
                  </button>
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${activeTab === 'workspace' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent text-secondary hover:bg-accent'}`}
                  >
                    <Building className="mb-1 mx-auto h-5 w-5" />
                    Workspace
                  </button>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/"
                    className={`flex items-center space-x-3 rounded-md p-2 transition-colors
                      ${pathname === '/' 
                        ? 'bg-accent text-foreground' 
                        : 'text-secondary hover:bg-accent hover:text-foreground'}`}
                  >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <div className="pt-4">
                    <h4 className="mb-2 px-2 text-sm font-medium text-foreground">
                      {activeTab === 'personal' ? 'Personal Projects' : 'Workspace Projects'}
                    </h4>
                    {renderProjects()}
                  </div>
                </nav>
              </div>

              <div className="border-t border-divider p-4">
                {user ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setIsSettingsOpen(true)} 
                      className="flex w-full items-center space-x-3 rounded-md p-2 text-secondary transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center space-x-3 rounded-md p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-sm text-secondary">
                    <p>Sign in to access all features</p>
                  </div>
                )}
                <SettingsWindow isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideBar;