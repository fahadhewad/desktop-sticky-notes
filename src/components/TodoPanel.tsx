import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Todo } from '../types'
import { relativeTime, uid } from '../utils'

interface Props {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

export default function TodoPanel({ todos, setTodos }: Props) {
  const [text, setText] = useState('')

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((prev) => [
      { id: uid(), text: t, done: false, createdAt: Date.now() },
      ...prev,
    ])
    setText('')
  }

  const toggle = (id: string) =>
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined }
          : t,
      ),
    )

  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id))

  const remaining = todos.filter((t) => !t.done).length

  return (
    <section className="flex min-w-0 flex-1 flex-col p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-ink">To-do</h2>
        <span className="text-xs text-ink-soft">{remaining} left</span>
      </header>

      <div className="no-drag mb-3 flex items-center gap-2 rounded-xl border border-line bg-glass-strong px-3 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Write something down…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        />
        <button
          onClick={add}
          className="shrink-0 rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent transition-transform duration-150 hover:scale-105"
        >
          Add
        </button>
      </div>

      <div className="scroll-area -mr-2 flex-1 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="no-drag group mb-1.5 flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-glass-strong"
            >
              <button
                onClick={() => toggle(todo.id)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200"
                style={{
                  borderColor: todo.done ? 'var(--accent)' : 'var(--line)',
                  backgroundColor: todo.done ? 'var(--accent)' : 'transparent',
                }}
                aria-label={todo.done ? 'Mark not done' : 'Mark done'}
              >
                {todo.done && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm transition-all duration-200 ${
                    todo.done ? 'text-ink-soft line-through' : 'text-ink'
                  }`}
                >
                  {todo.text}
                </span>
                <span className="text-[10px] text-ink-soft">
                  {todo.done && todo.completedAt
                    ? `done ${relativeTime(todo.completedAt)}`
                    : `added ${relativeTime(todo.createdAt)}`}
                </span>
              </div>

              <button
                onClick={() => remove(todo.id)}
                className="shrink-0 text-ink-soft opacity-0 transition-opacity duration-150 hover:text-accent group-hover:opacity-100"
                aria-label="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {todos.length === 0 && (
          <p className="mt-6 text-center text-xs text-ink-soft">Nothing yet — add your first task.</p>
        )}
      </div>
    </section>
  )
}
