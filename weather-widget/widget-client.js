/**
 * Weather Widget — Client-side Controller
 * ServiceNow Service Portal (AngularJS)
 *
 * Fetches geocoding + forecast from Open-Meteo directly from the browser.
 * No authentication required. ES5 syntax to stay consistent with widget-server.js.
 */
api.controller = function($scope, $http, $interval, $timeout) {
  var c = this;

  c.activeTab = 'current';
  c.loading = true;
  c.error = '';
  c.location = null;
  c.current = null;
  c.hourly = [];
  c.daily = [];
  c.lastUpdated = null;

  var GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  var FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

  // WMO weather code → label + Font Awesome 4.x icon class
  var WMO_CODES = {
    0:  { label: 'Clear sky',                       icon: 'fa-sun-o' },
    1:  { label: 'Mainly clear',                    icon: 'fa-sun-o' },
    2:  { label: 'Partly cloudy',                   icon: 'fa-cloud' },
    3:  { label: 'Overcast',                        icon: 'fa-cloud' },
    45: { label: 'Fog',                             icon: 'fa-align-justify' },
    48: { label: 'Depositing rime fog',             icon: 'fa-align-justify' },
    51: { label: 'Light drizzle',                   icon: 'fa-tint' },
    53: { label: 'Moderate drizzle',                icon: 'fa-tint' },
    55: { label: 'Dense drizzle',                   icon: 'fa-tint' },
    56: { label: 'Light freezing drizzle',          icon: 'fa-snowflake-o' },
    57: { label: 'Dense freezing drizzle',          icon: 'fa-snowflake-o' },
    61: { label: 'Light rain',                      icon: 'fa-tint' },
    63: { label: 'Moderate rain',                   icon: 'fa-tint' },
    65: { label: 'Heavy rain',                      icon: 'fa-umbrella' },
    66: { label: 'Light freezing rain',             icon: 'fa-snowflake-o' },
    67: { label: 'Heavy freezing rain',             icon: 'fa-snowflake-o' },
    71: { label: 'Light snow',                      icon: 'fa-snowflake-o' },
    73: { label: 'Moderate snow',                   icon: 'fa-snowflake-o' },
    75: { label: 'Heavy snow',                      icon: 'fa-snowflake-o' },
    77: { label: 'Snow grains',                     icon: 'fa-snowflake-o' },
    80: { label: 'Light rain showers',              icon: 'fa-tint' },
    81: { label: 'Moderate rain showers',           icon: 'fa-tint' },
    82: { label: 'Violent rain showers',            icon: 'fa-umbrella' },
    85: { label: 'Light snow showers',              icon: 'fa-snowflake-o' },
    86: { label: 'Heavy snow showers',              icon: 'fa-snowflake-o' },
    95: { label: 'Thunderstorm',                    icon: 'fa-bolt' },
    96: { label: 'Thunderstorm with slight hail',   icon: 'fa-bolt' },
    99: { label: 'Thunderstorm with heavy hail',    icon: 'fa-bolt' }
  };

  function describeCode(code) {
    return WMO_CODES[code] || { label: 'Unknown', icon: 'fa-question-circle-o' };
  }

  c.setTab = function(tab) {
    c.activeTab = tab;
  };

  c.unitsImperial = function() {
    return c.data.units === 'imperial';
  };

  c.tempUnit = function() {
    return c.unitsImperial() ? '°F' : '°C';
  };

  c.windUnit = function() {
    return c.unitsImperial() ? 'mph' : 'km/h';
  };

  c.precipUnit = function() {
    return c.unitsImperial() ? 'in' : 'mm';
  };

  c.showPrecip = function() {
    return String(c.data.show_precipitation).toLowerCase() !== 'false';
  };

  function geocode(city) {
    var params = { name: city, count: 1, language: 'en', format: 'json' };
    if (c.data.country_code) {
      params.country_code = c.data.country_code;
    }
    return $http.get(GEOCODE_URL, { params: params }).then(function(resp) {
      var results = resp.data && resp.data.results;
      if (!results || !results.length) {
        throw new Error('No results for city "' + city + '"');
      }
      return results[0];
    });
  }

  function fetchForecast(loc) {
    var imperial = c.unitsImperial();
    var params = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset',
      timezone: 'auto',
      forecast_days: 7,
      temperature_unit: imperial ? 'fahrenheit' : 'celsius',
      wind_speed_unit: imperial ? 'mph' : 'kmh',
      precipitation_unit: imperial ? 'inch' : 'mm'
    };
    return $http.get(FORECAST_URL, { params: params }).then(function(resp) {
      return resp.data;
    });
  }

  function buildHourly(forecast) {
    var times = forecast.hourly && forecast.hourly.time;
    if (!times) return [];
    // Find the index of the current hour (first slot >= now)
    var nowMs = Date.now();
    var startIdx = 0;
    for (var i = 0; i < times.length; i++) {
      if (new Date(times[i]).getTime() >= nowMs - 3600000) {
        startIdx = i;
        break;
      }
    }
    var out = [];
    var endIdx = Math.min(startIdx + 24, times.length);
    for (var j = startIdx; j < endIdx; j++) {
      var d = new Date(times[j]);
      out.push({
        time: d,
        hourLabel: formatHourLabel(d),
        temp: forecast.hourly.temperature_2m[j],
        precipProb: forecast.hourly.precipitation_probability[j],
        weather: describeCode(forecast.hourly.weather_code[j])
      });
    }
    return out;
  }

  function buildDaily(forecast) {
    var times = forecast.daily && forecast.daily.time;
    if (!times) return [];
    var out = [];
    for (var i = 0; i < times.length; i++) {
      var d = new Date(times[i] + 'T00:00:00');
      out.push({
        date: d,
        dayLabel: formatDayLabel(d, i),
        tempMax: forecast.daily.temperature_2m_max[i],
        tempMin: forecast.daily.temperature_2m_min[i],
        precip: forecast.daily.precipitation_sum[i],
        weather: describeCode(forecast.daily.weather_code[i]),
        sunrise: forecast.daily.sunrise[i],
        sunset: forecast.daily.sunset[i]
      });
    }
    return out;
  }

  function formatHourLabel(d) {
    var h = d.getHours();
    var suffix = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + ' ' + suffix;
  }

  function formatDayLabel(d, idx) {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }

  function formatTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var h = d.getHours();
    var m = d.getMinutes();
    var suffix = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 === 0 ? 12 : h % 12;
    var mm = m < 10 ? '0' + m : m;
    return hh + ':' + mm + ' ' + suffix;
  }

  c.formatTime = formatTime;

  c.load = function() {
    c.error = '';
    if (!c.data.city) {
      c.loading = false;
      c.error = 'No city configured. Set the City option or weather.widget.city sys_property.';
      return;
    }
    c.loading = true;
    geocode(c.data.city)
      .then(function(loc) {
        c.location = loc;
        return fetchForecast(loc);
      })
      .then(function(forecast) {
        var cur = forecast.current || {};
        c.current = {
          temperature: cur.temperature_2m,
          apparentTemperature: cur.apparent_temperature,
          humidity: cur.relative_humidity_2m,
          precipitation: cur.precipitation,
          windSpeed: cur.wind_speed_10m,
          isDay: cur.is_day === 1,
          weather: describeCode(cur.weather_code)
        };
        c.hourly = buildHourly(forecast);
        c.daily = buildDaily(forecast);
        c.lastUpdated = new Date();
        c.loading = false;
      })
      .catch(function(err) {
        c.loading = false;
        c.error = (err && err.message) ? err.message : 'Could not load forecast.';
      });
  };

  // Auto-refresh
  var refreshHandle = null;
  function startAutoRefresh() {
    var minutes = parseInt(c.data.refresh_minutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      refreshHandle = $interval(c.load, minutes * 60 * 1000);
    }
  }

  $scope.$on('$destroy', function() {
    if (refreshHandle) {
      $interval.cancel(refreshHandle);
      refreshHandle = null;
    }
  });

  // Kick off initial load on next digest so c.data is fully bound
  $timeout(function() {
    c.load();
    startAutoRefresh();
  }, 0);
};
