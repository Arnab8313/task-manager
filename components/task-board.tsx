"use client"

import { Droppable } from "@hello-pangea/dnd"
import { TaskColumn } from "./task-column"
import type { Task } from "@/app/page"

interface TaskBoardProps {
  todoTasks: Task[]
  inProgressTasks: Task[]
  doneTasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#0052cc", icon: "📝" },
  { id: "inProgress", title: "In Progress", color: "#f59e0b", icon: "⚙️" },
  { id: "done", title: "Done", color: "#10b981", icon: "✓" },
] as const

export function TaskBoard({ todoTasks, inProgressTasks, doneTasks, onEditTask, onDeleteTask }: TaskBoardProps) {
  const tasksByColumn = {
    todo: todoTasks,
    inProgress: inProgressTasks,
    done: doneTasks,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
      {COLUMNS.map((column) => (
        <Droppable key={column.id} droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`transition-colors duration-200 ${
                snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20 rounded-lg" : ""
              }`}
            >
              <TaskColumn
                column={column.id as Task["column"]}
                title={column.title}
                icon={column.icon}
                color={column.color}
                tasks={tasksByColumn[column.id as keyof typeof tasksByColumn]}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  )
}
