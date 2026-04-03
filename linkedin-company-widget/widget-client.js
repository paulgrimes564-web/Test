/**
 * LinkedIn Company Widget — Client-side Controller
 * ServiceNow Service Portal (AngularJS)
 */
api.controller = function($scope, $timeout) {
  var c = this;

  // Active tab state — default to 'profile'
  c.activeTab = 'profile';

  /**
   * Switch active tab and re-trigger LinkedIn SDK rendering
   * if switching to the profile tab (badge needs re-initialization).
   */
  c.setTab = function(tab) {
    c.activeTab = tab;
    if (tab === 'profile') {
      c.initLinkedInSDK();
    }
  };

  /**
   * Build a dynamic inline style for the banner background.
   * Falls back to a gradient if no custom banner image is configured.
   */
  c.bannerStyle = function() {
    if (c.data.banner_url) {
      return {
        'background-image': 'url(' + c.data.banner_url + ')',
        'background-size': 'cover',
        'background-position': 'center'
      };
    }
    // Default animated gradient banner using LinkedIn blue palette
    return {};
  };

  /**
   * Load (or reload) the LinkedIn platform SDK.
   * Required for:
   *   - IN/FollowCompany badge
   *   - LI-profile-badge (company profile card)
   * Safe to call multiple times — checks for existing instance first.
   */
  c.initLinkedInSDK = function() {
    $timeout(function() {
      // LinkedIn official badge script
      if (!document.getElementById('li-badge-script')) {
        var badgeScript = document.createElement('script');
        badgeScript.id = 'li-badge-script';
        badgeScript.src = 'https://platform.linkedin.com/badges/js/profile.js';
        badgeScript.async = true;
        badgeScript.defer = true;
        document.body.appendChild(badgeScript);
      } else if (window.LI && window.LI.init) {
        // Re-render badges if SDK already loaded
        window.LI.init();
      }

      // LinkedIn platform.js (follow button)
      if (!document.getElementById('li-platform-script') && c.data.company_id) {
        var platformScript = document.createElement('script');
        platformScript.id = 'li-platform-script';
        platformScript.src = 'https://platform.linkedin.com/in.js';
        platformScript.type = 'text/javascript';
        platformScript.innerHTML = 'lang: en_US';
        document.head.appendChild(platformScript);
      }
    }, 150);
  };

  // Initialize LinkedIn SDK on widget load
  c.initLinkedInSDK();
};
