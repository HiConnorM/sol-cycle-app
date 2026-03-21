import type { Task, TaskFrequency } from '@/lib/types'

const STORAGE_KEY = 'sol-cycle-tasks'

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get all tasks
 */
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save all tasks
 */
function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

/**
 * Add a new task
 */
export function addTask(task: Omit<Task, 'id'>): Task {
  const newTask: Task = {
    ...task,
    id: generateId(),
  }
  
  const tasks = getTasks()
  tasks.push(newTask)
  saveTasks(tasks)
  
  return newTask
}

/**
 * Update an existing task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  tasks[index] = { ...tasks[index], ...updates }
  saveTasks(tasks)
  
  return tasks[index]
}

/**
 * Delete a task
 */
export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const filtered = tasks.filter(t => t.id !== id)
  
  if (filtered.length === tasks.length) return false
  
  saveTasks(filtered)
  return true
}

/**
 * Toggle task completion
 */
export function toggleTaskCompletion(id: string): Task | null {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  
  if (!task) return null
  
  task.completed = !task.completed
  task.completedAt = task.completed ? new Date().toISOString() : undefined
  
  saveTasks(tasks)
  return task
}

/**
 * Get tasks by frequency
 */
export function getTasksByFrequency(frequency: TaskFrequency): Task[] {
  return getTasks().filter(t => t.frequency === frequency)
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string): Task[] {
  return getTasks().filter(t => t.category === category)
}

/**
 * Get incomplete tasks
 */
export function getIncompleteTasks(): Task[] {
  return getTasks().filter(t => !t.completed)
}

/**
 * Get completed tasks
 */
export function getCompletedTasks(): Task[] {
  return getTasks().filter(t => t.completed)
}

/**
 * Reset daily tasks (mark as incomplete)
 */
export function resetDailyTasks(): void {
  const tasks = getTasks()
  const dailyTasks = tasks.filter(t => t.frequency === 'daily')
  
  dailyTasks.forEach(task => {
    task.completed = false
    task.completedAt = undefined
  })
  
  saveTasks(tasks)
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(): Task[] {
  const today = new Date().toISOString().split('T')[0]
  const tasks = getTasks()
  
  return tasks.filter(task => {
    if (task.completed) return false
    
    // Daily tasks are always due
    if (task.frequency === 'daily') return true
    
    // Check due date for others
    if (task.dueDate) {
      return task.dueDate === today
    }
    
    return false
  })
}

/**
 * Create sample tasks for demo
 */
export function createSampleTasks(): void {
  const existingTasks = getTasks()
  if (existingTasks.length > 0) return
  
  const sampleTasks: Omit<Task, 'id'>[] = [
    { title: 'Take vitamins', frequency: 'daily', category: 'Health', completed: false },
    { title: 'Drink 8 glasses of water', frequency: 'daily', category: 'Health', completed: false },
    { title: '10 min meditation', frequency: 'daily', category: 'Self-Care', completed: false },
    { title: 'Grocery shopping', frequency: 'weekly', category: 'Grocery', completed: false },
    { title: 'Clean bathroom', frequency: 'weekly', category: 'Home', completed: false },
    { title: 'Check bills', frequency: 'monthly', category: 'Finance', completed: false },
    { title: 'Schedule doctor appointment', frequency: 'quarterly', category: 'Health', completed: false },
    { title: 'Replace air filters', frequency: 'quarterly', category: 'Home', completed: false },
    { title: 'Annual health checkup', frequency: 'yearly', category: 'Health', completed: false },
  ]
  
  sampleTasks.forEach(task => addTask(task))
}
