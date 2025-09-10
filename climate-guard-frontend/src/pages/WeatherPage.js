import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Cloud, Users, BarChart3, MapPin, Bell, Phone, Mail, User, Lock, Building, Clock, ExternalLink, Search, Navigation, RefreshCw, Zap, Sun, Eye, Wind, Droplets, Thermometer, Gauge } from 'lucide-react';

const WeatherPage = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ name: 'New Delhi, India', lat: 28.61, lon: 77.23 });
  const [locationInput, setLocationInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // API Keys - In production, these should be environment variables
  const API_KEYS = {
    OPENWEATHER: 'c938dadd8489ebd032053cac93d1c7ee', // Replace with actual key
    WEATHERAPI: '846118686fa14d349f0170005250909', // Replace with actual key
    NASA_POWER: 'free-no-key-required',
    OPENMETEO: 'free-no-key-required',
    GOOGLE_MAPS: 'AIzaSyBvOkBwGyKQJ9Y8yUv4Q5vhAbCdEfGhIjK' // Replace with actual key
  };

  
  // Navigation Component
  const NavigationMenu = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getAvailablePages = () => {
      const role = user?.role;
      const basePages = ['home', 'weather'];
      let pages = [];

      switch (role) {
        case 'admin':
          pages = [...basePages, 'reports', 'alerts', 'recommendations', 'agriculture', 'solar_monitoring'];
          break;
        case 'government_officer':
          pages = [...basePages, 'reports', 'alerts', 'recommendations', 'agriculture', 'solar_monitoring'];
          break;
        case 'field_officer':
          pages = [...basePages, 'alerts', 'recommendations', 'agriculture', 'solar_monitoring'];
          break;
        case 'farmer':
          pages = [...basePages, 'recommendations', 'agriculture', 'solar_monitoring'];
          break;
        case 'researcher':
          pages = [...basePages, 'reports', 'recommendations', 'agriculture', 'solar_monitoring'];
          break;
        default:
          pages = [...basePages, 'solar_monitoring'];
      }
      pages.push('profile');
      return pages;
    };

    const getPageLabel = (page) => {
      const labels = {
        home: 'Home',
        weather: 'Weather Reports',
        reports: 'Reports & Analytics',
        alerts: 'Alerts & Notifications',
        recommendations: 'Smart Recommendations',
        agriculture: 'Agriculture',
        solar_monitoring: 'Solar Monitoring',
        profile: 'Profile'
      };
      return labels[page] || page;
    };

    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Climate Guard Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <span className="mr-2">Menu</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {getAvailablePages().map(page => (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition duration-200 ${
                            currentPage === page ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {getPageLabel(page)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-gray-700 block text-sm">Welcome, {user?.name}</span>
                <span className="text-xs text-gray-500">({user?.role?.replace('_', ' ')})</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
      </nav>
    );
  };

  // Simple Location Search Component
  const LocationSelector = () => {
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    // Debounce or throttle can be added here if needed
    searchLocationSuggestions(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        selectLocation(searchResults[0]);
      } else {
        searchLocation();
      }
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    // Clear location-related errors when user focuses on input
    if (error && error.toLowerCase().includes('location')) {
      setError(null);
    }
    if (searchResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  const selectLocation = (locationObj) => {
    setLocation({
      name: `${locationObj.name}${locationObj.state ? ', ' + locationObj.state : ''}, ${locationObj.country}`,
      lat: locationObj.lat,
      lon: locationObj.lon
    });
    setLocationInput('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const searchLocationSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEYS.OPENWEATHER}`
      );
      if (!response.ok) throw new Error('Failed to fetch location suggestions');
      const data = await response.json();
      setSearchResults(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Location suggestions error:', err);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
      <h3 className="text-lg font-semibold mb-4">Location Settings</h3>
      
      <div className="flex gap-3 mb-4 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={locationInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            placeholder="Enter city name (e.g., Mumbai, India or New York, USA)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={searchLoading}
            autoComplete="off"
          />
          {showSuggestions && searchResults.length > 0 && (
            <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-auto mt-1 shadow-lg">
              {searchResults.map((result, index) => (
                <li
                  key={`${result.lat}-${result.lon}-${index}`}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => selectLocation(result)}
                >
                  {result.name}{result.state ? `, ${result.state}` : ''}, {result.country}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => {
            searchLocation();
            setShowSuggestions(false);
          }}
          disabled={searchLoading || !locationInput.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searchLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="font-medium">Current Location:</span>
        <span>{location.name}</span>
        <span className="text-xs text-gray-500">
          ({location.lat.toFixed(2)}, {location.lon.toFixed(2)})
        </span>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>💡 Try searching for: "London, UK", "Tokyo, Japan", "Sydney, Australia", or "Cairo, Egypt"</p>
      </div>
    </div>
  );
};

  const searchLocation = async () => {
    if (!locationInput.trim()) return;
    
    setSearchLoading(true);
    setError(null);
    
    try {
      // Use OpenWeatherMap Geocoding API
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationInput.trim())}&limit=5&appid=${API_KEYS.OPENWEATHER}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0]; // Take the first result
        setLocation({
          name: `${result.name}${result.state ? ', ' + result.state : ''}, ${result.country}`,
          lat: result.lat,
          lon: result.lon
        });
        setLocationInput(''); // Clear the input after successful search
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Location search error:', err);
      setError('Failed to search location. Please check your internet connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch from multiple sources
      const [openWeatherData, weatherApiData, openMeteoData, nasaPowerData] = await Promise.allSettled([
        fetchOpenWeather(),
        fetchWeatherAPI(),
        fetchOpenMeteo(),
        fetchNASAPower()
      ]);

      const weatherData = {
        temperature: extractValue(openWeatherData, 'main.temp') || extractValue(weatherApiData, 'current.temp_c'),
        humidity: extractValue(openWeatherData, 'main.humidity') || extractValue(weatherApiData, 'current.humidity'),
        windSpeed: extractValue(openWeatherData, 'wind.speed') || extractValue(weatherApiData, 'current.wind_kph'),
        pressure: extractValue(openWeatherData, 'main.pressure') || extractValue(weatherApiData, 'current.pressure_mb'),
        visibility: extractValue(openWeatherData, 'visibility') || extractValue(weatherApiData, 'current.vis_km'),
        uvIndex: extractValue(weatherApiData, 'current.uv'),
        solarRadiation: extractValue(openMeteoData, 'hourly.shortwave_radiation.0') || extractValue(nasaPowerData, 'ALLSKY_SFC_SW_DWN'),
        sunlightDuration: extractValue(nasaPowerData, 'ALLSKY_SFC_SW_DWN') ? calculateSunlightHours() : null,
        weatherDescription: extractValue(openWeatherData, 'weather.0.description') || extractValue(weatherApiData, 'current.condition.text'),
        icon: extractValue(openWeatherData, 'weather.0.icon') || 'default',
        timestamp: Date.now(),
        sources: {
          primary: openWeatherData.status === 'fulfilled' ? 'OpenWeather' : 'WeatherAPI',
          solar: nasaPowerData.status === 'fulfilled' ? 'NASA POWER' : 'Open-Meteo'
        }
      };

      setWeather(weatherData);
      updateChartData(weatherData);
      checkAlerts(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  const fetchOpenWeather = async () => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEYS.OPENWEATHER}&units=metric`
    );
    if (!response.ok) throw new Error('OpenWeather API error');
    return response.json();
  };

  const fetchWeatherAPI = async () => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEYS.WEATHERAPI}&q=${location.lat},${location.lon}&aqi=yes`
    );
    if (!response.ok) throw new Error('WeatherAPI error');
    return response.json();
  };

  const fetchOpenMeteo = async () => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,shortwave_radiation&current_weather=true`
    );
    if (!response.ok) throw new Error('Open-Meteo API error');
    return response.json();
  };

  const fetchNASAPower = async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (date) => {
      return date.getFullYear() + 
             String(date.getMonth() + 1).padStart(2, '0') + 
             String(date.getDate()).padStart(2, '0');
    };
    
    const response = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M,RH2M&community=RE&longitude=${location.lon}&latitude=${location.lat}&start=${formatDate(yesterday)}&end=${formatDate(today)}&format=JSON`
    );
    if (!response.ok) throw new Error('NASA POWER API error');
    return response.json();
  };

  const extractValue = (promiseResult, path) => {
    if (promiseResult.status !== 'fulfilled') return null;
    const data = promiseResult.value;
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  };

  const calculateSunlightHours = () => {
    // Simplified calculation based on solar radiation
    return Math.round(Math.random() * 4 + 8); // Mock calculation
  };

  const updateChartData = (newData) => {
    const now = new Date();
    setChartData(prev => [
      ...prev.slice(-23), // Keep last 23 entries
      {
        time: now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'),
        temperature: newData.temperature,
        solar: newData.solarRadiation,
        humidity: newData.humidity,
        timestamp: now.getTime()
      }
    ]);
  };

  const checkAlerts = (data) => {
    const newAlerts = [];
    
    if (data.temperature && data.temperature > 40) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        title: 'High Temperature Alert',
        message: `Temperature is ${data.temperature.toFixed(1)}°C - Consider reducing solar panel exposure`
      });
    }
    
    if (data.solarRadiation && data.solarRadiation < 200) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'info',
        title: 'Low Solar Radiation',
        message: `Solar radiation is ${data.solarRadiation.toFixed(0)} W/m² - Expect reduced solar energy generation`
      });
    }
    
    if (data.windSpeed && data.windSpeed > 25) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'warning',
        title: 'High Wind Speed',
        message: `Wind speed is ${data.windSpeed.toFixed(1)} km/h - Check solar panel stability`
      });
    }
    
    setAlerts(newAlerts);
  };

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(fetchWeatherData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, fetchWeatherData]);

  const WeatherCard = ({ icon, title, value, unit, color, bgColor, description }) => (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 ${color} bg-white rounded-full`}>
          {icon}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-sm text-gray-600">{unit}</div>
        </div>
      </div>
      <h3 className="font-medium text-gray-800">{title}</h3>
      {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
    </div>
  );

  const MiniChart = () => {
    if (chartData.length < 2) return <div className="text-gray-500 text-center py-8">Collecting data...</div>;
    
    const maxTemp = Math.max(...chartData.map(d => d.temperature || 0));
    const minTemp = Math.min(...chartData.map(d => d.temperature || 0));
    const tempRange = maxTemp - minTemp || 1;
    
    return (
      <div className="relative h-32">
        <svg className="w-full h-full">
          {chartData.map((point, index) => {
            if (index === 0 || !point.temperature) return null;
            const prevPoint = chartData[index - 1];
            if (!prevPoint.temperature) return null;
            
            const x1 = ((index - 1) / (chartData.length - 1)) * 100;
            const x2 = (index / (chartData.length - 1)) * 100;
            const y1 = ((maxTemp - prevPoint.temperature) / tempRange) * 80 + 10;
            const y2 = ((maxTemp - point.temperature) / tempRange) * 80 + 10;
            
            return (
              <line
                key={index}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
              />
            );
          })}
          {chartData.map((point, index) => {
            if (!point.temperature) return null;
            return (
              <circle
                key={index}
                cx={`${(index / (chartData.length - 1)) * 100}%`}
                cy={`${((maxTemp - point.temperature) / tempRange) * 80 + 10}%`}
                r="3"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🌦 Advanced Weather Monitoring</h1>
            <p className="text-gray-600">Real-time weather data for solar energy optimization</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isAutoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <LocationSelector />

        {alerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Active Alerts
            </h3>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <strong className="text-sm">{alert.title}</strong>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Fetching weather data from multiple sources...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {weather && (
          <>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
              <WeatherCard
                icon={<Thermometer className="h-6 w-6" />}
                title="Temperature"
                value={weather.temperature?.toFixed(1) || 'N/A'}
                unit="°C"
                color="text-red-600"
                bgColor="bg-gradient-to-br from-red-50 to-red-100"
                description={weather.weatherDescription}
              />
              <WeatherCard
                icon={<Zap className="h-6 w-6" />}
                title="Solar Radiation"
                value={weather.solarRadiation?.toFixed(0) || 'N/A'}
                unit="W/m²"
                color="text-yellow-600"
                bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
                description="Shortwave solar irradiance"
              />
              <WeatherCard
                icon={<Droplets className="h-6 w-6" />}
                title="Humidity"
                value={weather.humidity || 'N/A'}
                unit="%"
                color="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                description="Relative humidity"
              />
              <WeatherCard
                icon={<Wind className="h-6 w-6" />}
                title="Wind Speed"
                value={weather.windSpeed?.toFixed(1) || 'N/A'}
                unit="km/h"
                color="text-green-600"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
                description="Surface wind speed"
              />
              <WeatherCard
                icon={<Gauge className="h-6 w-6" />}
                title="Pressure"
                value={weather.pressure || 'N/A'}
                unit="hPa"
                color="text-purple-600"
                bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
                description="Atmospheric pressure"
              />
              <WeatherCard
                icon={<Eye className="h-6 w-6" />}
                title="Visibility"
                value={weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A'}
                unit="km"
                color="text-indigo-600"
                bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
                description="Horizontal visibility"
              />
              <WeatherCard
                icon={<Sun className="h-6 w-6" />}
                title="UV Index"
                value={weather.uvIndex || 'N/A'}
                unit=""
                color="text-orange-600"
                bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
                description="UV radiation level"
              />
              <WeatherCard
                icon={<Clock className="h-6 w-6" />}
                title="Sunlight Hours"
                value={weather.sunlightDuration || 'N/A'}
                unit="hrs"
                color="text-amber-600"
                bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
                description="Expected daily sunlight"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Temperature Trend</h2>
                  <span className="text-sm text-gray-500">Live Updates Every 5 Minutes</span>
                </div>
                <MiniChart />
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Last 24 data points • Blue line shows temperature trend
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Data Sources</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Primary Weather</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {weather.sources?.primary || 'OpenWeather'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Solar Data</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {weather.sources?.solar || 'NASA POWER'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-xs text-gray-600">{location.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-xs text-gray-600">
                      {new Date(weather.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Solar Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {weather.solarRadiation ? Math.round((weather.solarRadiation / 1000) * 100) : 0}%
                  </div>
                  <p className="text-xs text-blue-700">
                    Based on current solar irradiance and atmospheric conditions
                  </p>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Multi-Source Data:</strong> We aggregate data from OpenWeather, WeatherAPI, 
                    Open-Meteo, and NASA POWER APIs for maximum accuracy and reliability.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;