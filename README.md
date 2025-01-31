
# Bitcoin Tracker Frontend

This is a Next.js-based frontend application for tracking Bitcoin transactions and generating tax reports.

## Features

- Dashboard with portfolio overview
- Transaction tracking
- Tax report generation
- User authentication
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 7 or later (comes with Node.js)

-npx (comes with npm 5.2+ and Node.js 8.2+)

-Docker (optional, for containerized deployment)

#### Installing Node.js and npm

1. Visit the [official Node.js website](https://nodejs.org/) and download the installer for your operating system.
2. Run the installer and follow the installation wizard.
3. After installation, verify by opening a terminal and running:

   \`\`\`

   node --version

   npm --version

\`\`\`

#### Installing Docker

1. Visit the [official Docker website](https://www.docker.com/get-started) and download Docker Desktop for your operating system.
2. Follow the installation instructions for your OS.
3. After installation, verify by opening a terminal and running:

\`\`\`

   docker --version

\`\`\`

### Setting up the Development Environment

1. Clone the repository:

### Using npm Scripts

This project includes several npm scripts to help with development and deployment:

- `npm run dev`: Start the development server
- `npm run build`: Create a production build
- `npm start`: Start the production server
- `npm run docker:build`: Build the Docker image
- `npm run docker:run`: Run the Docker container

To use these scripts, run them in your terminal. For example:

\`\`\`

npm run dev

\`\`\`

### Docker Deployment

To deploy the application using Docker:

1. Build the Docker image:

\`\`\`

   npm run docker:build

\`\`\`

2. Run the Docker container:

\`\`\`

   npm run docker:run

\`\`\`

3. Access the application at [http://localhost:3000](http://localhost:3000)

These commands use the scripts defined in `package.json` to simplify the Docker build and run process.
