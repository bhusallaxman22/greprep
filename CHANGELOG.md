# Changelog

All notable changes to the GRE/GMAT Test Prep application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-08-08

### Added
- **Question Preloading System**: Implemented intelligent background loading of upcoming questions to improve user experience
  - Questions now preload 2-3 questions ahead of current position
  - Visual indicators show preloading status in QuestionDisplay component
  - Background generation with setTimeout delays to prevent API overload
  - "Next (Ready)" button indicator when questions are preloaded

- **Enhanced Question Display Features**:
  - Added support for reading passages with proper formatting
  - Added visual reference support for math/diagram questions with image descriptions
  - Improved passage display with Georgia serif font and justified text alignment
  - Enhanced visual hierarchy with proper section headers

- **AI Question Generation Improvements**:
  - Implemented multi-model retry logic with 5 different AI models
  - Enhanced JSON parsing with multiple extraction methods
  - Added comprehensive question validation with detailed error logging
  - Improved prompt engineering for better question quality
  - Added support for passage-based questions and image descriptions
  - Enhanced error handling with fallback question generation

- **Learning Module Enhancements**:
  - Added 45+ comprehensive learning modules across verbal, quantitative, strategy, and writing categories
  - Implemented module-specific lesson prompts for targeted content generation
  - Added passage display support for reading comprehension lessons
  - Enhanced lesson content rendering with proper formatting
  - Improved module categorization and filtering

- **Dashboard Improvements**:
  - Added error handling for quick insights generation
  - Enhanced AI evaluation with proper test result parsing
  - Improved performance analytics calculation
  - Added graceful fallback for AI service failures

### Fixed
- **AI Evaluation System**: Fixed AI evaluation always showing 0% scores
  - Corrected test result parsing to properly extract question data from nested structures
  - Fixed statistics calculation for section and difficulty performance
  - Improved accuracy calculations across multiple test sessions

- **Learning Module Content Matching**: Resolved issue where all modules generated passage questions
  - Implemented module-specific content generation based on module type
  - Added conditional passage inclusion only for reading comprehension modules
  - Enhanced prompt specificity to prevent content type mismatches

- **Question Generation Validation**: Enhanced validation system to prevent invalid question structures
  - Added detailed debugging logs for validation failures
  - Improved error reporting for question structure issues
  - Enhanced fallback mechanisms for failed generations

### Changed
- **Question Navigation**: Improved question progression flow
  - Enhanced next/previous button logic with preloading awareness
  - Added visual feedback for question loading states
  - Improved user experience with ready indicators

- **Performance Optimization**: 
  - Reduced question generation latency through preloading
  - Optimized API usage with intelligent retry mechanisms
  - Improved overall app responsiveness during test sessions

- **UI/UX Enhancements**:
  - Better visual feedback for loading states
  - Enhanced progress indicators showing preloaded questions
  - Improved question display layout with passage support
  - Enhanced button states based on question availability

### Technical Details
- **App.jsx**: Added comprehensive question preloading system with background generation
- **QuestionDisplay.jsx**: Enhanced with passage/image support and preloading indicators
- **Dashboard.jsx**: Improved error handling and insights generation
- **LearningModule.jsx**: Added passage display and enhanced lesson content
- **openrouter.js**: Major improvements to AI service with multi-model support and validation

### Dependencies
- No new dependencies added
- Enhanced existing Material-UI component usage
- Improved Firebase integration for test result tracking

---

## Previous Versions

### [1.3.0] - Previous Release
- Core test prep functionality
- Dashboard with basic analytics
- Learning module foundation
- AI-powered question generation
- Firebase authentication and data storage

### [1.2.0] - Previous Release
- Initial AI evaluation system
- Basic learning modules
- Test result tracking

### [1.1.0] - Previous Release
- Test selection and question display
- Basic user authentication
- Firebase integration

### [1.0.0] - Initial Release
- Basic GRE/GMAT test prep application
- Material UI integration
- OpenRouter AI integration
- Core testing functionality
