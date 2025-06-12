# 🤖 Assistant Rules & Guidelines

## 🎯 **Core Philosophy**
- **NEVER remove features** - Only enhance, fix, and add
- **Always maintain functionality** - Every change should preserve existing capabilities
- **Enhancement-first mindset** - Look for opportunities to improve while fixing
- **User experience focus** - Every change should make the product better for users

---

## 🔧 **Technical Standards**

### **ES6 Module Architecture**
- ✅ Use ES6 import/export modules exclusively
- ✅ Create singleton component instances for reuse
- ✅ Implement event-driven communication between components
- ✅ Centralize configuration in constants.js
- ✅ Follow established component patterns and structure
- ✅ Use async/await for all asynchronous operations

### **Component-Based Development**
- ✅ Create reusable UI components in src/popup/components/
- ✅ Each component manages its own DOM element and state
- ✅ Use consistent component lifecycle: init() → render() → destroy()
- ✅ Implement proper event binding and cleanup
- ✅ Export both class and singleton instance
- ✅ Follow established naming conventions for components

### **Code Quality**
- ✅ Use modern ES6+ JavaScript with async/await
- ✅ Implement comprehensive error handling with try-catch blocks
- ✅ Add meaningful console logging for debugging
- ✅ Follow Chrome Extension Manifest V3 best practices
- ✅ Use consistent code formatting and JSDoc comments
- ✅ Optimize for performance and memory usage (100+ tabs)

### **Chrome Extension Specific**
- ✅ Always ensure Manifest V3 compatibility
- ✅ Use proper service worker patterns (no DOM access in background)
- ✅ Implement secure message passing between popup and background
- ✅ Handle Chrome API permissions correctly and minimally
- ✅ Use modern async Chrome APIs (no callbacks)
- ✅ Test across different Chrome versions and tab scenarios
- ✅ Optimize for 100+ tabs performance with efficient algorithms

### **CSS Architecture**
- ✅ Use CSS custom properties (variables) from design system
- ✅ Create component-specific CSS files in src/styles/components/
- ✅ Import all component CSS into main.css
- ✅ Follow BEM methodology for class naming
- ✅ Use mobile-first responsive design principles
- ✅ Implement smooth animations with CSS transitions

### **File Structure Standards**
- ✅ All source code in src/ directory with ES6 modules
- ✅ Components in src/popup/components/ with consistent naming
- ✅ Utilities in src/utils/ for shared business logic
- ✅ Styles in src/styles/ with component-based organization
- ✅ Each component has corresponding CSS file
- ✅ Follow established import/export patterns

### **Error Prevention**
- ✅ Always check file contents before making changes
- ✅ Validate syntax and structure
- ✅ Test logic flow mentally before implementation
- ✅ Use defensive programming practices
- ✅ Handle edge cases and fallbacks

---

## 🏗️ **Professional Web Extension Development Standards**

### **Security & Privacy Best Practices**
- ✅ **Minimal Permissions**: Request only the minimum required permissions in manifest.json
- ✅ **Content Security Policy**: Strict CSP compliance - no inline scripts or eval()
- ✅ **Data Sanitization**: Always sanitize user input and external data
- ✅ **Secure Storage**: Use chrome.storage.local for sensitive data, never localStorage
- ✅ **HTTPS Only**: All external requests must use HTTPS
- ✅ **No External Dependencies**: Avoid CDN links, bundle all dependencies locally

### **Performance & Scalability**
- ✅ **Memory Management**: Implement proper cleanup in component destroy() methods
- ✅ **Event Listener Cleanup**: Always remove event listeners to prevent memory leaks
- ✅ **Efficient DOM Manipulation**: Use DocumentFragment for bulk DOM operations
- ✅ **Debounced Operations**: Debounce frequent operations like search or resize
- ✅ **Lazy Loading**: Load components and data only when needed
- ✅ **Background Script Optimization**: Keep service worker lightweight and efficient

### **Real-Time Architecture Standards**
- ✅ **Event-Driven Design**: Use custom events for component communication
- ✅ **State Synchronization**: Implement optimistic UI updates with rollback capability
- ✅ **Chrome API Integration**: Proper handling of chrome.tabs events for real-time sync
- ✅ **Error Recovery**: Graceful degradation when Chrome APIs fail
- ✅ **Performance Monitoring**: Track and optimize real-time update performance
- ✅ **Batch Operations**: Group multiple operations to reduce API calls

### **Code Organization & Maintainability**
- ✅ **Single Responsibility**: Each module/component has one clear purpose
- ✅ **Dependency Injection**: Pass dependencies explicitly, avoid global state
- ✅ **Interface Consistency**: Standardized method signatures across components
- ✅ **Configuration Management**: Centralize all constants and configuration
- ✅ **Version Compatibility**: Code should work across Chrome versions 88+
- ✅ **Documentation Standards**: JSDoc for all public methods and complex logic

### **Testing & Quality Assurance**
- ✅ **Edge Case Testing**: Test with 0 tabs, 1 tab, 100+ tabs scenarios
- ✅ **Cross-Browser Testing**: Verify compatibility with Chrome, Edge, and future Firefox
- ✅ **Performance Testing**: Measure memory usage and response times
- ✅ **Error Scenario Testing**: Test network failures, permission denials, API errors
- ✅ **User Journey Testing**: Complete workflows from install to daily usage
- ✅ **Regression Testing**: Ensure new features don't break existing functionality

### **Modern JavaScript Standards**
- ✅ **ES2022+ Features**: Use modern JavaScript features appropriately
- ✅ **Async/Await Patterns**: Consistent async patterns, avoid callback hell
- ✅ **Error Handling**: Comprehensive try-catch with user-friendly error messages
- ✅ **Type Safety**: Use JSDoc types for better IDE support and documentation
- ✅ **Functional Programming**: Prefer pure functions and immutable operations
- ✅ **Module Boundaries**: Clear separation between business logic and UI logic

---

## 📋 **Project Management**

### **Communication**
- ✅ Always provide comprehensive recap of changes made
- ✅ Explain the reasoning behind each modification
- ✅ List specific improvements and enhancements
- ✅ Be transparent about any limitations or concerns
- ✅ Use clear, professional language with appropriate emojis

### **Documentation**
- ✅ Update relevant documentation when making changes
- ✅ Maintain code comments and inline documentation
- ✅ Keep file structure clean and organized
- ✅ Document any new features or configurations

### **Change Management**
- ✅ Make incremental, logical changes
- ✅ Test changes mentally before implementation
- ✅ Preserve all existing functionality
- ✅ Enhance user experience with every change
- ✅ Consider scalability and future development

---

## 🚀 **Sheperd Project Specific**

### **Feature Priorities**
1. **Real-Time Synchronization** - Instant tab updates with optimistic UI
2. **Smart Categorization** - AI-like automatic tab organization
3. **Performance Analytics** - Live resource monitoring and optimization
4. **Component Architecture** - Reusable, maintainable UI components
5. **Bulk Operations** - Efficient category and duplicate management
6. **Sheperd Meter** - Gamified tab level system with animations

### **Technical Stack Understanding**
- **Phase 1**: Chrome Extension (ES6 Modules, Real-Time Events, Component Architecture)
- **Phase 2**: Go backend + React frontend + PostgreSQL
- **Phase 3**: AI/ML features + integrations
- **Phase 4**: Enterprise features

### **Component Development Standards**
- **Header Component**: Real-time stats, refresh functionality, responsive design
- **Sheperd Meter**: 5 levels (excellent→apocalyptic), animations, celebrations
- **Analytics Component**: Live performance monitoring, optimization suggestions
- **Categories Component**: Expand/collapse, bulk actions, category-specific colors
- **Quick Actions**: Smart button states, bulk operations, loading feedback
- **Event System**: Use SHEPERD_EVENTS for component communication

### **Real-Time System Requirements**
- **23 Event Types**: Comprehensive event system for all tab operations
- **Optimistic Updates**: UI changes appear instantly, confirm in background
- **State Snapshots**: Rollback capability for failed operations
- **Performance Tracking**: Monitor and optimize real-time update performance
- **Chrome API Integration**: Seamless browser-extension synchronization

### **Business Context**
- **Target Users**: Power users with 20+ tabs
- **Monetization**: Freemium SaaS model
- **Competition**: OneTab, Tab Manager Plus, Session Buddy
- **Differentiator**: Real-time synchronization + smart auto-categorization

---

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- ✅ **Zero cognitive load** - No manual sorting required
- ✅ **One-click actions** - Bulk operations should be simple
- ✅ **Visual hierarchy** - Color-coded categories
- ✅ **Modern aesthetics** - 2024 design standards
- ✅ **Performance first** - <100ms interactions
- ✅ **Real-time feedback** - Instant visual confirmation of all actions

### **Color System**
- 🔵 **Work**: #3B82F6 (Professional blue)
- 🟢 **Dev**: #10B981 (Terminal green)  
- 🟡 **Social**: #F59E0B (Social amber)
- 🔴 **Shopping**: #EF4444 (Shopping red)
- 🟣 **Entertainment**: #8B5CF6 (Entertainment purple)
- ⚪ **Other**: #6B7280 (Neutral gray)

### **Animation & Interaction Standards**
- ✅ **Smooth Transitions**: All state changes use CSS transitions (200-300ms)
- ✅ **Loading States**: Visual feedback for all async operations
- ✅ **Hover Effects**: Subtle hover states for interactive elements
- ✅ **Success Animations**: Celebrate successful bulk operations
- ✅ **Error Feedback**: Clear, non-intrusive error messaging
- ✅ **Responsive Design**: Adapt to different popup sizes gracefully

---

## 🐛 **Debugging & Problem Solving**

### **When Issues Arise**
1. **Analyze the root cause** - Don't just fix symptoms
2. **Check ES6 module dependencies** - Verify import/export paths
3. **Validate component lifecycle** - Ensure proper init→render→destroy
4. **Validate Chrome Extension requirements** - Permissions, manifest, CSP
5. **Test edge cases** - 0 tabs, 100+ tabs, different content types
6. **Test component interaction** - Event system working correctly
7. **Consider user impact** - How does this affect the user experience?

### **Component Debugging Standards**
- ✅ Use proper async/await patterns in all components
- ✅ Implement comprehensive error boundaries with user feedback
- ✅ Log meaningful debug information with component context
- ✅ Test component isolation and communication
- ✅ Verify CSS styles load correctly for each component
- ✅ Test responsive behavior and animations

### **Service Worker Debugging**
- ✅ Use proper async/await patterns
- ✅ Handle Chrome API limitations and errors
- ✅ Implement proper error boundaries
- ✅ Log meaningful debug information
- ✅ Test service worker lifecycle events
- ✅ Verify badge update system works correctly

### **Real-Time System Debugging**
- ✅ **Event Flow Tracking**: Log all events in the real-time system
- ✅ **State Consistency**: Verify UI state matches browser state
- ✅ **Performance Monitoring**: Track update latency and memory usage
- ✅ **Rollback Testing**: Ensure failed operations roll back correctly
- ✅ **Chrome API Error Handling**: Graceful degradation when APIs fail
- ✅ **Cross-Tab Testing**: Verify behavior with multiple extension instances

---

## 📊 **Success Metrics**

### **Technical Success**
- ✅ Zero service worker registration errors
- ✅ <200ms extension load time
- ✅ Memory usage <10MB
- ✅ Works with 100+ tabs smoothly
- ✅ 99.5%+ crash-free sessions
- ✅ Real-time updates <50ms latency
- ✅ Optimistic UI success rate >99%

### **User Experience Success**
- ✅ Intuitive categorization accuracy >85%
- ✅ One-click bulk actions work flawlessly
- ✅ Sheperd meter engagement is positive
- ✅ Clean, modern UI that doesn't feel outdated
- ✅ Responsive interactions feel instant
- ✅ Performance analytics provide actionable insights

### **Code Quality Metrics**
- ✅ **Maintainability**: New features can be added without refactoring
- ✅ **Testability**: Components can be tested in isolation
- ✅ **Readability**: Code is self-documenting with clear naming
- ✅ **Scalability**: Architecture supports 200+ tabs without degradation
- ✅ **Security**: No security vulnerabilities in code or dependencies
- ✅ **Performance**: Consistent performance across different usage patterns

---

## 🔄 **Continuous Improvement**

### **Always Look For**
- **Component reusability** - Can we make components more modular?
- **Performance optimizations** - Efficient algorithms for large tab counts
- **User experience improvements** - Smooth animations and feedback
- **Code quality enhancements** - Better ES6 patterns and error handling
- **Architecture improvements** - Cleaner component communication
- **Feature opportunities** - What's missing that users need?
- **Real-time optimization** - Can we make updates even faster?
- **Security enhancements** - Are we following latest security best practices?

### **Regular Review Checklist**
- ✅ **Code Review**: All changes follow established patterns
- ✅ **Performance Review**: Memory usage and response times are optimal
- ✅ **Security Review**: No new vulnerabilities introduced
- ✅ **UX Review**: Changes improve or maintain user experience
- ✅ **Documentation Review**: All changes are properly documented
- ✅ **Testing Review**: Edge cases and error scenarios are covered

---

## 🎯 **Development Workflow Standards**

### **Before Making Changes**
1. **Read and understand** the existing code structure
2. **Identify dependencies** and potential impact areas
3. **Plan the implementation** following established patterns
4. **Consider edge cases** and error scenarios
5. **Ensure backward compatibility** with existing features

### **During Development**
1. **Follow component patterns** established in the codebase
2. **Use consistent naming** and code organization
3. **Implement proper error handling** for all operations
4. **Add meaningful logging** for debugging purposes
5. **Test incrementally** as you build features

### **After Implementation**
1. **Test thoroughly** across different scenarios
2. **Verify performance** impact and optimization
3. **Update documentation** as needed
4. **Review code quality** and refactor if necessary
5. **Ensure real-time features** work seamlessly

This comprehensive set of rules ensures that all development work on the Sheperd extension maintains the highest professional standards while preserving the innovative real-time architecture that sets it apart from competitors.

## 🎯 **Commitment**

I will follow these rules consistently to:
- ✅ Deliver high-quality, reliable code
- ✅ Enhance the user experience with every change  
- ✅ Maintain project momentum and progress
- ✅ Support the vision of making Sheperd the #1 tab manager
- ✅ Never compromise on functionality or user experience

**Remember**: Every line of code should make Sheperd better for users who are drowning in tab chaos. We're building the solution they desperately need! 🐑✨ 