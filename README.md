# SpecGen User Interface

The user interface for SpecGen, allowing users to generate speculative fiction based on selected parameters.

## Features

- Browse Categories
- Select Parameters
- Generate Fiction
- View Generation History
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- npm
- Running SpecGen server

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   - Create a `.env` file
   - Set the API URL: `REACT_APP_API_URL=http://localhost:3000/api`

3. Start the development server:
   ```bash
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Technologies

- React
- Material-UI for components
- Axios for API calls
- React Router for navigation
- Emotion for styling

## Development

The user interface is built with React and Material-UI, providing a modern and responsive design for generating fiction. It communicates with the SpecGen server API to fetch categories and parameters, and to generate fiction based on user selections.

### Key Components

- Category Selection
- Parameter Configuration
- Generation Form
- Results Display
- Error Handling
- Loading States

### API Integration

The user interface interacts with the following API endpoints:

- GET /api/categories - Get all categories
- GET /api/parameters - Get parameters for a category
- POST /api/generate - Generate fiction based on parameters
