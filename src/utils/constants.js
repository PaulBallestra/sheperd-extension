// src/utils/constants.js
// Centralized constants for Sheperd Tab Manager

export const SHEPERD_CONFIG = {
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

/**
 * LICENSING & MONETIZATION CONFIGURATION
 * 
 * 🎯 FREEMIUM MODEL:
 * - Free version: Limited categories and features
 * - Pro version: Full features + advanced analytics
 * - Early access: Founder's edition pricing
 */
export const SHEPERD_LICENSE = {
    // License Types
    FREE: 'free',
    PRO: 'pro',
    FOUNDER: 'founder',

    // Pro Features
    PRO_FEATURES: {
        ALL_CATEGORIES: true,
        UNLIMITED_TABS: true,
        ADVANCED_ANALYTICS: true,
        CUSTOM_THEMES: true,
        BACKUP_RESTORE: true,
        PRIORITY_SUPPORT: true,
        EXPORT_BOOKMARKS: true,
        PERFORMANCE_OPTIMIZATION: true,
    },

    // Free Version Limitations
    FREE_LIMITS: {
        MAX_CATEGORIES: 6, // Only show 6 most popular categories
        MAX_TABS_MANAGED: 50, // Limit tab management to 50 tabs
        BASIC_ANALYTICS_ONLY: true,
    },

    // Pricing
    PRICING: {
        PRO_MONTHLY: 2.99,
        PRO_YEARLY: 29.99, // 2 months free
        PRO_LIFETIME: 49.99,
        FOUNDER_EDITION: 19.99, // Limited time, lifetime access
    },

    // Free tier categories (most popular ones)
    FREE_CATEGORIES: [
        'Work & Productivity',
        'Media & Entertainment',
        'Shopping & E-commerce',
        'Social & Communication',
        'Development',
        'News & Information'
    ],
};

/**
 * MONETIZATION EVENTS
 * Track user interactions for conversion optimization
 */
export const MONETIZATION_EVENTS = {
    // Upgrade prompts
    UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
    UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',
    UPGRADE_PROMPT_DISMISSED: 'upgrade_prompt_dismissed',

    // Feature limitations hit
    CATEGORY_LIMIT_HIT: 'category_limit_hit',
    TAB_LIMIT_HIT: 'tab_limit_hit',
    PREMIUM_FEATURE_ATTEMPTED: 'premium_feature_attempted',

    // Conversions
    UPGRADE_INITIATED: 'upgrade_initiated',
    UPGRADE_COMPLETED: 'upgrade_completed',
    TRIAL_STARTED: 'trial_started',

    // Engagement
    ANALYTICS_VIEWED: 'analytics_viewed',
    BULK_ACTION_USED: 'bulk_action_used',
    CATEGORY_CUSTOMIZED: 'category_customized',
};

/**
 * TAB_CATEGORIES - Smart international domain matching
 * 
 * 🌍 INTELLIGENT INTERNATIONAL SUPPORT:
 * Domain keywords like "amazon.com" now automatically match international variants:
 * - amazon.fr, amazon.it, amazon.co.uk, amazon.de, etc.
 * - google.com matches google.fr, google.co.uk, google.de, etc.
 * - youtube.com matches youtube.fr, youtube.de, etc.
 * 
 * This means we only need to specify the main .com domain and the system
 * will intelligently match ALL international variants of that brand!
 * 
 * 🎯 OPTIMIZED FOR BRANDS:
 * - Major brands: One entry handles all countries
 * - Reduced redundancy: No need for separate google.fr, google.de entries
 * - Automatic coverage: Works for any TLD (.fr, .it, .co.uk, etc.)
 */
export const TAB_CATEGORIES = {
    Development: {
        icon: "💻",
        color: "#10B981",
        keywords: [
            // Code Repositories & Version Control
            "github.com",
            "gitlab.com",
            "bitbucket.org",
            "codeberg.org",

            // Q&A & Forums
            "stackoverflow.com",
            "stackexchange.com",
            "serverfault.com",

            // Documentation & References
            "developer.mozilla.org",
            "docs.microsoft.com",
            "docs.aws.amazon.com",
            "cloud.google.com/docs",
            "docs.docker.com",
            "kubernetes.io",
            "reactjs.org",
            "vuejs.org",
            "angular.io",
            "svelte.dev",
            "nodejs.org",
            "python.org",
            "golang.org",
            "rust-lang.org",

            // Dev Platforms & Tools
            "dev.to",
            "hashnode.com",
            "codepen.io",
            "jsfiddle.net",
            "replit.com",
            "codesandbox.io",
            "glitch.com",
            "stackblitz.com",
            "vercel.com",
            "netlify.com",
            "heroku.com",
            "railway.app",

            // Local Development
            "localhost",
            "127.0.0.1",
            "local.",
            "dev.",

            // Package Managers & Registries
            "npmjs.com",
            "pypi.org",
            "packagist.org",
            "crates.io",
            "nuget.org",
            "maven.apache.org",
        ],
        patterns: [
            /docs?\./i,
            /api\./i,
            /localhost/i,
            /127\.0\.0\.1/i,
            /:\d{4}/i, // Port numbers
            /dev\./i,
            /staging\./i,
            /test\./i,
        ],
    },

    "AI & Machine Learning": {
        icon: "🤖",
        color: "#FF6B6B",
        keywords: [
            // AI Chat & Assistants
            "chat.openai.com",
            "chatgpt.com",
            "claude.ai",
            "anthropic.com",
            "bard.google.com",
            "bing.com/chat",
            "character.ai",
            "poe.com",
            "perplexity.ai",
            "you.com",
            "phind.com",

            // AI Development Platforms
            "huggingface.co",
            "replicate.com",
            "runpod.io",
            "colab.research.google.com",
            "kaggle.com",
            "paperswithcode.com",
            "arxiv.org",

            // AI Tools & Services
            "midjourney.com",
            "stability.ai",
            "dalle.openai.com",
            "runway.ml",
            "luma.ai",
            "elevenlabs.io",
            "murf.ai",
            "jasper.ai",
            "copy.ai",
            "writesonic.com",
            "grammarly.com",
            "notion.ai",
            "github.com/copilot",
            "leonardo.ai",
            "photopea.com",
            "remove.bg",
            "loom.ai",
            "descript.com",
            "synthesia.io",
            "tome.app",

            // AI News & Communities
            "aibreakfast.com",
            "towards-ai.com",
            "techcrunch.com/tag/artificial-intelligence",
        ],
        patterns: [
            /\bai\b/i,
            /artificial.intelligence/i,
            /machine.learning/i,
            /neural.network/i,
            /gpt/i,
            /llm/i,
        ],
    },

    "Social & Communication": {
        icon: "📱",
        color: "#F59E0B",
        keywords: [
            // Major Social Platforms
            "twitter.com",
            "x.com",
            "facebook.com",
            "instagram.com",
            "linkedin.com",
            "tiktok.com",
            "snapchat.com",
            "pinterest.com",

            // Professional Networks
            "glassdoor.com",
            "indeed.com",
            "angel.co",
            "wellfound.com",

            // Communities & Forums
            "reddit.com",
            "discord.com",
            "telegram.org",
            "whatsapp.com",
            "signal.org",
            "mastodon.social",
            "threads.net",
            "clubhouse.com",
            "bereal.com",
            "vero.co",
            "minds.com",
            "gab.com",

            // Dating & Social
            "tinder.com",
            "bumble.com",
            "hinge.co",
            "match.com",

            // Communication Tools
            "zoom.us",
            "meet.google.com",
            "teams.microsoft.com",
            "slack.com",
            "discord.gg",
        ],
        patterns: [/social/i, /chat/i, /message/i, /community/i],
    },

    "News & Information": {
        icon: "📰",
        color: "#6366F1",
        keywords: [
            // Major News Outlets
            "cnn.com",
            "bbc.com",
            "nytimes.com",
            "washingtonpost.com",
            "reuters.com",
            "ap.org",
            "bloomberg.com",
            "wsj.com",
            "theguardian.com",
            "usatoday.com",
            "npr.org",
            "pbs.org",

            // Tech News
            "techcrunch.com",
            "theverge.com",
            "ars-technica.com",
            "wired.com",
            "engadget.com",
            "gizmodo.com",
            "mashable.com",
            "venturebeat.com",

            // Aggregators & Discussion
            "news.ycombinator.com",
            "slashdot.org",
            "digg.com",
            "flipboard.com",
            "pocket.com",
            "instapaper.com",

            // Newsletters & Blogs
            "medium.com",
            "substack.com",
            "newsletter.",
        ],
        patterns: [
            /news/i,
            /breaking/i,
            /headlines/i,
            /journal/i,
            /times/i,
            /post/i,
        ],
    },

    "Shopping & E-commerce": {
        icon: "🛒",
        color: "#EF4444",
        keywords: [
            // Major Retailers
            "amazon.com",
            "walmart.com",
            "target.com",
            "costco.com",
            "bestbuy.com",
            "homedepot.com",
            "lowes.com",
            "macys.com",

            // Online Marketplaces
            "ebay.com",
            "etsy.com",
            "mercari.com",
            "poshmark.com",
            "facebook.com/marketplace",
            "offerup.com",
            "craigslist.org",

            // International & Specialized
            "aliexpress.com",
            "alibaba.com",
            "wish.com",
            "temu.com",
            "shein.com",
            "zaful.com",
            "banggood.com",

            // Fashion & Lifestyle
            "nike.com",
            "adidas.com",
            "zara.com",
            "h&m.com",
            "uniqlo.com",
            "gap.com",
            "oldnavy.com",
            "lululemon.com",
            "athleta.com",
            "patagonia.com",
            "northface.com",
            "asos.com",
            "boohoo.com",
            "prettylittlething.com",
            "revolve.com",
            "ssense.com",

            // Deal Sites
            "slickdeals.net",
            "groupon.com",
            "woot.com",
            "overstock.com",
            "dealfinder.",
            "coupon",
            "promo",
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
            /price/i,
        ],
    },

    "Media & Entertainment": {
        icon: "🎬",
        color: "#8B5CF6",
        keywords: [
            // Video Streaming
            "youtube.com",
            "netflix.com",
            "hulu.com",
            "disneyplus.com",
            "amazon.com/prime",
            "hbomax.com",
            "paramount.com",
            "peacocktv.com",
            "crunchyroll.com",
            "funimation.com",
            "tubi.tv",
            "roku.com",
            "appletv.com",
            "discovery.com",
            "starz.com",
            "showtime.com",
            "amc.com",
            "fxnetworks.com",

            // Music Streaming
            "spotify.com",
            "apple.com/music",
            "youtube.com/music",
            "soundcloud.com",
            "pandora.com",
            "deezer.com",
            "tidal.com",
            "bandcamp.com",
            "last.fm",
            "audiomack.com",

            // Gaming
            "twitch.tv",
            "steam.com",
            "epic.games",
            "origin.com",
            "battle.net",
            "xbox.com",
            "playstation.com",
            "nintendo.com",
            "itch.io",
            "gog.com",
            "humble.com",

            // Entertainment News & Reviews
            "imdb.com",
            "rottentomatoes.com",
            "metacritic.com",
            "entertainment.",
            "variety.com",
            "hollywood.com",

            // Podcasts & Audio
            "podcasts.apple.com",
            "podcasts.google.com",
            "anchor.fm",
        ],
        patterns: [
            /watch/i,
            /stream/i,
            /play/i,
            /video/i,
            /music/i,
            /game/i,
            /gaming/i,
            /entertainment/i,
        ],
    },

    "Work & Productivity": {
        icon: "💼",
        color: "#3B82F6",
        keywords: [
            // Email & Communication (international variants handled automatically)
            "gmail.com",
            "google.com", // Handles all Google services: mail, calendar, drive, docs, etc. in all countries
            "outlook.com", // Handles Outlook/Microsoft services internationally 
            "microsoft.com", // Handles Office365, OneDrive, etc. internationally
            "yahoo.com", // Handles mail.yahoo.fr, yahoo.co.uk, etc.
            "protonmail.com",
            "tutanota.com",

            // Calendar & Scheduling
            "calendly.com",
            "acuityscheduling.com",
            "when2meet.com",
            "doodle.com",

            // Project Management
            "asana.com",
            "trello.com",
            "monday.com",
            "clickup.com",
            "notion.so",
            "airtable.com",
            "basecamp.com",
            "atlassian.com", // Handles Jira, Confluence, etc.

            // Cloud Storage & File Sharing
            "dropbox.com",
            "box.com",
            "icloud.com",
            "apple.com", // Handles iCloud and other Apple services

            // Design & Creative
            "figma.com",
            "sketch.com",
            "adobe.com",
            "canva.com",
            "miro.com",
            "mural.co",
            "lucidchart.com",

            // Finance & Business
            "quickbooks.com",
            "xero.com",
            "freshbooks.com",
            "stripe.com",
            "paypal.com",
            "square.com",
        ],
        patterns: [
            /work/i,
            /office/i,
            /business/i,
            /productivity/i,
            /project/i,
            /task/i,
            /meeting/i,
        ],
    },

    "Research & Learning": {
        icon: "📚",
        color: "#059669",
        keywords: [
            // Educational Platforms
            "coursera.org",
            "udemy.com",
            "edx.org",
            "khanacademy.org",
            "pluralsight.com",
            "skillshare.com",
            "masterclass.com",
            "linkedin.com/learning",
            "udacity.com",
            "codecademy.com",

            // Academic & Research
            "wikipedia.org",
            "scholar.google.com",
            "jstor.org",
            "researchgate.net",
            "academia.edu",
            "pubmed.ncbi.nlm.nih.gov",
            "sciencedirect.com",
            "springer.com",
            "nature.com",

            // Language Learning
            "duolingo.com",
            "babbel.com",
            "rosettastone.com",
            "busuu.com",
            "lingoda.com",
            "italki.com",

            // Reference & Tools
            "dictionary.com",
            "merriam-webster.com",
            "thesaurus.com",
            "translate.google.com",
            "deepl.com",
            "grammarly.com",

            // Libraries & Archives
            ".edu",
            ".ac.",
            "library.",
            "archive.org",
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
            /\.edu/i,
        ],
    },

    "Finance & Banking": {
        icon: "💰",
        color: "#DC2626",
        keywords: [
            // Banking
            "bankofamerica.com",
            "chase.com",
            "wellsfargo.com",
            "citi.com",
            "usbank.com",
            "pnc.com",
            "truist.com",
            "capitalone.com",

            // Investment & Trading
            "robinhood.com",
            "etrade.com",
            "schwab.com",
            "fidelity.com",
            "vanguard.com",
            "tdameritrade.com",
            "webull.com",
            "coinbase.com",

            // Crypto
            "binance.com",
            "kraken.com",
            "gemini.com",
            "crypto.com",
            "blockchain.com",
            "coinmarketcap.com",
            "coingecko.com",

            // Personal Finance
            "mint.com",
            "ynab.com",
            "personalcapital.com",
            "creditkarma.com",
            "nerdwallet.com",
            "bankrate.com",
            "experian.com",
            "creditscorecard.com",

            // Business Finance
            "quickbooks.com",
            "xero.com",
            "freshbooks.com",
        ],
        patterns: [
            /bank/i,
            /finance/i,
            /money/i,
            /invest/i,
            /crypto/i,
            /trading/i,
            /credit/i,
            /loan/i,
        ],
    },

    "Health & Fitness": {
        icon: "🏥",
        color: "#16A34A",
        keywords: [
            // Health Information
            "webmd.com",
            "mayoclinic.org",
            "healthline.com",
            "medicalnewstoday.com",
            "nih.gov",
            "cdc.gov",
            "who.int",

            // Fitness & Wellness
            "myfitnesspal.com",
            "fitbit.com",
            "strava.com",
            "nike.com/run-club",
            "headspace.com",
            "calm.com",
            "meditation.com",

            // Mental Health
            "betterhelp.com",
            "talkspace.com",
            "psychology.com",

            // Medical Services
            "teladoc.com",
            "amwell.com",
            "mdlive.com",
        ],
        patterns: [
            /health/i,
            /medical/i,
            /fitness/i,
            /wellness/i,
            /doctor/i,
            /hospital/i,
        ],
    },

    "Travel & Maps": {
        icon: "✈️",
        color: "#0EA5E9",
        keywords: [
            // Maps & Navigation
            "maps.google.com",
            "waze.com",
            "mapquest.com",
            "bing.com/maps",

            // Travel Booking
            "expedia.com",
            "booking.com",
            "hotels.com",
            "airbnb.com",
            "kayak.com",
            "priceline.com",
            "tripadvisor.com",
            "vrbo.com",

            // Airlines
            "delta.com",
            "american.com",
            "united.com",
            "southwest.com",
            "jetblue.com",
            "alaska.com",

            // Travel Planning
            "tripit.com",
            "lonely.planet",
            "fodors.com",
            "frommers.com",
        ],
        patterns: [/travel/i, /trip/i, /hotel/i, /flight/i, /map/i, /navigation/i],
    },

    "Gaming": {
        icon: "🎮",
        color: "#8B5CF6",
        keywords: [
            // Gaming Platforms
            "steam.com",
            "steamcommunity.com",
            "epicgames.com",
            "gog.com",
            "battle.net",
            "ubisoft.com",
            "ea.com",
            "origin.com",
            "xbox.com",
            "playstation.com",
            "nintendo.com",

            // Cloud Gaming
            "stadia.google.com",
            "geforce.nvidia.com",
            "xbox.com/play",
            "amazon.com/luna",

            // Gaming Communities
            "reddit.com/r/gaming",
            "gamefaqs.com",
            "ign.com",
            "gamespot.com",
            "polygon.com",
            "kotaku.com",
            "pcgamer.com",
            "rockpapershotgun.com",

            // Esports & Streaming
            "twitch.tv",
            "youtube.com/gaming",
            "mixer.com",

            // Game Development
            "unity.com",
            "unrealengine.com",
            "godotengine.org",
            "itch.io",

            // Gaming Tools
            "steamdb.info",
            "protondb.com",
            "nexusmods.com",
        ],
        patterns: [
            /gaming/i,
            /game/i,
            /steam/i,
            /twitch/i,
            /esports/i,
            /minecraft/i,
            /fortnite/i,
        ],
    },

    "Design & Creative": {
        icon: "🎨",
        color: "#EC4899",
        keywords: [
            // Design Tools
            "figma.com",
            "sketch.com",
            "adobe.com",
            "canva.com",
            "invision.com",
            "framer.com",
            "principle.design",
            "zeplin.io",
            "marvel.app",

            // Creative Platforms
            "behance.net",
            "dribbble.com",
            "deviantart.com",
            "artstation.com",
            "creativemarket.com",
            "shutterstock.com",
            "unsplash.com",
            "pexels.com",

            // 3D & Animation
            "blender.org",
            "autodesk.com",
            "cinema4d.com",
            "sketchfab.com",

            // Color & Typography
            "coolors.co",
            "color.adobe.com",
            "fonts.google.com",
            "typeface.com",
            "fontawesome.com",

            // Inspiration
            "awwwards.com",
            "siteinspire.com",
            "ui-patterns.com",
            "mobbin.design",
        ],
        patterns: [
            /design/i,
            /creative/i,
            /graphics/i,
            /illustration/i,
            /typography/i,
            /branding/i,
            /ui.ux/i,
        ],
    },

    "Productivity & Tools": {
        icon: "⚡",
        color: "#059669",
        keywords: [
            // Note Taking & Docs
            "notion.so",
            "obsidian.md",
            "roamresearch.com",
            "logseq.com",
            "bear.app",
            "typora.io",

            // Task Management
            "todoist.com",
            "any.do",
            "asana.com",
            "monday.com",
            "clickup.com",
            "basecamp.com",
            "linear.app",

            // Time Tracking
            "toggl.com",
            "harvest.com",
            "clockify.com",
            "rescuetime.com",

            // File Management
            "dropbox.com",
            "onedrive.com",
            "box.com",
            "wetransfer.com",

            // Communication Tools
            "loom.com",
            "calendly.com",
            "doodle.com",
            "when2meet.com",

            // Automation
            "zapier.com",
            "ifttt.com",
            "integromat.com",

            // Password Management
            "1password.com",
            "lastpass.com",
            "bitwarden.com",
            "dashlane.com",
        ],
        patterns: [
            /productivity/i,
            /workflow/i,
            /organize/i,
            /manage/i,
            /calendar/i,
            /schedule/i,
            /todo/i,
        ],
    },

    "Food & Cooking": {
        icon: "🍳",
        color: "#F97316",
        keywords: [
            // Recipe Sites
            "allrecipes.com",
            "foodnetwork.com",
            "epicurious.com",
            "food.com",
            "tasty.co",
            "buzzfeed.com/tasty",
            "seriouseats.com",
            "bonappetit.com",

            // Food Delivery
            "doordash.com",
            "ubereats.com",
            "grubhub.com",
            "postmates.com",
            "seamless.com",
            "menulog.com",
            "justeat.com",

            // Meal Planning
            "mealime.com",
            "plantoeat.com",
            "emeals.com",
            "yummly.com",

            // Grocery & Shopping
            "instacart.com",
            "shipt.com",
            "fresh.amazon.com",
            "peapod.com",

            // Restaurant Discovery
            "yelp.com",
            "zomato.com",
            "opentable.com",
            "resy.com",

            // Cooking YouTube Channels
            "youtube.com/c/BingingWithBabish",
            "youtube.com/c/joshuaweissman",
        ],
        patterns: [
            /food/i,
            /cooking/i,
            /recipe/i,
            /restaurant/i,
            /delivery/i,
            /kitchen/i,
            /chef/i,
        ],
    },
};

export const SHEPERD_METER_LEVELS = {
    EXCELLENT: {
        range: [0, 10],
        level: "excellent",
        message: "Looking sharp! 🌟",
        color: "#10B981",
        percentage: 20,
    },
    GOOD: {
        range: [11, 20],
        level: "good",
        message: "Getting busy 📈",
        color: "#3B82F6",
        percentage: 40,
    },
    BUSY: {
        range: [21, 35],
        level: "busy",
        message: "Tab collector detected 📚",
        color: "#F59E0B",
        percentage: 60,
    },
    CHAOTIC: {
        range: [36, 50],
        level: "chaotic",
        message: "Approaching chaos 🌪️",
        color: "#F97316",
        percentage: 80,
    },
    APOCALYPTIC: {
        range: [51, Infinity],
        level: "apocalyptic",
        message: "Tab apocalypse! 🔥",
        color: "#EF4444",
        percentage: 100,
    },
};

export const SHEPERD_ACTIONS = {
    CLOSE_CATEGORY: "close_category",
    BOOKMARK_CATEGORY: "bookmark_category",
    CLOSE_DUPLICATES: "close_duplicates",
    CLOSE_OLD_TABS: "close_old_tabs",
    SWITCH_TO_TAB: "switch_to_tab",
    CLOSE_TAB: "close_tab",
    TOGGLE_CATEGORY: "toggle_category",
};

export const SHEPERD_EVENTS = {
    // Legacy events (keep for compatibility)
    CATEGORIES_UPDATED: "categories_updated",
    CATEGORY_EXPANDED: "category_expanded",
    CATEGORY_COLLAPSED: "category_collapsed",
    OPTIMIZE_PERFORMANCE: "optimize_performance",
    ERROR_OCCURRED: "error_occurred",
    LOADING_STARTED: "loading_started",
    LOADING_FINISHED: "loading_finished",

    // Real-time state management events
    STATE_UPDATED: "state_updated",

    // Optimistic operation events
    TAB_REMOVED_OPTIMISTIC: "tab_removed_optimistic",
    TAB_REMOVAL_CONFIRMED: "tab_removal_confirmed",
    TAB_REMOVAL_FAILED: "tab_removal_failed",

    CATEGORY_REMOVED_OPTIMISTIC: "category_removed_optimistic",
    CATEGORY_REMOVAL_CONFIRMED: "category_removal_confirmed",
    CATEGORY_REMOVAL_FAILED: "category_removal_failed",

    BULK_OPERATION_OPTIMISTIC: "bulk_operation_optimistic",
    BULK_OPERATION_CONFIRMED: "bulk_operation_confirmed",
    BULK_OPERATION_FAILED: "bulk_operation_failed",

    // State restoration events
    STATE_RESTORED: "state_restored",
    TAB_RESTORED: "tab_restored",
    CATEGORY_RESTORED: "category_restored",

    // Component-specific updates
    COUNTERS_UPDATED: "counters_updated",
    ANALYTICS_UPDATED: "analytics_updated",
    HEADER_UPDATED: "header_updated",
    QUICK_ACTIONS_UPDATED: "quick_actions_updated",
    SHEPERD_METER_UPDATED: "sheperd_meter_updated",
};

export const DEFAULT_SETTINGS = {
    autoClose: false,
    duplicateThreshold: 2,
    oldTabDays: 7,
    enableNotifications: true,
    badgeEnabled: true,
    expandedCategories: [],
    theme: "light",
};

export const SHEPERD_STORAGE_KEYS = {
    SETTINGS: "SHEPERD_SETTINGS",
    TAB_ACCESS_TIMES: "SHEPERD_TAB_ACCESS_TIMES",
    EXPANDED_CATEGORIES: "SHEPERD_EXPANDED_CATEGORIES",
    USER_PREFERENCES: "SHEPERD_USER_PREFERENCES",
};