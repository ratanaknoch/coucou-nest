# 🦉 Coucou Nest

An offline-optimized, desktop-first coding sandbox and Socratic assistant, integrating step-by-step logic playgrounds with an Ollama-inspired companion.

Designed under a modern, student-first aesthetic, **Coucou Nest** guides learners through advanced computational concepts using guided inquiry, sandbox experimentations, and interactive quiz feedback.

---

## 🌟 Key Features

- **Interactive Socratic Playgrounds**: Interactive visualizer modules allowing step-by-step execution, dynamic index checks, and modular sandbox configurations for computational algorithms.
- **AI Socratic Companion**: A server-side integrated Google Gemini mentorship module trained to help users reason through code, errors, and syntax without offering simple cop-out answers.
- **Fluid & Responsive Interface**: A clean, high-contrast, offline-first workspace styled with precise typography pairing, custom color schemes, and seamless micro-animations.
- **Persistent Student Syncing**: Robust Firestore synchronization paired with customized student persona setups, progress loggers, and automated daily streaks.
- **Native Desktop Shell**: Wrapped inside a lightweight Electron application, compiled to produce ultra-portable standalone desktop executables (`.exe`) for Windows and multi-platform offline environments.

---

## 🛠️ Architecture & Tech Stack

Coucou Nest is engineered with a **Full-Stack (Client + Server)** decoupled structure to guarantee complete credential concealment, peak offline rendering performance, and cross-platform portability.

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://motion.dev/) (smooth interface transitions) + [Lucide Icons](https://lucide.dev/)
- **Backend/API Proxy**: [Express](https://expressjs.com/) (handles secure server-side API proxy routing, static single-page application delivery, and local network bindings)
- **Database & Auth**: [Firebase v10](https://firebase.google.com/) (with custom-hardened security rules for cloud-synchronized learning progress)
- **Desktop Wrapper**: [Electron](https://www.electronjs.org/) + [Electron Builder](https://www.electron.build/) (bundling the Express web server and client assets into standard Windows portables)

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 1. Installation

Clone or export the project repository and install its dependencies:

```bash
npm install
```

### 2. Local Development (Web)

To boot up the integrated Express proxy server running Vite asset middle-routing in development mode, execute:

```bash
npm run dev
```

The application will launch on **http://localhost:3000**. All assets are hot-reloaded dynamically.

---

## 📦 Production Builds & Desktop Packaging

### 1. Standard Production Build

To compile a highly optimized static frontend bundle alongside a compiled self-contained CommonJS backend script (`dist/server.cjs`), run:

```bash
npm run build
```

Once built, launch the standalone production server locally:

```bash
npm start
```

### 2. Desktop App Compilation (`.exe`)

We have pre-configured Electron packaging to create self-contained Windows Portable executables. You can build your native desktop executable by executing:

```bash
npm run desktop:build
```

This sequence:
1. Performs an optimized production asset build.
2. Compiles the Express server entrypoint.
3. Packages both parts into a standalone Electron container.
4. Outputs the portable desktop package in the `/dist` directory (`/dist/win-unpacked/CoucouNest.exe`).

---

## 🔒 Security & Environment Configuration

The application implements strict server-side encapsulation for AI interactions:
- The **Gemini API Key** remains entirely hidden on the backend container; it is never transmitted to the user's web browser.
- Cloud progress syncing is secured with custom `/firestore.rules` allowing isolated read-write access to authorized student documents.

---

*Made with love in Socratic Academy Cloud.* 🦉
