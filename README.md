# Game Show App

A local-only React app to create and play custom game shows: **Price Is Right**, **Family Feud**, and **Jeopardy**. All data is saved locally in your browser.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - The terminal will show a URL (usually `http://localhost:5173`)
   - Open that URL in your browser
   - Enter your name to "sign in"
   - Start creating and playing games!

## Available Commands

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features

- ✅ Simple local login (just enter your name)
- ✅ Create games with any combination of the 3 game modes
- ✅ Add custom questions/answers for each mode
- ✅ Play with 2 teams and automatic scorekeeping
- ✅ All data auto-saves to browser localStorage
- ✅ Resume games where you left off

## Deploy to Vercel

1. **Push your code to GitHub**

2. **Import the repository in [Vercel](https://vercel.com)**
   - Click "New Project"
   - Import your GitHub repository

3. **Configure build settings:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (default)

4. **Deploy!** The `vercel.json` config handles SPA routing for React Router

### If you get a blank screen:

1. Check the browser console (F12) for JavaScript errors
2. Verify the build completed successfully in Vercel's build logs
3. Make sure the Output Directory is set to `dist`
4. Ensure the Build Command is `npm run build`

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- localStorage (data persistence)

