#!/usr/bin/env node

/**
 * Climate Guard Database Setup Script
 * This script helps set up the MySQL database for the Climate Guard application
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Climate Guard Database Setup');
    console.log('================================');

    // Database configuration
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    try {
        // Connect to MySQL server (without specifying database)
        console.log('📡 Connecting to MySQL server...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server successfully');

        // Create database if it doesn't exist
        console.log('🏗️  Creating database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS climate_guard');
        console.log('✅ Database created successfully');

        // Switch to the climate_guard database
        await connection.query('USE climate_guard');

        // Read and execute schema file
        console.log('📄 Reading database schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Executing database schema...');
        await connection.query(schemaSQL);
        console.log('✅ Database schema executed successfully');

        // Close connection
        await connection.end();
        console.log('🔌 Database connection closed');

        console.log('');
        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update your .env file with correct MySQL credentials');
        console.log('2. Run: npm start');
        console.log('3. Test the API at: http://localhost:5000/api/health');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('1. Make sure MySQL is running');
        console.log('2. Check your MySQL credentials in .env file');
        console.log('3. Ensure you have CREATE DATABASE permissions');
        process.exit(1);
    }
}

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('⚠️  .env file not found. Creating template...');
    const envTemplate = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=climate_guard

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# API Keys (for future use)
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key

# Email Configuration (for future use)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password`;

    fs.writeFileSync(path.join(__dirname, '.env'), envTemplate);
    console.log('✅ .env template created. Please update with your MySQL credentials.');
    console.log('');
}

// Run setup if this script is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
