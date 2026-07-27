const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const OPEN_METEO_FORECAST_URL =
  'https://api.open-meteo.com/v1/forecast';

const OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';

const REQUEST_TIMEOUT_MS = 10_000;

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((origin) =>
          origin.trim()
        )
      : '*',
    methods: ['GET'],
  })
);

app.use(express.json({ limit: '10kb' }));

const parseCoordinate = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
};

const isValidLatitude = (latitude) =>
  latitude >= -90 && latitude <= 90;

const isValidLongitude = (longitude) =>
  longitude >= -180 && longitude <= 180;

const cleanText = (value, maxLength = 100) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
};

const sendNoStoreHeaders = (res) => {
  res.set({
    'Cache-Control':
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });
};

const getAxiosErrorDetails = (error) => ({
  status: error.response?.status || null,
  message:
    error.response?.data?.reason ||
    error.response?.data?.error ||
    error.message ||
    'Unknown upstream error',
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Atmos Weather API',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/weather', async (req, res) => {
  sendNoStoreHeaders(res);

  try {
    const latitude = parseCoordinate(req.query.lat);
    const longitude = parseCoordinate(req.query.lon);
    const requestedCity = cleanText(req.query.city);

    if (latitude === null || longitude === null) {
      return res.status(400).json({
        error:
          'Valid latitude and longitude are required.',
      });
    }

    if (!isValidLatitude(latitude)) {
      return res.status(400).json({
        error:
          'Latitude must be between -90 and 90.',
      });
    }

    if (!isValidLongitude(longitude)) {
      return res.status(400).json({
        error:
          'Longitude must be between -180 and 180.',
      });
    }

    const response = await axios.get(
      OPEN_METEO_FORECAST_URL,
      {
        params: {
          latitude,
          longitude,

          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'weather_code',
            'wind_speed_10m',
          ].join(','),

          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'uv_index_max',
          ].join(','),

          timezone: 'auto',
          forecast_days: 7,
          temperature_unit: 'celsius',
          wind_speed_unit: 'kmh',
          precipitation_unit: 'mm',
        },

        timeout: REQUEST_TIMEOUT_MS,

        headers: {
          Accept: 'application/json',
        },
      }
    );

    const data = response.data;

    if (
      !data?.current ||
      !data?.daily ||
      !Array.isArray(data.daily.time)
    ) {
      console.error(
        'Unexpected Open-Meteo response structure:',
        data
      );

      return res.status(502).json({
        error:
          'Weather provider returned an unexpected response.',
      });
    }

    const current = data.current;
    const daily = data.daily;

    const dailyForecast = daily.time.map(
      (date, index) => ({
        date,
        maxTemp:
          daily.temperature_2m_max?.[index] ?? null,
        minTemp:
          daily.temperature_2m_min?.[index] ?? null,
        weatherCode:
          daily.weather_code?.[index] ?? null,
        uvIndex:
          daily.uv_index_max?.[index] ?? null,
      })
    );

    return res.status(200).json({
      location:
        requestedCity || 'Selected location',

      coordinates: {
        requested: {
          latitude,
          longitude,
        },

        weatherGrid: {
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          elevation: data.elevation ?? null,
        },
      },

      timezone: {
        name: data.timezone ?? null,
        abbreviation:
          data.timezone_abbreviation ?? null,
        utcOffsetSeconds:
          data.utc_offset_seconds ?? null,
      },

      current: {
        temperature:
          current.temperature_2m ?? null,

        feelsLike:
          current.apparent_temperature ?? null,

        humidity:
          current.relative_humidity_2m ?? null,

        precipitation:
          current.precipitation ?? null,

        windSpeed:
          current.wind_speed_10m ?? null,

        isDay:
          current.is_day ?? null,

        weatherCode:
          current.weather_code ?? null,

        time:
          current.time ?? null,

        intervalSeconds:
          current.interval ?? null,
      },

      daily: dailyForecast,

      units: {
        temperature:
          data.current_units?.temperature_2m ||
          '°C',

        feelsLike:
          data.current_units
            ?.apparent_temperature || '°C',

        humidity:
          data.current_units
            ?.relative_humidity_2m || '%',

        precipitation:
          data.current_units?.precipitation ||
          'mm',

        windSpeed:
          data.current_units?.wind_speed_10m ||
          'km/h',
      },

      source: {
        provider: 'Open-Meteo',
        type: 'Weather forecast model data',
        disclaimer:
          'Weather values may differ from other providers because providers can use different weather models, observation stations, update times, and grid locations.',
      },

      fetchedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    const details = getAxiosErrorDetails(error);

    console.error(
      'Error fetching weather data:',
      details
    );

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error:
          'The weather provider took too long to respond. Please try again.',
      });
    }

    if (error.response?.status === 400) {
      return res.status(502).json({
        error:
          'The weather provider rejected the request.',
      });
    }

    return res.status(502).json({
      error:
        'Unable to retrieve weather data at this time. Please try again later.',
    });
  }
});

app.get('/api/search', async (req, res) => {
  sendNoStoreHeaders(res);

  try {
    const query = cleanText(req.query.q);

    if (query.length < 2) {
      return res.status(400).json({
        error:
          'Please enter at least 2 characters.',
      });
    }

    const response = await axios.get(
      OPEN_METEO_GEOCODING_URL,
      {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json',
        },

        timeout: REQUEST_TIMEOUT_MS,

        headers: {
          Accept: 'application/json',
        },
      }
    );

    const cities = Array.isArray(
      response.data?.results
    )
      ? response.data.results
      : [];

    const results = cities.map((city) => ({
      id: city.id,
      name: city.name,
      admin1: city.admin1 || '',
      admin2: city.admin2 || '',
      country: city.country || '',
      countryCode: city.country_code || '',
      latitude: city.latitude,
      longitude: city.longitude,
      elevation: city.elevation ?? null,
      timezone: city.timezone || null,
      population: city.population ?? null,
    }));

    return res.status(200).json(results);
  } catch (error) {
    const details = getAxiosErrorDetails(error);

    console.error(
      'Error searching cities:',
      details
    );

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error:
          'The location search took too long. Please try again.',
      });
    }

    return res.status(502).json({
      error:
        'Unable to search locations at this time.',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found.',
  });
});

app.use((error, req, res, next) => {
  console.error(
    'Unexpected server error:',
    error
  );

  res.status(500).json({
    error:
      'An unexpected server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(
    `Atmos Weather API running on port ${PORT}`
  );
});