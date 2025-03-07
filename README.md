# Bitcoin Tracker Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.2.23-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.57.1-4B32C3)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-Private-red)]()
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green)]()

A Next.js-based frontend application for tracking Bitcoin transactions and generating tax reports.

## 🚀 Features

- Dashboard with portfolio overview
- Transaction tracking
- Tax report generation
- User authentication
- Responsive design

## 📦 Core Dependencies

### Framework

- **Next.js** (v14.2.23) - React framework for production
- **React** (v18) - UI library
- **TypeScript** (v5) - Type safety and developer experience

### UI Components

- **Radix UI** - Headless UI components
  - Multiple components including Accordion, Dialog, Navigation Menu
  - All components at latest stable versions
- **Lucide React** (v0.454.0) - Icon library
- **Recharts** (latest) - Responsive charting library
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework

### Forms and Validation

- **React Hook Form** (latest) - Form handling
- **Zod** (latest) - Schema validation
- **@hookform/resolvers** (latest) - Form validation integration

### Development Tools

- **ESLint** (v8.57.1) - Code linting
- **PostCSS** (v8) - CSS processing
- **TypeScript** (v5) - Static type checking

## 🛠️ Prerequisites

- Node.js 18 or later
- npm 7 or later (comes with Node.js)
- npx (comes with npm 5.2+ and Node.js 8.2+)
- Docker (optional, for containerized deployment)

### Installing Node.js and npm

1. Visit the [official Node.js website](https://nodejs.org/) and download the installer for your operating system.
2. Run the installer and follow the installation wizard.
3. After installation, verify by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

### Installing Docker (Optional)

1. Visit the [official Docker website](https://www.docker.com/get-started) and download Docker Desktop for your operating system.
2. Follow the installation instructions for your OS.
3. After installation, verify by opening a terminal and running:
   ```bash
   docker --version
   ```

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd bitcoin-tracker-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## 🐳 Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Access the application at http://localhost:3000
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Add your environment variables here
```

## 📝 License

This project is private and proprietary.
