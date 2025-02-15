'use client'

import { useState } from 'react';
import { useGlobal } from '../context/GlobalProvider';
import { useAuth } from '../context/AuthContext';
import NavBar from '@/components/layouts/NavBar';
import SideBar from '@/components/layouts/SideBar';
import ProjectDetailPage from '@/components/ProjectDetailPage';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Users, CheckCircle, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export default function Home() {
  const { isSidebarOpen, toggleSidebar, screenSize } = useGlobal();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const isMobile = screenSize === 'mobile';

  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', tasks: [{ id: 'task1', title: 'Design new layout' }] },
    { id: 'inProgress', title: 'In Progress', tasks: [{ id: 'task2', title: 'Implement API' }] },
    { id: 'done', title: 'Done', tasks: [{ id: 'task3', title: 'Test application' }] }
  ]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destinationColIndex = columns.findIndex(col => col.id === destination.droppableId);
    const sourceCol = columns[sourceColIndex];
    const destinationCol = columns[destinationColIndex];
    const sourceTasks = [...sourceCol.tasks];
    const destinationTasks = [...destinationCol.tasks];
    const [removed] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIndex].tasks = sourceTasks;
      setColumns(newColumns);
    } else {
      destinationTasks.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIndex].tasks = sourceTasks;
      newColumns[destinationColIndex].tasks = destinationTasks;
      setColumns(newColumns);
    }
  };

  const addTask = (columnId: string, taskTitle: string) => {
    const newTask = { id: `task${Date.now()}`, title: taskTitle };
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return { ...column, tasks: [...column.tasks, newTask] };
      }
      return column;
    });
    setColumns(updatedColumns);
  };

  const containerVariants = {
    expanded: { marginLeft: isMobile ? '0' : '16rem', transition: { type: "spring", stiffness: 300, damping: 30 } },
    collapsed: { marginLeft: '0', transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  if (selectedProjectId !== null) {
    return (
      <div className="flex min-h-screen bg-background">
        <SideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} session={null} />
        <motion.div className="flex-1" initial="collapsed" animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"} variants={containerVariants}>
          <NavBar currentPath={['Projects', 'Project Details']} />
          <ProjectDetailPage projectId={selectedProjectId} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} session={null} />
      <motion.div className="flex-1" initial="collapsed" animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"} variants={containerVariants}>
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
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Project Tasks</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {columns.map(column => (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="bg-container rounded-lg shadow-sm p-4">
                        <h3 className="font-semibold text-foreground mb-4">{column.title}</h3>
                        <AnimatePresence>
                          {column.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-card rounded shadow p-3 mb-2"
                                >
                                  <p className="text-sm text-foreground">{task.title}</p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                        <button
                          onClick={() => addTask(column.id, `New Task ${column.tasks.length + 1}`)}
                          className="mt-2 w-full text-sm text-muted hover:text-foreground transition-colors"
                        >
                          + Add Task
                        </button>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </DragDropContext>
        </main>
      </motion.div>
    </div>
  );
}