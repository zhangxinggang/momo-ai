const XIAN = {
  name: '西安',
  latitude: 34.3416,
  longitude: 108.9398,
  timezone: 'Asia/Shanghai',
};

function finiteNumber(value, field) {
  if (!Number.isFinite(value)) throw new Error(`天气服务未返回有效的 ${field}`);
  return value;
}

export async function execute() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(XIAN.latitude));
  url.searchParams.set('longitude', String(XIAN.longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
  );
  url.searchParams.set('timezone', XIAN.timezone);

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`天气服务请求失败（${response.status}）`);
  const payload = await response.json();
  const current = payload?.current;
  if (!current || typeof current.time !== 'string') throw new Error('天气服务返回格式无效');

  return {
    city: XIAN.name,
    observedAt: current.time,
    timezone: payload.timezone || XIAN.timezone,
    temperatureC: finiteNumber(current.temperature_2m, '温度'),
    apparentTemperatureC: finiteNumber(current.apparent_temperature, '体感温度'),
    humidityPercent: finiteNumber(current.relative_humidity_2m, '湿度'),
    precipitationMm: finiteNumber(current.precipitation, '降水量'),
    weatherCode: finiteNumber(current.weather_code, '天气代码'),
    windSpeedKmh: finiteNumber(current.wind_speed_10m, '风速'),
    source: 'Open-Meteo',
  };
}
