// 西安实时天气工具 —— 共用业务逻辑（供 actions 使用；index.html 内含等价实现）
// 数据源：Open-Meteo，免费且无需 API Key，仅访问固定公开 URL，只用 Node 内置 fetch。

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search';

// WMO 天气代码 -> 中文描述 + 图标
const WMO = {
  0: ['晴', '☀️'], 1: ['大致晴朗', '🌤️'], 2: ['局部多云', '⛅'], 3: ['阴天', '☁️'],
  45: ['雾', '🌫️'], 48: ['雾凇', '🌫️'],
  51: ['毛毛雨（弱）', '🌦️'], 53: ['毛毛雨（中）', '🌦️'], 55: ['毛毛雨（强）', '🌧️'],
  56: ['冻毛毛雨（弱）', '🌧️'], 57: ['冻毛毛雨（强）', '🌧️'],
  61: ['小雨', '🌦️'], 63: ['中雨', '🌧️'], 65: ['大雨', '🌧️'],
  66: ['冻雨（弱）', '🌧️'], 67: ['冻雨（强）', '🌧️'],
  71: ['小雪', '🌨️'], 73: ['中雪', '🌨️'], 75: ['大雪', '❄️'], 77: ['雪粒', '❄️'],
  80: ['阵雨（弱）', '🌦️'], 81: ['阵雨（中）', '🌧️'], 82: ['强阵雨', '⛈️'],
  85: ['阵雪（弱）', '🌨️'], 86: ['阵雪（强）', '❄️'],
  95: ['雷阵雨', '⛈️'], 96: ['雷阵雨伴冰雹（弱）', '⛈️'], 99: ['雷阵雨伴冰雹（强）', '⛈️']
};

export function describeCode(code) {
  const v = WMO[code];
  return v ? { text: v[0], icon: v[1] } : { text: `未知天气（代码 ${code}）`, icon: '❔' };
}

const round = (n, d = 1) =>
  (typeof n !== 'number' || Number.isNaN(n)) ? null : Math.round(n * 10 ** d) / 10 ** d;

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const DIRS = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
const dirText = (deg) => (deg == null ? '' : DIRS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]);
const weekdayOf = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : WEEK[d.getDay()];
};

async function getJson(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`接口返回 ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// 内置常用城市坐标，减少地理编码请求
const KNOWN = {
  '西安': [34.3416, 108.9398, '陕西省'],
  'xian': [34.3416, 108.9398, '陕西省'],
  'xi_an': [34.3416, 108.9398, '陕西省'],
  '西安市': [34.3416, 108.9398, '陕西省'],
  '北京': [39.9042, 116.4074, '北京市'],
  '上海': [31.2304, 121.4737, '上海市'],
  '广州': [23.1291, 113.2644, '广东省'],
  '深圳': [22.5431, 114.0579, '广东省'],
  '成都': [30.5728, 104.0668, '四川省'],
  '杭州': [30.2741, 120.1551, '浙江省']
};

export async function resolveCity(city) {
  const raw = String(city || '西安').trim() || '西安';
  const key = raw.toLowerCase().replace(/[\s·]/g, '_');
  if (KNOWN[key]) {
    const [lat, lon, prov] = KNOWN[key];
    return { name: raw.startsWith('西') ? '西安' : raw, province: prov, latitude: lat, longitude: lon };
  }
  try {
    const d = await getJson(`${GEOCODE_API}?name=${encodeURIComponent(raw)}&count=1&language=zh&format=json`);
    const hit = d && Array.isArray(d.results) && d.results[0];
    if (hit) {
      return { name: hit.name || raw, province: hit.admin1 || '', latitude: hit.latitude, longitude: hit.longitude };
    }
  } catch (e) {
    // 地理编码失败则回退到西安，保证 action 始终有可用结果
  }
  return { name: '西安', province: '陕西省', latitude: KNOWN['西安'][0], longitude: KNOWN['西安'][1] };
}

export async function fetchWeather(city = '西安', options = {}) {
  const forecastDays = Math.max(1, Math.min(Number(options.forecastDays) || 3, 7));
  const loc = await resolveCity(city);
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,is_day,uv_index',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max',
    timezone: 'auto',
    forecast_days: String(forecastDays)
  });
  const data = await getJson(`${WEATHER_API}?${params.toString()}`);
  const cur = data.current || {};
  const info = describeCode(cur.weather_code);
  const nowIso = cur.time || new Date().toISOString();

  const times = (data.hourly && data.hourly.time) || [];
  let idx = times.indexOf(String(nowIso).slice(0, 13) + ':00');
  if (idx < 0) idx = 0;
  const hourly = times.slice(idx, idx + 24).map((t, i) => {
    const h = describeCode(data.hourly.weather_code?.[idx + i]);
    return {
      time: t,
      temperature: round(data.hourly.temperature_2m?.[idx + i]),
      text: h.text,
      icon: h.icon,
      precipProbability: data.hourly.precipitation_probability?.[idx + i] ?? null,
      isDay: (data.hourly.is_day?.[idx + i] ?? 1) === 1
    };
  });

  const daily = ((data.daily && data.daily.time) || []).map((d, i) => {
    const di = describeCode(data.daily.weather_code?.[i]);
    return {
      date: d,
      weekday: weekdayOf(d),
      text: di.text,
      icon: di.icon,
      tempMax: round(data.daily.temperature_2m_max?.[i]),
      tempMin: round(data.daily.temperature_2m_min?.[i]),
      precipitation: round(data.daily.precipitation_sum?.[i]),
      precipProbability: data.daily.precipitation_probability_max?.[i] ?? null,
      sunrise: data.daily.sunrise?.[i] ?? null,
      sunset: data.daily.sunset?.[i] ?? null,
      uvIndexMax: round(data.daily.uv_index_max?.[i])
    };
  });

  const today = daily[0] || null;
  const summary = [
    `${loc.name}${cur.is_day === 0 ? '夜间' : ''}实时天气：${info.text}，`,
    `气温 ${round(cur.temperature_2m)}℃（体感 ${round(cur.apparent_temperature)}℃），`,
    `湿度 ${cur.relative_humidity_2m ?? '--'}%，`,
    `${dirText(cur.wind_direction_10m) || '风'} ${round(cur.wind_speed_10m)} km/h`,
    today ? `，今日 ${today.tempMin}~${today.tempMax}℃。` : '。'
  ].join('');

  return {
    city: {
      name: loc.name,
      region: [loc.province, '中国'].filter(Boolean).join(' · '),
      latitude: round(loc.latitude, 4),
      longitude: round(loc.longitude, 4)
    },
    observedAt: nowIso,
    timezone: data.timezone || 'Asia/Shanghai',
    current: {
      code: cur.weather_code ?? null,
      text: info.text,
      icon: info.icon,
      isDay: cur.is_day !== 0,
      temperature: round(cur.temperature_2m),
      feelsLike: round(cur.apparent_temperature),
      humidity: cur.relative_humidity_2m ?? null,
      dewPoint: round(cur.dew_point_2m),
      precipitation: round(cur.precipitation),
      cloudCover: cur.cloud_cover ?? null,
      pressure: round(cur.pressure_msl),
      windSpeed: round(cur.wind_speed_10m),
      windDirection: cur.wind_direction_10m ?? null,
      windDirText: dirText(cur.wind_direction_10m),
      windGusts: round(cur.wind_gusts_10m),
      visibilityKm: cur.visibility != null ? round(cur.visibility / 1000) : null,
      uvIndex: round(cur.uv_index)
    },
    today,
    hourly,
    daily,
    summary
  };
}