# Climate Guard Backend API

A comprehensive weather monitoring and climate data management system built with Node.js, Express, and MySQL.

## Features

- 🔐 **User Authentication** - JWT-based authentication with role-based access control
- 🌤️ **Weather Data Management** - Real-time weather station data collection and analysis
- 🚨 **Alert System** - Weather alerts and disaster management
- 👥 **Multi-Role Support** - Government officers, farmers, researchers, and administrators
- 📊 **Dashboard Analytics** - Comprehensive statistics and reporting
- 🗄️ **MySQL Database** - Robust data storage with optimized queries

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Enabled for cross-origin requests

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Weather Data
- `GET /api/weather` - Fetch weather data (authenticated)
- `GET /api/stations` - Get weather stations (authenticated)

### Alerts
- `GET /api/alerts` - Get active alerts
- `POST /api/alerts` - Create new alert (government officers only)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics (authenticated)
- `GET /api/user/profile` - User profile (authenticated)

### Health Check
- `GET /api/health` - API health status

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

### 1. Clone and Install Dependencies

```bash
cd climate-guard-backend
npm install
```

### 2. Database Setup

#### Option A: Using MySQL Command Line
```bash
mysql -u root -p < schema.sql
```

#### Option B: Using phpMyAdmin or MySQL Workbench
1. Open phpMyAdmin or MySQL Workbench
2. Create a new database called `climate_guard`
3. Import the `schema.sql` file

### 3. Environment Configuration

Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=climate_guard
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
PORT=5000
```

### 4. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## Database Schema

The system includes the following main tables:

- **users** - User accounts with roles
- **weather_stations** - Weather monitoring stations
- **weather_data** - Collected weather measurements
- **alerts** - Weather alerts and warnings
- **departments** - Government departments
- **regions** - Geographic regions and districts
- **disaster_reports** - Disaster incident reports

## User Roles

- **government_officer** - Can create alerts and manage disaster reports
- **farmer** - Access to weather data and agricultural information
- **researcher** - Full access to weather data and analytics
- **admin** - Full system administration access

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- CORS protection
- Input validation and sanitization

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "farmer",
    "region": "Chennai"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Project Structure

```
climate-guard-backend/
├── src/
│   ├── server.js          # Main server file
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── schema.sql             # Database schema
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the Climate Guard development team.
