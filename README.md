<div align="center">
  <img src="public/favicon.svg" alt="LoveLink Logo" width="120" />
  <h1>LoveLink — Modern Dating App (Frontend)</h1>
  <p>
    <strong>A high-performance, real-time dating application interface built with React, Vite, and Tailwind CSS.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  </p>
</div>

## 📖 Overview

LoveLink is an industry-standard, premium dating and social discovery platform. This repository contains the frontend client, engineered for maximum performance, buttery-smooth animations, and real-time interactions. Designed with a dark-mode-first glassmorphism aesthetic, it delivers a deeply engaging user experience.

*Note: This is the frontend repository. The backend API is hosted at [lovelink-server](https://github.com/shekhmohibur/lovelink-server).*

## ✨ Core Features

- **Modern Discovery Engine**: Tinder-style swipe cards with fluid physics powered by Framer Motion.
- **Real-Time Communication**: Instant messaging, typing indicators, and read receipts via WebSockets (`socket.io-client`).
- **Secure Authentication**: Frictionless onboarding utilizing Firebase Auth (Google OAuth & Email/Password).
- **Responsive Architecture**: Fully mobile-optimized layout with bottom navigation for iOS/Android-like PWA experience.
- **Media Handling**: Secure image sharing with built-in daily quota limits (Free & Pro tiers).
- **Premium Subscription Flow**: Geo-aware pricing tiers seamlessly integrated into the UI.

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) (Headless UI components)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Global state) & [React Query](https://tanstack.com/query/latest) (Server state caching)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Animate.css](https://animate.style/)
- **Real-Time**: [Socket.io Client](https://socket.io/)
- **Routing**: [React Router v7](https://reactrouter.com/)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shekhmohibur/lovelink.git
   cd lovelink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Create a `.env` file in the root directory and populate it with your Firebase config and backend URL:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   VITE_API_URL=http://localhost:3001
   VITE_SOCKET_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Folder Structure

```
src/
├── assets/        # Static images and icons
├── components/    # Reusable UI elements (Buttons, Inputs, Cards)
│   ├── chat/      # Messaging specific components
│   ├── discovery/ # Swipe stack components
│   ├── layout/    # Navbars, Sidebars, Containers
│   └── ui/        # Atomic Radix UI wrappers
├── contexts/      # React Context providers (Auth, Socket)
├── lib/           # Utility functions, API clients, Firebase init
├── pages/         # Full-page route components
└── routes/        # Application routing logic
```

## 📈 Performance & SEO
This React application utilizes optimized bundling via Vite. For production, ensure environment variables point to your secure API endpoints. Image lazy loading and component code-splitting are enabled by default for optimal Lighthouse scores.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
