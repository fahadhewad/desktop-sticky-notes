# Desktop Sticky Notes

A minimalist desktop widget for **Windows**. Half of it is a sticky-note **to-do
list**; the other half is a **schedule** of recurring reminders (e.g. *“Take
vitamin pill — 9:00 AM daily”*). It sits pinned to your desktop — just above the
wallpaper, below all your other windows — with smooth animations and a glass UI
that can match your wallpaper's colours.

![status](https://img.shields.io/badge/platform-Windows-blue) ![status](https://img.shields.io/badge/stack-Electron%20%2B%20React-9cf)

## Features

- **To-dos** — quick capture, check off, delete, with spring animations. Each
  records `createdAt` / `completedAt`.
- **Schedule** — time-based recurring tasks (once / daily / weekdays / weekly).
  When one is due it highlights on the widget **and** fires a native Windows
  notification.
- **Completion history** — every time a scheduled task is marked done is logged.
  This is the groundwork for future *smart* reminders that learn your usual
  timing.
- **Desktop-pinned** — frameless, transparent, bottom-of-the-z-order window that
  stays on your desktop without covering other apps (Windows, via `user32`).
- **Wallpaper-matched theme** — derives the glass tint and accent from your
  current wallpaper, and re-themes when you change it. Can be turned off for a
  manual accent.
- **Resizable + remembered** — drag to resize and it's remembered automatically;
  use presets/sliders in Settings; save named **size profiles** to switch back
  to any size later.
- **Hover-only chrome** — the window controls and settings gear are invisible
  until you hover the top strip.

## Tech

Electron · React + TypeScript · Vite · Tailwind CSS · Framer Motion ·
electron-store · node-schedule · node-vibrant · koffi (win32 FFI).

## Develop

```bash
npm install
npm run dev      # runs Vite + Electron together
```

> The desktop-pinning and wallpaper-theming are **Windows-only**. On macOS/Linux
> the app still runs as a normal frameless window (those features no-op), so you
> can develop the UI anywhere. In a plain browser (`npm run dev:vite`) it falls
> back to `localStorage`.

## Build a Windows installer

```bash
npm run build    # outputs an NSIS installer in release/
```

## Data

Everything is stored locally via `electron-store` (a JSON file in your user data
folder). No account, no server.

## Roadmap

- Smart reminders that learn from `completionHistory` and nudge at your real
  usual time.
- Multiple notes / tags / colour labels.
- Drag-to-reorder.

## License

MIT
