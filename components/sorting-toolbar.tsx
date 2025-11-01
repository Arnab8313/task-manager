"use client"

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { SortConfig } from "@/app/page"

interface SortingToolbarProps {
  sortConfig: SortConfig
  onSortChange: (config: SortConfig) => void
}

export function SortingToolbar({ sortConfig, onSortChange }: SortingToolbarProps) {
  const sortModes = [
    { value: "priority" as const, label: "Priority" },
    { value: "deadline" as const, label: "Deadline" },
    { value: "custom" as const, label: "Custom" },
  ]

  const handleModeChange = (mode: SortConfig["mode"]) => {
    onSortChange({ ...sortConfig, mode })
  }

  const handleOrderChange = () => {
    onSortChange({
      ...sortConfig,
      order: sortConfig.order === "asc" ? "desc" : "asc",
    })
  }

  const getModeLabel = () => {
    const mode = sortModes.find((m) => m.value === sortConfig.mode)
    return mode?.label || "Custom"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-8 card p-4"
    >
      {sortConfig.mode === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3"
        >
          <span className="text-lg">🖐️</span>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Custom Order Active</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Drag and drop tasks to set your own order within each column.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Sort Mode Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by:</span>
          <div className="flex gap-2 flex-wrap">
            {sortModes.map((mode) => (
              <motion.button
                key={mode.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModeChange(mode.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortConfig.mode === mode.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title={`Sort by ${mode.label.toLowerCase()}`}
              >
                {mode.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort Order Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Order:</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOrderChange}
            disabled={sortConfig.mode === "custom"}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              sortConfig.mode === "custom"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : sortConfig.order === "asc"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
            }`}
            title={`Current order: ${sortConfig.order === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortConfig.order === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{sortConfig.order === "asc" ? "Ascending" : "Descending"}</span>
          </motion.button>
        </div>
      </div>

      {/* Sort Info Caption */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Sorted by: <span className="font-semibold text-gray-700 dark:text-gray-300">{getModeLabel()}</span>
        {sortConfig.mode !== "custom" && (
          <span>
            {" "}
            (<span className="font-semibold">{sortConfig.order === "asc" ? "Ascending ⬆" : "Descending ⬇"}</span>)
          </span>
        )}
      </div>
    </motion.div>
  )
}
