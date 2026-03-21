'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import type { Task, TaskFrequency } from '@/lib/types'

interface TaskCardProps {
  title: string
  tasks: Task[]
  frequency: TaskFrequency
  onToggleTask: (taskId: string) => void
  onAddTask?: (title: string) => void
  className?: string
}

const FREQUENCY_COLORS: Record<TaskFrequency, string> = {
  daily: '#BFD8C2', // Sage
  weekly: '#C9D6E3', // Pale Blue
  biweekly: '#B7D3CF', // Misty Teal
  monthly: '#EAD9A0', // Muted Gold
  quarterly: '#E6B8A2', // Soft Peach
  yearly: '#BFA8C9', // Soft Plum
}

export function TaskCard({ 
  title, 
  tasks, 
  frequency,
  onToggleTask, 
  onAddTask,
  className 
}: TaskCardProps) {
  const [showInput, setShowInput] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  
  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  
  const handleAddTask = () => {
    if (newTaskTitle.trim() && onAddTask) {
      onAddTask(newTaskTitle.trim())
      setNewTaskTitle('')
      setShowInput(false)
    }
  }
  
  return (
    <div 
      className={cn(
        'rounded-2xl bg-card border border-border shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header with progress */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="font-semibold text-sm"
            style={{ color: FREQUENCY_COLORS[frequency] }}
          >
            {title}
          </h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: FREQUENCY_COLORS[frequency],
            }}
          />
        </div>
      </div>
      
      {/* Task list */}
      <div className="p-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            No tasks yet
          </p>
        ) : (
          <ul className="space-y-1">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-2 py-2 rounded-lg text-left transition-colors',
                    'hover:bg-secondary/50',
                    task.completed && 'opacity-60'
                  )}
                >
                  <div 
                    className={cn(
                      'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors',
                      task.completed ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    )}
                  >
                    {task.completed && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span 
                    className={cn(
                      'text-sm flex-1',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        {/* Add task input */}
        {showInput ? (
          <div className="mt-2 flex items-center gap-2 px-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="New task..."
              className="flex-1 text-sm bg-transparent border-b border-border focus:border-primary outline-none py-1"
              autoFocus
            />
            <button
              onClick={handleAddTask}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : onAddTask && (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 w-full px-2 py-2 mt-1 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add task</span>
          </button>
        )}
      </div>
    </div>
  )
}
