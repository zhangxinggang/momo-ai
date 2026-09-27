import { fetchWeather } from '../lib/weather.mjs';

export async function execute(input = {}) {
  const city = input.city || '西安';
  const w = await fetchWeather(city, { forecastDays: 3 });
  return {
    city: w.city.name,
    region: w.city.region,
    observedAt: w.observedAt,
    timezone: w.timezone,
    summary: w.summary,
    current: w.current,
    today: w.today,
    hourly: input.hourly ? w.hourly : []
  };
}