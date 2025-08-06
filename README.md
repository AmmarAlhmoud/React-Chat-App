# ChatApp - React Chat Application

A modern, responsive full-stack chat application built with React and CSS Modules alongside Firebase.

## Features

- 🎨 Modern UI with dark/light theme support
- 📱 Fully responsive design
- 💬 Real-time chat interface
- 🔐 Authentication system (Firebase integration)
- ⚡ Fast and optimized with Vite
- 🎯 Component-based architecture
- 🎭 CSS Modules for scoped styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository or copy the files
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Key Components

### App.jsx

Main application component that handles authentication state and theme management.

### Chat.jsx

Main chat page that combines all chat-related components.

### Sidebar Components

- **Sidebar.jsx**: Main sidebar container
- **ChatList.jsx**: List of chat conversations

### Chat Components

- **ChatWindow.jsx**: Main chat interface
- **Header.jsx**: Chat header with user info and actions
- **Message.jsx**: Individual message bubbles
- **MessageInput.jsx**: Input field for typing messages
- **TypingIndicator.jsx**: Shows when someone is typing

### Authentication

- **Login.jsx**: Login page with email/password and Google auth
- **AuthContext.jsx**: Authentication state management

### Settings

- **SettingsModal.jsx**: Settings popup with theme toggle and account options

## CSS Modules

Each component has its own `.module.css` file for scoped styling. Global styles and CSS variables are defined in `App.css`.

## Firebase Integration

The app is built with Firebase integration:

1. `firebase/config.js` - Firebase project configuration
2. The implementation for authentication functions is in `firebase/auth.js`
3. Firestore for real-time messaging

## Responsive Design

The app is fully responsive with:

- Mobile-first design approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized layouts for different screen sizes

## Theme System

Supports light and dark themes using CSS custom properties:

- Theme switching via settings modal
- Persistent theme preference in localStorage
- Smooth transitions between themes

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Follow the existing code style
2. Create components in their respective folders with CSS modules
3. Update this README if you add new features
4. Test on both desktop and mobile devices

## License

This project is open source and available under the MIT License.
