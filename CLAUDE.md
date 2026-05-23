# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of ServiceNow Service Portal widgets, each in its own directory and packaged as an Update Set XML for import into a ServiceNow instance. There is no Node.js runtime, no package manager, no build system, and no test framework — widgets run entirely inside ServiceNow.

Current widgets:

| Directory | Widget | Data source |
|---|---|---|
| `linkedin-company-widget/` | LinkedIn Company Widget | LinkedIn embed SDKs (`platform.linkedin.com`) |
| `weather-widget/` | Weather Widget | Open-Meteo (`api.open-meteo.com`, no auth) |

Each widget directory follows the same 5-file layout (`widget.html`, `widget.css`, `widget-client.js`, `widget-server.js`, `widget-options.json`) plus its own `generate-update-set.py` and `README.md`. To add a new widget, copy an existing directory and rename — do not refactor a shared generator unless the user asks for it.

## Regenerating the Update Set XML

After editing any source file, regenerate the deployable XML for that widget:

```bash
cd <widget-directory>           # e.g. linkedin-company-widget or weather-widget
python3 generate-update-set.py
# Output: <widget-directory>-update-set.xml
```

This is the only "build" step. The XML is then imported into ServiceNow via **System Update Sets → Retrieved Update Sets → Import Update Set from XML**.

## Architecture

The widget follows the standard ServiceNow Service Portal two-script model:

| File | Where it runs | Notes |
|---|---|---|
| `widget-server.js` | ServiceNow server (Rhino/ES5) | Reads `options` and `gs.getProperty()`, populates `data.*` |
| `widget-client.js` | Browser (AngularJS 1.x) | Receives `c.data`, manages tab state, injects LinkedIn SDKs |
| `widget.html` | Browser (AngularJS template) | Uses `c.data.*` via `c` controller alias |
| `widget.css` | Browser | Scoped to `.linkedin-widget-wrapper` |
| `widget-options.json` | ServiceNow Studio | Defines 18 configurable fields shown in the Portal Designer |

### Configuration priority

Widget instance options (set per-page in Portal Designer) always win over `sys_properties` (global defaults). The server script merges them: `opts.field || gs.getProperty('<widget>.widget.field', default)`. Each widget owns its own sys_property namespace (`linkedin.widget.*`, `weather.widget.*`).

### LinkedIn SDK loading

The client controller (`widget-client.js`) lazily injects two `<script>` tags into the DOM the first time the Profile tab is activated:
- `platform.linkedin.com/badges/js/profile.js` — renders the `LI-profile-badge` div
- `platform.linkedin.com/in.js` — renders the `IN/FollowCompany` button (only if `company_id` is set)

Both scripts are idempotent: they check for an existing element by ID before injecting.

### Update Set XML generation

`generate-update-set.py` reads the five source files, XML-entity-encodes their contents, and assembles a single `<unload>` document with:
- One `sys_remote_update_set` record
- One `sp_widget` record (the widget code)
- 18 `sys_properties` records (one per config field)

All sys_ids in the script are stable fake GUIDs — they must stay constant so re-imports update the same records rather than creating duplicates. When adding a new widget, choose a GUID prefix that does not collide with existing widgets in this repo.

## Language constraints

- **`widget-server.js`** — ES5 only (Rhino engine). No `const`, `let`, arrow functions, template literals, destructuring, or any ES6+.
- **`widget-client.js`** — AngularJS 1.x. Use `api.controller = function($scope, $timeout) {}`, `c` as the controller alias, and `$timeout` for deferred DOM work.
- **`widget.html`** — AngularJS directives (`ng-if`, `ng-show`, `ng-repeat`, `ng-class`, `ng-href`, `ng-src`, `ng-style`). ServiceNow's Font Awesome 4.x is available via `fa fa-*` classes.

## CSP requirements

Each widget's `README.md` lists the CSP entries it needs. Notable cross-widget items:

| Widget | Directive | Domains |
|---|---|---|
| LinkedIn | `script-src` | `platform.linkedin.com` `badges.linkedin.com` |
| LinkedIn | `frame-src` | `www.linkedin.com` `platform.linkedin.com` |
| LinkedIn | `img-src` | `media.licdn.com` `static.licdn.com` `*.licdn.com` |
| LinkedIn | `style-src` | `static.licdn.com` |
| LinkedIn | `connect-src` | `www.linkedin.com` |
| Weather | `connect-src` | `api.open-meteo.com` `geocoding-api.open-meteo.com` |
