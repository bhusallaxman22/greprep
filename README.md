# GRE/GMAT Test Prep App

A modern, AI-powered test preparation application buil### 3. OpenRouter API Configuration

1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Get your API key
3. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

4. Update the `.env` file with your API key:

````env
VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```act, Material UI, Firebase, and OpenRouter AI. This app provides personalized test practice with intelligent analytics and performance insights.

## Features

### 🎯 Core Functionality

- **Interactive Test Taking**: One question per page with intuitive navigation
- **Multiple Test Types**: Support for both GRE and GMAT with various sections
- **Difficulty Levels**: Easy, Medium, and Hard questions
- **Real-time Analytics**: Track performance and accuracy rates

### 📊 Dashboard & Analytics

- **Performance Overview**: Visual charts showing accuracy by section
- **Test History**: Complete record of all past exams
- **Progress Tracking**: Improvement trends over time
- **AI-Powered Insights**: Personalized recommendations for improvement

### 🤖 AI Integration

- **Question Generation**: Dynamic question creation using OpenRouter AI
- **Performance Analysis**: AI evaluation of test results
- **Study Recommendations**: Targeted suggestions based on weak areas
- **Adaptive Difficulty**: Questions tailored to your skill level

### 🎨 User Experience

- **Material UI Design**: Clean, minimal, and beautiful interface
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Comfortable viewing in any environment
- **Intuitive Navigation**: Easy-to-use interface with clear progress indicators

## Tech Stack

- **Frontend**: React 18 with Vite
- **UI Framework**: Material UI (MUI)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Anonymous)
- **AI Integration**: OpenRouter API
- **Charts**: Recharts
- **State Management**: React Context API

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- OpenRouter API account

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd gre-gmat
npm install
````

### 2. Firebase Configuration

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication and configure Anonymous sign-in
4. Get your Firebase configuration
5. Update `src/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};
```

### 3. OpenRouter API Configuration

1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Get your API key
3. Update `src/services/openrouter.js`:

```javascript
const OPENROUTER_API_KEY = "your-openrouter-api-key";
```

### 4. Firebase Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own test results
    match /testResults/{document} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Allow users to read/write their own questions
    match /questions/{document} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Allow users to read/write their own stats
    match /userStats/{document} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Troubleshooting

### OpenRouter API Issues

If you're seeing 404 errors or JSON parsing failures with OpenRouter:

#### 1. Check Configuration
```bash
# Make sure your .env file has:
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

#### 2. Test Your Connection
Run this in your browser console:
```javascript
// Test if OpenRouter is working
testOpenRouterConnection();
```

#### 3. Common Error Solutions

**"404 Not Found"**
- Verify your API key is correct and has credits
- Ensure base URL is `https://openrouter.ai/api/v1`
- Check [OpenRouter.ai](https://openrouter.ai) for service status

**"JSON parsing failed"**
- App will automatically fall back to predefined questions
- This is a temporary issue that self-resolves
- Check console for specific parsing errors

**"API key not configured"**
- Copy `.env.example` to `.env`
- Add your actual OpenRouter API key  
- Restart the development server (`npm run dev`)

### Quick Fix
If OpenRouter issues persist, the app includes high-quality fallback questions and will continue working normally while you resolve the API configuration.

### Getting Help
- 📖 See `OPENROUTER_TROUBLESHOOTING.md` for detailed solutions
- 🔍 Check browser console for specific error messages
- ⚡ The app includes diagnostic tools to test your setup

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard with analytics
│   ├── TestSelection.jsx # Test configuration
│   ├── QuestionDisplay.jsx # Individual question view
│   ├── TestResults.jsx  # Results and analysis
│   └── LoadingScreen.jsx # Loading component
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── services/           # External service integrations
│   ├── firebase.js     # Firebase operations
│   └── openrouter.js   # OpenRouter AI integration
├── firebase.js         # Firebase configuration
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Key Features Explained

### Dashboard

- **Quick Stats**: Total tests, questions answered, overall accuracy
- **Performance Charts**: Visual representation of section-wise performance
- **Recent Activity**: Latest test results and trends
- **AI Insights**: Personalized improvement suggestions

### Test Flow

1. **Test Selection**: Choose test type (GRE/GMAT), section, difficulty, and question count
2. **Question Display**: One question per page with timer and progress tracking
3. **Navigation**: Previous/Next buttons with answer validation
4. **Results**: Comprehensive analysis with AI-powered insights

### Data Storage

- **User Progress**: All test results stored in Firebase
- **Performance Analytics**: Detailed tracking of accuracy by section
- **Question Bank**: AI-generated questions with explanations
- **Study Recommendations**: Personalized improvement suggestions

## Customization

### Adding New Test Types

1. Update the `testTypes` array in `TestSelection.jsx`
2. Add corresponding sections in the `sections` object
3. Update question generation logic in `openrouter.js`

### Modifying UI Theme

Update the theme configuration in `App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: "#your-color" },
    // ... other theme options
  },
});
```

### AI Prompt Customization

Modify the prompts in `src/services/openrouter.js` to change:

- Question generation style
- Difficulty levels
- Performance evaluation criteria

## Troubleshooting

### Common Issues

1. **Firebase Configuration Errors**

   - Ensure all Firebase services are enabled
   - Check that API keys are correctly configured
   - Verify Firestore security rules

2. **OpenRouter API Issues**

   - Confirm API key is valid and has sufficient credits
   - Check network connectivity
   - Verify model availability

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Update dependencies: `npm update`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

---

Built with ❤️ using React, Material UI, Firebase, and OpenRouter AI.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
