import { useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import type { Board, Todo } from '../types'
import { relativeTime, uid } from '../utils'

interface Props {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  boards: Board[]
  activeBoardId: string
  onSwitchBoard: (id: string) => void
  onAddBoard: () => void
  onRenameBoard: (id: string, name: string) => void
  onDeleteBoard: (id: string) => void
}

// Label palette (red / orange / yellow / green / blue / purple).
const LABEL_COLORS = ['#f6736b', '#f6b06b', '#f3d44e', '#9ece6a', '#7aa2f7', '#bb9af7']

export default function TodoPanel({
  todos,
  setTodos,
  boards,
  activeBoardId,
  onSwitchBoard,
  onAddBoard,
  onRenameBoard,
  onDeleteBoard,
}: Props) {
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [filterColor, setFilterColor] = useState<string | null>(null)

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((prev) => [{ id: uid(), text: t, done: false, createdAt: Date.now() }, ...prev])
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

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.done))

  const setColor = (id: string, color?: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)))

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }
  const commitEdit = () => {
    if (!editingId) return
    const t = editText.trim()
    setTodos((prev) => prev.map((todo) => (todo.id === editingId ? { ...todo, text: t || todo.text } : todo)))
    setEditingId(null)
  }
  const cancelEdit = () => setEditingId(null)

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining
  const usedColors = LABEL_COLORS.filter((c) => todos.some((t) => t.color === c))
  const visible = filterColor ? todos.filter((t) => t.color === filterColor) : todos

  // Reorder the visible set; when filtered, weave the new order back into the
  // full list so hidden items keep their slots.
  const handleReorder = (newOrder: Todo[]) => {
    if (!filterColor) {
      setTodos(newOrder)
      return
    }
    let i = 0
    setTodos((prev) => prev.map((t) => (t.color === filterColor ? newOrder[i++] : t)))
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <BoardTabs
          boards={boards}
          activeBoardId={activeBoardId}
          onSwitch={onSwitchBoard}
          onAdd={onAddBoard}
          onRename={onRenameBoard}
          onDelete={onDeleteBoard}
        />
        <div className="flex shrink-0 items-baseline gap-2">
          <AnimatePresence>
            {doneCount > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={clearCompleted}
                className="no-drag rounded-lg px-2 py-0.5 text-xs font-medium text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                Clear done
              </motion.button>
            )}
          </AnimatePresence>
          <span className="text-xs text-ink-soft">{remaining} left</span>
        </div>
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
          className="shrink-0 rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent transition-transform duration-150 hover:scale-105 active:scale-95"
        >
          Add
        </button>
      </div>

      {usedColors.length > 0 && (
        <div className="no-drag mb-2 flex items-center gap-1.5">
          {usedColors.map((c) => (
            <button
              key={c}
              onClick={() => setFilterColor(filterColor === c ? null : c)}
              className="h-4 w-4 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: filterColor === c ? 'var(--ink)' : 'transparent' }}
              aria-label={`Filter by ${c}`}
              aria-pressed={filterColor === c}
            />
          ))}
          {filterColor && (
            <button
              onClick={() => setFilterColor(null)}
              className="text-[10px] text-ink-soft transition-colors hover:text-accent"
            >
              clear
            </button>
          )}
        </div>
      )}

      <div className="scroll-area -mr-2 flex-1 overflow-y-auto pr-2">
        <Reorder.Group axis="y" values={visible} onReorder={handleReorder} as="div">
          <AnimatePresence initial={false}>
            {visible.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                editing={editingId === todo.id}
                editText={editText}
                setEditText={setEditText}
                onToggle={() => toggle(todo.id)}
                onRemove={() => remove(todo.id)}
                onStartEdit={() => startEdit(todo)}
                onCommitEdit={commitEdit}
                onCancelEdit={cancelEdit}
                onSetColor={(c) => setColor(todo.id, c)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {visible.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2.5 px-4 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-ink-soft opacity-50"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p className="text-xs text-ink-soft">
              {filterColor ? 'No to-dos with that label.' : 'Nothing yet — add your first task.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

interface RowProps {
  todo: Todo
  editing: boolean
  editText: string
  setEditText: (v: string) => void
  onToggle: () => void
  onRemove: () => void
  onStartEdit: () => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onSetColor: (color?: string) => void
}

function TodoRow({
  todo,
  editing,
  editText,
  setEditText,
  onToggle,
  onRemove,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onSetColor,
}: RowProps) {
  const controls = useDragControls()
  const [pickerOpen, setPickerOpen] = useState(false)
  return (
    <Reorder.Item
      value={todo}
      as="div"
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="no-drag group relative mb-1.5 flex items-center gap-2 rounded-xl px-1.5 py-2 hover:bg-glass-strong"
    >
      {todo.color && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-0.5 top-2 w-1 rounded-full"
          style={{ backgroundColor: todo.color }}
        />
      )}

      <button
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none text-ink-soft opacity-0 transition-opacity duration-150 group-hover:opacity-60 active:cursor-grabbing"
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>

      <button
        onClick={onToggle}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200"
        style={{
          borderColor: todo.done ? 'var(--accent)' : 'var(--line)',
          backgroundColor: todo.done ? 'var(--accent)' : 'transparent',
        }}
        aria-label={todo.done ? 'Mark not done' : 'Mark done'}
      >
        {todo.done && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
          >
            <path d="M5 12l5 5L20 6" />
          </motion.svg>
        )}
      </button>

      {editing ? (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitEdit()
            else if (e.key === 'Escape') onCancelEdit()
          }}
          onBlur={onCommitEdit}
          autoFocus
          className="min-w-0 flex-1 border-b border-accent bg-transparent text-sm text-ink focus:outline-none"
        />
      ) : (
        <div className="min-w-0 flex-1 cursor-text" onDoubleClick={onStartEdit} title="Double-click to edit">
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
      )}

      {!editing && (
        <div className="relative shrink-0">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            className="flex items-center text-ink-soft opacity-0 transition-opacity duration-150 hover:text-accent group-hover:opacity-100"
            aria-label="Label colour"
            title="Label colour"
          >
            <span
              className="block h-3 w-3 rounded-full border"
              style={{
                backgroundColor: todo.color || 'transparent',
                borderColor: todo.color || 'var(--ink-soft)',
              }}
            />
          </button>
          {pickerOpen && (
            <div className="absolute right-0 z-20 mt-1 flex items-center gap-1 rounded-lg border border-line bg-glass-strong p-1.5 shadow-card backdrop-blur-2xl">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSetColor(c)
                    setPickerOpen(false)
                  }}
                  className="h-4 w-4 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: todo.color === c ? 'var(--ink)' : 'transparent' }}
                  aria-label={`Set label ${c}`}
                />
              ))}
              <button
                onClick={() => {
                  onSetColor(undefined)
                  setPickerOpen(false)
                }}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:text-accent"
                aria-label="No label"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {!editing && (
        <button
          onClick={onStartEdit}
          className="shrink-0 text-ink-soft opacity-0 transition-opacity duration-150 hover:text-accent group-hover:opacity-100"
          aria-label="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
      )}

      <button
        onClick={onRemove}
        className="shrink-0 text-ink-soft opacity-0 transition-opacity duration-150 hover:text-accent group-hover:opacity-100"
        aria-label="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </Reorder.Item>
  )
}

interface BoardTabsProps {
  boards: Board[]
  activeBoardId: string
  onSwitch: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

function BoardTabs({ boards, activeBoardId, onSwitch, onAdd, onRename, onDelete }: BoardTabsProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [name, setName] = useState('')

  const startRename = (b: Board) => {
    setRenamingId(b.id)
    setName(b.name)
  }
  const commitRename = () => {
    if (renamingId) onRename(renamingId, name.trim() || 'Board')
    setRenamingId(null)
  }

  return (
    <div className="no-drag flex min-w-0 items-center gap-1 overflow-x-auto">
      {boards.map((b) => {
        const active = b.id === activeBoardId
        if (renamingId === b.id) {
          return (
            <input
              key={b.id}
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                else if (e.key === 'Escape') setRenamingId(null)
              }}
              onBlur={commitRename}
              className="w-24 shrink-0 rounded-md border border-accent bg-transparent px-2 py-0.5 text-xs text-ink focus:outline-none"
            />
          )
        }
        return (
          <button
            key={b.id}
            onClick={() => onSwitch(b.id)}
            onDoubleClick={() => startRename(b)}
            title="Double-click to rename"
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--ink-soft)',
            }}
          >
            <span className="max-w-[8rem] truncate">{b.name}</span>
            {active && boards.length > 1 && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Delete board"
                title="Delete board"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(b.id)
                }}
                className="text-sm leading-none opacity-50 transition-opacity hover:opacity-100"
              >
                ×
              </span>
            )}
          </button>
        )
      })}
      <button
        onClick={onAdd}
        aria-label="New board"
        title="New board"
        className="shrink-0 rounded-md px-1.5 py-0.5 text-sm leading-none text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
      >
        +
      </button>
    </div>
  )
}
