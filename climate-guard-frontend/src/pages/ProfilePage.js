import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Edit3, Save, X, Camera } from 'lucide-react';

// Navigation Component for Profile Page
const ProfileNavigation = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const getAvailablePages = () => {
    const role = user?.role;
    const basePages = ['home', 'weather'];

    switch (role) {
      case 'admin':
        return [...basePages, 'reports', 'alerts', 'recommendations', 'agriculture', 'profile'];
      case 'government_officer':
        return [...basePages, 'reports', 'alerts', 'recommendations', 'agriculture', 'profile'];
      case 'field_officer':
        return [...basePages, 'alerts', 'recommendations', 'agriculture', 'profile'];
      case 'farmer':
        return [...basePages, 'recommendations', 'agriculture', 'profile'];
      case 'researcher':
        return [...basePages, 'reports', 'recommendations', 'agriculture', 'profile'];
      default:
        return [...basePages, 'profile'];
    }
  };

  const availablePages = getAvailablePages();

  const getPageLabel = (page) => {
    const labels = {
      home: 'Home',
      weather: 'Weather Reports',
      profile: 'My Profile',
      reports: 'Reports & Analytics',
      alerts: 'Alerts & Notifications',
      recommendations: 'Smart Recommendations',
      agriculture: 'Agriculture'
    };
    return labels[page] || page;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CG</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Climate Guard</span>
            </div>
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'government_officer' ? 'bg-blue-100 text-blue-800' :
                user?.role === 'farmer' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition duration-200"
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

const ProfilePage = ({ user, setUser, currentPage, setCurrentPage, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    region: '',
    district: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        region: user.region || '',
        district: user.district || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();

      // Update user state
      setUser(data.user);
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      region: user?.region || '',
      district: user?.district || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'System Administrator',
      'government_officer': 'Government Officer',
      'field_officer': 'Field Officer',
      'farmer': 'Farmer',
      'researcher': 'Researcher/Analyst'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'government_officer': 'bg-blue-100 text-blue-800',
      'field_officer': 'bg-green-100 text-green-800',
      'farmer': 'bg-yellow-100 text-yellow-800',
      'researcher': 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={onLogout}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
                {user.region && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {user.region}
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {user.department}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-200"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.name}</p>
                    )}
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.email}</p>
                    )}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.phone || 'Not provided'}</p>
                    )}
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region/District
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Madurai, Tamil Nadu"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.region || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Role-specific fields */}
                {(user.role === 'government_officer' || user.role === 'field_officer' || user.role === 'admin') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    {isEditing ? (
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
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{user.department || 'Not specified'}</p>
                    )}
                  </div>
                )}

                {/* Farmer-specific fields */}
                {user.role === 'farmer' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">🌱 Farm Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Land Details
                        </label>
                        <p className="text-sm text-gray-600">
                          Region: {user.region || 'Not specified'}<br />
                          District: {user.district || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Crop Information
                        </label>
                        <p className="text-sm text-gray-600">
                          Update your region and district above to specify your farming location and crop details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Researcher-specific fields */}
                {user.role === 'researcher' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">🔬 Research Information</h3>
                    <p className="text-sm text-gray-600">
                      As a researcher, you have access to advanced analytics and detailed climate data.
                      Update your department and region information above for specialized access.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Account Status</h3>
              <p className="text-2xl font-bold text-blue-600">Active</p>
              <p className="text-sm text-gray-500">Verified account</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Last Login</h3>
              <p className="text-lg font-bold text-green-600">Today</p>
              <p className="text-sm text-gray-500">Recent activity</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Profile Completion</h3>
              <p className="text-2xl font-bold text-purple-600">85%</p>
              <p className="text-sm text-gray-500">Complete your profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
