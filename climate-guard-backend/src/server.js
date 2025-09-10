const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'climate_guard',
  multipleStatements: false,
  charset: 'utf8mb4'
};

let db;

// Initialize database connection
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Test the connection
    await db.execute('SELECT 1');
    console.log('✅ Database test query successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Climate Guard API is running',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Registration endpoint with better error handling
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt started');
    const { name, email, password, role, department, region, phone } = req.body;

    // Detailed input validation
    if (!name || !email || !password || !role) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'email', 'password', 'role']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('Input validation passed');

    // Check if user already exists
    try {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        console.log('User already exists with email:', email);
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }
    } catch (dbError) {
      console.error('Error checking existing user:', dbError);
      return res.status(500).json({
        message: 'Database error while checking existing user'
      });
    }

    console.log('User doesn\'t exist, proceeding with registration');

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return res.status(500).json({
        message: 'Error processing password'
      });
    }

    // Insert new user
    try {
      const insertQuery = `
        INSERT INTO users (name, email, password, role, department, region, phone, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await db.execute(insertQuery, [
        name,
        email,
        hashedPassword,
        role,
        department || null,
        region,
        phone
      ]);

      console.log('User inserted successfully with ID:', result.insertId);

      // Get the created user (without password)
      const [newUser] = await db.execute(
        'SELECT id, name, email, role, department, region, phone, created_at FROM users WHERE id = ?',
        [result.insertId]
      );

      console.log('Registration successful for:', email);

      res.status(201).json({
        message: 'User registered successfully',
        user: newUser[0]
      });

    } catch (insertError) {
      console.error('Error inserting user:', insertError);
      
      // Handle specific MySQL errors
      if (insertError.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      return res.status(500).json({
        message: 'Database error while creating user',
        error: process.env.NODE_ENV === 'development' ? insertError.message : undefined
      });
    }

  } catch (error) {
    console.error('Unexpected error in registration:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint with better error handling
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt started');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, name, email, password, role, department, region, phone FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password;

    console.log('Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Profile update endpoint
app.put('/api/auth/profile', async (req, res) => {
  try {
    console.log('Profile update attempt started');

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (jwtError) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    const { name, phone, department, region, district } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }

    // Update user profile
    const updateQuery = `
      UPDATE users
      SET name = ?, phone = ?, department = ?, region = ?, district = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await db.execute(updateQuery, [
      name,
      phone || null,
      department || null,
      region || null,
      district || null,
      decoded.userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get updated user data
    const [updatedUser] = await db.execute(
      'SELECT id, name, email, role, department, region, district, phone, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    console.log('Profile updated successfully for user ID:', decoded.userId);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as user_count FROM users');
    res.json({
      status: 'Database connection working',
      user_count: result[0].user_count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      error: 'Database test failed',
      message: error.message
    });
  }
});

// News endpoint (keeping your existing news functionality)
app.get('/api/news', async (req, res) => {
  try {
    const mockNews = [
      {
        title: "IMD issues orange alert: Heavy rainfall expected across Tamil Nadu and Kerala",
        description: "Indian Meteorological Department warns of intense monsoon activity",
        publishedAt: "2025-09-01T10:30:00Z",
        url: "#",
        source: { name: "IMD Weather Updates" }
      },
      {
        title: "Cyclone threat in Bay of Bengal: Coastal evacuation plans activated",
        description: "NDMA coordinates with state governments for emergency preparedness",
        publishedAt: "2025-09-01T08:15:00Z",
        url: "#",
        source: { name: "NDMA Emergency" }
      }
    ];

    res.json({
      status: 'success',
      articles: mockNews,
      totalResults: mockNews.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      message: 'Error fetching news',
      error: error.message
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/test-db',
      'GET /api/news'
    ]
  });
});

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Climate Guard API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();