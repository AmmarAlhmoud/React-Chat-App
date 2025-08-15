# ChatApp – React + Firebase Real-Time Chat with Presence

**Overview**

This is a modern, responsive real-time chat application built with React, Vite, and Firebase. It supports one-to-one messaging, live presence tracking, self-chats, and responsive UI for both desktop and mobile devices.

**Tech Stack**

- **Frontend:** React, Vite
- **Backend:** Firebase Authentication, Firestore, Firebase Realtime Database

**Features**

**Real-Time Chat:**

- One-to-one messaging with instant updates.
- Read receipts for delivered messages.
- Message types: text (support for future media/file uploads).

**Presence System:**

- Live online/offline status updates.
- Last seen tracking.
- Automatic offline detection when users close the tab or disconnect.
- Self-chat mode for personal notes.

**Typing Indicators:**

- Real-time typing status for active conversations. _(Work in progress)_

**Authentication:**

- Email and password login.
- Google Sign-In integration.
- Persistent login state.

**Responsive Design:**

- Mobile-first design with adaptive layouts.
- Collapsible sidebar on smaller screens.
- Touch-friendly UI components.

**Styling:**

- CSS Modules for scoped component styling.
- Light and dark themes with smooth transitions.
- Global theme variables for easy customization.

**Getting Started**

1. **Install Dependencies:**

   - Navigate to the project directory.
   - Install dependencies:

     ```bash
     npm install
     ```

2. **Start the Development Server:**

   - Run:

     ```bash
     npm run dev
     ```

   - This will typically launch the app at `http://localhost:5173` in your browser.

**Live Website:**

- Visit the live app at: \[[https://chatspace-app.netlify.app/)]
