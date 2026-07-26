# Atmos — Full-Stack Weather Dashboard

## Live Demo

[Open Atmos Weather Dashboard](https://atmos-weather-dashboard.onrender.com)

## Internship Project

Completed as part of the Full Stack Web Development Internship at CODTECH IT SOLUTIONS.

---

## Project Overview

Atmos is a responsive full-stack weather dashboard built with React, Node.js, and Express.js.

The application uses the Open-Meteo weather and geocoding APIs to search for cities and display current weather conditions together with a multi-day forecast.

The project includes a clean product-style interface, city autocomplete, loading states, error handling, light and dark themes, responsive layouts, and a timestamp showing when weather data was fetched.

---

## Features

- Search for cities worldwide
- Live city suggestions using a geocoding API
- Current temperature and weather condition
- Feels-like temperature
- Humidity information
- Wind-speed information
- Precipitation details
- Multi-day weather forecast
- Weather-condition icons based on WMO weather codes
- Weather data-fetch timestamp
- Loading skeletons while data is being fetched
- Clear error messages when requests fail
- Light and dark theme support
- Responsive layout for desktop, tablet, and mobile screens
- Open-Meteo data-source attribution

---

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- Axios
- CORS
- dotenv

### External APIs

- Open-Meteo Forecast API
- Open-Meteo Geocoding API

---

## Project Structure

```text
.
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   └── WeatherCard.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   └── jaipur-weather.png
│
├── server/
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
├── .gitignore
└── README.md
```

> Secret files such as `.env` are intentionally excluded from the repository and must never be committed to GitHub.

---

## Application Workflow

1. The user enters a city name in the search box.
2. The frontend sends a request to the backend city-search endpoint.
3. The backend retrieves matching city suggestions from the Open-Meteo Geocoding API.
4. The user selects a city.
5. The frontend sends the selected city coordinates to the backend weather endpoint.
6. The backend retrieves weather information from the Open-Meteo Forecast API.
7. The frontend displays:
   - Current temperature
   - Weather condition
   - Feels-like temperature
   - Humidity
   - Wind speed
   - Precipitation
   - Forecast data
   - Data-fetch time

---

## Deployment

The frontend and backend are deployed separately on Render.

- **Live Application:** [Open Atmos Weather Dashboard](https://atmos-weather-dashboard.onrender.com)
- **Frontend Hosting:** Render Static Site
- **Backend Hosting:** Render Web Service

The free Render backend may enter an inactive state after a period without traffic. The first request after inactivity may therefore take additional time.

---

## Local Setup

### Prerequisites

Install the following software before running the project locally:

- Node.js
- npm
- Visual Studio Code or another code editor

---

### Backend Setup

Open a terminal in the project root and navigate to the backend directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Start the backend server:

```bash
npm start
```

The local backend normally runs at:

```text
http://localhost:5000
```

Keep this terminal running while using the local frontend.

---

### Frontend Setup

Open another terminal in the project root and navigate to the frontend directory:

```bash
cd client
```

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The local frontend normally runs at:

```text
http://localhost:5173
```

Open this address in a browser.

> The localhost addresses are used only during local development. The deployed application communicates with the Render backend.

---

## Security and Secret Management

- Do not commit `.env` files to GitHub.
- Do not place API keys, passwords, tokens, or private credentials directly in source code.
- Store deployment secrets using the hosting provider’s environment-variable settings.
- Keep `node_modules` and generated build directories excluded through `.gitignore`.
- Review staged files with `git status` before every commit.
- Run `npm audit` periodically in both the frontend and backend directories.

This project currently uses Open-Meteo APIs, which do not require a private API key for the implemented endpoints.

---

## API Reference

### Search Cities

```http
GET /api/search?q={cityName}
```

Example:

```http
GET /api/search?q=Jaipur
```

This endpoint returns matching locations, including their names, regions, countries, latitudes, and longitudes.

---

### Fetch Weather

```http
GET /api/weather?lat={latitude}&lon={longitude}&city={cityName}
```

Example:

```http
GET /api/weather?lat=26.9124&lon=75.7873&city=Jaipur
```

This endpoint returns:

- Location name
- Current weather information
- Temperature
- Feels-like temperature
- Humidity
- Wind speed
- Precipitation
- Weather code
- Forecast data

---

## Important Code Improvements

The following improvements were made during development and testing:

- Reinstalled frontend and backend dependencies
- Fixed ESLint errors
- Improved React state handling
- Removed invalid nested HTML elements
- Added API error handling
- Added city autocomplete
- Added Open-Meteo attribution
- Added the weather data-fetch timestamp
- Replaced the original glassmorphism layout with a cleaner product-style dashboard
- Improved desktop and mobile responsiveness
- Improved the forecast-card layout
- Added light and dark theme support
- Connected the deployed frontend to the deployed backend
- Verified the frontend production build

---

## Validation Commands

### Dependency Audit

Run inside both the `client` and `server` directories:

```bash
npm audit
```

Review the command output and address any reported vulnerabilities before production use.

### Frontend Lint Check

Run inside the `client` directory:

```bash
npm run lint
```

The command should complete without ESLint errors.

### Frontend Production Build

Run inside the `client` directory:

```bash
npm run build
```

The generated production files are stored locally in:

```text
client/dist
```

The `dist` directory is generated automatically and is not committed to the repository.

---

## Verified Testing

The following checks were completed:

- Jaipur weather search
- Frontend-to-backend communication
- Live deployed frontend
- Live deployed backend
- Light theme
- Dark theme
- Frontend lint check using `npm run lint`
- Frontend production build using `npm run build`

Additional recommended checks before future releases:

- Search for multiple valid cities
- Invalid or incomplete city input
- Loading-state behaviour
- Backend-unavailable error handling
- Narrow mobile-screen layout
- Cross-browser testing

---

## Screenshots

![Jaipur Weather Result](screenshots/jaipur-weather.png)

---

## Data Source

Weather and geocoding data are provided by Open-Meteo.

Weather values may differ slightly from Google Weather or other providers because services can use different weather models, observation sources, locations, and update schedules.

---

## Limitations

- The application requires an internet connection to fetch weather data.
- Weather values may differ slightly between providers.
- The free Render backend may take additional time to respond after inactivity.
- Hourly forecasts are not currently available.
- Weather alerts are not currently available.
- Automatic current-location detection is not currently available.

---

## Future Improvements

- Automatic current-location weather
- Hourly weather forecast
- Air-quality information
- Weather alerts
- Recent city-search history
- Favourite cities
- Unit switching between Celsius and Fahrenheit
- Backend rate limiting
- Request caching
- Environment-variable-based frontend API configuration
- Automated testing
- Broader cross-browser testing

---

## Author

**Anurag Kumar**  
Full Stack Web Developer