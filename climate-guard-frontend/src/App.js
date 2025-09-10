import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Users, BarChart3, MapPin, Bell, Phone, Mail, User, Lock, Building, Clock, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProfilePage from './pages/ProfilePage';
import SolarMonitoringPage from './pages/SolarMonitoringPage';
import HomePage from './pages/HomePage';
import WeatherPage from './pages/WeatherPage';

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [news, setNews] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [showAllNews, setShowAllNews] = useState(false);
  const [currentPage, setCurrentPage] = useState(localStorage.getItem('currentPage') || 'home');

  useEffect(() => {
    if (currentPage === 'redirectPage') {
      // Redirect from homepage to desired page, e.g., 'home'
      setCurrentPage('home');
    }
  }, [currentPage]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    region: '',
    phone: ''
  });

  // API Configuration
  const API_KEYS = {
    newsapi: 'b468f67191a64464a13a8d934dad9318',
    newsdata: 'pub_9f11a2dbd2b84a66b7a644670df25464'
  };

  // Mock news data - fallback when APIs fail
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
    },
    {
      title: "Record solar energy generation reported across western states",
      description: "Clear skies boost renewable energy production by 18% this month",
      publishedAt: "2025-08-31T16:45:00Z",
      url: "#",
      source: { name: "Ministry of New & Renewable Energy" }
    },
    {
      title: "Drought relief: Monsoon rains revive agriculture in Maharashtra",
      description: "Farmers report improved soil moisture levels after delayed monsoon",
      publishedAt: "2025-08-31T14:20:00Z",
      url: "#",
      source: { name: "Agriculture Ministry" }
    },
    {
      title: "Heat wave warning: Northern plains to experience extreme temperatures",
      description: "Health advisory issued as mercury expected to cross 47°C mark",
      publishedAt: "2025-08-30T11:30:00Z",
      url: "#",
      source: { name: "India Meteorological Department" }
    },
    {
      title: "Flood management: Smart early warning systems deployed in Assam",
      description: "Technology integration helps reduce flood impact in vulnerable areas",
      publishedAt: "2025-08-30T09:15:00Z",
      url: "#",
      source: { name: "Disaster Management Authority" }
    }
  ];

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
    fetchNews();
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) =>
        prevIndex >= news.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  // Function to test backend connection
  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      console.log('Backend connection successful:', data);
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Backend server is not running! Please start the backend server on port 5000');
    }
  };

  // Fetch weather and disaster news
  const fetchNews = async () => {
    setLoading(true);
    try {
      let fetchedNews = [];

      // Specific weather/climate keywords for better filtering
      const weatherKeywords = [
        'weather', 'climate', 'monsoon', 'rainfall', 'temperature', 'humidity',
        'solar', 'disaster', 'cyclone', 'flood', 'drought', 'heatwave',
        'IMD', 'Indian Meteorological', 'NDMA', 'thunderstorm', 'lightning',
        'earthquake', 'tsunami', 'landslide', 'fog', 'smog', 'air quality'
      ];

      // Try NewsAPI first - this usually works best
      try {
        const query = `(weather OR climate OR monsoon OR rainfall OR disaster OR cyclone OR flood OR drought OR IMD) AND India`;
        const newsApiResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEYS.newsapi}`
        );

        if (newsApiResponse.ok) {
          const newsApiData = await newsApiResponse.json();
          if (newsApiData.articles && newsApiData.articles.length > 0) {
            // Filter articles to only weather/climate related
            const filteredArticles = newsApiData.articles.filter(article => {
              const titleLower = (article.title || '').toLowerCase();
              const descLower = (article.description || '').toLowerCase();
              return weatherKeywords.some(keyword =>
                titleLower.includes(keyword.toLowerCase()) ||
                descLower.includes(keyword.toLowerCase())
              );
            });
            fetchedNews = [...fetchedNews, ...filteredArticles.slice(0, 15)];
          }
        } else {
          console.log(`NewsAPI error: ${newsApiResponse.status} - Check API key or quota`);
        }
      } catch (error) {
        console.log('NewsAPI failed:', error.message);
      }

      // Try NewsData API as backup - only if we have very few articles
      if (fetchedNews.length < 5) {
        try {
          const newsdataResponse = await fetch(
            `https://newsdata.io/api/1/news?apikey=${API_KEYS.newsdata}&q=weather&country=in&language=en&size=10`
          );

          if (newsdataResponse.ok) {
            const newsdataData = await newsdataResponse.json();
            if (newsdataData.results && newsdataData.results.length > 0) {
              const formattedArticles = newsdataData.results
                .filter(article => {
                  const titleLower = (article.title || '').toLowerCase();
                  const descLower = (article.description || article.content || '').toLowerCase();
                  return weatherKeywords.some(keyword =>
                    titleLower.includes(keyword.toLowerCase()) ||
                    descLower.includes(keyword.toLowerCase())
                  );
                })
                .map(article => ({
                  title: article.title,
                  description: article.description || article.content,
                  publishedAt: article.pubDate,
                  url: article.link,
                  source: { name: article.source_id || 'News Source' }
                }));
              fetchedNews = [...fetchedNews, ...formattedArticles.slice(0, 10 - fetchedNews.length)];
            }
          } else {
            console.log(`NewsData error: ${newsdataResponse.status} - Check API key or quota`);
          }
        } catch (error) {
          console.log('NewsData failed:', error.message);
        }
      }

      // Remove duplicates based on title
      const uniqueNews = fetchedNews.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
      );

      // Sort by date (newest first)
      uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // If we got news from APIs, use it; otherwise fallback to mock
      if (uniqueNews.length > 0) {
        setAllNews(uniqueNews);
        setNews(uniqueNews.slice(0, 6));
        console.log(`Successfully fetched ${uniqueNews.length} weather news articles`);
      } else {
        setAllNews(mockNews);
        setNews(mockNews);
        console.log('Using mock data - no API articles available');
      }

    } catch (error) {
      console.error('Error fetching news:', error);
      setAllNews(mockNews);
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    console.log('Form submission started');
    console.log('Form data:', formData);
   
    if (!isLogin) {
      // Registration validation
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        alert('Please fill in all required fields');
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `http://localhost:5000${endpoint}`;
     
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            department: formData.department || null,
            region: formData.region,
            phone: formData.phone
          };

      console.log('Sending request to:', url);
      console.log('Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (isLogin) {
        // Store user data and redirect to home page
        setUser(data.user);
        setIsAuthenticated(true);
        setCurrentPage('home');
        // Store in localStorage for persistence
        localStorage.setItem('token', data.token || 'dummy-token');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('currentPage', 'home');
        alert(`Login successful! Welcome ${data.user?.name || 'User'}`);
        setShowAuthModal(false);
        resetForm();
      } else {
        alert(`Registration successful! Welcome ${data.user?.name || formData.name}. You can now login.`);
        setIsLogin(true);
        resetForm();
      }
    } catch (error) {
      console.error('Frontend Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      region: '',
      phone: ''
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('home');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
  };

  // Logout handler for ProfilePage
  const handleLogout = () => {
    logout();
  };

  // Save currentPage to localStorage on change
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Save user and auth state to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('token', 'dummy-token'); // Replace with real token if available
    } else {
      localStorage.removeItem('token');
    }
  }, [isAuthenticated]);

  // Navigation Component for authenticated users with role-based access
  const NavigationMenu = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getAvailablePages = () => {
      const role = user?.role;
      // Base pages without profile
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

      // Always add profile at the end
      pages.push('profile');

      return pages;
    };

    const availablePages = getAvailablePages();

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

    const handlePageChange = (page) => {
      setCurrentPage(page);
      setIsDropdownOpen(false);
    };

    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Climate Guard</span>
            </div>

            {/* Dropdown Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <span className="mr-2">Menu</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {availablePages.map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
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
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overlay to close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          ></div>
        )}
      </nav>
    );
  };

  // Home Page (after login)
  const HomePage = () => (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Climate Guard Home</h1>
          <p className="text-gray-600">Your personalized climate intelligence platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-800">Today's Weather</h3>
            <p className="text-2xl font-bold text-blue-600">28°C</p>
            <p className="text-sm text-gray-500">Partly Cloudy</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800">Rainfall</h3>
            <p className="text-2xl font-bold text-green-600">15mm</p>
            <p className="text-sm text-gray-500">Last 24 hours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-800">Humidity</h3>
            <p className="text-2xl font-bold text-yellow-600">68%</p>
            <p className="text-sm text-gray-500">Current Level</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-800">Active Alerts</h3>
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-500">In your region</p>
          </div>
        </div>

        {/* Recent News Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Latest Climate News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 6).map((article, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {article.source?.name}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {article.description}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read More <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );





  // Reports Page with Charts and Weather Cards
  const ReportsPage = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchWeatherData = async () => {
        try {
          // Fetch current weather
          const currentResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true&timezone=Asia/Kolkata"
          );

          if (!currentResponse.ok) {
            throw new Error('Failed to fetch current weather');
          }

          const currentData = await currentResponse.json();

          // Generate mock historical data for charts (in real app, this would come from database)
          const mockHistoricalData = [];
          const baseTemp = currentData.current_weather.temperature;
          const baseHumidity = 65;
          const baseWind = currentData.current_weather.windspeed;

          for (let i = 23; i >= 0; i--) {
            const hour = new Date();
            hour.setHours(hour.getHours() - i);

            mockHistoricalData.push({
              time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              temperature: Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10,
              humidity: Math.round((baseHumidity + (Math.random() - 0.5) * 20) * 10) / 10,
              windSpeed: Math.round((baseWind + (Math.random() - 0.5) * 5) * 10) / 10,
            });
          }

          setWeatherData({
            current: {
              temp: currentData.current_weather.temperature,
              wind: currentData.current_weather.windspeed,
              weathercode: currentData.current_weather.weathercode,
              time: currentData.current_weather.time
            },
            historical: mockHistoricalData
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchWeatherData();
    }, []);

    const getWeatherIcon = (code) => {
      if (code === 0) return "☀️";
      if (code <= 3) return "⛅";
      if (code <= 48) return "☁️";
      if (code <= 67) return "🌧️";
      if (code <= 77) return "❄️";
      return "🌤️";
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Weather Reports & Analytics</h1>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading weather data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {weatherData && (
            <>
              {/* Current Weather Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Current Temperature</h3>
                      <p className="text-3xl font-bold text-blue-600">{weatherData.current.temp}°C</p>
                      <p className="text-sm text-gray-500">Delhi, India</p>
                    </div>
                    <div className="text-4xl">{getWeatherIcon(weatherData.current.weathercode)}</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Wind Speed</h3>
                      <p className="text-3xl font-bold text-green-600">{weatherData.current.wind} km/h</p>
                      <p className="text-sm text-gray-500">10m height</p>
                    </div>
                    <div className="text-4xl">🌬️</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Last Updated</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {new Date(weatherData.current.time).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-500">Real-time data</p>
                    </div>
                    <div className="text-4xl">📡</div>
                  </div>
                </div>
              </div>

              {/* Weather Charts */}
              <div className="grid lg:grid-cols-1 gap-8">
                {/* Temperature Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">🌡 Temperature Trend (Last 24 Hours)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weatherData.historical}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip
                        formatter={(value) => [`${value}°C`, 'Temperature']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Humidity Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">💧 Humidity Trend (Last 24 Hours)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weatherData.historical}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Humidity']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Wind Speed Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">🌬️ Wind Speed Trend (Last 24 Hours)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weatherData.historical}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 'dataMax + 5']} />
                      <Tooltip
                        formatter={(value) => [`${value} km/h`, 'Wind Speed']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="windSpeed"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Summary */}
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">📈 Data Summary</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Temperature Range</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.min(...weatherData.historical.map(d => d.temperature))}° - {Math.max(...weatherData.historical.map(d => d.temperature))}°C
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Avg Humidity</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(weatherData.historical.reduce((sum, d) => sum + d.humidity, 0) / weatherData.historical.length)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Max Wind Speed</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {Math.max(...weatherData.historical.map(d => d.windSpeed))} km/h
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Data Points</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {weatherData.historical.length}
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

  // Agriculture Page
  const AgriculturePage = () => (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Agriculture Insights</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Crop Health Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>Rice</span>
                <span className="font-semibold text-green-600">Excellent (92%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span>Wheat</span>
                <span className="font-semibold text-yellow-600">Good (78%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>Cotton</span>
                <span className="font-semibold text-red-600">Alert (45%)</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recommendations</h2>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="text-sm">Optimal time for rice sowing in your region</p>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <p className="text-sm">Increase irrigation for cotton fields</p>
              </div>
              <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                <p className="text-sm">Monitor pest activity in wheat crops</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Alerts Page with Threshold Settings
  const AlertsPage = () => {
    const [thresholds, setThresholds] = useState({
      temp: 35,
      humidity: 30,
      wind: 50,
    });
    const [currentWeather, setCurrentWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchCurrentWeather = async () => {
        try {
          const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true&hourly=relative_humidity_2m&timezone=Asia/Kolkata"
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }

          const data = await response.json();

          setCurrentWeather({
            temp: data.current_weather.temperature,
            humidity: data.hourly.relative_humidity_2m[0],
            wind: data.current_weather.windspeed,
            time: data.current_weather.time
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchCurrentWeather();
    }, []);

    const handleThresholdChange = (type, value) => {
      setThresholds(prev => ({
        ...prev,
        [type]: parseFloat(value) || 0
      }));
    };

    const getAlerts = () => {
      if (!currentWeather) return [];

      const alerts = [];

      if (currentWeather.temp > thresholds.temp) {
        alerts.push({
          type: 'danger',
          title: '🚨 High Temperature Alert',
          message: `Current temperature ${currentWeather.temp}°C exceeds threshold of ${thresholds.temp}°C`,
          icon: '🌡️'
        });
      }

      if (currentWeather.humidity < thresholds.humidity) {
        alerts.push({
          type: 'warning',
          title: '⚠️ Low Humidity Alert',
          message: `Current humidity ${currentWeather.humidity}% is below threshold of ${thresholds.humidity}%`,
          icon: '💧'
        });
      }

      if (currentWeather.wind > thresholds.wind) {
        alerts.push({
          type: 'danger',
          title: '🌪️ Strong Wind Alert',
          message: `Current wind speed ${currentWeather.wind} km/h exceeds threshold of ${thresholds.wind} km/h`,
          icon: '🌬️'
        });
      }

      return alerts;
    };

    const alerts = getAlerts();
    const hasAlerts = alerts.length > 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🚨 Alerts & Notifications</h1>

          {/* Current Weather Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Current Weather Status</h2>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading current weather...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error}
              </div>
            )}

            {currentWeather && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🌡️</div>
                  <h3 className="font-semibold">Temperature</h3>
                  <p className="text-xl font-bold text-blue-600">{currentWeather.temp}°C</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">💧</div>
                  <h3 className="font-semibold">Humidity</h3>
                  <p className="text-xl font-bold text-green-600">{currentWeather.humidity}%</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">🌬️</div>
                  <h3 className="font-semibold">Wind Speed</h3>
                  <p className="text-xl font-bold text-yellow-600">{currentWeather.wind} km/h</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold">Last Updated</h3>
                  <p className="text-sm font-bold text-purple-600">
                    {new Date(currentWeather.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Threshold Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">⚙️ Alert Threshold Settings</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature Threshold (°C)
                </label>
                <input
                  type="number"
                  value={thresholds.temp}
                  onChange={(e) => handleThresholdChange('temp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="60"
                  step="0.5"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when temperature exceeds this value</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Humidity Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.humidity}
                  onChange={(e) => handleThresholdChange('humidity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when humidity drops below this value</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wind Speed Threshold (km/h)
                </label>
                <input
                  type="number"
                  value={thresholds.wind}
                  onChange={(e) => handleThresholdChange('wind', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="200"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when wind speed exceeds this value</p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">📢 Active Alerts</h2>

            {!hasAlerts ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">All Conditions Normal</h3>
                <p className="text-gray-600">No alerts triggered. All weather parameters are within safe thresholds.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-lg ${
                      alert.type === 'danger'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-yellow-50 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{alert.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          alert.type === 'danger' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`mt-1 ${
                          alert.type === 'danger' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Triggered at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alert History */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📋 Alert History</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">High Temperature Alert (36°C)</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">Low Humidity Alert (28%)</span>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">Strong Wind Alert (55 km/h)</span>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Recommendations Page with Smart Crop Advice
  const RecommendationsPage = () => {
    const [currentWeather, setCurrentWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchWeatherForRecommendations = async () => {
        try {
          const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true&hourly=relative_humidity_2m&timezone=Asia/Kolkata"
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }

          const data = await response.json();

          setCurrentWeather({
            temp: data.current_weather.temperature,
            humidity: data.hourly.relative_humidity_2m[0],
            wind: data.current_weather.windspeed,
            time: data.current_weather.time
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchWeatherForRecommendations();
    }, []);

    const getSmartRecommendations = () => {
      if (!currentWeather) return [];

      const recommendations = [];
      const { temp, humidity, wind } = currentWeather;

      // Temperature-based recommendations
      if (temp > 35) {
        recommendations.push({
          type: 'warning',
          title: '🌡️ High Temperature Alert',
          message: 'Current temperature is above 35°C. Consider heat stress management for crops.',
          actions: [
            'Provide shade for young plants',
            'Increase irrigation frequency',
            'Apply mulch to retain soil moisture',
            'Consider heat-tolerant crop varieties'
          ],
          priority: 'high'
        });
      } else if (temp < 15) {
        recommendations.push({
          type: 'info',
          title: '❄️ Low Temperature Warning',
          message: 'Temperature is below 15°C. Monitor for frost damage.',
          actions: [
            'Cover sensitive crops with frost cloth',
            'Delay planting frost-sensitive crops',
            'Use row covers for protection',
            'Monitor soil temperature'
          ],
          priority: 'medium'
        });
      }

      // Humidity-based recommendations
      if (humidity < 30) {
        recommendations.push({
          type: 'danger',
          title: '💧 Low Humidity Risk',
          message: 'Humidity is below 30%. Risk of drought stress and plant dehydration.',
          actions: [
            'Increase irrigation immediately',
            'Apply organic mulch to conserve moisture',
            'Use drip irrigation systems',
            'Consider drought-resistant crop varieties',
            'Monitor soil moisture levels regularly'
          ],
          priority: 'high'
        });
      } else if (humidity > 80) {
        recommendations.push({
          type: 'warning',
          title: '🌿 High Humidity Conditions',
          message: 'High humidity may increase disease risk.',
          actions: [
            'Improve air circulation around plants',
            'Avoid overhead watering',
            'Apply preventive fungicides if needed',
            'Space plants adequately'
          ],
          priority: 'medium'
        });
      }

      // Wind-based recommendations
      if (wind > 40) {
        recommendations.push({
          type: 'warning',
          title: '🌪️ Strong Wind Advisory',
          message: 'Wind speed exceeds 40 km/h. Secure outdoor equipment and protect plants.',
          actions: [
            'Secure greenhouse structures',
            'Stake tall plants and trees',
            'Protect young seedlings',
            'Store loose equipment indoors',
            'Check irrigation systems for wind damage'
          ],
          priority: 'high'
        });
      }

      // Optimal conditions
      if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70 && wind <= 20) {
        recommendations.push({
          type: 'success',
          title: '✅ Optimal Growing Conditions',
          message: 'Current weather conditions are ideal for most crops.',
          actions: [
            'Excellent time for planting and transplanting',
            'Good conditions for pest management',
            'Optimal for fertilizer application',
            'Favorable for field operations'
          ],
          priority: 'low'
        });
      }

      return recommendations;
    };

    const recommendations = getSmartRecommendations();

    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🌱 Smart Crop Recommendations</h1>

          {/* Current Weather Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Current Weather Conditions</h2>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Analyzing weather conditions...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error}
              </div>
            )}

            {currentWeather && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🌡️</div>
                  <h3 className="font-semibold">Temperature</h3>
                  <p className="text-xl font-bold text-blue-600">{currentWeather.temp}°C</p>
                  <p className="text-xs text-gray-500">Current</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">💧</div>
                  <h3 className="font-semibold">Humidity</h3>
                  <p className="text-xl font-bold text-green-600">{currentWeather.humidity}%</p>
                  <p className="text-xs text-gray-500">Relative</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">🌬️</div>
                  <h3 className="font-semibold">Wind Speed</h3>
                  <p className="text-xl font-bold text-yellow-600">{currentWeather.wind} km/h</p>
                  <p className="text-xs text-gray-500">10m height</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold">Analysis</h3>
                  <p className="text-sm font-bold text-purple-600">AI-Powered</p>
                  <p className="text-xs text-gray-500">Real-time</p>
                </div>
              </div>
            )}
          </div>

          {/* Smart Recommendations */}
          <div className="space-y-6">
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Analyzing Conditions</h3>
                <p className="text-gray-500">Please wait while we analyze current weather conditions...</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    rec.type === 'danger' ? 'border-red-500' :
                    rec.type === 'warning' ? 'border-yellow-500' :
                    rec.type === 'success' ? 'border-green-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <span className="text-2xl">{rec.title.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          rec.type === 'danger' ? 'text-red-800' :
                          rec.type === 'warning' ? 'text-yellow-800' :
                          rec.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {rec.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className={`mb-4 ${
                        rec.type === 'danger' ? 'text-red-700' :
                        rec.type === 'warning' ? 'text-yellow-700' :
                        rec.type === 'success' ? 'text-green-700' :
                        'text-blue-700'
                      }`}>
                        {rec.message}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span className="text-sm text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Additional Resources */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">📚 Additional Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Crop Calendar</h3>
                <p className="text-sm text-gray-600 mb-2">Seasonal planting guide for major crops</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Calendar →
                </button>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Pest Management</h3>
                <p className="text-sm text-gray-600 mb-2">Weather-based pest prediction and control</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render different pages based on authentication and current page
  if (isAuthenticated && user) {
    switch (currentPage) {
      case 'home':
        return <HomePage
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />;
      case 'weather':
        return <WeatherPage
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />;
      case 'profile':
        return <ProfilePage
          user={user}
          setUser={setUser}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />;
      case 'reports':
        return <ReportsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'agriculture':
        return <AgriculturePage />;
      case 'solar_monitoring':
        return <SolarMonitoringPage
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />;
      default:
        return <HomePage />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Debug Panel - Remove this in production */}
      <div className="bg-yellow-100 p-2 text-xs">
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Climate Guard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Login / Signup
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breaking News Ticker */}
      <section className="bg-red-600 text-white py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <div className="bg-white text-red-600 px-3 py-1 rounded font-bold text-sm mr-4 flex-shrink-0">
              LATEST UPDATES
            </div>
            <div className="flex-1 overflow-hidden">
              {news.length > 0 && (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="text-sm font-medium">
                    🚨 {news[currentNewsIndex]?.title} - {news[currentNewsIndex]?.source?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Weather Monitoring &
            <span className="text-blue-600"> Climate Decision Support System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering government agencies, farmers, and communities with real-time weather data,
            AI-powered predictions, and automated alerts for climate-smart decision making.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-200"
            >
              Get Started
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold transition duration-200">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Comprehensive Climate Intelligence Platform
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Disaster Management</h3>
              <p className="text-gray-600">
                Early warning systems for floods, cyclones, heatwaves, and droughts.
                Automated SMS/WhatsApp alerts to protect lives and property.
              </p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <BarChart3 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Agriculture Analytics</h3>
              <p className="text-gray-600">
                Crop yield forecasting, optimal sowing time recommendations,
                and pest outbreak predictions using AI/ML models.
              </p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <Cloud className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Renewable Energy</h3>
              <p className="text-gray-600">
                Solar and wind power forecasting to optimize renewable energy
                generation and support grid management decisions.
              </p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <MapPin className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Urban Planning</h3>
              <p className="text-gray-600">
                Heat zone mapping, water resource management, and infrastructure
                planning based on climate data and trends.
              </p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <Users className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Multi-language Support</h3>
              <p className="text-gray-600">
                AI chatbot in Tamil, Hindi, and English. Citizen-friendly
                interfaces for farmers and rural communities.
              </p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition duration-200">
              <Bell className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Policy Insights</h3>
              <p className="text-gray-600">
                Climate change analytics, policy reports, and decision-support
                tools for government planning and resource allocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Government Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Serving India's Climate Resilience</h2>
            <p className="text-xl text-blue-200">Integrated with national weather infrastructure</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Real-time Monitoring</div>
              <div className="text-sm text-blue-300 mt-1">Connected to IMD & ISRO</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Prediction Accuracy</div>
              <div className="text-sm text-blue-300 mt-1">AI/ML powered forecasts</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">28</div>
              <div className="text-blue-200">States Covered</div>
              <div className="text-sm text-blue-300 mt-1">Pan-India deployment</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">3</div>
              <div className="text-blue-200">Languages</div>
              <div className="text-sm text-blue-300 mt-1">Hindi, English, Tamil</div>
            </div>
          </div>
        </div>
      </section>

      {/* Government Integration */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Integrated Government Solutions
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-900">
                Connected to National Infrastructure
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">IMD Integration</h4>
                    <p className="text-gray-600 text-sm">Direct connection to Indian Meteorological Department weather stations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">ISRO Satellite Data</h4>
                    <p className="text-gray-600 text-sm">Real-time satellite imagery and climate monitoring</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">NDMA Coordination</h4>
                    <p className="text-gray-600 text-sm">Seamless disaster management and emergency response</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Key Capabilities</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Multi-language farmer chatbot (AI-powered)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Automated threshold-based alerts via SMS/Email
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Renewable energy potential mapping
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Policy decision support analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Climate change impact assessment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Latest Weather & Climate News
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 6).map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {article.source?.name}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllNews(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
            >
              View All News ({allNews.length} articles)
            </button>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Built for Government & Citizens
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="bg-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Government Agencies</h3>
              <p className="text-sm text-gray-600">Meteorology, Agriculture, Energy, Disaster Management Departments</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Field Officers</h3>
              <p className="text-sm text-gray-600">Village officers, agricultural extension workers, ground staff</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Farmers</h3>
              <p className="text-sm text-gray-600">Crop planning, irrigation alerts, yield optimization guidance</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Researchers</h3>
              <p className="text-sm text-gray-600">Climate data analysis, policy research, academic studies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Climate Guard</h3>
              <p className="text-gray-400">
                Advanced weather monitoring and climate decision support
                for sustainable governance and agriculture.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Weather Reports</a></li>
                <li><a href="#" className="hover:text-white">Agriculture Insights</a></li>
                <li><a href="#" className="hover:text-white">Emergency Alerts</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+91-XXX-XXX-XXXX</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@climateguard.gov.in</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Climate Guard. Built for Government of India. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? 'Login to Climate Guard' : 'Create Account'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select your role</option>
                        <option value="admin">System Administrator</option>
                        <option value="government_officer">Government Officer</option>
                        <option value="field_officer">Field Officer</option>
                        <option value="farmer">Farmer</option>
                        <option value="researcher">Researcher/Analyst</option>
                      </select>
                    </div>

                    {(formData.role === 'government_officer' || formData.role === 'field_officer') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select department</option>
                          <option value="IMD">Meteorological Department (IMD)</option>
                          <option value="Agriculture">Agriculture Department</option>
                          <option value="Energy">Energy Department</option>
                          <option value="NDMA">Disaster Management (NDMA)</option>
                          <option value="Environment">Environment & Forest</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region/District *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          placeholder="e.g., Madurai, Tamil Nadu"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@gov.in"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter secure password"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-200"
                >
                  {isLogin ? 'Login' : 'Create Account'}
                </button>

                <div className="mt-6 text-center">
                  <span className="text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {isLogin ? 'Sign up' : 'Login'}
                  </button>
                </div>

                {!isLogin && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Government officials may require admin approval.
                      Contact your IT department for access credentials.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default App;
