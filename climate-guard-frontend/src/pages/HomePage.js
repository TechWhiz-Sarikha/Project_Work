import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Users, BarChart3, MapPin, Bell, Phone, Mail, User, Lock, Building, Clock, ExternalLink } from 'lucide-react';

const HomePage = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const [news, setNews] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [showAllNews, setShowAllNews] = useState(false);

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
                onClick={onLogout}
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

    checkBackendConnection();
    setAllNews(mockNews);
    setNews(mockNews);
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) =>
        prevIndex >= news.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  return (
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
};

export default HomePage;
