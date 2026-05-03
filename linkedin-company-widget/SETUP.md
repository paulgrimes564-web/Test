# LinkedIn Company Widget — ServiceNow Setup Guide

> **Two ways to install.** Pick whichever fits your role:
> - **Method A** — Import the Update Set XML *(fastest, recommended for admins)*
> - **Method B** — Create the widget manually in the Widget Editor *(useful for developers who want full control)*

---

## Prerequisites

| Requirement | Details |
|---|---|
| ServiceNow release | Madrid or later (tested through Xanadu) |
| Role | `admin` or `sp_admin` |
| Service Portal | At least one portal configured |
| Internet access from browser | LinkedIn's SDK scripts load from `platform.linkedin.com` |

---

## Method A — Import the Update Set (Recommended)

### Step 1 — Upload the XML file

1. In your ServiceNow instance, type **`sys_remote_update_set_list.do`** in the navigation filter (left sidebar) and press **Enter**.  
   *Or navigate to: **System Update Sets → Retrieved Update Sets***

2. Click **Import Update Set from XML** in the top-right area of the list.

3. Click **Choose File** and select:
   ```
   linkedin-company-widget/linkedin-company-widget-update-set.xml
   ```

4. Click **Upload**.  
   You will see a new row appear: **LinkedIn Company Widget v1.0** with state **Loaded**.

---

### Step 2 — Preview and commit the Update Set

1. Click the **LinkedIn Company Widget v1.0** link to open the update set record.

2. Click the **Preview Update Set** button (top of the form).  
   ServiceNow will check for conflicts. Wait for it to finish.

3. If no problems are listed, click **Commit Update Set**.  
   Click **Proceed** on the confirmation dialog.

4. Wait for the commit to complete. You will see **Commit complete** when done.

> **If you see a conflict warning:** Click the conflict row, choose **Accept Remote**, then commit again.

---

### Step 3 — Verify the widget was created

1. Navigate to **Service Portal → Widgets** (or type `sp_widget_list.do`).
2. Search for **LinkedIn Company Widget** in the Name column.
3. You should see the widget. Click it to confirm the HTML, CSS, Client Script, Server Script, and Option Schema are all populated.

---

### Step 4 — Verify the sys_properties were created

1. Navigate to **System Properties → All Properties** (or type `sys_properties_list.do`).
2. Search for **linkedin.widget** in the Name column.
3. You should see 18 properties. They start empty (except `linkedin.widget.title` = `Our LinkedIn` and `linkedin.widget.theme` = `light`).

**You now have the widget installed. Skip to [Section 3 — Configure the Widget](#3--configure-the-widget).**

---

## Method B — Create the Widget Manually

### Step 1 — Open the Widget Editor

Navigate to **Service Portal → Widget Editor** in the application navigator.

*Alternative path: type `$sp.do` in a browser tab to open your portal, then append `?sp_widget_editor=true` to the URL and click a widget to open the editor — or just navigate directly to `sp_widget_editor.do`.*

---

### Step 2 — Create a new widget

1. Click the **hamburger menu (≡)** in the top-left of the Widget Editor.
2. Select **Create a new widget**.
3. Fill in:
   - **Widget Name:** `LinkedIn Company Widget`
   - **Widget ID:** `linkedin-company-widget`
4. Click **Submit**.

---

### Step 3 — Paste the HTML Template

1. In the Widget Editor, click the **HTML** tab (top-center panel).
2. Select all existing content and delete it.
3. Open `linkedin-company-widget/widget.html` from this repository.
4. Copy the **entire file contents** and paste it into the HTML panel.

---

### Step 4 — Paste the CSS

1. Click the **CSS** tab.
2. Select all and delete.
3. Open `linkedin-company-widget/widget.css`.
4. Copy all and paste into the CSS panel.

---

### Step 5 — Paste the Client Script

1. Click the **Client Script** tab.
2. Select all and delete.
3. Open `linkedin-company-widget/widget-client.js`.
4. Copy all and paste into the Client Script panel.

---

### Step 6 — Paste the Server Script

1. Click the **Server Script** tab.
2. Select all and delete.
3. Open `linkedin-company-widget/widget-server.js`.
4. Copy all and paste into the Server Script panel.

---

### Step 7 — Add the Option Schema

1. Click the **Option Schema** tab (it may be in a dropdown labeled **...** or **More**).
2. Select all and delete.
3. Open `linkedin-company-widget/widget-options.json`.
4. Copy all and paste into the Option Schema panel.

---

### Step 8 — Save the widget

Click **Save** (or press `Ctrl+S` / `Cmd+S`).

---

## 3 — Configure the Widget

You have two ways to configure the widget. **Widget Instance Options** (per-page) always override **sys_properties** (global defaults).

---

### 3A — Set sys_properties (Global Defaults)

Use this if you want the same company on every portal page that uses the widget.

1. Navigate to **System Properties → All Properties** (or `sys_properties_list.do`).
2. Filter the list by Name contains `linkedin.widget`.
3. Fill in the properties below.

| Property Name | What to enter |
|---|---|
| `linkedin.widget.company_name` | Your company's full name, e.g. `Acme Corporation` |
| `linkedin.widget.tagline` | Short headline, e.g. `Building tomorrow's solutions, today.` |
| `linkedin.widget.description` | 1–3 sentence about the company (shown in About tab) |
| `linkedin.widget.linkedin_url` | Full URL: `https://www.linkedin.com/company/your-company/` |
| `linkedin.widget.vanity_name` | The slug after `/company/` — e.g. `acme-corporation` ← **required for badge** |
| `linkedin.widget.company_id` | Numeric ID (see Step 4 below) ← **required for Follow button** |
| `linkedin.widget.logo_url` | Direct URL to a square logo image (min 100×100px) |
| `linkedin.widget.banner_url` | Banner image URL (1128×191px). Leave blank for gradient. |
| `linkedin.widget.website` | `https://www.acmecorp.com` |
| `linkedin.widget.industry` | e.g. `Information Technology & Services` |
| `linkedin.widget.company_size` | e.g. `5,001–10,000 employees` |
| `linkedin.widget.headquarters` | e.g. `San Francisco, California` |
| `linkedin.widget.location` | Short version, e.g. `San Francisco, CA` |
| `linkedin.widget.founded` | e.g. `2003` |
| `linkedin.widget.followers` | Approximate count as number, e.g. `42800` |
| `linkedin.widget.theme` | `light` or `dark` |
| `linkedin.widget.featured_posts` | JSON array (see format below) |

**Featured Posts JSON format** — paste this into the `linkedin.widget.featured_posts` property value:
```json
[
  {
    "text": "We're thrilled to announce our new product launch!",
    "date": "May 2026",
    "url": "https://www.linkedin.com/posts/your-company_post-id"
  },
  {
    "text": "We're hiring! Join our team of innovators.",
    "date": "Apr 2026",
    "url": "https://www.linkedin.com/posts/your-company_hiring-post-id"
  }
]
```

---

### 3B — Set Widget Instance Options (Per-Page)

Use this if you want different companies on different portal pages.

See **Section 5 (Add to Portal Page)** — you set instance options through the Portal Designer after placing the widget.

---

## 4 — Find Your LinkedIn Company ID and Vanity Name

### Vanity Name (slug)
Look at your LinkedIn company page URL:
```
https://www.linkedin.com/company/YOUR-VANITY-NAME/
```
The part after `/company/` is your vanity name. Copy it exactly (lowercase, hyphens).

**Example:** `https://www.linkedin.com/company/microsoft/` → vanity name is `microsoft`

---

### Numeric Company ID
The numeric ID is required for the Follow button. Two ways to find it:

**Option 1 — Page source:**
1. Go to your LinkedIn company page while logged in.
2. Right-click → **View Page Source** (or `Ctrl+U`).
3. Search for `organizationUrn` in the source.
4. You'll see something like: `"organizationUrn":"urn:li:organization:1234567"`
5. The number (`1234567`) is your company ID.

**Option 2 — LinkedIn Admin Center URL:**
1. Go to `https://www.linkedin.com/company/YOUR-VANITY-NAME/admin/`
2. Look at the URL — it may include the numeric ID in the path.
3. Or check the network tab in browser DevTools for API calls containing the organization ID.

---

## 5 — Add the Widget to a Portal Page

### Step 1 — Open the Portal Designer

1. Navigate to your Service Portal (e.g. `https://yourinstance.service-now.com/sp`).
2. Append `?sp_designer=true` to the URL, or navigate to **Service Portal → Designer** from the application navigator.

---

### Step 2 — Select your page

1. In the Designer, click the **page dropdown** at the top.
2. Select the portal page where you want the widget (e.g. `home`, `landing`).

---

### Step 3 — Add a container

1. In the left-panel widget list, find **Container** (or **12 Column Container**).
2. Drag it to the desired position on the page canvas.

---

### Step 4 — Add the LinkedIn widget

1. In the left-panel widget list, search for **LinkedIn Company Widget**.
2. Drag it into the container you just added.

---

### Step 5 — Configure the widget instance

1. Hover over the widget on the canvas. A pencil icon (✏) appears in the top-right corner.
2. Click the pencil icon. The **Widget Instance Options** panel opens.
3. Fill in your company details in the form fields. These override the sys_properties for this specific widget placement.

   > **Tip:** If you already filled in the sys_properties, you can leave these fields blank and the global values will be used automatically.

4. Click **Save**.

---

### Step 6 — Preview

1. Click the **eye icon (👁)** in the Designer toolbar, or open your portal page in a browser tab.
2. You should see the LinkedIn widget with the Profile, Posts, and About tabs.

---

## 6 — Configure Content Security Policy (CSP)

If your ServiceNow instance enforces a Content Security Policy (common in production), the LinkedIn SDK scripts will be blocked unless you whitelist them.

### Step 1 — Find your CSP configuration

Navigate to: **System Security → Content Security Policy Configurations** (or search for `sn_csp` in the navigator).

*Note: This module name varies by ServiceNow version. In older releases it may be under **System Properties → Security**.*

---

### Step 2 — Edit your active policy

Open the policy applied to your Service Portal (`/sp`).

---

### Step 3 — Add these directives

Add each domain to the corresponding directive:

| Directive | Add these values |
|---|---|
| **script-src** | `platform.linkedin.com` `badges.linkedin.com` |
| **frame-src** | `www.linkedin.com` `platform.linkedin.com` |
| **img-src** | `media.licdn.com` `static.licdn.com` `*.licdn.com` |
| **style-src** | `static.licdn.com` |
| **connect-src** | `www.linkedin.com` |

---

### Step 4 — Save and test

Save the CSP record. Clear your browser cache and reload the portal page. The LinkedIn badge should now render.

---

## 7 — Testing Checklist

Work through these after setup:

- [ ] Widget appears on the portal page
- [ ] **Profile tab** shows company name, tagline, follower count
- [ ] **Profile tab** shows "View on LinkedIn" button that opens the correct URL
- [ ] **Profile tab** LinkedIn badge renders (may take a few seconds for SDK to load)
- [ ] **Posts tab** shows configured posts (or the empty-state if none configured)
- [ ] **Posts tab** "See all posts" link opens the correct LinkedIn posts page
- [ ] **About tab** shows all configured fields (blanks are hidden automatically)
- [ ] **About tab** "Full profile on LinkedIn" link opens the correct URL
- [ ] Tabs switch with the fade animation
- [ ] Dark theme works (set `linkedin.widget.theme` = `dark` to test)
- [ ] Mobile view: open on a narrow browser window — widget should be responsive
- [ ] Console shows no JS errors

---

## 8 — Troubleshooting

### Badge doesn't appear / shows blank

**Cause:** LinkedIn's SDK (`platform.linkedin.com/badges/js/profile.js`) was blocked by CSP or the vanity name is incorrect.

**Fix:**
1. Open browser DevTools → Console tab. Look for errors mentioning `platform.linkedin.com`.
2. Check Section 6 (CSP) above.
3. Verify `vanity_name` matches exactly what's in your LinkedIn URL (case-sensitive, hyphens not underscores).

---

### Follow button doesn't appear

**Cause:** `company_id` is empty or the `platform.linkedin.com/in.js` script was blocked.

**Fix:**
1. Confirm `company_id` is the **numeric** ID (not the vanity name).
2. Add `platform.linkedin.com` to your CSP `script-src` directive.

---

### Widget shows with no data / all fields blank

**Cause:** sys_properties are empty AND no widget instance options were set.

**Fix:** Fill in either the sys_properties (Section 3A) or the widget instance options (Section 3B).

---

### Follower count shows as a plain number without formatting

**Cause:** The `followers` field is a string passed to AngularJS's `| number` filter.

**Fix:** Ensure the `followers` property value is a plain integer with no commas (e.g. `42800`, not `42,800`). The filter applies the comma formatting.

---

### Posts tab is empty after configuring featured_posts

**Cause:** JSON syntax error in the featured_posts value.

**Fix:**
1. Take the JSON value and paste it into a JSON validator (e.g. `jsonlint.com`).
2. Ensure the format is exactly: `[{"text":"...","date":"...","url":"..."}]`
3. Save the corrected value in the sys_property or widget instance option.

---

### After import, widget exists but CSS/scripts are empty

**Cause:** Occasional issue with large update set imports truncating CDATA content.

**Fix:** Use Method B (manual widget editor) to paste the content from the source files directly into each panel.

---

## 9 — Update / Maintenance

To update the widget after code changes:
1. Re-run `generate-update-set.py` to regenerate the XML with the new source.
2. Import the new XML as a new update set and commit it.
   - ServiceNow will `INSERT_OR_UPDATE` the existing widget record (same sys_id).
   - Your widget instance options and sys_properties are NOT overwritten.

To change company details without a code update: just edit the sys_properties or widget instance options — no re-import needed.
