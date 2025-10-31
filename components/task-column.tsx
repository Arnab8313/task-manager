"use client"

import { Draggable } from "@hello-pangea/dnd"
import { TaskCard } from "./task-card"
import type { Task } from "@/app/page"

interface TaskColumnProps {
  column: Task["column"]
  title: string
  icon: string
  color: string
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function TaskColumn({ column, title, icon, color, tasks, onEditTask, onDeleteTask }: TaskColumnProps) {
  return (
    <div className="card p-6">
      {/* Column Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <span className="ml-auto text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="h-1 w-12 rounded-full" style={{ backgroundColor: color }} />
      </div>

      {/* Tasks Container */}
      <div className="space-y-3 min-h-[300px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks here yet</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`transition-all ${
                    snapshot.isDragging ? "opacity-50 bg-blue-100 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <TaskCard task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
                </div>
              )}
            </Draggable>
          ))
        )}
      </div>
    </div>
  )
}
