import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { installLocalStorageMock, uninstallLocalStorageMock } from './local-storage-mock'

installLocalStorageMock()

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTasksByFrequency,
  getIncompleteTasks,
  getCompletedTasks,
  getTasksDueToday,
  createSampleTasks,
  isCompletionCurrent,
  rolloverRecurringTasks,
  refreshTasksFromStorage,
} from '../tasks-storage'
import type { TaskFrequency } from '@/lib/types'

function seed(frequency: TaskFrequency = 'daily', title = 'Take vitamins') {
  return addTask({ title, frequency, category: 'Health', completed: false })
}

beforeEach(() => {
  localStorage.clear()
  // The storage module caches the parsed task list; clearing the backing
  // store behind its back has to drop that cache too.
  refreshTasksFromStorage()
})

afterAll(() => {
  uninstallLocalStorageMock()
})

describe('task CRUD', () => {
  it('adds a task with a generated id', () => {
    const task = seed()
    expect(task.id).toMatch(/^task-/)
    expect(getTasks()).toHaveLength(1)
  })

  it('gives each task a distinct id', () => {
    const ids = new Set(Array.from({ length: 50 }, (_, i) => seed('daily', `t${i}`).id))
    expect(ids.size).toBe(50)
  })

  it('updates a task in place', () => {
    const task = seed()
    updateTask(task.id, { title: 'Take magnesium' })
    expect(getTasks()[0].title).toBe('Take magnesium')
  })

  it('returns null when updating an unknown id', () => {
    expect(updateTask('task-nope', { title: 'x' })).toBeNull()
  })

  it('deletes a task and reports whether anything was removed', () => {
    const task = seed()
    expect(deleteTask(task.id)).toBe(true)
    expect(getTasks()).toHaveLength(0)
    expect(deleteTask(task.id)).toBe(false)
  })

  it('filters by frequency and completion', () => {
    const daily = seed('daily')
    seed('weekly', 'Grocery shopping')
    toggleTaskCompletion(daily.id)

    expect(getTasksByFrequency('weekly')).toHaveLength(1)
    expect(getCompletedTasks()).toHaveLength(1)
    expect(getIncompleteTasks()).toHaveLength(1)
  })

  it('returns an empty list when stored JSON is corrupt', () => {
    localStorage.setItem('sol-cycle-tasks', 'not json')
    refreshTasksFromStorage()
    expect(getTasks()).toEqual([])
  })
})

describe('toggleTaskCompletion', () => {
  it('stamps completedAt when completing', () => {
    const task = seed()
    const toggled = toggleTaskCompletion(task.id)
    expect(toggled?.completed).toBe(true)
    expect(toggled?.completedAt).toBeTruthy()
  })

  it('clears completedAt when un-completing', () => {
    const task = seed()
    toggleTaskCompletion(task.id)
    const toggled = toggleTaskCompletion(task.id)
    expect(toggled?.completed).toBe(false)
    expect(toggled?.completedAt).toBeUndefined()
  })

  it('returns null for an unknown id', () => {
    expect(toggleTaskCompletion('task-nope')).toBeNull()
  })
})

describe('isCompletionCurrent', () => {
  const now = new Date(2026, 7, 18, 10, 0) // Tuesday 18 August 2026
  const at = (y: number, m: number, d: number, h = 12) =>
    new Date(y, m, d, h).toISOString()

  it('holds a daily completion only for the rest of that day', () => {
    expect(isCompletionCurrent('daily', at(2026, 7, 18, 1), now)).toBe(true)
    expect(isCompletionCurrent('daily', at(2026, 7, 18, 23), now)).toBe(true)
    expect(isCompletionCurrent('daily', at(2026, 7, 17, 23), now)).toBe(false)
  })

  it('holds a weekly completion across the same Sunday-start week', () => {
    // Week of Sunday 16 August 2026.
    expect(isCompletionCurrent('weekly', at(2026, 7, 16), now)).toBe(true)
    expect(isCompletionCurrent('weekly', at(2026, 7, 17), now)).toBe(true)
    // Previous week.
    expect(isCompletionCurrent('weekly', at(2026, 7, 15), now)).toBe(false)
  })

  it('holds a biweekly completion for two weeks', () => {
    expect(isCompletionCurrent('biweekly', at(2026, 7, 10), now)).toBe(true)
    expect(isCompletionCurrent('biweekly', at(2026, 7, 2), now)).toBe(false)
  })

  it('holds a monthly completion within the calendar month', () => {
    expect(isCompletionCurrent('monthly', at(2026, 7, 1), now)).toBe(true)
    expect(isCompletionCurrent('monthly', at(2026, 6, 31), now)).toBe(false)
  })

  it('holds a quarterly completion within the calendar quarter', () => {
    // Q3 2026 is July–September.
    expect(isCompletionCurrent('quarterly', at(2026, 6, 1), now)).toBe(true)
    expect(isCompletionCurrent('quarterly', at(2026, 8, 30), now)).toBe(true)
    expect(isCompletionCurrent('quarterly', at(2026, 5, 30), now)).toBe(false)
  })

  it('holds a yearly completion within the calendar year', () => {
    expect(isCompletionCurrent('yearly', at(2026, 0, 1), now)).toBe(true)
    expect(isCompletionCurrent('yearly', at(2025, 11, 31), now)).toBe(false)
  })

  it('treats an unparseable timestamp as expired', () => {
    expect(isCompletionCurrent('daily', 'not a date', now)).toBe(false)
  })
})

describe('rolloverRecurringTasks', () => {
  it('brings back a daily task completed yesterday', () => {
    const task = seed('daily')
    toggleTaskCompletion(task.id)
    updateTask(task.id, { completedAt: new Date(2026, 7, 17, 20).toISOString() })

    expect(rolloverRecurringTasks(new Date(2026, 7, 18, 9))).toBe(true)
    const rolled = getTasks()[0]
    expect(rolled.completed).toBe(false)
    expect(rolled.completedAt).toBeUndefined()
  })

  it('leaves a daily task completed earlier today alone', () => {
    const task = seed('daily')
    toggleTaskCompletion(task.id)
    updateTask(task.id, { completedAt: new Date(2026, 7, 18, 7).toISOString() })

    expect(rolloverRecurringTasks(new Date(2026, 7, 18, 9))).toBe(false)
    expect(getTasks()[0].completed).toBe(true)
  })

  it('leaves incomplete tasks untouched', () => {
    seed('daily')
    expect(rolloverRecurringTasks(new Date(2026, 7, 18))).toBe(false)
    expect(getTasks()[0].completed).toBe(false)
  })

  it('rolls a weekly task over once the week turns, not before', () => {
    const task = seed('weekly', 'Grocery shopping')
    toggleTaskCompletion(task.id)
    updateTask(task.id, { completedAt: new Date(2026, 7, 17, 12).toISOString() })

    // Still the same Sunday-start week.
    expect(rolloverRecurringTasks(new Date(2026, 7, 20))).toBe(false)
    // Following week.
    expect(rolloverRecurringTasks(new Date(2026, 7, 24))).toBe(true)
  })

  it('rolls over a completed task that predates completedAt being recorded', () => {
    const task = seed('daily')
    updateTask(task.id, { completed: true })
    expect(rolloverRecurringTasks(new Date(2026, 7, 18))).toBe(true)
    expect(getTasks()[0].completed).toBe(false)
  })

  it('is idempotent', () => {
    const task = seed('daily')
    toggleTaskCompletion(task.id)
    updateTask(task.id, { completedAt: new Date(2026, 7, 17).toISOString() })

    expect(rolloverRecurringTasks(new Date(2026, 7, 18))).toBe(true)
    expect(rolloverRecurringTasks(new Date(2026, 7, 18))).toBe(false)
  })

  it('rolls over each frequency independently', () => {
    const daily = seed('daily')
    const yearly = seed('yearly', 'Annual health checkup')
    toggleTaskCompletion(daily.id)
    toggleTaskCompletion(yearly.id)
    const completedAt = new Date(2026, 7, 17).toISOString()
    updateTask(daily.id, { completedAt })
    updateTask(yearly.id, { completedAt })

    rolloverRecurringTasks(new Date(2026, 7, 18))

    const byTitle = Object.fromEntries(getTasks().map(t => [t.title, t]))
    expect(byTitle['Take vitamins'].completed).toBe(false)
    expect(byTitle['Annual health checkup'].completed).toBe(true)
  })
})

describe('getTasksDueToday', () => {
  it('always includes incomplete daily tasks', () => {
    seed('daily')
    expect(getTasksDueToday()).toHaveLength(1)
  })

  it('excludes completed tasks', () => {
    const task = seed('daily')
    toggleTaskCompletion(task.id)
    expect(getTasksDueToday()).toHaveLength(0)
  })

  it('excludes non-daily tasks with no due date', () => {
    seed('weekly', 'Grocery shopping')
    expect(getTasksDueToday()).toHaveLength(0)
  })
})

describe('createSampleTasks', () => {
  it('seeds starter tasks on an empty store', () => {
    createSampleTasks()
    expect(getTasks().length).toBeGreaterThan(0)
  })

  it('does not seed twice', () => {
    createSampleTasks()
    const count = getTasks().length
    createSampleTasks()
    expect(getTasks()).toHaveLength(count)
  })

  it('does not seed over a user who already has tasks', () => {
    seed('daily', 'My own task')
    createSampleTasks()
    expect(getTasks()).toHaveLength(1)
  })
})
