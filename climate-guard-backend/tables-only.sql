-- Climate Guard Database Tables Only (without CREATE DATABASE)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('government_officer', 'farmer', 'researcher', 'admin') NOT NULL,
    department VARCHAR(100),
    region VARCHAR(100),
    district VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Weather Stations Table
CREATE TABLE IF NOT EXISTS weather_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    elevation DECIMAL(8, 2),
    district VARCHAR(100),
    state VARCHAR(100),
    region VARCHAR(100),
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    installation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Data Table
CREATE TABLE IF NOT EXISTS weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    pressure DECIMAL(7, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction DECIMAL(5, 2),
    rainfall DECIMAL(7, 2),
    uv_index DECIMAL(4, 2),
    visibility DECIMAL(6, 2),
    recorded_at TIMESTAMP NOT NULL,
    data_quality ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES weather_stations(id) ON DELETE CASCADE,
    INDEX idx_station_time (station_id, recorded_at),
    INDEX idx_recorded_at (recorded_at)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('heatwave', 'cold_wave', 'heavy_rain', 'drought', 'cyclone', 'thunderstorm', 'fog') NOT NULL,
    severity ENUM('low', 'moderate', 'high', 'extreme') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    affected_regions JSON,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    issued_by VARCHAR(100),
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Government Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    ministry VARCHAR(100),
    description TEXT,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regions/Districts Table
CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    region_code VARCHAR(20) UNIQUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INT,
    area_sq_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disaster Reports Table
CREATE TABLE IF NOT EXISTS disaster_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('flood', 'drought', 'cyclone', 'heatwave', 'landslide', 'earthquake', 'other') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    severity ENUM('minor', 'moderate', 'major', 'severe') NOT NULL,
    casualties INT DEFAULT 0,
    property_damage DECIMAL(15, 2),
    affected_population INT,
    reported_by INT,
    verified_by INT,
    status ENUM('reported', 'investigating', 'verified', 'resolved') DEFAULT 'reported',
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Sample Data Insertion

-- Insert Sample Departments
INSERT IGNORE INTO departments (name, code, ministry, description) VALUES
('India Meteorological Department', 'IMD', 'Ministry of Earth Sciences', 'National weather forecasting and monitoring'),
('National Disaster Management Authority', 'NDMA', 'Ministry of Home Affairs', 'Disaster management and response'),
('Department of Agriculture', 'DOA', 'Ministry of Agriculture', 'Agricultural development and farmer welfare'),
('State Emergency Operations Center', 'SEOC', 'State Government', 'State-level emergency coordination');

-- Insert Sample Regions
INSERT IGNORE INTO regions (region_name, state, district, region_code, latitude, longitude) VALUES
('Chennai', 'Tamil Nadu', 'Chennai', 'TN_CHE', 13.0827, 80.2707),
('Madurai', 'Tamil Nadu', 'Madurai', 'TN_MDU', 9.9252, 78.1198),
('Coimbatore', 'Tamil Nadu', 'Coimbatore', 'TN_COI', 11.0168, 76.9558),
('Salem', 'Tamil Nadu', 'Salem', 'TN_SAL', 11.6643, 78.1460),
('Tiruchirappalli', 'Tamil Nadu', 'Tiruchirappalli', 'TN_TRI', 10.7905, 78.7047);

-- Insert Sample Weather Stations
INSERT IGNORE INTO weather_stations (station_name, station_code, latitude, longitude, elevation, district, state, region) VALUES
('Chennai Meenambakkam', 'CHE_MEEN', 12.9851, 80.1809, 16.0, 'Chennai', 'Tamil Nadu', 'South'),
('Madurai Airport', 'MDU_AIRP', 9.8344, 78.0932, 140.0, 'Madurai', 'Tamil Nadu', 'South'),
('Coimbatore Peelamedu', 'COI_PEEL', 11.0410, 76.9734, 427.0, 'Coimbatore', 'Tamil Nadu', 'South'),
('Salem Collectorate', 'SAL_COLL', 11.6643, 78.1460, 278.0, 'Salem', 'Tamil Nadu', 'South'),
('Tiruchirappalli Central', 'TRI_CENT', 10.7905, 78.7047, 88.0, 'Tiruchirappalli', 'Tamil Nadu', 'South');

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_weather_data_station_time ON weather_data(station_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_status ON alerts(severity, status);
CREATE INDEX IF NOT EXISTS idx_users_role_region ON users(role, region);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_type_severity ON disaster_reports(report_type, severity);
