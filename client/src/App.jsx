import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Cloud, Moon, Sun } from 'lucide-react';

import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { SkeletonLoader } from './components/SkeletonLoader';

import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [weatherData, setWeatherData] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light'
    );
  };

  const fetchWeather = async (location) => {
    setLoading(true);
    setError(null);

    try {
      const { latitude, longitude, name } = location;

      const response = await axios.get(
        'http://localhost:5000/api/weather',
        {
          params: {
            lat: latitude,
            lon: longitude,
            city: name,
          },
        }
      );

      setWeatherData(response.data);
      setFetchedAt(new Date());
    } catch (err) {
      setWeatherData(null);
      setFetchedAt(null);

      setError(
        err.response?.data?.error ||
          'Failed to fetch weather data. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="glass-nav navbar">
        <div className="logo">
          <Cloud color="#3b82f6" />
          <span>Atmos</span>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            theme === 'light'
              ? 'Switch to dark theme'
              : 'Switch to light theme'
          }
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </nav>

      <main className="main-content">
        <section className="page-intro">
          <p className="page-eyebrow">Weather dashboard</p>

          <h1>Check the weather in any city</h1>

          <p className="page-description">
            Search for a city to view current conditions and the upcoming
            seven-day forecast.
          </p>
        </section>

        <SearchBar onSearch={fetchWeather} />

        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="glass empty-state">
            <AlertCircle
              size={48}
              className="error-text"
              style={{ marginBottom: '1rem' }}
            />

            <h3 className="error-text">Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : weatherData ? (
          <WeatherCard
            data={weatherData}
            fetchedAt={fetchedAt}
          />
        ) : (
          <div className="glass empty-state">
            <Cloud size={64} className="empty-icon" />
            <h3>No weather data</h3>
            <p>
              Search for a city above to see current conditions and forecasts.
            </p>
          </div>
        )}

        <p className="data-source">
          Weather data provided by Open-Meteo
        </p>
      </main>
    </div>
  );
}

export default App;