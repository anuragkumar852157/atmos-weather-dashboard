import { cloneElement } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Droplets,
  Snowflake,
  Sun,
  ThermometerSun,
  Wind,
} from 'lucide-react';

/**
 * Maps Open-Meteo/WMO weather codes to icons and readable descriptions.
 *
 * Reference groups:
 * 0       Clear sky
 * 1–3     Mainly clear, partly cloudy, overcast
 * 45–48   Fog
 * 51–57   Drizzle
 * 61–67   Rain/freezing rain
 * 71–77   Snow
 * 80–82   Rain showers
 * 85–86   Snow showers
 * 95–99   Thunderstorms
 */
const getWeatherIcon = (code) => {
  const weatherCode = Number(code);

  if (weatherCode === 0) {
    return {
      icon: <Sun size={64} />,
      desc: 'Clear sky',
    };
  }

  if (weatherCode === 1) {
    return {
      icon: <Sun size={64} />,
      desc: 'Mainly clear',
    };
  }

  if (weatherCode === 2) {
    return {
      icon: <Cloud size={64} />,
      desc: 'Partly cloudy',
    };
  }

  if (weatherCode === 3) {
    return {
      icon: <Cloud size={64} />,
      desc: 'Overcast',
    };
  }

  if (weatherCode >= 45 && weatherCode <= 48) {
    return {
      icon: <CloudFog size={64} />,
      desc: 'Fog',
    };
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return {
      icon: <CloudDrizzle size={64} />,
      desc: 'Drizzle',
    };
  }

  if (weatherCode >= 61 && weatherCode <= 67) {
    return {
      icon: <CloudRain size={64} />,
      desc:
        weatherCode >= 66
          ? 'Freezing rain'
          : 'Rain',
    };
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    return {
      icon: <Snowflake size={64} />,
      desc: 'Snow',
    };
  }

  if (weatherCode >= 80 && weatherCode <= 82) {
    return {
      icon: <CloudRain size={64} />,
      desc: 'Rain showers',
    };
  }

  if (weatherCode >= 85 && weatherCode <= 86) {
    return {
      icon: <Snowflake size={64} />,
      desc: 'Snow showers',
    };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return {
      icon: <CloudLightning size={64} />,
      desc:
        weatherCode >= 96
          ? 'Thunderstorm with hail'
          : 'Thunderstorm',
    };
  }

  return {
    icon: <Cloud size={64} />,
    desc: 'Weather unavailable',
  };
};

/**
 * Safely converts an API date value into a Date.
 *
 * Open-Meteo may return a local date-time without a timezone suffix,
 * for example: 2026-07-27T23:00.
 */
const parseDateValue = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime())
      ? null
      : dateValue;
  }

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatDate = (dateValue) => {
  const date = parseDateValue(dateValue);

  if (!date) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const formatTime = (dateValue) => {
  const date = parseDateValue(dateValue);

  if (!date) {
    return 'Not available';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Parses YYYY-MM-DD without timezone shifting.
 *
 * Using new Date('2026-07-28') can sometimes display the previous
 * date in certain timezones because the string may be interpreted
 * as UTC.
 */
const formatForecastWeekday = (dateString) => {
  if (
    typeof dateString !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return 'N/A';
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
  });
};

const formatTemperature = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? `${Math.round(number)}°C`
    : 'N/A';
};

const formatValue = (value, unit) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? `${number} ${unit}`
    : 'N/A';
};

const formatPercentage = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? `${Math.round(number)}%`
    : 'N/A';
};

export const WeatherCard = ({
  data,
  fetchedAt,
}) => {
  if (!data?.current) {
    return null;
  }

  const {
    current,
    location = 'Unknown location',
    daily = [],
  } = data;

  const weatherInfo = getWeatherIcon(
    current.weatherCode
  );

  return (
    <div className="weather-dashboard">
      <div className="location-header">
        <div>
          <h2 className="location-name">
            {location}
          </h2>

          <p className="location-date">
            {formatDate(current.time)}
          </p>
        </div>

        <div className="updated-time">
          <p>
            Weather data time:{' '}
            {formatTime(current.time)}
          </p>

          <p>
            App refreshed:{' '}
            {formatTime(fetchedAt)}
          </p>
        </div>
      </div>

      <div className="current-weather">
        <div className="glass main-card">
          {weatherInfo.icon}

          <h1 className="temp-large">
            {formatTemperature(
              current.temperature
            )}
          </h1>

          <p className="weather-desc">
            {weatherInfo.desc}
          </p>
        </div>

        <div className="details-grid">
          <div className="glass detail-item">
            <ThermometerSun
              className="detail-icon"
              size={32}
            />

            <div className="detail-info">
              <h4>Feels Like</h4>

              <p>
                {formatTemperature(
                  current.feelsLike
                )}
              </p>
            </div>
          </div>

          <div className="glass detail-item">
            <Droplets
              className="detail-icon"
              size={32}
            />

            <div className="detail-info">
              <h4>Humidity</h4>

              <p>
                {formatPercentage(
                  current.humidity
                )}
              </p>
            </div>
          </div>

          <div className="glass detail-item">
            <Wind
              className="detail-icon"
              size={32}
            />

            <div className="detail-info">
              <h4>Wind Speed</h4>

              <p>
                {formatValue(
                  current.windSpeed,
                  'km/h'
                )}
              </p>
            </div>
          </div>

          <div className="glass detail-item">
            <CloudRain
              className="detail-icon"
              size={32}
            />

            <div className="detail-info">
              <h4>Precipitation</h4>

              <p>
                {formatValue(
                  current.precipitation,
                  'mm'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {daily.length > 1 && (
        <div className="forecast-section">
          <h3 className="forecast-title">
            7-Day Forecast
          </h3>

          <div className="forecast-grid">
            {daily.slice(1, 7).map((day) => {
              const dayIcon = getWeatherIcon(
                day.weatherCode
              );

              return (
                <div
                  key={day.date}
                  className="glass forecast-card"
                >
                  <span className="forecast-date">
                    {formatForecastWeekday(
                      day.date
                    )}
                  </span>

                  {cloneElement(dayIcon.icon, {
                    size: 32,
                  })}

                  <span className="forecast-desc">
                    {dayIcon.desc}
                  </span>

                  <div className="forecast-temps">
                    <span>
                      {formatTemperature(
                        day.maxTemp
                      )}
                    </span>

                    <span className="forecast-min">
                      {formatTemperature(
                        day.minTemp
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};