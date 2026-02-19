# Agentic Guidelines for My Pomodoro Manager

This document provides essential information for AI agents working on the My Pomodoro Manager project.

## 🛠 Build, Lint, and Test Commands

### Environment Setup
- **Language**: Python 3.13+
- **Framework**: PySide6 (Qt for Python)
- **Virtual Environment**: Located in `.venv/`. Use `.venv/bin/python` and `.venv/bin/pip`.

### Running the Application
- Start the app: `.venv/bin/python main.py`

### Linting & Formatting
- **Linter/Formatter**: `ruff`
- Run linting: `.venv/bin/ruff check .`
- Fix linting: `.venv/bin/ruff check --fix .`
- Run formatting: `.venv/bin/ruff format .`

### Testing
- **Framework**: `pytest`
- Run all tests: `.venv/bin/pytest`
- Run a single test: `.venv/bin/pytest tests/test_filename.py::test_func_name`

---

## 🎨 Code Style & Conventions

### 1. Naming Conventions
- **Classes**: `PascalCase` (e.g., `PomodoroTimer`)
- **Functions/Variables**: `snake_case` (e.g., `start_timer`, `current_session`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_WORK_TIME`)
- **Private Members**: Prefix with underscore (e.g., `_internal_state`)

### 2. PySide6 / Qt Specifics
- Use **Signals and Slots** for communication between components.
- Keep UI logic (Widgets) separate from business logic (Timers/Data).
- Use `QThread` or `qasync` for long-running operations to avoid freezing the GUI.
- Organize custom UI components into `assets/widgets/<widget-name>/`.

### 3. CSS (Qt Style Sheets)
- **Strict Rule**: Never use inline styles or keep CSS in Python files.
- **Separation**: Always separate CSS into `assets/css/<file-name>.css`.
- **Theme**: Always use a **premium light mode** theme for the application.
- Use CSS Variables/Properties for colors and spacing where possible within QSS.

### 4. Imports
- Group imports: Standard library, third-party (PySide6), then local modules.
- Prefer explicit imports from PySide6 (e.g., `from PySide6.QtWidgets import QPushButton`).

---

## 📝 Best Practices & Error Handling

- **Docstrings**: Use **Google-style docstrings** for all public classes and functions.
- **Type Hinting**: Use Python type hints for all function signatures and complex variables.
- **Error Handling**: Use specific exceptions. Log errors using the `logging` module rather than `print`.
- **Async**: Use `asyncio` for non-blocking operations if required, but ensure integration with the Qt Event Loop.
- **Pathing**: **CRITICAL**: Always use absolute paths when interacting with the filesystem via tools. Use `os.path.abspath` or `pathlib.Path.resolve()`.

## 🛠 Development Guidelines (Strict Rules)

1.  **Creative Design**: Be ambitious with UI/UX designs. Aim for a "premium" feel.
2.  **Entry Point**: The main script is always `main.py`.
3.  **Completion Notification**: Use the shell command `notify-send "Task Complete" "Description"` to notify the user when you finish a significant task.
4.  **Verification**: Always run `ruff` and `pytest` before considering a task complete.
5.  **No Reverts**: Do not revert changes unless they break the build or the user explicitly asks.

---
*Last updated: 2026-02-19*
