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
      // Code Repositories & Version Control
      'github.com', 'gitlab.com', 'bitbucket.org', 'codeberg.org',
      
      // Q&A & Forums
      'stackoverflow.com', 'stackexchange.com', 'serverfault.com',
      
      // Documentation & References
      'developer.mozilla.org', 'docs.microsoft.com', 'docs.aws.amazon.com',
      'cloud.google.com/docs', 'docs.docker.com', 'kubernetes.io',
      'reactjs.org', 'vuejs.org', 'angular.io', 'svelte.dev',
      'nodejs.org', 'python.org', 'golang.org', 'rust-lang.org',
      
      // Dev Platforms & Tools
      'dev.to', 'hashnode.com', 'codepen.io', 'jsfiddle.net', 
      'replit.com', 'codesandbox.io', 'glitch.com', 'stackblitz.com',
      'vercel.com', 'netlify.com', 'heroku.com', 'railway.app',
      
      // Local Development
      'localhost', '127.0.0.1', 'local.', 'dev.',
      
      // Package Managers & Registries
      'npmjs.com', 'pypi.org', 'packagist.org', 'crates.io',
      'nuget.org', 'maven.apache.org'
    ],
    patterns: [
      /docs?\./i,
      /api\./i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /:\d{4}/i,  // Port numbers
      /dev\./i,
      /staging\./i,
      /test\./i
    ]
  },

  'AI & Machine Learning': {
    icon: '🤖',
    color: '#FF6B6B',
    keywords: [
      // AI Chat & Assistants
      'chat.openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
      'bard.google.com', 'bing.com/chat', 'character.ai', 'poe.com',
      'perplexity.ai', 'you.com', 'phind.com',
      
      // AI Development Platforms
      'huggingface.co', 'replicate.com', 'runpod.io', 'colab.research.google.com',
      'kaggle.com', 'paperswithcode.com', 'arxiv.org',
      
      // AI Tools & Services
      'midjourney.com', 'stability.ai', 'dalle.openai.com',
      'runway.ml', 'luma.ai', 'elevenlabs.io', 'murf.ai',
      'jasper.ai', 'copy.ai', 'writesonic.com', 'grammarly.com',
      'notion.ai', 'github.com/copilot',
      
      // AI News & Communities
      'aibreakfast.com', 'towards-ai.com', 'techcrunch.com/tag/artificial-intelligence'
    ],
    patterns: [
      /\bai\b/i,
      /artificial.intelligence/i,
      /machine.learning/i,
      /neural.network/i,
      /gpt/i,
      /llm/i
    ]
  },
  
  'Social & Communication': {
    icon: '📱',
    color: '#F59E0B',
    keywords: [
      // Major Social Platforms
      'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
      'linkedin.com', 'tiktok.com', 'snapchat.com', 'pinterest.com',
      
      // Professional Networks
      'glassdoor.com', 'indeed.com', 'angel.co', 'wellfound.com',
      
      // Communities & Forums
      'reddit.com', 'discord.com', 'telegram.org', 'whatsapp.com',
      'signal.org', 'mastodon.social', 'threads.net',
      
      // Dating & Social
      'tinder.com', 'bumble.com', 'hinge.co', 'match.com',
      
      // Communication Tools
      'zoom.us', 'meet.google.com', 'teams.microsoft.com',
      'slack.com', 'discord.gg'
    ],
    patterns: [
      /social/i,
      /chat/i,
      /message/i,
      /community/i
    ]
  },

  'News & Information': {
    icon: '📰',
    color: '#6366F1',
    keywords: [
      // Major News Outlets
      'cnn.com', 'bbc.com', 'nytimes.com', 'washingtonpost.com',
      'reuters.com', 'ap.org', 'bloomberg.com', 'wsj.com',
      'theguardian.com', 'usatoday.com', 'npr.org', 'pbs.org',
      
      // Tech News
      'techcrunch.com', 'theverge.com', 'ars-technica.com', 'wired.com',
      'engadget.com', 'gizmodo.com', 'mashable.com', 'venturebeat.com',
      
      // Aggregators & Discussion
      'news.ycombinator.com', 'slashdot.org', 'digg.com',
      'flipboard.com', 'pocket.com', 'instapaper.com',
      
      // Newsletters & Blogs
      'medium.com', 'substack.com', 'newsletter.'
    ],
    patterns: [
      /news/i,
      /breaking/i,
      /headlines/i,
      /journal/i,
      /times/i,
      /post/i
    ]
  },
  
  'Shopping & E-commerce': {
    icon: '🛒',
    color: '#EF4444',
    keywords: [
      // Major Retailers
      'amazon.com', 'walmart.com', 'target.com', 'costco.com',
      'bestbuy.com', 'homedepot.com', 'lowes.com', 'macys.com',
      
      // Online Marketplaces
      'ebay.com', 'etsy.com', 'mercari.com', 'poshmark.com',
      'facebook.com/marketplace', 'offerup.com', 'craigslist.org',
      
      // International & Specialized
      'aliexpress.com', 'alibaba.com', 'wish.com', 'temu.com',
      'shein.com', 'zaful.com', 'banggood.com',
      
      // Fashion & Lifestyle
      'nike.com', 'adidas.com', 'zara.com', 'h&m.com',
      'uniqlo.com', 'gap.com', 'oldnavy.com',
      
      // Deal Sites
      'slickdeals.net', 'groupon.com', 'woot.com', 'overstock.com',
      'dealfinder.', 'coupon', 'promo'
    ],
    patterns: [
      /shop/i,
      /store/i,
      /buy/i,
      /cart/i,
      /checkout/i,
      /deals?/i,
      /sale/i,
      /coupon/i,
      /price/i
    ]
  },
  
  'Entertainment & Media': {
    icon: '🎬',
    color: '#8B5CF6',
    keywords: [
      // Video Streaming
      'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
      'amazon.com/prime', 'hbomax.com', 'paramount.com', 'peacocktv.com',
      'crunchyroll.com', 'funimation.com', 'tubi.tv', 'roku.com',
      
      // Music Streaming
      'spotify.com', 'apple.com/music', 'youtube.com/music',
      'soundcloud.com', 'pandora.com', 'deezer.com', 'tidal.com',
      
      // Gaming
      'twitch.tv', 'steam.com', 'epic.games', 'origin.com',
      'battle.net', 'xbox.com', 'playstation.com', 'nintendo.com',
      'itch.io', 'gog.com', 'humble.com',
      
      // Entertainment News & Reviews
      'imdb.com', 'rottentomatoes.com', 'metacritic.com',
      'entertainment.', 'variety.com', 'hollywood.com',
      
      // Podcasts & Audio
      'podcasts.apple.com', 'podcasts.google.com', 'anchor.fm'
    ],
    patterns: [
      /watch/i,
      /stream/i,
      /play/i,
      /video/i,
      /music/i,
      /game/i,
      /gaming/i,
      /entertainment/i
    ]
  },
  
  'Work & Productivity': {
    icon: '💼',
    color: '#3B82F6',
    keywords: [
      // Email & Communication
      'gmail.com', 'outlook.com', 'mail.google.com', 'mail.yahoo.com',
      'protonmail.com', 'tutanota.com',
      
      // Calendar & Scheduling
      'calendar.google.com', 'outlook.live.com/calendar', 'calendly.com',
      'acuityscheduling.com', 'when2meet.com', 'doodle.com',
      
      // Project Management
      'asana.com', 'trello.com', 'monday.com', 'clickup.com',
      'notion.so', 'airtable.com', 'basecamp.com', 'jira.atlassian.com',
      
      // Cloud Storage & Docs
      'drive.google.com', 'docs.google.com', 'sheets.google.com',
      'onedrive.com', 'dropbox.com', 'box.com', 'icloud.com',
      'office.com', 'office365.com',
      
      // Design & Creative
      'figma.com', 'sketch.com', 'adobe.com', 'canva.com',
      'miro.com', 'mural.co', 'lucidchart.com',
      
      // Finance & Business
      'quickbooks.com', 'xero.com', 'freshbooks.com',
      'stripe.com', 'paypal.com', 'square.com'
    ],
    patterns: [
      /work/i,
      /office/i,
      /business/i,
      /productivity/i,
      /project/i,
      /task/i,
      /meeting/i
    ]
  },
  
  'Research & Learning': {
    icon: '📚',
    color: '#059669',
    keywords: [
      // Educational Platforms
      'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org',
      'pluralsight.com', 'skillshare.com', 'masterclass.com',
      'linkedin.com/learning', 'udacity.com', 'codecademy.com',
      
      // Academic & Research
      'wikipedia.org', 'scholar.google.com', 'jstor.org',
      'researchgate.net', 'academia.edu', 'pubmed.ncbi.nlm.nih.gov',
      'sciencedirect.com', 'springer.com', 'nature.com',
      
      // Language Learning
      'duolingo.com', 'babbel.com', 'rosettastone.com',
      'busuu.com', 'lingoda.com', 'italki.com',
      
      // Reference & Tools
      'dictionary.com', 'merriam-webster.com', 'thesaurus.com',
      'translate.google.com', 'deepl.com', 'grammarly.com',
      
      // Libraries & Archives
      '.edu', '.ac.', 'library.', 'archive.org'
    ],
    patterns: [
      /learn/i,
      /study/i,
      /course/i,
      /tutorial/i,
      /guide/i,
      /how.?to/i,
      /research/i,
      /academic/i,
      /\.edu/i
    ]
  },

  'Finance & Banking': {
    icon: '💰',
    color: '#DC2626',
    keywords: [
      // Banking
      'bankofamerica.com', 'chase.com', 'wellsfargo.com', 'citi.com',
      'usbank.com', 'pnc.com', 'truist.com', 'capitalone.com',
      
      // Investment & Trading
      'robinhood.com', 'etrade.com', 'schwab.com', 'fidelity.com',
      'vanguard.com', 'tdameritrade.com', 'webull.com', 'coinbase.com',
      
      // Crypto
      'binance.com', 'kraken.com', 'gemini.com', 'crypto.com',
      'blockchain.com', 'coinmarketcap.com', 'coingecko.com',
      
      // Personal Finance
      'mint.com', 'ynab.com', 'personalcapital.com', 'creditkarma.com',
      'nerdwallet.com', 'bankrate.com', 'experian.com', 'creditscorecard.com',
      
      // Business Finance
      'quickbooks.com', 'xero.com', 'freshbooks.com'
    ],
    patterns: [
      /bank/i,
      /finance/i,
      /money/i,
      /invest/i,
      /crypto/i,
      /trading/i,
      /credit/i,
      /loan/i
    ]
  },

  'Health & Fitness': {
    icon: '🏥',
    color: '#16A34A',
    keywords: [
      // Health Information
      'webmd.com', 'mayoclinic.org', 'healthline.com', 'medicalnewstoday.com',
      'nih.gov', 'cdc.gov', 'who.int',
      
      // Fitness & Wellness
      'myfitnesspal.com', 'fitbit.com', 'strava.com', 'nike.com/run-club',
      'headspace.com', 'calm.com', 'meditation.com',
      
      // Mental Health
      'betterhelp.com', 'talkspace.com', 'psychology.com',
      
      // Medical Services
      'teladoc.com', 'amwell.com', 'mdlive.com'
    ],
    patterns: [
      /health/i,
      /medical/i,
      /fitness/i,
      /wellness/i,
      /doctor/i,
      /hospital/i
    ]
  },

  'Travel & Maps': {
    icon: '✈️',
    color: '#0EA5E9',
    keywords: [
      // Maps & Navigation
      'maps.google.com', 'waze.com', 'mapquest.com', 'bing.com/maps',
      
      // Travel Booking
      'expedia.com', 'booking.com', 'hotels.com', 'airbnb.com',
      'kayak.com', 'priceline.com', 'tripadvisor.com', 'vrbo.com',
      
      // Airlines
      'delta.com', 'american.com', 'united.com', 'southwest.com',
      'jetblue.com', 'alaska.com',
      
      // Travel Planning
      'tripit.com', 'lonely.planet', 'fodors.com', 'frommers.com'
    ],
    patterns: [
      /travel/i,
      /trip/i,
      /hotel/i,
      /flight/i,
      /map/i,
      /navigation/i
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
  CATEGORIES_UPDATED: 'categories_updated',
  CATEGORY_EXPANDED: 'category_expanded',
  CATEGORY_COLLAPSED: 'category_collapsed',
  OPTIMIZE_PERFORMANCE: 'optimize_performance',
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