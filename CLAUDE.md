# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A single ServiceNow Service Portal widget that surfaces a company's LinkedIn presence in a 3-tab card (Profile, Posts, About). There is no Node.js runtime, no package manager, no build system, and no test framework — the widget runs entirely inside ServiceNow.

## Regenerating the Update Set XML

After editing any source file, regenerate the deployable XML:

```bash
cd linkedin-company-widget
python3 generate-update-set.py
# Output: linkedin-company-widget-update-set.xml
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

Widget instance options (set per-page in Portal Designer) always win over `sys_properties` (global defaults). The server script merges them: `opts.field || gs.getProperty('linkedin.widget.field', default)`.

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

All sys_ids in the script are stable fake GUIDs — they must stay constant so re-imports update the same records rather than creating duplicates.

## Language constraints

- **`widget-server.js`** — ES5 only (Rhino engine). No `const`, `let`, arrow functions, template literals, destructuring, or any ES6+.
- **`widget-client.js`** — AngularJS 1.x. Use `api.controller = function($scope, $timeout) {}`, `c` as the controller alias, and `$timeout` for deferred DOM work.
- **`widget.html`** — AngularJS directives (`ng-if`, `ng-show`, `ng-repeat`, `ng-class`, `ng-href`, `ng-src`, `ng-style`). ServiceNow's Font Awesome 4.x is available via `fa fa-*` classes.

## CSP requirements

If the target ServiceNow instance enforces Content Security Policy, these domains must be whitelisted:

```
script-src: platform.linkedin.com badges.linkedin.com
frame-src:  www.linkedin.com platform.linkedin.com
img-src:    media.licdn.com static.licdn.com *.licdn.com
style-src:  static.licdn.com
connect-src: www.linkedin.com
```
