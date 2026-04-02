# Hoon or Home

A Next.js + TailwindCSS app that helps you decide whether to **Windsurf**, **Wingfoil**, or **Stay Home** based on forecast conditions at a specific sailing location.

## Features

- Search by sailing location (via Open-Meteo geocoding API)
- Pulls wind, temperature, and rain forecast data from Open-Meteo
- Uses simple rules to recommend:
  - Windsurf
  - Wingfoil
  - Stay Home
- 24h / 48h / 72h forecast windows

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Decision logic (current defaults)

- **Windsurf**: max wind >= 28 km/h, max temp >= 10°C, total rain < 2.5 mm
- **Wingfoil**: avg wind >= 16 km/h and max wind >= 20 km/h, max temp >= 8°C, total rain < 3.5 mm
- **Stay Home** otherwise

You can tune thresholds in `app/api/forecast/route.js`.
