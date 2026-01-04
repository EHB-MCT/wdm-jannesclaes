# Movement Dashboard

A web application for tracking and scoring daily transportation choices based on environmental impact.

## Features

- **User Authentication**: Secure JWT-based login and registration system with bcrypt password hashing
- **Transport Tracking**: Support for 4 transport modes (Auto, Fiets, Openbaar Vervoer, Anders)
- **Distance Calculation**: Automatic GPS-based distance calculation using Haversine formula
- **Efficiency Scoring**: Real-time scoring system with environmental impact assessment (Eco Warrior, Eco Neutral, Climate Criminal)
- **Trip History**: View and manage all past trips with detailed metrics
- **Admin Dashboard**: Comprehensive admin interface with charts, statistics, and user management
- **Data Visualization**: Interactive charts showing transport patterns and environmental impact
- **Telemetry Tracking**: Advanced user behavior tracking (clicks, hovers, time spent)
- **Geocoding Integration**: Real-time location services via Geoapify API

## Technology Stack

### Backend
- **Node.js** with Express.js - RESTful API server
- **MongoDB** with Mongoose ODM - NoSQL database with schema validation
- **JWT** for stateless authentication
- **bcryptjs** for secure password hashing (12 salt rounds)
- **Geoapify API** for geocoding and location services

### Frontend
- **Vanilla JavaScript** (ES6+ modules) - Modern JavaScript without frameworks
- **Chart.js** - Interactive data visualization and charts
- **HTML5** with semantic markup and accessibility features
- **CSS3** with CSS variables, mobile-first responsive design, and animations

### DevOps
- **Docker** containerization with multi-stage builds
- **Docker Compose** for multi-service orchestration
- **Environment-based configuration** with .env files

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository

### Installation

1. **Clone and navigate**:
   ```bash
   git clone <repository-url>
   cd wdm-jannesclaes
   ```

2. **Setup environment**:
   ```bash
   cd BackEnd
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

3. **Start the application**:
   ```bash
   docker-compose up --build
   ```

4. **Create admin account (first time only)**:
   ```bash
   npm run docker-seed
   ```
   
   Admin credentials:
   - Username: `admin`
   - Password: `admin1234`

5. **Access the application**:
   - Frontend: http://localhost:1234
   - Backend API: http://localhost:5050
   - Database: MongoDB on port 27017

### Manual Development Setup

For local development without Docker:

1. **Install dependencies**:
   ```bash
   cd BackEnd && npm install
   cd ../FrontEnd && npm install
   ```

2. **Start MongoDB** (required)

3. **Start backend**:
   ```bash
   cd BackEnd && npm start
   ```

4. **Start frontend**:
   ```bash
   cd FrontEnd && npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email validation
- `POST /api/auth/login` - User login with JWT token response
- `GET /api/auth/profile` - Get user profile (protected route)

### Trips
- `GET /api/trips` - Get all user trips (protected)
- `POST /api/trips` - Create new trip with efficiency scoring (protected)
- `GET /api/trips/stats` - Get user transportation statistics (protected)

### Admin
- `GET /api/admin/overview` - Get overview statistics (admin only)
- `GET /api/admin/users` - Get all users list (admin only)
- `GET /api/admin/trips` - Get all trips with filters (admin only)
- `GET /api/admin/rankings` - Get user rankings by efficiency (admin only)

### Geocoding
- `GET /api/geocode/search` - Search locations by name
- `GET /api/geocode/route` - Get route information between locations

### Telemetry
- `POST /api/telemetry` - Log user interaction data (protected)

## Project Structure

```
wdm-jannesclaes/
├── BackEnd/
│   ├── controllers/     # API route handlers
│   ├── models/          # Mongoose data models
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Authentication and validation
│   ├── .env.example     # Environment variables template
│   └── server.js        # Main application server
├── FrontEnd/
│   ├── app.js           # Main application logic
│   ├── charts.js        # Chart.js visualization
│   ├── tracker.js       # User telemetry tracking
│   ├── index.html       # Single page application
│   └── style.css        # Styles and responsive design
├── docker-compose.yml   # Multi-container orchestration
├── README.md           # This file
├── STANDARDS.md        # Coding standards and guidelines
├── RESOURCES.md        # External resources and documentation
├── CONTRIBUTING.MD     # Contribution guidelines
└── LICENSE.md          # License information
```

## Development

For development setup and coding standards, see `STANDARDS.md`.

For resources, tools, and documentation, see `RESOURCES.md`.

## Contributing

For contribution guidelines, see `CONTRIBUTING.MD`.

We welcome contributions! Please follow our coding standards and submit pull requests to the develop branch.

## License

See `LICENSE.md` for license information.

## Recent Updates

- Removed "Vliegtuig" transport option from filters
- Improved popup title wrapping and sizing
- Enhanced admin dashboard with comprehensive charts
- Added telemetry tracking for user behavior analysis
- Implemented efficiency scoring system with environmental impact
- Added real-time geocoding integration

