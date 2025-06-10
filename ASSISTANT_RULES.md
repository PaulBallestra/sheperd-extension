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
1. **Tab Management** - Smart categorization with ES6 modules
2. **Component Architecture** - Reusable, maintainable UI components
3. **Performance** - Handle 100+ tabs with efficient algorithms
4. **User Experience** - Intuitive interface with smooth animations
5. **Reliability** - Comprehensive error handling and feedback
6. **Sheperd Meter** - Level-based tab tracking (renamed from shame)

### **Technical Stack Understanding**
- **Phase 1**: Chrome Extension (ES6 Modules, Component Architecture, CSS Variables)
- **Phase 2**: Go backend + React frontend + PostgreSQL
- **Phase 3**: AI/ML features + integrations
- **Phase 4**: Enterprise features

### **Component Development Standards**
- **Header Component**: Real-time stats, refresh functionality, responsive design
- **Sheperd Meter**: 5 levels (excellent→apocalyptic), animations, celebrations
- **Categories Component**: Expand/collapse, bulk actions, category-specific colors
- **Quick Actions**: Smart button states, bulk operations, loading feedback
- **Event System**: Use Sheperd_EVENTS for component communication

### **Business Context**
- **Target Users**: Power users with 20+ tabs
- **Monetization**: Freemium SaaS model
- **Competition**: OneTab, Tab Manager Plus, Session Buddy
- **Differentiator**: Smart auto-categorization

---

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- ✅ **Zero cognitive load** - No manual sorting required
- ✅ **One-click actions** - Bulk operations should be simple
- ✅ **Visual hierarchy** - Color-coded categories
- ✅ **Modern aesthetics** - 2024 design standards
- ✅ **Performance first** - <100ms interactions

### **Color System**
- 🔵 **Work**: #3B82F6 (Professional blue)
- 🟢 **Dev**: #10B981 (Terminal green)  
- 🟡 **Social**: #F59E0B (Social amber)
- 🔴 **Shopping**: #EF4444 (Shopping red)
- 🟣 **Entertainment**: #8B5CF6 (Entertainment purple)
- ⚪ **Other**: #6B7280 (Neutral gray)

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

---

## 📊 **Success Metrics**

### **Technical Success**
- ✅ Zero service worker registration errors
- ✅ <200ms extension load time
- ✅ Memory usage <10MB
- ✅ Works with 100+ tabs smoothly
- ✅ 99.5%+ crash-free sessions

### **User Experience Success**
- ✅ Intuitive categorization accuracy >85%
- ✅ One-click bulk actions work flawlessly
- ✅ Tab shame metrics are engaging
- ✅ Clean, modern UI that doesn't feel outdated
- ✅ Responsive interactions

---

## 🔄 **Continuous Improvement**

### **Always Look For**
- **Component reusability** - Can we make components more modular?
- **Performance optimizations** - Efficient algorithms for large tab counts
- **User experience improvements** - Smooth animations and feedback
- **Code quality enhancements** - Better ES6 patterns and error handling
- **Architecture improvements** - Cleaner component communication
- **Feature opportunities** - What's missing that users need?
- **Bug prevention** - Comprehensive error boundaries

### **Future Considerations**
- **Scalability** - Will this component architecture work for Phase 2 SaaS?
- **Maintainability** - Can other developers understand ES6 module structure?
- **Extensibility** - Can we easily add new components and features?
- **Security** - Are we following CSP and Chrome extension best practices?
- **Performance** - Will the event system scale with more components?

### **Refactoring Guidelines**
- ✅ **Never break existing functionality** - Always maintain 100% compatibility
- ✅ **Enhance while refactoring** - Improve performance, UX, and maintainability
- ✅ **Follow established patterns** - Use existing component structures as templates
- ✅ **Update documentation** - Keep README and rules in sync with changes
- ✅ **Test thoroughly** - Verify all features work with new architecture

---

## 🎯 **Commitment**

I will follow these rules consistently to:
- ✅ Deliver high-quality, reliable code
- ✅ Enhance the user experience with every change  
- ✅ Maintain project momentum and progress
- ✅ Support the vision of making Sheperd the #1 tab manager
- ✅ Never compromise on functionality or user experience

**Remember**: Every line of code should make Sheperd better for users who are drowning in tab chaos. We're building the solution they desperately need! 🐑✨ 