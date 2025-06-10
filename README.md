# 🐑 Sheperd - Smart Tab Manager Chrome Extension

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)

---

> **Finally, a tab manager that actually understands your chaos.** 🌪️

**Sheperd** is an intelligent Chrome extension that automatically categorizes and manages your browser tabs with smart AI-like categorization, bulk actions, and "tab shame" metrics. Say goodbye to the endless horizontal scroll of doom!

---

## 🎯 The Problem We're Solving

### Real Talk: Your browser probably looks like this right now:

- 📊 **47 tabs open** (you can't even see the titles)
- 🎬 **12 YouTube videos** you'll "watch later"
- 💻 **8 different Stack Overflow** solutions to that bug from last week
- 🛒 **15 shopping tabs** from your 2 AM impulse research session
- 📄 **That important work document** buried somewhere in tab purgatory

> **Current solutions suck** because they require manual organization. Who has time for that?

---

## ✨ What Makes Sheperd Different

### 🧠 Smart Auto-Categorization
- ✅ **Zero manual work** - Just open tabs, we organize them
- 🎯 **Context-aware** - Understands work vs personal vs entertainment
- 🔗 **Domain clustering** - Groups related sites intelligently
- 🔍 **Duplicate detection** - Highlights your 7 identical Amazon tabs

### 🔥 **Performance Analytics (UNIQUE FEATURE!)**
- 📊 **Real-time resource monitoring** - See actual performance impact
- 🎯 **Smart optimization suggestions** - "Close 5 tabs to save 200MB RAM"
- 🧠 **Domain intelligence** - Knows which sites are resource-heavy
- ⚡ **One-click optimization** - Instant performance improvements
- 🔋 **Loaded vs total tracking** - See which tabs are actually using resources

### ⚡ Bulk Actions That Actually Work
- 🗂️ **Close entire categories** with one click
- 📑 **Bookmark organized collections** to folders
- 💤 **Suspend resource-heavy tabs** to save memory
- 🧹 **Bulk close old/duplicate tabs** with smart suggestions
- 🎯 **Performance-based actions** - Close heaviest tabs first

### 📊 Sheperd Level Metrics (Gamification)
- 📈 **Real-time tab count** with 5-level Sheperd meter
- 🎯 **Performance impact scoring** - Light/Medium/Heavy system
- 📅 **Smart recommendations** - Personalized optimization tips
- 🏆 **Achievement system** - Celebrate good tab hygiene

---

## 🚀 Current Features (Phase 1 - MVP)

### Core Functionality
| Feature | Status | Description |
|---------|--------|-------------|
| 🏷️ Smart Categorization | ✅ | Work, Social, Shopping, Dev, Entertainment, Other |
| 📊 Live Tab Count | ✅ | Visual Sheperd meter with real-time updates |
| 📈 **Performance Analytics** | 🔥 **NEW** | **Smart resource monitoring & optimization suggestions** |
| 📁 Category View | ✅ | Expandable categories with tab previews |
| 🗑️ One-Click Closure | ✅ | Category closure with confirmation |
| 🎯 Individual Management | ✅ | Close, switch, bookmark individual tabs |
| 🔍 Duplicate Detection | ✅ | Bulk removal of duplicate tabs |
| 🎨 Modern UI | ✅ | Clean, 2024-standard interface |
| ⚡ Performance | ✅ | Optimized for 100+ tabs with smart algorithms |

### 🔥 Performance Analytics System (NEW!)
| Metric | Details | Smart Actions |
|--------|---------|---------------|
| 📊 **Resource Impact** | Light/Medium/Heavy performance scoring | One-click optimization suggestions |
| 🔋 **Loaded vs Total** | Active resource usage tracking (12/47 loaded) | Smart tab suspension recommendations |
| 🎯 **Domain Intelligence** | Heavy sites detection (YouTube, Figma, etc.) | Category-based resource estimates |
| ⚡ **Quick Optimization** | "Close 5 idle tabs to save ~200MB RAM" | Instant performance improvements |
| 🧠 **Smart Recommendations** | Context-aware suggestions based on usage | Personalized tab management tips |

### Tab Shame System
| Tab Count | Status | Message |
|-----------|--------|---------|
| 0-10 tabs | 🌟 | "Looking sharp!" |
| 11-20 tabs | 📈 | "Getting busy" |
| 21-35 tabs | 📚 | "Tab collector detected" |
| 36-50 tabs | 🌪️ | "Approaching chaos" |
| 51+ tabs | 🔥 | "Tab apocalypse!" |

---

## 🛠️ Tech Stack

### Phase 1: Chrome Extension (Current)

#### Frontend (Extension):
```
├── ES6 Modules + Async/Await     # Modern JavaScript architecture
├── Component-Based Design        # Reusable UI components
├── Event-Driven Architecture     # Decoupled component communication
├── HTML5 + CSS3 + CSS Variables  # Modern styling with design system
├── Chrome Extension Manifest V3  # Extension configuration
├── Chrome APIs (Modern Async)    # tabs, storage, bookmarks, alarms
└── Local Storage + Error Handling # Robust data persistence
```

#### Architecture:
```
├── src/popup/                   # ES6 module-based popup interface
│   ├── components/              # Reusable UI components
│   │   ├── header.js           # Header with real-time stats
│   │   ├── Sheperd-meter.js   # Level-based tab meter
│   │   ├── analytics.js        # 🔥 Performance analytics & optimization
│   │   ├── categories.js       # Tab categorization & management
│   │   └── quick-actions.js    # Bulk operations
│   ├── popup.js                # Main app orchestrator
│   └── popup.html              # Clean HTML structure
├── src/utils/                   # Core business logic
│   ├── constants.js            # Centralized configuration
│   ├── categorizer.js          # Enhanced categorization engine
│   └── tabs.js                 # Chrome Tabs API wrapper
├── src/styles/                  # Component-based CSS
│   ├── main.css                # Design system & globals
│   └── components/             # Component-specific styles
├── background.js                # Service worker with badge system
└── Chrome Storage + Events      # Modern data & event handling
```

### Phase 2: SaaS Platform (Planned)

#### Backend API:
```
├── Go (Golang)                  # High-performance backend
├── Gin/Echo Framework           # HTTP router & middleware
├── GORM                         # Database ORM
├── PostgreSQL                   # Primary database
├── JWT Authentication           # Secure user sessions
├── Stripe API                   # Payment processing
└── Docker                       # Containerization
```

#### Frontend Dashboard:
```
├── React 18 + TypeScript        # Modern UI framework
├── Next.js 14                   # Full-stack React framework
├── Tailwind CSS                 # Utility-first styling
├── Recharts/Chart.js           # Analytics visualization
├── Framer Motion               # Smooth animations
└── React Query                 # Server state management
```

#### DevOps & Deployment:
```
├── Railway/Render              # Backend hosting
├── Vercel/Netlify             # Frontend hosting
├── AWS RDS/Railway DB         # Managed PostgreSQL
├── GitHub Actions             # CI/CD pipeline
└── Docker Compose             # Local development
```

---

## 📁 Project Structure

### Current Structure (Phase 1) - Refactored ES6 Architecture
```
Sheperd-extension/
├── manifest.json              # Extension configuration & permissions
├── background.js              # Service worker for tab events & badge updates
├── src/                       # Source code with ES6 modules
│   ├── assets/                 # Shared utilities & core logic
│   │   ├── icons/              # Extension icons (16, 48, 128px)
│   │   │   ├── icon16.jpeg
│   │   │   ├── icon48.jpeg
│   │   │   └── icon128.jpeg
│   ├── utils/                 # Shared utilities & core logic
│   │   ├── constants.js       # Configuration, events & design system
│   │   ├── categorizer.js     # Smart categorization engine
│   │   └── tabs.js           # Chrome Tabs API wrapper
│   ├── popup/                 # Popup interface
│   │   ├── components/        # Reusable UI components
│   │   │   ├── header.js      # Header with stats & branding
│   │   │   ├── Sheperd-meter.js # Tab level meter (renamed from shame)
│   │   │   ├── analytics.js   # 🔥 Performance analytics & optimization
│   │   │   ├── categories.js  # Category management & display
│   │   │   └── quick-actions.js # Bulk operations buttons
│   │   ├── popup.js          # Main application orchestrator
│   │   └── popup.html        # HTML structure for popup
│   └── styles/                # Component-based CSS architecture
│       ├── main.css          # Global styles & design system
│       └── components/        # Component-specific stylesheets
│           ├── header.css     # Header component styles
│           ├── Sheperd-meter.css # Meter component styles
│           ├── analytics.css  # 🔥 Performance analytics styles
│           ├── categories.css # Categories component styles
│           ├── quick-actions.css # Quick actions styles
│           ├── buttons.css    # Shared button styles
│           └── footer.css     # Footer component styles
├── README.md                  # This file
├── ASSISTANT_RULES.md         # Development guidelines & standards
├── LICENSE                    # MIT License
└── docs/                      # Documentation
    ├── CONTRIBUTING.md
    ├── CHANGELOG.md
    └── API.md
```

### Future Structure (Phase 2)
```
Sheperd-platform/
├── sheperd-extension/                 # Chrome extension (Phase 1)
│   └── [current structure]
├── backend/                   # Go API server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── handlers/
│   │   ├── models/
│   │   ├── services/
│   │   └── middleware/
│   ├── migrations/
│   ├── docker-compose.yml
│   └── Dockerfile
├── dashboard/                 # React web dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── next.config.js
└── docs/                     # Shared documentation
```

---

## 🎨 UI/UX Design Philosophy

### Design Principles
- 🎯 **Instant Recognition**: Color-coded categories, clear visual hierarchy
- 🧠 **Zero Cognitive Load**: No manual sorting required
- 👆 **One-Click Actions**: Bulk operations are single clicks
- ✨ **Clean & Modern**: 2024 design standards, not 2010
- ⚡ **Performance First**: Smooth animations, <100ms interactions

### Color System
```css
/* Category Colors */
--work: #3B82F6      /* Professional blue */
--dev: #10B981       /* Terminal green */
--social: #F59E0B    /* Social amber */
--shopping: #EF4444  /* Shopping red */
--entertainment: #8B5CF6  /* Entertainment purple */
--other: #6B7280     /* Neutral gray */

/* UI Colors */
--primary: #667eea   /* Action buttons */
--danger: #f56565    /* Delete actions */
--success: #48bb78   /* Confirmations */
--background: #f7fafc /* Clean background */
```

---

## 🚧 Roadmap & Future Features

### Phase 1: MVP Extension (Current) - 🔥 **ENHANCED WITH ANALYTICS**
- ✅ Smart tab categorization with expanded categories
- ✅ Bulk category management & optimization
- ✅ Sheperd level metrics (renamed from shame)
- 🔥 **NEW: Performance Analytics & Resource Monitoring**
- 🔥 **NEW: Smart optimization suggestions & actions**
- ✅ Duplicate detection with smart algorithms
- ✅ Clean, modern UI with performance insights
- ✅ Optimized for 100+ tabs with analytics
- ✅ Chrome Web Store ready

### Phase 2: SaaS Platform (Q2 2024)

#### Backend Development:
- 🔐 User authentication system
- ☁️ Cloud sync for categories & settings
- 📊 Advanced analytics API
- 💳 Subscription management (Stripe)
- 👥 Team collaboration features
- 📤 Data export/import

#### Web Dashboard:
- 📈 Detailed analytics & insights
- 🎯 Custom categorization rules
- 👥 Team tab sharing
- ⚡ Advanced bulk operations
- 📅 Tab session management
- 📊 Usage statistics & reporting

### Phase 3: Advanced Features (Q3 2024)

#### AI & Intelligence:
- 🤖 Machine learning categorization
- 💡 Smart tab suggestions
- 📊 Productivity analysis
- 📦 Automatic tab archiving
- 🧠 Context-aware tab grouping

#### Integrations:
- 🔖 Bookmark sync across browsers
- 📝 Notion/Obsidian tab exports
- 💬 Slack team sharing
- 📅 Calendar integration
- ✅ Task management sync

#### Mobile & Cross-Platform:
- 🍎 Safari extension
- 🦊 Firefox extension
- 📱 PWA mobile companion
- 💻 Desktop app (Electron)

### Phase 4: Enterprise & Pro Features (Q4 2024)

#### Enterprise:
- 👥 Team dashboards
- 🛡️ Admin controls & policies
- 🔐 SSO integration
- 🛡️ Advanced security features
- 🎨 Custom branding

#### Pro Features:
- ☁️ Unlimited cloud storage
- 🤖 Advanced AI categorization
- ⚙️ Custom automation rules
- 🆘 Priority support
- 🔗 API access

---

## 💰 Business Model & Monetization

### 🆓 **Free Tier** (Chrome Extension)
- ✅ Smart tab categorization
- ✅ Basic bulk actions
- ✅ Tab shame metrics
- ✅ Duplicate detection
- ✅ Local storage (no cloud sync)

> **Target**: 100K-500K users

### 💎 **Pro Tier** ($4.99/month or $39/year)
**🔥 Everything in free +**
- ☁️ Cloud sync across devices
- 📊 Advanced analytics & insights
- 🎯 Custom categorization rules
- 📈 Detailed productivity reports
- 🔄 Automatic tab archiving
- 👥 Team collaboration (up to 5 members)
- 📤 Bulk export to bookmarks/Notion
- 🎨 Custom themes & UI options

> **Target**: 5-10% conversion (5K-25K paid users)

### 🏢 **Team Tier** ($19/month per team)
**💎 Everything in Pro +**
- 👑 Admin dashboard & controls
- 📊 Team analytics & insights
- 🔐 Advanced security features
- 🎨 Custom branding
- 📞 Priority support

> **Target**: 1-2% of Pro users

### Revenue Projection

#### Conservative (Year 1):
| Metric | Count | Revenue |
|--------|-------|---------|
| Free users | 50K | - |
| Pro users (5% conversion) | 2.5K | $149K ARR |
| Team users (1% of Pro) | 25 | $5.7K ARR |
| **Total** | - | **~$155K ARR** |

#### Optimistic (Year 2):
| Metric | Count | Revenue |
|--------|-------|---------|
| Free users | 500K | - |
| Pro users (5% conversion) | 25K | $1.2M ARR |
| Team users (1% of Pro) | 250 | $57K ARR |
| **Total** | - | **~$1.26M ARR** |

---

## 📊 Market Analysis

### 🏆 Competitive Landscape

| Competitor | Users | Strengths | Weaknesses | Our Advantage |
|------------|-------|-----------|------------|---------------|
| **OneTab** | ~2M | Simple, reliable | Manual categorization, outdated UI | Smart auto-categorization |
| **Tab Manager Plus** | ~500K | Search functionality | Complex UI, slow | Clean UX, bulk actions |
| **Session Buddy** | ~1M | Session management | No smart grouping | AI-like categorization |
| **Workona** | ~100K | Enterprise focus | Expensive, complex | Freemium, consumer-friendly |

### 🎯 Market Opportunity

#### **Total Addressable Market (TAM):**
- 🌍 Chrome users: ~3.2B globally
- 💪 Power users (20+ tabs): ~320M (10%)
- 💰 **Potential market: $1.6B+** (at $5/user/month)

#### **Serviceable Addressable Market (SAM):**
- 🇺🇸 English-speaking power users: ~80M
- 🔧 Extension-savvy users: ~40M (50%)
- 💰 **Realistic market: $240M** (at $5/user/month)

#### **Serviceable Obtainable Market (SOM):**
- 🚀 Early adopters: ~2M (5% of SAM)
- 🎯 Realistic capture: ~100K users (5% of early adopters)
- 💰 **Revenue potential: $6M ARR** (at 10% paid conversion)

---

## 🚀 Getting Started

### For Users

#### **# Install from Chrome Web Store (Coming Soon)**
1. 🌐 Visit Chrome Web Store
2. 🔍 Search "Sheperd Tab Manager"
3. ➕ Click "Add to Chrome"
4. 🐑 Click the 🐑 icon in your toolbar
5. ✨ Watch the magic happen!

### For Developers

#### **# Clone and run locally**
```bash
git clone https://github.com/yourusername/Sheperd-extension
cd Sheperd-extension
```

#### **# Load extension in Chrome**
1. 🌐 Open `chrome://extensions/`
2. 🔧 Enable "Developer mode"
3. 📁 Click "Load unpacked"
4. 📂 Select the project folder
5. 🚀 Start contributing!

#### **# Future: Run full stack locally (Phase 2)**
```bash
docker-compose up -d
cd dashboard && npm run dev
cd backend && go run cmd/server/main.go
```

### Installation Requirements
- ✅ **Chrome Browser**: Version 88+ (Manifest V3 support)
- 🔐 **Permissions**: tabs, storage, bookmarks, activeTab
- 💾 **Storage**: <5MB local storage for settings
- ⚡ **Performance**: Works smoothly with 100+ tabs

---

## 🤝 Contributing

### We Need Help With:
- 🎨 **UI/UX Design**: Making the interface even cleaner
- 🧠 **Categorization Logic**: Improving auto-categorization accuracy
- 🐛 **Bug Testing**: Finding edge cases with different tab patterns
- 📖 **Documentation**: Improving setup guides and API docs
- 🌐 **Localization**: Translating to other languages
- 📈 **Performance**: Optimizing for 200+ tabs

### Development Workflow

#### **# 1. Fork the repository**
```bash
git fork https://github.com/yourusername/Sheperd-extension
```

#### **# 2. Create feature branch**
```bash
git checkout -b feature/amazing-new-feature
```

#### **# 3. Make changes and test**
```bash
# Load extension in Chrome, test with 50+ tabs
```

#### **# 4. Commit with conventional commits**
```bash
git commit -m "feat: add smart duplicate detection"
```

#### **# 5. Submit pull request**
```bash
git push origin feature/amazing-new-feature
```

### Code Style

#### **JavaScript (ES6+ Modules)**
- **Module System**: ES6 import/export, no CommonJS
- **Async Patterns**: async/await preferred over Promises
- **Error Handling**: try-catch blocks with user feedback
- **Documentation**: Comprehensive JSDoc comments
- **Naming**: camelCase variables, PascalCase classes/components
- **Components**: Singleton instances with event-driven communication

#### **CSS (Component Architecture)**
- **Methodology**: BEM naming convention
- **Variables**: CSS custom properties from design system
- **Structure**: Component-specific files imported into main.css
- **Responsive**: Mobile-first approach with media queries
- **Animations**: Use CSS transitions and keyframes

#### **Chrome Extension Specific**
- **Manifest V3**: Service workers, no background pages
- **APIs**: Modern async Chrome APIs with error handling
- **Permissions**: Minimal required permissions only
- **Security**: Content Security Policy compliant

#### **Future Standards (Phase 2+)**
- **Go**: Standard Go formatting, comprehensive error handling
- **React**: Functional components, TypeScript preferred

---

## 📈 Analytics & Metrics

### Key Performance Indicators (KPIs)

#### **Extension Metrics:**
- 👥 Daily Active Users (DAU)
- 📊 Average tabs per user session
- 🎯 Category accuracy rating
- ⚡ Bulk actions per user
- 📈 User retention (7-day, 30-day)

#### **Business Metrics:**
- 💰 Free to paid conversion rate
- 📊 Monthly Recurring Revenue (MRR)
- 👥 Customer Lifetime Value (CLV)
- 📉 Churn rate
- ⭐ Net Promoter Score (NPS)

#### **Technical Metrics:**
- ⚡ Extension load time (<200ms)
- 🎯 Categorization accuracy (>85%)
- 💾 Memory usage (<10MB)
- 🛡️ Crash-free sessions (>99.5%)
- ⭐ Chrome Web Store rating (>4.5★)

### Success Metrics by Phase

#### **Phase 1 Success (Extension MVP):**
- 🎯 10K+ active users
- 📦 Chrome Web Store approval
- ⭐ 4.5+ star rating
- 📈 <5% weekly churn
- 💬 Positive user feedback

#### **Phase 2 Success (SaaS Launch):**
- 🎯 100K+ extension users
- 💰 $10K+ MRR
- 🔄 5%+ free-to-paid conversion
- 📊 Advanced analytics working
- 👥 First enterprise customers

#### **Phase 3 Success (Market Leadership):**
- 🎯 500K+ total users
- 💰 $100K+ MRR
- 🏆 #1 tab manager on Chrome Store
- 🚀 Multi-browser support
- 🌐 International expansion

---

## 🔧 Development Setup

### Prerequisites

#### **# Required for Phase 1**
- 🌐 Chrome Browser (latest with ES6 modules support)
- 📝 Text editor with ES6 support (VS Code recommended)
- 💻 Modern JavaScript knowledge (ES6+, async/await, modules)
- 🔧 Basic understanding of Chrome Extension APIs

#### **# Required for Phase 2**
- 🐹 Go 1.21+
- 🟢 Node.js 18+
- 🐘 PostgreSQL 14+
- 🐳 Docker & Docker Compose

### Environment Setup

#### **# Phase 1: Extension Development**
```bash
git clone https://github.com/yourusername/Sheperd-extension
cd Sheperd-extension

# Development workflow:
# 1. Load extension in Chrome (Developer Mode)
# 2. Navigate to chrome://extensions/
# 3. Enable "Developer mode"
# 4. Click "Load unpacked" and select project folder
# 5. Make changes and click reload icon to test

# File structure follows ES6 modules:
# - src/popup/popup.js is the main entry point
# - Components are in src/popup/components/
# - Utilities are in src/utils/
# - Styles use component-based architecture
```

#### **# Development Best Practices**
```bash
# Component Development:
# 1. Create new components in src/popup/components/
# 2. Export as ES6 modules with singleton instances
# 3. Use event-driven communication between components
# 4. Follow established patterns in existing components

# CSS Development:
# 1. Use CSS variables from main.css design system
# 2. Create component-specific CSS files in src/styles/components/
# 3. Import component CSS in main.css
# 4. Follow BEM methodology for class naming

# Testing Workflow:
# 1. Open multiple tabs with different content types
# 2. Test categorization accuracy
# 3. Verify bulk operations work correctly
# 4. Check responsive design on different popup sizes
# 5. Test error handling and edge cases
```

#### **# Phase 2: Full Stack Development**
```bash
cp .env.example .env
# Fill in database credentials, Stripe keys, etc.

docker-compose up -d postgres
cd backend && go run cmd/server/main.go
cd dashboard && npm install && npm run dev
```

### Testing Strategy

#### **Unit Tests:**
- 🧪 Categorizer logic tests
- ⚡ Tab management functions
- 🧩 UI component tests
- 🔗 API endpoint tests

#### **Integration Tests:**
- 🔗 Extension + Chrome APIs
- 🔗 Backend + Database
- 🔗 Frontend + API
- 💳 Payment flow (Stripe)

#### **E2E Tests:**
- 🚀 Full user journey (install → use → upgrade)
- 🌐 Multi-browser compatibility
- ⚡ Performance with 100+ tabs
- 💪 Stress testing

---

## 👥 Team & Credits

### Core Team
**[Your Name]** - Full-Stack Developer & Product Owner
- Extension development, backend architecture
- GitHub: @yourusername

### Contributors
Community contributions welcome! 🙌
See `CONTRIBUTORS.md` for full list

### Special Thanks
- 🌐 **Chrome Extension Community** - For excellent documentation
- 🐹 **Go Community** - For robust backend tools
- 🧪 **Early Beta Testers** - For invaluable feedback
- 📚 **Tab Hoarders Everywhere** - For inspiring this project 😄

---

## 📞 Contact & Support

### Get In Touch
- 📧 **Email**: hello@Sheperd-tabs.com
- 🐦 **Twitter**: @SheperdTabs
- 💬 **Discord**: Join Community
- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions

### Documentation
- 📖 **User Guide**: docs.Sheperd-tabs.com
- 👨‍💻 **Developer Docs**: api.Sheperd-tabs.com
- 🎥 **Video Tutorials**: YouTube Channel

---

<div align="center">

**Made with ❤️ by the Sheperd Team**

*Helping you tame the tab chaos, one browser at a time* 🐑

[![Star this repo](https://img.shields.io/badge/⭐-Star%20this%20repo-yellow?style=for-the-badge)](https://github.com/yourusername/Sheperd-extension)

</div>