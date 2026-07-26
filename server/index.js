const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, city } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and Longitude are required' });
        }


        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

        const response = await axios.get(url);
        const data = response.data;


        let locationName = city || 'Unknown Location';
        if (!city) {
            try {
                const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`);
                if (geoRes.data && geoRes.data.city) {
                    locationName = geoRes.data.city;
                } else if (geoRes.data && geoRes.data.locality) {
                    locationName = geoRes.data.locality;
                }
            } catch (e) {
                console.error('Reverse geocoding failed', e.message);
            }
        }


        res.json({
            location: locationName,
            current: {
                temperature: data.current.temperature_2m,
                feelsLike: data.current.apparent_temperature,
                humidity: data.current.relative_humidity_2m,
                precipitation: data.current.precipitation,
                windSpeed: data.current.wind_speed_10m,
                isDay: data.current.is_day,
                weatherCode: data.current.weather_code,
                time: data.current.time
            },
            daily: data.daily.time.map((time, index) => ({
                date: time,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                weatherCode: data.daily.weather_code[index],
                uvIndex: data.daily.uv_index_max[index]
            }))
        });

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data. Please try again later.' });
    }
});


app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
        const response = await axios.get(url);

        if (!response.data.results) {
            return res.json([]);
        }

        const results = response.data.results.map(city => ({
            id: city.id,
            name: city.name,
            admin1: city.admin1,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude
        }));

        res.json(results);
    } catch (error) {
        console.error('Error searching cities:', error.message);
        res.status(500).json({ error: 'Failed to search cities' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
