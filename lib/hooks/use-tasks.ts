'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskFrequency } from '@/lib/types'
import {
  getTasks,
  addTask as addTaskToStorage,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTasksByFrequency,
  createSampleTasks,
} from '@/lib/storage/tasks-storage'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Load tasks on mount
  useEffect(() => {
    // Create sample tasks if none exist
    createSampleTasks()
    setTasks(getTasks())
    setIsLoading(false)
  }, [])
  
  // Refresh tasks from storage
  const refreshTasks = useCallback(() => {
    setTasks(getTasks())
  }, [])
  
  // Add a new task
  const addTask = useCallback((title: string, frequency: TaskFrequency, category: string = 'General') => {
    addTaskToStorage({
      title,
      frequency,
      category,
      completed: false,
    })
    refreshTasks()
  }, [refreshTasks])
  
  // Toggle task completion
  const toggleTask = useCallback((taskId: string) => {
    toggleTaskCompletion(taskId)
    refreshTasks()
  }, [refreshTasks])
  
  // Remove a task
  const removeTask = useCallback((taskId: string) => {
    deleteTask(taskId)
    refreshTasks()
  }, [refreshTasks])
  
  // Update a task
  const editTask = useCallback((taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates)
    refreshTasks()
  }, [refreshTasks])
  
  // Get tasks by frequency
  const tasksByFrequency = useCallback((frequency: TaskFrequency): Task[] => {
    return tasks.filter(t => t.frequency === frequency)
  }, [tasks])
  
  // Task counts by frequency
  const taskCounts = {
    daily: tasks.filter(t => t.frequency === 'daily').length,
    weekly: tasks.filter(t => t.frequency === 'weekly').length,
    biweekly: tasks.filter(t => t.frequency === 'biweekly').length,
    monthly: tasks.filter(t => t.frequency === 'monthly').length,
    quarterly: tasks.filter(t => t.frequency === 'quarterly').length,
    yearly: tasks.filter(t => t.frequency === 'yearly').length,
  }
  
  // Incomplete task count
  const incompleteCount = tasks.filter(t => !t.completed).length
  
  return {
    tasks,
    isLoading,
    
    // Actions
    addTask,
    toggleTask,
    removeTask,
    editTask,
    
    // Filtered
    tasksByFrequency,
    
    // Counts
    taskCounts,
    incompleteCount,
  }
}
