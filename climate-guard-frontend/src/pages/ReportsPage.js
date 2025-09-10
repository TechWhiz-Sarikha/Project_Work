import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Users, BarChart3, MapPin, Bell, Phone, Mail, User, Lock, Building, Clock, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsPage = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
