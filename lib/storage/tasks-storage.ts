import type { Task, TaskFrequency } from '@/lib/types'
import { daysBetween, startOfLocalDay, toDateKey, todayKey } from '@/lib/utils/date-keys'

const STORAGE_KEY = 'sol-cycle-tasks'

/**
 * Change notification + parsed-value cache, mirroring cycle-storage.
 *
 * The cache also gives getTasks() a referentially stable result between
 * writes, which useSyncExternalStore requires — returning a freshly parsed
 * array each call would re-render without end.
 */
type Listener = () => void
const listeners = new Set<Listener>()
let cachedTasks: Task[] | null = null
const EMPTY_TASKS: Task[] = []

export function subscribeToTasks(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Drop the cache and notify — for writes made outside this module. */
export function refreshTasksFromStorage(): void {
  cachedTasks = null
  for (const listener of listeners) listener()
}

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
  if (typeof window === 'undefined') return EMPTY_TASKS
  if (cachedTasks) return cachedTasks

  // JSON.parse can return null or an object for a value an interrupted write
  // left behind; every caller then calls .filter on it and throws.
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    cachedTasks = Array.isArray(parsed) ? parsed : []
  } catch {
    cachedTasks = []
  }
  return cachedTasks
}

/**
 * Save all tasks
 */
function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  cachedTasks = tasks
  for (const listener of listeners) listener()
}

/**
 * Add a new task
 */
export function addTask(task: Omit<Task, 'id'>): Task {
  const newTask: Task = {
    ...task,
    id: generateId(),
  }
  
  saveTasks([...getTasks(), newTask])
  
  return newTask
}

/**
 * Update an existing task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === id)

  if (index === -1) return null

  const next = [...tasks]
  next[index] = { ...next[index], ...updates }
  saveTasks(next)

  return next[index]
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
  const index = tasks.findIndex(t => t.id === id)

  if (index === -1) return null

  const current = tasks[index]
  const completed = !current.completed
  const updated: Task = {
    ...current,
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  }

  const next = [...tasks]
  next[index] = updated
  saveTasks(next)
  return updated
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
  saveTasks(
    getTasks().map(task =>
      task.frequency === 'daily'
        ? { ...task, completed: false, completedAt: undefined }
        : task
    )
  )
}

/**
 * Is a completion timestamp still inside the current period for `frequency`?
 *
 * A task ticked off last Tuesday should be waiting again today; without this
 * every recurring task stayed completed forever once ticked, which made the
 * frequency field decorative.
 */
export function isCompletionCurrent(
  frequency: TaskFrequency,
  completedAt: string,
  now: Date = new Date()
): boolean {
  const completed = new Date(completedAt)
  if (Number.isNaN(completed.getTime())) return false

  switch (frequency) {
    case 'daily':
      return toDateKey(completed) === toDateKey(now)
    case 'weekly':
      return daysBetween(startOfWeek(completed), startOfWeek(now)) === 0
    case 'biweekly':
      // Two-week blocks anchored to the week the task was completed in.
      return daysBetween(startOfWeek(completed), startOfWeek(now)) < 14
    case 'monthly':
      return (
        completed.getFullYear() === now.getFullYear() &&
        completed.getMonth() === now.getMonth()
      )
    case 'quarterly':
      return (
        completed.getFullYear() === now.getFullYear() &&
        Math.floor(completed.getMonth() / 3) === Math.floor(now.getMonth() / 3)
      )
    case 'yearly':
      return completed.getFullYear() === now.getFullYear()
    default:
      return false
  }
}

/** Local midnight on the Sunday starting the week containing `date`. */
function startOfWeek(date: Date): Date {
  const start = startOfLocalDay(date)
  start.setDate(start.getDate() - start.getDay())
  return start
}

/**
 * Clear completions that belong to a finished period, so recurring tasks come
 * back around. Idempotent — safe to call on every app load. Returns true if
 * anything changed.
 */
export function rolloverRecurringTasks(now: Date = new Date()): boolean {
  let changed = false

  const next = getTasks().map(task => {
    if (!task.completed) return task
    // A completed task with no timestamp predates completedAt being recorded;
    // roll it over rather than leaving it stuck forever.
    if (task.completedAt && isCompletionCurrent(task.frequency, task.completedAt, now)) {
      return task
    }
    changed = true
    return { ...task, completed: false, completedAt: undefined }
  })

  if (changed) saveTasks(next)
  return changed
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(): Task[] {
  const today = todayKey()
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
