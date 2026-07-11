export const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/ytgify/dnljofakogbecppbkmnoffppkfdmpfje';
export const FIREFOX_ADDON_URL = 'https://addons.mozilla.org/en-US/firefox/addon/ytgify-for-firefox/';
export const GITHUB_ORG_URL = 'https://github.com/ytgify';
export const GITHUB_REPO_URL = 'https://github.com/ytgify/ytgify';
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
export const DEMO_VIDEO_EMBED_URL = 'https://www.youtube.com/embed/hBBr8SluoQ8';

// Formspree email capture
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjqpkbv';

// Mobile reminder content
export const MOBILE_REMINDER = {
  title: 'Install YTgify on Desktop',
  text: 'Reminder: Install YTgify - the free YouTube to GIF converter. No watermark, works inside YouTube.',
  url: 'https://ytgify.com',
};

// Mobile reminder email (for mailto: fallback)
export const MOBILE_REMINDER_EMAIL = {
  subject: encodeURIComponent('Reminder: Install YTgify on Desktop'),
  body: encodeURIComponent(
    `Hey future me!\n\n` +
    `Remember to install YTgify - the free YouTube to GIF converter.\n\n` +
    `Website: https://ytgify.com\n` +
    `Chrome: ${CHROME_EXTENSION_URL}\n` +
    `Firefox: ${FIREFOX_ADDON_URL}\n\n` +
    `Features:\n` +
    `- No watermark\n` +
    `- Works right inside YouTube\n` +
    `- Custom text overlays\n` +
    `- Takes 30 seconds to create your first GIF`
  ),
};

// Site metadata constants
export const SITE_URL = 'https://ytgify.com';
export const SITE_NAME = 'YTgify';
export const SITE_TITLE = 'YouTube to GIF Converter - Free, No Watermark | YTgify';
export const SITE_DESCRIPTION = 'Turn YouTube videos into GIFs for free with YTgify. Create, caption, and download no-watermark GIFs in your browser without uploading your video.';
