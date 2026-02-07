# Quantro Project - Complete Running Guide

This guide explains how to run the entire Quantro ecosystem including the main dashboard, all APIs, backends, and extensions.

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Python** (for serving static files, optional)
- **Chrome/Edge Browser** (for the extension)

---

## Projects Overview

| Project | Port | Description |
|---------|------|-------------|
| **Quantro Main** | 5500 | Main analytics dashboard (Vite + React) |
| **News Provider** | 3000 | News aggregation service (Next.js) |
| **Status/Ops** | 5173 | Operations status dashboard (Vite + React) |
| **Status Proxy** | 8787 | DeepSeek AI proxy server |
| **Global Entry API** | 4000 | Global Entry slots API |
| **Global Entry Client** | 5500 | Web client for slot monitoring |

---

## Required Environment Variables

### Quantro Main (`quantro-main/.env`)
```
VITE_SERPAPI_KEY=your_serpapi_key
GEMINI_API_KEY=your_gemini_api_key
```

### News Provider (`news/.env.local`)
```
SERPAPI_KEY=your_serpapi_key
GEMINI_API_KEY=your_gemini_api_key
```

### Status/Ops (`status/.env`)
```
VITE_GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

---

## Step-by-Step Startup

### Terminal 1: Quantro Main Dashboard

```powershell
cd C:\Users\owusu\Desktop\Features\quantro-main
npm install
npm run dev
```

Access at: **http://localhost:5500**

> [!NOTE]
> The Quantro main dashboard includes an embedded News API endpoint at `/api/news` powered by SerpAPI.

---

### Terminal 2: News Provider (Next.js)

```powershell
cd C:\Users\owusu\Desktop\Features\news
npm install
npm run dev
```

Access at: **http://localhost:3000**

---

### Terminal 3: Status Dashboard

```powershell
cd C:\Users\owusu\Desktop\Features\status
npm install
npm run dev
```

Access at: **http://localhost:5173**

---

### Terminal 4: DeepSeek Proxy Server

```powershell
cd C:\Users\owusu\Desktop\Features\status
npm run proxy
```

Runs at: **http://localhost:8787**

> [!IMPORTANT]
> Required for AI-powered features in the Status dashboard. Ensure `DEEPSEEK_API_KEY` is set in `.env`.

---

### Terminal 5: Global Entry Web API

```powershell
cd C:\Users\owusu\Desktop\Features\global-entry-drops-main\web\server
npm install
npm run dev
```

Runs at: **http://localhost:4000**

---

### Terminal 6: Global Entry Web Client

```powershell
cd C:\Users\owusu\Desktop\Features\global-entry-drops-main\web\client
npx serve -l 5500
```

Access at: **http://localhost:5500**

> [!WARNING]
> Port 5500 conflicts with Quantro Main. Run the Global Entry client on a different port if running both:
> ```powershell
> npx serve -l 5501
> ```

---

## Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select: `C:\Users\owusu\Desktop\Features\global-entry-drops-main`
5. The extension icon will appear in the toolbar

---

## Data Processing Scripts

The Quantro main project includes data processing scripts for H1B analytics:

```powershell
cd C:\Users\owusu\Desktop\Features\quantro-main

npm run process-csv
npm run parse-opportunities
npm run match-opportunities

npm run refresh-data
```

---

## Quick Start Summary

| Terminal | Directory | Command |
|----------|-----------|---------|
| 1 | `quantro-main` | `npm run dev` |
| 2 | `news` | `npm run dev` |
| 3 | `status` | `npm run dev` |
| 4 | `status` | `npm run proxy` |
| 5 | `global-entry-drops-main\web\server` | `npm run dev` |
| 6 | `global-entry-drops-main\web\client` | `npx serve -l 5501` |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `localhost:5500/api/news` | POST | Fetch visa-related news articles |
| `localhost:8787/api/deepseek/chat/completions` | POST | DeepSeek AI proxy |
| `localhost:8787/health` | GET | Proxy health check |
| `localhost:4000/locations` | GET | Global Entry locations |
| `localhost:4000/slots` | GET | Global Entry available slots |
