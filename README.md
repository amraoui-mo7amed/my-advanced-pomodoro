# 🍅 My Pomodoro Manager

An advanced, premium Pomodoro application built with Electron, designed for deep work and project-based productivity tracking.

## 🚀 Features

- **Project-Based Focus**: Create and manage multiple projects, each with its own specific focus.
- **Customizable Timeouts**: Assign unique session durations (work, short break, long break) to individual projects.
- **Modern UI/UX**: A beautiful, distraction-free interface with premium dark-mode styling and smooth interactions.
- **Project Icons**: Personalize projects with custom icons/emojis.
- **Cross-Platform**: Built on Electron for a seamless experience on Windows, macOS, and Linux.

## 🛠 Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: HTML5, CSS3 (Modern Flexbox/Grid), Vanilla JavaScript
- **State Management**: JavaScript-based project and session handling
- **Styling**: Premium Dark Mode CSS with hardware acceleration

## 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-pomodoro-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🖥 Usage

Start the application by running:

```bash
npm start
```

## 🏗 Project Structure

- `main.js`: Electron main process and window management.
- `preload.js`: Secure bridge between main and renderer processes.
- `renderer.js`: Core Pomodoro logic and UI interactions.
- `index.html`: Main application interface.
- `assets/`: Contains global CSS stylesheets and images.

## 🤖 For AI Agents

Guidelines for contributing to this project can be found in [AGENTS.md](./AGENTS.md).

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
