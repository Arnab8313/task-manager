"use client"

import { useState, useEffect, useMemo } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { TaskBoard } from "@/components/task-board"
import { TaskModal } from "@/components/task-modal"
import { Navbar } from "@/components/navbar"
import { useTheme } from "next-themes"

export interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  column: "todo" | "inProgress" | "done"
  createdAt: number
  deadline?: {
    date: string
    time: string
  }
}

const STORAGE_KEY = "task-manager-tasks"

export default function Home() {
  const { theme } = useTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse tasks from localStorage:", e)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(
      (task) => task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query),
    )
  }, [tasks, searchQuery])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t)))
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: Date.now(),
      }
      setTasks([...tasks, newTask])
    }
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const task = filteredTasks.find((t) => t.id === draggableId)
    if (!task) return

    const newColumn = destination.droppableId as Task["column"]
    setTasks(tasks.map((t) => (t.id === draggableId ? { ...t, column: newColumn } : t)))
  }

  const handleResetBoard = () => {
    if (confirm("Are you sure you want to delete all tasks? This cannot be undone.")) {
      setTasks([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  const todoTasks = filteredTasks.filter((t) => t.column === "todo")
  const inProgressTasks = filteredTasks.filter((t) => t.column === "inProgress")
  const doneTasks = filteredTasks.filter((t) => t.column === "done")
  const totalCompleted = tasks.filter((t) => t.column === "done").length
  const completionPercentage = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar
        onAddTask={handleAddTask}
        onResetBoard={handleResetBoard}
        totalTasks={tasks.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="mb-8 card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Progress</h3>
              <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-pink-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {totalCompleted} of {tasks.length} tasks completed
            </p>
          </div>
        )}

        {/* Board with Drag and Drop */}
        {tasks.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <TaskBoard
              todoTasks={todoTasks}
              inProgressTasks={inProgressTasks}
              doneTasks={doneTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          </DragDropContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-5xl">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              Create your first task to get started managing your work
            </p>
            <button onClick={handleAddTask} className="btn-primary px-6 py-2 flex items-center gap-2">
              <span>+</span> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </main>
  )
}
