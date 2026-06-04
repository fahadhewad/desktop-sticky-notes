'use strict'
// Turns schedule items into recurring jobs. When a job fires we call onDue(id);
// the main process then shows a native notification and tells the renderer to
// highlight the item.

const schedule = require('node-schedule')

let jobs = []
let snoozeJobs = []

// --- smart timing: mirror of usualCompletionMinutes() in src/utils.ts so the
// scheduler can fire at the user's learned "usual" time when a reminder adapts. ---
function minutesOfDay(ts) {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

function usualMinutes(history, minSamples = 3, recent = 20) {
  if (!history || history.length < minSamples) return null
  const mins = history
    .slice(-recent)
    .map((h) => minutesOfDay(h.completedAt))
    .sort((a, b) => a - b)
  const mid = Math.floor(mins.length / 2)
  return mins.length % 2 ? mins[mid] : Math.round((mins[mid - 1] + mins[mid]) / 2)
}

// The hour/minute a reminder should actually fire at: the learned time when it
// adapts and there's enough history, otherwise the set time.
function effectiveHM(item) {
  if (item.adaptive) {
    const u = usualMinutes(item.completionHistory)
    if (u != null) return [Math.floor(u / 60), u % 60]
  }
  return item.time.split(':').map(Number)
}

function ruleFor(item) {
  const [hour, minute] = effectiveHM(item)
  const rule = new schedule.RecurrenceRule()
  rule.hour = hour
  rule.minute = minute
  rule.second = 0

  switch (item.repeat) {
    case 'daily':
      break
    case 'weekdays':
      rule.dayOfWeek = [1, 2, 3, 4, 5]
      break
    case 'weekly':
      rule.dayOfWeek = typeof item.weekday === 'number' ? item.weekday : 1
      break
    case 'once': {
      // Next occurrence of this time (today if still ahead, else tomorrow).
      const when = new Date()
      when.setHours(hour, minute, 0, 0)
      if (when.getTime() <= Date.now()) when.setDate(when.getDate() + 1)
      return when
    }
    default:
      break
  }
  return rule
}

function rescheduleAll(items, onDue) {
  jobs.forEach((j) => j.cancel())
  jobs = []
  for (const item of items || []) {
    try {
      const job = schedule.scheduleJob(ruleFor(item), () => onDue(item))
      if (job) jobs.push(job)
    } catch (err) {
      console.warn('[scheduler] could not schedule', item.id, err.message)
    }
  }
}

// One-off re-fire for a snoozed reminder. Kept separate from the recurring jobs
// so rescheduling the recurring set doesn't cancel pending snoozes.
function snoozeTask(item, minutes, onDue) {
  const when = new Date(Date.now() + Math.max(1, minutes) * 60000)
  try {
    const job = schedule.scheduleJob(when, () => onDue(item))
    if (job) snoozeJobs.push(job)
  } catch (err) {
    console.warn('[scheduler] could not snooze', item.id, err.message)
  }
}

module.exports = { rescheduleAll, snoozeTask }
