'use strict'
// Turns schedule items into recurring jobs. When a job fires we call onDue(id);
// the main process then shows a native notification and tells the renderer to
// highlight the item.

const schedule = require('node-schedule')

let jobs = []

function ruleFor(item) {
  const [hour, minute] = item.time.split(':').map(Number)
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

module.exports = { rescheduleAll }
