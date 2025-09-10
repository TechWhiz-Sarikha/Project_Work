import React, { useState, useEffect } from 'react';
import { AlertTriangle, Sun, Battery, Zap, TrendingUp, TrendingDown, Activity, Settings, RefreshCw, Cloud, Users, BarChart3, MapPin, Bell, Phone, Mail, User, Lock, Building, Clock, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const SolarMonitoringPage = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const [solarData, setSolarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

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

  // Mock solar panel data - replace with real API calls
  const mockSolarData = {
    summary: {
      totalPower: 15.2,
      efficiency: 18.5,
      temperature: 42,
      irradiance: 850,
      dailyGeneration: 185.3,
      monthlyGeneration: 5420.8,
      status: 'optimal'
    },
    panels: [
      { id: 'P001', power: 3.2, voltage: 45.2, current: 7.1, temperature: 41, efficiency: 19.2, status: 'optimal' },
      { id: 'P002', power: 3.1, voltage: 44.8, current: 6.9, temperature: 43, efficiency: 18.8, status: 'warning' },
      { id: 'P003', power: 3.4, voltage: 46.1, current: 7.4, temperature: 40, efficiency: 19.5, status: 'optimal' },
      { id: 'P004', power: 2.8, voltage: 43.5, current: 6.4, temperature: 45, efficiency: 17.2, status: 'error' },
      { id: 'P005', power: 2.7, voltage: 42.9, current: 6.3, temperature: 44, efficiency: 16.8, status: 'warning' }
    ],
    historicalData: [
      { time: '00:00', power: 0, irradiance: 0, temperature: 25 },
      { time: '04:00', power: 0.5, irradiance: 50, temperature: 28 },
      { time: '08:00', power: 8.2, irradiance: 650, temperature: 35 },
      { time: '12:00', power: 15.8, irradiance: 920, temperature: 42 },
      { time: '16:00', power: 12.3, irradiance: 780, temperature: 38 },
      { time: '20:00', power: 2.1, irradiance: 120, temperature: 32 },
      { time: '24:00', power: 0, irradiance: 0, temperature: 28 }
    ]
  };

  useEffect(() => {
    const fetchSolarData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSolarData(mockSolarData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSolarData();
  }, [selectedPanel, timeRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return <Sun className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading solar panel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Error loading solar data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solar Panel Monitoring</h1>
          <p className="text-gray-600">Real-time performance tracking and maintenance alerts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Power Output</h3>
                <p className="text-3xl font-bold text-yellow-600">{solarData.summary.totalPower} kW</p>
                <p className="text-sm text-gray-500">Current generation</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">System Efficiency</h3>
                <p className="text-3xl font-bold text-blue-600">{solarData.summary.efficiency}%</p>
                <p className="text-sm text-gray-500">Overall performance</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Panel Temperature</h3>
                <p className="text-3xl font-bold text-orange-600">{solarData.summary.temperature}°C</p>
                <p className="text-sm text-gray-500">Average temperature</p>
              </div>
              <Sun className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Daily Generation</h3>
                <p className="text-3xl font-bold text-green-600">{solarData.summary.dailyGeneration} kWh</p>
                <p className="text-sm text-gray-500">Today's total</p>
              </div>
              <Battery className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Panel Selection</label>
                <select
                  value={selectedPanel}
                  onChange={(e) => setSelectedPanel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Panels</option>
                  {solarData.panels.map(panel => (
                    <option key={panel.id} value={panel.id}>Panel {panel.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Power Output Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Power Output Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={solarData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kW`, 'Power']} />
                <Area type="monotone" dataKey="power" stroke="#F59E0B" fill="#FEF3C7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Irradiance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Solar Irradiance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={solarData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} W/m²`, 'Irradiance']} />
                <Line type="monotone" dataKey="irradiance" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Panel Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Individual Panel Status</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solarData.panels.map(panel => (
              <div key={panel.id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Panel {panel.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(panel.status)}`}>
                    {getStatusIcon(panel.status)}
                    {panel.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power:</span>
                    <span className="font-semibold">{panel.power} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voltage:</span>
                    <span className="font-semibold">{panel.voltage} V</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold">{panel.current} A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold">{panel.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-semibold">{panel.efficiency}%</span>
                  </div>
                </div>

                {panel.status !== 'optimal' && (
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                    <strong>Alert:</strong> Panel requires maintenance
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Maintenance Recommendations</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="font-semibold text-yellow-800">Panel P004 - High Priority</h3>
              <p className="text-sm text-yellow-700 mt-1">Efficiency dropped below 18%. Check for shading or soiling.</p>
              <button className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Schedule Maintenance →
              </button>
            </div>

            <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
              <h3 className="font-semibold text-orange-800">Panel P002 & P005 - Medium Priority</h3>
              <p className="text-sm text-orange-700 mt-1">Temperature above optimal range. Verify cooling system.</p>
              <button className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarMonitoringPage;
