# Desktop Sticky Notes

A minimalist, glassmorphic desktop widget for **Windows**. One half is a
sticky-note **to-do list**; the other is a **schedule** of recurring reminders
(e.g. *“Take vitamin pill — 9:00 AM daily”*). It sits pinned to your desktop —
just above the wallpaper, below all your other windows — with smooth animations
and a glass UI that can match your wallpaper's colours.

![platform](https://img.shields.io/badge/platform-Windows-blue) ![stack](https://img.shields.io/badge/stack-Electron%20%2B%20React-9cf) ![license](https://img.shields.io/badge/license-MIT-green)

## Features

- **To-dos** — multiple **boards** you switch between; quick capture, check off,
  inline-edit (double-click), drag to reorder, **colour labels** with filtering,
  and *Clear done*. Give any to-do a **deadline** in plain words (“tomorrow
  5pm”, “fri”, “in 2 hours”, “25 dec”); it's highlighted when it's close,
  turns red when it's overdue, and fires a notification when it's due.
- **Quick add from anywhere** — a global shortcut (**Ctrl+Alt+N** by default)
  pops a small box up over whatever you're doing, even though the widget itself
  sits behind your windows. Type the note, **Enter**, type a deadline (or
  nothing), **Enter**, and it lands on your current board. Esc goes back or
  cancels; Ctrl+Enter saves straight away without a deadline.
- **Schedule** — time-based recurring reminders (once / daily / weekdays /
  weekly), fully editable inline, with a per-reminder **sound** toggle. When one
  is due it highlights on the widget **and** fires a native Windows notification
  — and you can **snooze** it (10 min / 1 hour / this evening / tomorrow).
- **Smart reminders** — every completion is logged, and each reminder learns
  your *usual* completion time. Flip on **adapt** (the sparkle) and it fires at
  your real usual time instead of the set one.
- **Daily Spanish** — learn one new verb a day (or more, if you like) from the
  **500 most common Spanish verbs**, each labelled **regular** or **irregular**
  with a note on what's irregular, an example with a literal translation, and
  full tables for ten tenses. **Tenses** has a short lesson for each tense
  (when to use it, how to form it, what to watch out for). **Practice** drills
  meanings or any tense on your verbs or the top 25 to 500: Enter checks,
  Enter again moves on, missed questions come back a little later and the same
  question never repeats back to back. **Verbs** lets you search and filter all
  500. Fully offline — no API.
- **Desktop-pinned** — frameless, transparent, bottom-of-the-z-order window that
  stays on your desktop without covering other apps (Windows, via `user32`).
  Press the show/hide shortcut to bring it in front of everything; press it
  again to hide it. Clicking into any text box also brings it forward and
  gives it the keyboard, so typing lands in the widget. While it's in front it
  turns solid and fully opaque so it's readable over other apps; click another
  app and it drops back to the desktop and its usual see-through look.
- **Stick it anywhere** — in Settings → Position, stick the widget to any corner
  or edge (top right, top left, bottom centre, centre…) of the screen it's on,
  and it stays there through resizes and display changes. Or leave it *Free*
  and drag it wherever you like.
- **System tray** — tuck the widget away to the tray and bring it back any time;
  quit from the tray menu.
- **Yours to tune** — adjustable widget **opacity** and an optional **launch at
  startup** so it's there every time you log in.
- **Keyboard shortcuts** — global shortcuts you can change in Settings →
  Shortcuts (click, press a new combo): quick add (Ctrl+Alt+N) and bring to
  front / hide (Ctrl+Shift+S). In the widget, Ctrl+N jumps to the add box and Esc tucks it
  away.
- **Wallpaper-matched theme** — derives the glass tint and accent from your
  current wallpaper and re-themes when you change it. Or turn it off and pick a
  manual accent.
- **Resizable + remembered** — drag to resize and it's remembered; use
  presets/sliders in Settings; save named **size profiles**.
- **Ambient clock** + **hover-only chrome** — a quiet clock and date in the
  title strip; the window controls and settings gear stay invisible until you
  hover.

## Tech

Electron · React + TypeScript · Vite · Tailwind CSS · Framer Motion ·
electron-store · node-schedule · node-vibrant · koffi (win32 FFI). Inter is
bundled via `@fontsource-variable/inter`, so the app needs no network at runtime.

## Develop

```bash
npm install
npm run dev      # runs Vite + Electron together
```

> Desktop-pinning, the tray, wallpaper-theming and notifications are
> **Windows-first**. On macOS/Linux the app still runs as a normal frameless
> window (those bits no-op), so you can develop the UI anywhere. In a plain
> browser (`npm run dev:vite`) it falls back to `localStorage`.

## Build a Windows installer

```bash
npm run icons    # regenerate icons from build/icon.svg (only if it changed)
npm run build    # outputs an NSIS installer in release/
```

> If you hit a `winCodeSign … Cannot create symbolic link` error, enable
> **Windows Developer Mode** (Settings → Privacy & security → For developers) or
> run the build from an elevated terminal — electron-builder needs symlink
> privilege to unpack its signing tools.

## Data

Everything is stored locally via `electron-store` (a JSON file in your user-data
folder). No account, no server.

## Roadmap

- Named tags and full-text search across boards.
- Optional cloud sync.

## License

MIT
