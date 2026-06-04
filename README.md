# Desktop Sticky Notes

A minimalist, glassmorphic desktop widget for **Windows**. One half is a
sticky-note **to-do list**; the other is a **schedule** of recurring reminders
(e.g. *“Take vitamin pill — 9:00 AM daily”*). It sits pinned to your desktop —
just above the wallpaper, below all your other windows — with smooth animations
and a glass UI that can match your wallpaper's colours.

![platform](https://img.shields.io/badge/platform-Windows-blue) ![stack](https://img.shields.io/badge/stack-Electron%20%2B%20React-9cf) ![license](https://img.shields.io/badge/license-MIT-green)

## Features

- **To-dos** — quick capture, check off, inline-edit (double-click), drag to
  reorder, and *Clear done*. Each records `createdAt` / `completedAt`.
- **Schedule** — time-based recurring reminders (once / daily / weekdays /
  weekly), fully editable inline. When one is due it highlights on the widget
  **and** fires a native Windows notification — and you can **snooze** it.
- **Smart reminders** — every completion is logged, and each reminder learns
  your *usual* completion time. Flip on **adapt** (the sparkle) and it fires at
  your real usual time instead of the set one.
- **Desktop-pinned** — frameless, transparent, bottom-of-the-z-order window that
  stays on your desktop without covering other apps (Windows, via `user32`).
- **System tray** — tuck the widget away to the tray and bring it back any time;
  quit from the tray menu.
- **Yours to tune** — adjustable widget **opacity** and an optional **launch at
  startup** so it's there every time you log in.
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

- Multiple notes / colour labels / tags.
- Per-reminder sounds.

## License

MIT
