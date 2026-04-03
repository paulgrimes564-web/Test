/**
 * LinkedIn Company Widget — Server-side Script
 * ServiceNow Service Portal
 *
 * Merges widget instance options with system property defaults
 * and sends a clean data object to the client controller.
 */
(function() {

  /* ── Helper: read a sys_property with a fallback value ── */
  function sysProp(name, fallback) {
    var val = gs.getProperty(name, '');
    return val ? val : (fallback || '');
  }

  /* ── Widget instance options (set in the portal designer) ── */
  var opts = options || {};

  /* ── Build the data payload ── */
  data.widget_title   = opts.widget_title   || sysProp('linkedin.widget.title', 'Our LinkedIn');
  data.company_name   = opts.company_name   || sysProp('linkedin.widget.company_name', '');
  data.tagline        = opts.tagline        || sysProp('linkedin.widget.tagline', '');
  data.description    = opts.description    || sysProp('linkedin.widget.description', '');
  data.linkedin_url   = opts.linkedin_url   || sysProp('linkedin.widget.linkedin_url', 'https://www.linkedin.com/company/');
  data.vanity_name    = opts.vanity_name    || sysProp('linkedin.widget.vanity_name', '');
  data.company_id     = opts.company_id     || sysProp('linkedin.widget.company_id', '');
  data.logo_url       = opts.logo_url       || sysProp('linkedin.widget.logo_url', '');
  data.banner_url     = opts.banner_url     || sysProp('linkedin.widget.banner_url', '');
  data.website        = opts.website        || sysProp('linkedin.widget.website', '');
  data.industry       = opts.industry       || sysProp('linkedin.widget.industry', '');
  data.company_size   = opts.company_size   || sysProp('linkedin.widget.company_size', '');
  data.headquarters   = opts.headquarters   || sysProp('linkedin.widget.headquarters', '');
  data.location       = opts.location       || sysProp('linkedin.widget.location', '');
  data.founded        = opts.founded        || sysProp('linkedin.widget.founded', '');
  data.followers      = opts.followers      || sysProp('linkedin.widget.followers', '');
  data.theme          = opts.theme          || sysProp('linkedin.widget.theme', 'light');

  /*
   * Featured posts: JSON array stored in the widget option or sys_property.
   * Format: [{"text":"...", "date":"...", "url":"..."}, ...]
   *
   * Example sys_property value (linkedin.widget.featured_posts):
   * [{"text":"We are hiring!","date":"Mar 2026","url":"https://www.linkedin.com/posts/..."}]
   */
  var rawPosts = opts.featured_posts || sysProp('linkedin.widget.featured_posts', '');
  if (rawPosts) {
    try {
      data.featured_posts = JSON.parse(rawPosts);
    } catch (e) {
      gs.warn('LinkedIn Widget: could not parse featured_posts JSON — ' + e.message);
      data.featured_posts = [];
    }
  } else {
    data.featured_posts = [];
  }

})();
