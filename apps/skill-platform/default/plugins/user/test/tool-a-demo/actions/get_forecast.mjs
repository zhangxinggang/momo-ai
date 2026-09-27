import { fetchWeather } from '../lib/weather.mjs';

export async function execute(input = {}) {
  const city = input.city || '西安';
  const days = Math.max(1, Math.min(Number(input.days) || 3, 7));
  const w = await fetchWeather(city, { forecastDays: days });
  const forecast = w.daily.map((d) => ({
    date: d.date,
    weekday: d.weekday,
    text: d.text,
    tempMin: d.tempMin,
    tempMax: d.tempMax,
    precipitation: d.precipitation,
    precipProbability: d.precipProbability
  }));
  const brief = forecast
    .map((d) => `${String(d.date).slice(5)} ${d.text} ${d.tempMin}~${d.tempMax}℃`)
    .join('；');
  return {
    city: w.city.name,
    days: forecast.length,
    forecast,
    summary: `${w.city.name}未来 ${forecast.length} 天预报：${brief}。（当前：${w.current.text} ${w.current.temperature}℃）`
  };
}