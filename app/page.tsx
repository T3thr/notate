'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGlobal } from '../context/GlobalProvider'
import { useAuth } from '../context/AuthContext'
import NavBar from '@/components/layouts/NavBar'
import SideBar from '@/components/layouts/SideBar'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClipboardList, Users, CheckCircle, Clock, 
  Plus, MoreVertical, Calendar, FileText,
  Star, AlertCircle, Search
} from 'lucide-react'

// Enhanced Types
interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  createdAt: string
  lastUpdated?: string
  status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'
  attachments?: string[]
  comments?: Comment[]
}

interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

interface ProjectStats {
  activeProjects: number
  teamMembers: number
  completionRate: number
  upcomingDeadlines: number
  tasksCreatedThisWeek: number
  averageCompletionTime: number
}

// Enhanced Storage Management
const STORAGE_KEYS = {
  COLUMNS: 'pm_columns',
  STATS: 'pm_stats',
  PREFERENCES: 'pm_preferences'
}

const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`)
    return defaultValue
  }
}

const setLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage: ${error}`)
    }
  }
}

export default function Home() {
  const { isSidebarOpen, toggleSidebar, screenSize } = useGlobal()
  const { user } = useAuth()
  const isMobile = screenSize === 'mobile'

  // Enhanced State Management
  const [columns, setColumns] = useState<Column[]>(() => 
    getLocalStorage(STORAGE_KEYS.COLUMNS, [
      {
        id: 'backlog',
        title: 'Backlog',
        color: 'gray',
        tasks: [
          {
            id: 'task1',
            title: 'Design system implementation',
            description: 'Create a comprehensive design system for consistent UI/UX',
            priority: 'high',
            tags: ['design', 'system', 'ui'],
            createdAt: new Date().toISOString(),
            status: 'backlog',
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      {
        id: 'todo',
        title: 'To Do',
        color: 'blue',
        tasks: []
      },
      {
        id: 'inProgress',
        title: 'In Progress',
        color: 'yellow',
        tasks: []
      },
      {
        id: 'review',
        title: 'In Review',
        color: 'purple',
        tasks: []
      },
      {
        id: 'done',
        title: 'Done',
        color: 'green',
        tasks: []
      }
    ])
  )

  const [stats, setStats] = useState<ProjectStats>(() =>
    getLocalStorage(STORAGE_KEYS.STATS, {
      activeProjects: 8,
      teamMembers: 16,
      completionRate: 75,
      upcomingDeadlines: 5,
      tasksCreatedThisWeek: 12,
      averageCompletionTime: 3.5
    })
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [isGridView, setIsGridView] = useState(false)
  const [draggingTask, setDraggingTask] = useState<Task | null>(null)
  const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null)

  // Enhanced Effects
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.COLUMNS, columns)
    updateStats()
  }, [columns])

  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.STATS, stats)
  }, [stats])

  // Update stats dynamically
  const updateStats = () => {
    const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0)
    const doneTasks = columns.find(col => col.id === 'done')?.tasks.length || 0
    const upcomingDeadlines = columns.reduce((sum, col) => 
      sum + col.tasks.filter(task => task.dueDate && new Date(task.dueDate) > new Date()).length, 0)

    setStats(prev => ({
      ...prev,
      completionRate: Math.round((doneTasks / totalTasks) * 100),
      upcomingDeadlines,
      tasksCreatedThisWeek: columns.reduce((sum, col) => 
        sum + col.tasks.filter(task => new Date(task.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, 0)
    }))
  }

  // Enhanced Handlers
  const handleDragStart = (task: Task) => {
    setDraggingTask(task)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    if (!draggingTask) return

    const sourceColIndex = columns.findIndex(col => col.tasks.some(task => task.id === draggingTask.id))
    const destColIndex = columns.findIndex(col => col.id === columnId)
    
    const newColumns = [...columns]
    const sourceCol = newColumns[sourceColIndex]
    const destCol = newColumns[destColIndex]
    
    const taskIndex = sourceCol.tasks.findIndex(task => task.id === draggingTask.id)
    const [movedTask] = sourceCol.tasks.splice(taskIndex, 1)
    const updatedTask = {
      ...movedTask,
      status: columnId as Task['status'],
      lastUpdated: new Date().toISOString()
    }
    
    destCol.tasks.push(updatedTask)
    setColumns(newColumns)
    setDraggingTask(null)
  }

  const addTask = useCallback((columnId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `New Task`,
      description: 'Click to edit description',
      priority: 'medium',
      tags: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: columnId as Task['status']
    }

    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ))
  }, [])

  const deleteTask = (taskId: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    })))
  }

  const moveTask = (taskId: string, newColumnId: string) => {
    setColumns(prev => {
      const newColumns = [...prev]
      const sourceColIndex = newColumns.findIndex(col => col.tasks.some(task => task.id === taskId))
      const destColIndex = newColumns.findIndex(col => col.id === newColumnId)
      
      const sourceCol = newColumns[sourceColIndex]
      const destCol = newColumns[destColIndex]
      
      const taskIndex = sourceCol.tasks.findIndex(task => task.id === taskId)
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1)
      const updatedTask = {
        ...movedTask,
        status: newColumnId as Task['status'],
        lastUpdated: new Date().toISOString()
      }
      
      destCol.tasks.push(updatedTask)
      return newColumns
    })
  }

  // Filtering and Search
  const getFilteredTasks = useCallback((tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority

      return matchesSearch && matchesPriority
    })
  }, [searchTerm, selectedPriority])

  // Animation variants
  const containerVariants = {
    expanded: { 
      marginLeft: isMobile ? '0' : '16rem',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    collapsed: { 
      marginLeft: '0',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  }

  const statsData = [
    { 
      title: 'Active Projects',
      icon: ClipboardList,
      value: stats.activeProjects,
      change: '+2 this month',
      color: 'blue'
    },
    {
      title: 'Team Members',
      icon: Users,
      value: stats.teamMembers,
      change: 'Active collaborators',
      color: 'indigo'
    },
    {
      title: 'Completion Rate',
      icon: CheckCircle,
      value: `${stats.completionRate}%`,
      change: 'Tasks completed',
      color: 'green'
    },
    {
      title: 'Upcoming Deadlines',
      icon: Clock,
      value: stats.upcomingDeadlines,
      change: 'Next 7 days',
      color: 'amber'
    }
  ]

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-100">
      <SideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} session={null} />
      <motion.div 
        className="flex-1 transition-all duration-100 overflow-hidden"
        initial="collapsed"
        animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"}
        variants={containerVariants}
      >
        <NavBar currentPath={['Dashboard']} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-foreground border-gray-200 
                  dark:border-gray-700 bg-background 
                  focus:ring-2 focus:ring-blue-500 transition-all duration-100"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 
                  dark:border-gray-700 bg-background text-foreground
                  focus:ring-2 focus:ring-blue-500 transition-all duration-100"
                aria-label='selectpriority'
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="p-2 rounded-lg border text-foreground border-gray-200 
                  dark:border-gray-700 bg-background
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-all duration-100"
                aria-label="Toggle view"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                className={`rounded-xl bg-background p-6 
                  shadow-sm hover:shadow-md border border-gray-200 
                  dark:border-gray-700 transition-all duration-100`}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stat.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.change}
                    </p>
                  </div>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Project Tasks
            </h2>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-4 min-w-max pb-4'}`}>
              {columns.map(column => (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`${isMobile ? 'w-full' : 'w-80'} bg-gray-50 dark:bg-gray-800/50 
                    rounded-lg p-4 transition-colors duration-100`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.title}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getFilteredTasks(column.tasks).length}
                    </span>
                  </div>

                  <AnimatePresence>
                    {getFilteredTasks(column.tasks).map((task, index) => (
                      <motion.div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`bg-background rounded-lg 
                          shadow-sm p-4 mb-3 border border-gray-200 
                          dark:border-gray-700 hover:shadow-md
                          transition-all duration-100`}
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h4>
                          <div className="relative">
                            <button
                              onClick={() => setOpenTaskMenuId(task.id === openTaskMenuId ? null : task.id)}
                              className="p-1 bg-background hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              aria-label='openmenu'
                            >
                              <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                            {openTaskMenuId === task.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-background border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>
                                <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <select
                                    onChange={(e) => {
                                      moveTask(task.id, e.target.value)
                                      setOpenTaskMenuId(null)
                                    }}
                                    className="w-full bg-background focus:outline-none"
                                    aria-label='move'
                                  >
                                    <option value="">Move to...</option>
                                    {columns.map(col => (
                                      <option key={col.id} value={col.id}>
                                        {col.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-${task.priority}-100 text-${task.priority}-800`}>
                            {task.priority}
                          </span>
                          {task.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {task.dueDate && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button
                    onClick={() => addTask(column.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </motion.div>
    </div>
  )
}