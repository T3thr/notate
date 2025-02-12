// app/page.tsx
'use client'

import { useGlobal } from '../context/GlobalProvider';
import NavBar from '@/components/layouts/NavBar';
import SideBar from '@/components/layouts/SideBar';
import { motion } from 'framer-motion';
import { 
  Calendar, ClipboardList, Users, Target,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

export default function Home() {
  const { isSidebarOpen, toggleSidebar, screenSize } = useGlobal();
  const isMobile = screenSize === 'mobile';

  const containerVariants = {
    expanded: {
      marginLeft: isMobile ? '0' : '16rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    collapsed: {
      marginLeft: '0',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  // Example Kanban board columns
  const columns = [
    { id: 'todo', title: 'To Do', tasks: [{ id: 'task1', title: 'Design new layout' }] },
    { id: 'inProgress', title: 'In Progress', tasks: [{ id: 'task2', title: 'Implement API' }] },
    { id: 'done', title: 'Done', tasks: [{ id: 'task3', title: 'Test application' }] }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <motion.div 
        className="flex-1"
        initial="collapsed"
        animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"}
        variants={containerVariants}
      >
        <NavBar currentPath={['Dashboard']} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Active Projects', icon: ClipboardList, value: '12', change: '+2 this month', color: 'blue' },
              { title: 'Team Members', icon: Users, value: '24', change: 'Active collaborators', color: 'indigo' },
              { title: 'Tasks Completed', icon: CheckCircle, value: '85%', change: 'This week', color: 'green' },
              { title: 'Upcoming Deadlines', icon: Clock, value: '8', change: 'Next 7 days', color: 'amber' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md bg-${stat.color}-500`}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{stat.title}</h3>
                    <p className="text-sm text-muted">{stat.change}</p>
                  </div>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Kanban Board Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Project Tasks</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {columns.map(column => (
                <div key={column.id} className="bg-container rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-foreground mb-4">{column.title}</h3>
                  {column.tasks.map(task => (
                    <div key={task.id} className="bg-card rounded shadow p-3 mb-2">
                      <p className="text-sm text-foreground">{task.title}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </main>
      </motion.div>
    </div>
  );
}