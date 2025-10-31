"use client"

import { motion } from "framer-motion"
import { Trash2, Edit2, Clock } from "lucide-react"
import type { Task } from "@/app/page"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formatDeadline = (deadline: { date: string; time: string } | undefined) => {
    if (!deadline) return null
    const [year, month, day] = deadline.date.split("-")
    return `${day}/${month}/${year} ${deadline.time || "00:00"}`
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    }
  }

  const isOverdue = (deadline: { date: string; time: string } | undefined) => {
    if (!deadline) return false
    const [year, month, day] = deadline.date.split("-")
    const deadlineDate = new Date(`${year}-${month}-${day}T${deadline.time || "00:00"}`)
    return deadlineDate < new Date()
  }

  const deadlineStr = formatDeadline(task.deadline)
  const isDeadlineOverdue = task.deadline && isOverdue(task.deadline)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Deadline */}
      {deadlineStr && (
        <div
          className={`flex items-center gap-1.5 text-xs mb-3 ${
            isDeadlineOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{deadlineStr}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(task)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (confirm("Delete this task?")) {
              onDelete(task.id)
            }
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </motion.button>
      </div>
    </motion.div>
  )
}
