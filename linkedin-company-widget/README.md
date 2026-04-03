# LinkedIn Company Widget — ServiceNow Service Portal

A polished ServiceNow Service Portal widget that surfaces your company's LinkedIn presence directly in the portal — more interactive and branded than a plain iframe.

## Features

| Feature | Details |
|---|---|
| **3-tab layout** | Profile · Posts · About |
| **Company card** | Logo, name, tagline, follower count, meta row |
| **LinkedIn badge** | Official `LI-profile-badge` rendered via LinkedIn's SDK |
| **Follow button** | LinkedIn `IN/FollowCompany` plugin (requires numeric company ID) |
| **Posts tab** | Configurable featured post cards linking to LinkedIn |
| **About tab** | Animated info cards: website, industry, size, HQ, founded |
| **Dark theme** | Toggle via widget option or `sys_property` |
| **Fully configurable** | Widget options + `sys_properties` fallback |
| **Responsive** | Adapts for mobile portal pages |

---

## Installation

### 1. Create the widget in Studio / Widget Editor

1. Navigate to **Service Portal → Widget Editor** (or open Studio).
2. Click **Create a new widget**.
3. Fill in:
   - **Name**: `LinkedIn Company Widget`
   - **ID**: `linkedin-company-widget`
4. Paste each file's contents into the corresponding editor panel:

| File | Panel |
|---|---|
| `widget.html` | HTML Template |
| `widget.css` | CSS / LESS |
| `widget-client.js` | Client Script |
| `widget-server.js` | Server Script |
| `widget-options.json` | Option Schema (paste into the **Option Schema** tab as JSON) |

5. **Save** the widget.

---

### 2. Add to a portal page

1. Open your portal page in the **Service Portal Designer**.
2. Drag a container/column into place.
3. Click **+** → search for **LinkedIn Company Widget** → add it.
4. Click the pencil icon on the widget instance to open **Widget Options**.
5. Fill in your company details (see [Configuration](#configuration) below).
6. Save and preview.

---

## Configuration

All options can be set per-widget-instance **or** as global `sys_properties` (the widget instance value always wins).

### Core options

| Option | `sys_property` key | Description |
|---|---|---|
| Widget Title | `linkedin.widget.title` | Header bar label |
| Company Name | `linkedin.widget.company_name` | Display name |
| Tagline | `linkedin.widget.tagline` | Short headline |
| Description | `linkedin.widget.description` | About tab paragraph |
| LinkedIn URL | `linkedin.widget.linkedin_url` | Full page URL |
| Vanity Name | `linkedin.widget.vanity_name` | Slug after `/company/` — enables the badge |
| Company ID | `linkedin.widget.company_id` | Numeric ID — enables the Follow button |
| Logo URL | `linkedin.widget.logo_url` | Square logo image URL |
| Banner URL | `linkedin.widget.banner_url` | Cover image URL (1128×191px) |
| Theme | `linkedin.widget.theme` | `light` (default) or `dark` |
| Website | `linkedin.widget.website` | Company website |
| Industry | `linkedin.widget.industry` | e.g. "Information Technology" |
| Company Size | `linkedin.widget.company_size` | e.g. "1,001–5,000 employees" |
| Headquarters | `linkedin.widget.headquarters` | City, Country |
| Location (short) | `linkedin.widget.location` | Shown in profile card |
| Founded | `linkedin.widget.founded` | Year founded |
| Follower Count | `linkedin.widget.followers` | Numeric — formatted with commas |
| Featured Posts (JSON) | `linkedin.widget.featured_posts` | See below |

### Featured Posts JSON format

```json
[
  {
    "text": "We're excited to announce our new product launch! Check it out →",
    "date": "Mar 2026",
    "url": "https://www.linkedin.com/posts/your-company_post-id"
  },
  {
    "text": "We're hiring! Join our team of innovators.",
    "date": "Feb 2026",
    "url": "https://www.linkedin.com/posts/your-company_jobs-post-id"
  }
]
```

### Finding your Company ID and Vanity Name

- **Vanity name**: the slug in `https://www.linkedin.com/company/YOUR-VANITY-NAME/`
- **Company ID**: visible in the URL when you visit your LinkedIn Admin Center, or use LinkedIn's API. Also visible in page source as `organizationUrn`.

---

## How the LinkedIn SDK integrations work

> LinkedIn blocks direct iframe embedding of company pages via `X-Frame-Options: SAMEORIGIN`. This widget uses LinkedIn's **official embed APIs** instead.

| Feature | SDK used |
|---|---|
| Profile badge | `platform.linkedin.com/badges/js/profile.js` — renders `<div class="badge-base LI-profile-badge">` |
| Follow button | `platform.linkedin.com/in.js` — renders `<script type="IN/FollowCompany">` |

Both scripts are loaded lazily (only when the Profile tab is active) and are safe to include in a CSP-controlled ServiceNow environment.

### Content Security Policy

If your ServiceNow instance enforces CSP, add these entries:

```
script-src: platform.linkedin.com
frame-src:  www.linkedin.com platform.linkedin.com
img-src:    media.licdn.com static.licdn.com
style-src:  static.licdn.com
```

---

## Customization tips

- **Portal theme colors**: The widget uses CSS custom properties (`--li-blue`, `--li-bg`, etc.). Override them in a parent `.sp-widget-content` rule to match your portal theme.
- **Max width**: Default is `680px`. Set `.linkedin-widget-wrapper { max-width: 100%; }` for full-width layouts.
- **Animations**: Tab switches use a `lwFadeIn` keyframe. Adjust duration in `widget.css` under `@keyframes lwFadeIn`.
