# Agentic Guidelines for My Pomodoro Manager

This document provides essential information for AI agents working on the My Pomodoro Manager project.

## 🛠 Build, Lint, and Test Commands

### Environment Setup
- **Language**: JavaScript/Node.js
- **Framework**: Electron
- **Dependencies**: Install with `npm install`

### Running the Application
- Start the app: `npm start`

### Testing
- This project uses `Jest` for testing.
- Run tests: `npm test`

---

## 🎨 Code Style & Conventions

### 1. Naming Conventions
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### 2. Electron Specifics
- Use IPC for communication between main and renderer processes.
- Ensure context isolation is enabled.
- Separate logic into `main.js`, `preload.js`, and `renderer.js`.

### 3. CSS
- Use CSS Variables for colors and spacing.
- Maintain a strictly dark mode theme.

---

## 📝 Best Practices
- **Docstrings**: Use Google-style docstrings for all public classes and functions.
- **Async**: Use `anyio` or `asyncio` for non-blocking operations if required, but be mindful of the Qt Event Loop (use `qasync` if deep integration is needed).
- **Configuration**: Store configurable values (times, colors, sounds) in a `config.py` or `.env` file.

## 🛠 Development Guidelines (Strict Rules)

You MUST follow these rules strictly for every task:

1.  **Creative Design**: Always be creative and ambitious with your UI/UX designs. Aim for a "premium" feel.
2.  **CSS Separation**: Never use inline styles or keep CSS in Python files. Always separate CSS into `assets/css/<file-name>.css`.
3.  **Widget Organization**: Organize custom UI components into `assets/widgets/<widget-name>/`.
4.  **Entry Point**: The main script is always `main.py`.
5.  **Completion Notification**: Always use the shell command `notify-send` to notify the user when you finish a significant task or the entire request.
6.  **Pathing**: Always use absolute paths when interacting with the filesystem via tools.
8.  **Light Mode**: Always use a premium light mode theme for the application.
9.  **Verification**: Always run `ruff` and `pytest` (if applicable) before considering a task complete.

---
*Last updated: 2026-02-18*
