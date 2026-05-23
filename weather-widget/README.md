# Weather Widget — ServiceNow Service Portal

A 3-tab Service Portal widget that surfaces current conditions, an hourly outlook, and a 7-day forecast for any city. Powered by [Open-Meteo](https://open-meteo.com) — free, no API key, global coverage.

## Features

| Feature | Details |
|---|---|
| **3-tab layout** | Current · Hourly · Daily |
| **No API key** | Open-Meteo's public endpoints — geocoding + forecast |
| **City-name config** | User enters a city name; widget geocodes to lat/lon at runtime |
| **Auto-refresh** | Configurable interval (default 30 min); set to `0` to disable |
| **Units** | `metric` (°C, km/h, mm) or `imperial` (°F, mph, in) |
| **Dark theme** | Toggle via widget option or `sys_property` |
| **WMO weather codes** | Full mapping (all 28 codes) to icon + label |
| **Responsive** | Adapts to mobile portal pages |

## Installation

Two methods, same as the [LinkedIn widget](../linkedin-company-widget/SETUP.md).

### Method A — Import the Update Set XML

1. Run `python3 generate-update-set.py` from this directory if you need to regenerate the XML.
2. In ServiceNow, navigate to **System Update Sets → Retrieved Update Sets**.
3. Click **Import Update Set from XML**, upload `weather-widget-update-set.xml`.
4. Open the imported row, click **Preview Update Set**, then **Commit Update Set**.

### Method B — Create the widget manually in Widget Editor

Open **Service Portal → Widget Editor → Create a new widget**:

- **Name:** `Weather Widget`
- **ID:** `weather-widget`

Paste each source file into the matching panel:

| File | Panel |
|---|---|
| `widget.html` | HTML Template |
| `widget.css` | CSS / LESS |
| `widget-client.js` | Client Script |
| `widget-server.js` | Server Script |
| `widget-options.json` | Option Schema |

Save the widget, then add it to a portal page through the Portal Designer.

## Configuration

All options can be set per-widget-instance **or** as global `sys_properties`. Instance values always win.

| Option | `sys_property` key | Default | Description |
|---|---|---|---|
| Widget Title | `weather.widget.title` | `Weather` | Header bar label |
| City | `weather.widget.city` | _(empty)_ | City to forecast — required |
| Country Code | `weather.widget.country_code` | _(empty)_ | Optional ISO code (e.g. `US`, `GB`) for disambiguation |
| Units | `weather.widget.units` | `metric` | `metric` or `imperial` |
| Theme | `weather.widget.theme` | `light` | `light` or `dark` |
| Show Precipitation | `weather.widget.show_precipitation` | `true` | Show precipitation bars on the Hourly tab |
| Refresh Interval (minutes) | `weather.widget.refresh_minutes` | `30` | Auto-refresh interval; `0` disables |

## Content Security Policy

The widget makes browser-side `fetch` calls to two Open-Meteo domains. If your ServiceNow instance enforces CSP, add these entries:

```
connect-src: api.open-meteo.com geocoding-api.open-meteo.com
```

No other CSP changes are needed — there are no third-party scripts, frames, images, or styles.

## Architecture notes

- **Server script (`widget-server.js`)** is intentionally minimal: it only merges widget options with sys_properties and passes them through to the client. There are no `RESTMessageV2` calls server-side.
- **Client script (`widget-client.js`)** does both API calls (geocoding + forecast) via AngularJS `$http`, then builds `c.current`, `c.hourly` (24 hours from "now"), and `c.daily` (7 days) for the template.
- **WMO weather codes** are translated to Font Awesome 4.x icons via the `WMO_CODES` lookup. Edit the lookup to swap icons or copy in your own SVGs.
- **Auto-refresh** uses `$interval` and is cancelled on `$scope.$destroy` to avoid leaks when the portal page changes.

## Customization

- **Banner gradient**: edit `.ww-banner` in `widget.css`. The night variant (`.ww-banner-night`) is auto-applied when `current.is_day === 0`.
- **Color palette**: override `--ww-sky`, `--ww-indigo`, and the dark-theme variables on the wrapper.
- **More forecast days**: change `forecast_days: 7` in `fetchForecast()` in `widget-client.js`. Open-Meteo supports up to 16.
- **Hourly window**: change the `+ 24` slice in `buildHourly()` to show more or fewer hours.
