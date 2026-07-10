# ⚙️ Setup Instructions & Terminal Scripts

**Last updated: June 28, 2026**

This document details the configuration requirements, environment setup, and script commands required to run, build, and audit **Flavora Kitchen** locally.

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
* **Node.js**: Version 18.0.0 or higher.
* **npm**: Version 9.0.0 or higher.

---

## 🛠️ Local Environment Configuration

1. Navigate to the `flavora-kitchen` folder.
2. Duplicate `.env.example` to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Set the following environment variables:
   * **`GEMINI_API_KEY`**: Your Google Gemini AI API key. (Note: Inside AI Studio environments, this is injected automatically from the Secrets panel).
   * **`APP_URL`**: The base URL where your web server is hosted.

---

## 🚀 Package Installation & Scripts

The following key libraries have been added to power the premium features of **Flavora Kitchen**:
* **`three` / `@react-three/fiber` / `@react-three/drei`**: For WebGL 3D rendering.
* **`lenis` / `@lenis/react`**: For smooth, inertial viewport scrolling.
* **`howler` / `@types/howler`**: For zero-weight synthesized audio interactions.

Run the following commands inside the `flavora-kitchen` directory:

| Command | Action | Description |
| :--- | :--- | :--- |
| **`npm install`** | Standard Installation | Downloads and registers dependencies declared in `package.json`. |
| **`npm run dev`** | `vite --port=3000 --host=0.0.0.0` | Boots the Vite local server on port `3000`. Open `http://localhost:3000` to view. |
| **`npm run build`** | `vite build` | Compiles the React/TypeScript sources and asset resources into static distributions in `/dist`. |
| **`npm run preview`** | `vite preview` | Boots a local HTTP server to preview files created in `/dist`. |
| **`npm run clean`** | `rm -rf dist server.js` | Empties build directories and resets standard compiled output targets. |
| **`npm run lint`** | `tsc --noEmit` | Initiates typescript type checks across files without emitting output scripts. |

---

## 📦 Deployment Target Guidelines

* **Static Hosting**: The distribution directory `/dist` produced by `npm run build` is compatible with CDN hosts (e.g. Vercel, Netlify, Cloudflare Pages).
* **Dynamic Node Server**: An Express server config can be booted to serve static files from `/dist` and manage API requests (such as Gemini-powered recommendations) under Node.js runtime environments.
