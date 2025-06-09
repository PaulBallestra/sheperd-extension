// src/utils/constants.js
// Centralized constants for Shepherd Tab Manager

export const SHEPHERD_CONFIG = {
  // UI Configuration
  POPUP_WIDTH: 400,
  POPUP_MIN_HEIGHT: 500,
  POPUP_MAX_HEIGHT: 600,
  MAX_VISIBLE_TABS_PER_CATEGORY: 200,
  
  // Timing Configuration
  DUPLICATE_DETECTION_DELAY: 300,
  UI_ANIMATION_DURATION: 300,
  CLEANUP_INTERVAL_DAYS: 7,
  
  // Thresholds
  OLD_TAB_THRESHOLD_DAYS: 7,
  DUPLICATE_THRESHOLD: 2,
};

export const TAB_CATEGORIES = {
  'Development': {
    icon: '💻',
    color: '#10B981',
    keywords: [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'stackoverflow.com', 'stackexchange.com',
      'developer.mozilla.org', 'docs.microsoft.com',
      'dev.to', 'medium.com/tag/programming',
      'codepen.io', 'jsfiddle.net', 'replit.com',
      'localhost', '127.0.0.1', ':3000', ':8080',
      'api.', 'docs.', 'documentation'
    ],
    patterns: [
      /docs?\./i,
      /api\./i,
      /localhost/i,
      /:\d{4}/i  // Port numbers
    ]
  },
  
  'Social & News': {
    icon: '📰',
    color: '#F59E0B',
    keywords: [
      'twitter.com', 'facebook.com', 'instagram.com',
      'linkedin.com', 'reddit.com', 'discord.com',
      'news.ycombinator.com', 'hackernews',
      'cnn.com', 'bbc.com', 'nytimes.com',
      'medium.com', 'substack.com',
      'news', 'breaking', 'headlines'
    ]
  },
  
  'Shopping': {
    icon: '🛒',
    color: '#EF4444',
    keywords: [
      'amazon.com', 'ebay.com', 'etsy.com',
      'walmart.com', 'target.com', 'bestbuy.com',
      'aliexpress.com', 'alibaba.com',
      'shop', 'buy', 'cart', 'checkout',
      'price', 'deal', 'sale', 'coupon'
    ],
    patterns: [
      /shop/i,
      /buy/i,
      /cart/i,
      /checkout/i
    ]
  },
  
  'Entertainment': {
    icon: '🎬',
    color: '#8B5CF6',
    keywords: [
      'youtube.com', 'netflix.com', 'hulu.com',
      'disney.com', 'twitch.tv', 'spotify.com',
      'soundcloud.com', 'pandora.com',
      'gaming', 'games', 'movie', 'music',
      'video', 'stream', 'watch'
    ]
  },
  
  'Work & Productivity': {
    icon: '📊',
    color: '#3B82F6',
    keywords: [
      'gmail.com', 'outlook.com', 'mail.google.com',
      'calendar.google.com', 'calendly.com',
      'slack.com', 'teams.microsoft.com', 'zoom.us',
      'notion.so', 'airtable.com', 'trello.com',
      'asana.com', 'monday.com', 'clickup.com',
      'drive.google.com', 'dropbox.com', 'onedrive.com'
    ]
  },
  
  'Research & Learning': {
    icon: '📚',
    color: '#6B7280',
    keywords: [
      'wikipedia.org', 'scholar.google.com',
      'coursera.org', 'udemy.com', 'edx.org',
      'khanacademy.org', 'pluralsight.com',
      'research', 'study', 'learn', 'course',
      'tutorial', 'guide', 'how-to'
    ]
  }
};

export const SHEPHERD_METER_LEVELS = {
  EXCELLENT: {
    range: [0, 10],
    level: 'excellent',
    message: 'Looking sharp! 🌟',
    color: '#10B981',
    percentage: 20
  },
  GOOD: {
    range: [11, 20],
    level: 'good',
    message: 'Getting busy 📈',
    color: '#3B82F6',
    percentage: 40
  },
  BUSY: {
    range: [21, 35],
    level: 'busy',
    message: 'Tab collector detected 📚',
    color: '#F59E0B',
    percentage: 60
  },
  CHAOTIC: {
    range: [36, 50],
    level: 'chaotic',
    message: 'Approaching chaos 🌪️',
    color: '#F97316',
    percentage: 80
  },
  APOCALYPTIC: {
    range: [51, Infinity],
    level: 'apocalyptic',
    message: 'Tab apocalypse! 🔥',
    color: '#EF4444',
    percentage: 100
  }
};

export const SHEPHERD_ACTIONS = {
  CLOSE_CATEGORY: 'close_category',
  BOOKMARK_CATEGORY: 'bookmark_category',
  CLOSE_DUPLICATES: 'close_duplicates',
  CLOSE_OLD_TABS: 'close_old_tabs',
  SWITCH_TO_TAB: 'switch_to_tab',
  TOGGLE_CATEGORY: 'toggle_category'
};

export const SHEPHERD_EVENTS = {
  TABS_UPDATED: 'tabs_updated',
  CATEGORY_EXPANDED: 'category_expanded',
  CATEGORY_COLLAPSED: 'category_collapsed',
  ERROR_OCCURRED: 'error_occurred',
  LOADING_STARTED: 'loading_started',
  LOADING_FINISHED: 'loading_finished'
};

export const DEFAULT_SETTINGS = {
  autoClose: false,
  duplicateThreshold: 2,
  oldTabDays: 7,
  enableNotifications: true,
  badgeEnabled: true,
  expandedCategories: [],
  theme: 'light'
};

export const SHEPHERD_STORAGE_KEYS = {
  SETTINGS: 'shepherd_settings',
  TAB_ACCESS_TIMES: 'shepherd_tab_access_times',
  EXPANDED_CATEGORIES: 'shepherd_expanded_categories',
  USER_PREFERENCES: 'shepherd_user_preferences'
}; 