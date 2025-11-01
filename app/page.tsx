"use client"

import { useState, useEffect, useMemo } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { TaskBoard } from "@/components/task-board"
import { TaskModal } from "@/components/task-modal"
import { Navbar } from "@/components/navbar"
import { SortingToolbar } from "@/components/sorting-toolbar"
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

export interface SortConfig {
  mode: "priority" | "deadline" | "custom"
  order: "asc" | "desc"
}

const STORAGE_KEY = "task-manager-tasks"
const SORT_CONFIG_KEY = "task-manager-sort-config"

export default function Home() {
  const { theme } = useTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    mode: "custom",
    order: "asc",
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const storedSort = localStorage.getItem(SORT_CONFIG_KEY)
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse tasks from localStorage:", e)
      }
    }
    if (storedSort) {
      try {
        setSortConfig(JSON.parse(storedSort))
      } catch (e) {
        console.error("Failed to parse sort config from localStorage:", e)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  useEffect(() => {
    localStorage.setItem(SORT_CONFIG_KEY, JSON.stringify(sortConfig))
  }, [sortConfig])

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const sorted = [...tasksToSort]

    switch (sortConfig.mode) {
      case "priority": {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        sorted.sort((a, b) => {
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
          if (priorityDiff !== 0) return priorityDiff

          if (a.deadline && b.deadline) {
            const dateA = new Date(`${a.deadline.date}T${a.deadline.time}`)
            const dateB = new Date(`${b.deadline.date}T${b.deadline.time}`)
            if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
          } else if (a.deadline) return -1
          else if (b.deadline) return 1

          return a.title.localeCompare(b.title)
        })
        break
      }
      case "deadline": {
        sorted.sort((a, b) => {
          if (a.deadline && b.deadline) {
            const dateA = new Date(`${a.deadline.date}T${a.deadline.time}`)
            const dateB = new Date(`${b.deadline.date}T${b.deadline.time}`)
            const diff = dateA.getTime() - dateB.getTime()
            if (diff !== 0) return diff
          } else if (a.deadline) return -1
          else if (b.deadline) return 1

          const priorityOrder = { high: 0, medium: 1, low: 2 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
          if (priorityDiff !== 0) return priorityDiff

          return a.title.localeCompare(b.title)
        })
        break
      }
      case "custom":
      default:
        return sorted
    }

    if (sortConfig.order === "desc") {
      return sorted.reverse()
    }
    return sorted
  }

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(
      (task) => task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query),
    )
  }, [tasks, searchQuery])

  const sortedAndGroupedTasks = useMemo(() => {
    const todoTasks = sortTasks(filteredTasks.filter((t) => t.column === "todo"))
    const inProgressTasks = sortTasks(filteredTasks.filter((t) => t.column === "inProgress"))
    const doneTasks = sortTasks(filteredTasks.filter((t) => t.column === "done"))

    return {
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
    }
  }, [filteredTasks, sortConfig])

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

        {tasks.length > 0 && <SortingToolbar sortConfig={sortConfig} onSortChange={setSortConfig} />}

        {/* Board with Drag and Drop */}
        {tasks.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <TaskBoard
              todoTasks={sortedAndGroupedTasks.todo}
              inProgressTasks={sortedAndGroupedTasks.inProgress}
              doneTasks={sortedAndGroupedTasks.done}
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
