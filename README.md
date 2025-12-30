# Movement Dashboard

A web application for tracking and scoring daily transportation choices based on environmental impact.

## Features

- **User Authentication**: Secure login and registration system
- **Transport Tracking**: Support for 5 transport modes (Auto, Fiets, NMBS, De Lijn, Te Voet)
- **Distance Calculation**: Automatic GPS-based distance calculation using Haversine formula
- **Efficiency Scoring**: Real-time scoring system with environmental impact assessment
- **Trip History**: View and manage all past trips

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **Vanilla JavaScript** (no frameworks)
- **HTML5** with semantic markup
- **CSS3** with mobile-first responsive design

### DevOps
- **Docker** containerization
- **Docker Compose** for multi-service orchestration

## Quick Start

1. **Clone and navigate**:
   ```bash
   git clone <repository-url>
   cd wdm-jannesclaes
   ```

2. **Setup environment**:
   ```bash
   cd BackEnd
   cp .env.example .env
   cd ..
   ```

3. **Create admin account (first time only)**:
   ```bash
   npm run docker-seed
   ```
   
   Admin credentials:
   - Username: `admin`
   - Password: `admin1234`

4. **Access the application**:
   - Frontend: http://localhost:1234
   - Backend API: http://localhost:5050
   - Database: MongoDB on port 27017

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Trips
- `GET /api/trips` - Get user trips (protected)
- `POST /api/trips` - Create new trip (protected)

## Development

For development setup and coding standards, see `STANDARDS.md`.

For resources, tools, and documentation, see `RESOURCES.md`.

## Contributing

For contribution guidelines, see `CONTRIBUTING.MD`.

## License

See `LICENSE.md` for license information.

