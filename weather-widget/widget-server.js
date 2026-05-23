/**
 * Weather Widget — Server-side Script
 * ServiceNow Service Portal
 *
 * Pass-through only: merges widget instance options with sys_property
 * defaults and hands a clean data object to the client controller.
 * All API calls happen client-side via $http (Open-Meteo, no auth).
 */
(function() {

  function sysProp(name, fallback) {
    var val = gs.getProperty(name, '');
    return val ? val : (fallback || '');
  }

  var opts = options || {};

  data.widget_title       = opts.widget_title       || sysProp('weather.widget.title', 'Weather');
  data.city               = opts.city               || sysProp('weather.widget.city', '');
  data.country_code       = opts.country_code       || sysProp('weather.widget.country_code', '');
  data.units              = opts.units              || sysProp('weather.widget.units', 'metric');
  data.theme              = opts.theme              || sysProp('weather.widget.theme', 'light');
  data.show_precipitation = opts.show_precipitation || sysProp('weather.widget.show_precipitation', 'true');
  data.refresh_minutes    = opts.refresh_minutes    || sysProp('weather.widget.refresh_minutes', '30');

})();
