import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, TrendingUp, Brain, Activity, Hash, Flame, Cookie, Droplet, Wind, AlertCircle, Plus, X, Sparkles } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}


interface Entry {
  id: number;
  thc_mg: number;
  thcMg?: number; // Keep for backwards compatibility
  timestamp: string;
  date: string;
  time: string;
  method: string;
  amount: string;
  puffs: string;
  thc_percent: number;
  thcPercent?: number; // Keep for backwards compatibility
  strain: string;
  mood: number;
  energy: number;
  focus: number;
  creativity: number;
  anxiety: number;
  activities: string[];
  notes: string;
}

interface FormData {
  date: string;
  time: string;
  method: string;
  amount: string;
  puffs: string;
  thcPercent: number;
  strain: string;
  mood: number;
  energy: number;
  focus: number;
  creativity: number;
  anxiety: number;
  activities: string[];
  notes: string;
}

const CannabisTracker = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Initialize authentication from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
      try {
        setAuthToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // App state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    method: 'vape',
    amount: '',
    puffs: '',
    thcPercent: 75,
    strain: '',
    mood: 5,
    energy: 5,
    focus: 5,
    creativity: 5,
    anxiety: 0,
    activities: [],
    notes: ''
  });

  // API helper functions
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }, [authToken]);

  // Authentication functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      const response: AuthResponse = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });

      // Store token in localStorage for persistence
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      setAuthToken(response.access_token);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });

      // After successful registration, log in automatically
      const loginResponse: AuthResponse = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
        }),
      });

      // Store token in localStorage for persistence
      localStorage.setItem('authToken', loginResponse.access_token);
      localStorage.setItem('currentUser', JSON.stringify(loginResponse.user));
      
      setAuthToken(loginResponse.access_token);
      setCurrentUser(loginResponse.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setEntries([]);
  };

  // Data loading is now handled directly in useEffect and form submission

  // Note: THC calculation is now done on the backend

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const entryData = {
        date: formData.date,
        time: formData.time,
        method: formData.method,
        amount: formData.amount,
        puffs: formData.puffs,
        thc_percent: formData.thcPercent,
        strain: formData.strain,
        mood: formData.mood,
        energy: formData.energy,
        focus: formData.focus,
        creativity: formData.creativity,
        anxiety: formData.anxiety,
        activities: formData.activities,
        notes: formData.notes
      };

      await apiRequest('/entries', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });

      // Reload entries from the server to get the latest data
      const [entriesData, statsData] = await Promise.all([
        apiRequest('/entries'),
        apiRequest('/entries/stats')
      ]);
      setEntries(entriesData);
      setStatsData(statsData);
      
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        method: 'vape',
        amount: '',
        puffs: '',
        thcPercent: 75,
        strain: '',
        mood: 5,
        energy: 5,
        focus: 5,
        creativity: 5,
        anxiety: 0,
        activities: [],
        notes: ''
      });
    } catch (error: any) {
      alert('Failed to save entry: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const activities = ['Gaming', 'Music', 'Movies', 'Socializing', 'Exercise', 'Creative Work', 'Cooking', 'Nature', 'Reading', 'Meditation'];
  const methods = useMemo(() => [
    { value: 'vape', label: 'Vape', icon: Wind },
    { value: 'smoke', label: 'Flower', icon: Flame },
    { value: 'edible', label: 'Edible', icon: Cookie },
    { value: 'tincture', label: 'Tincture', icon: Droplet }
  ], []);

  // Load stats on component mount and when entries change
  const [statsData, setStatsData] = useState<any>(null);

  // Manual data loading function
  const manualLoadData = async () => {
    if (!isAuthenticated || !authToken) return;
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };

      const [entriesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/entries`, { headers }),
        fetch(`${API_BASE_URL}/entries/stats`, { headers })
      ]);
      
      if (!entriesResponse.ok || !statsResponse.ok) {
        throw new Error('API request failed');
      }
      
      const [entriesData, statsData] = await Promise.all([
        entriesResponse.json(),
        statsResponse.json()
      ]);
      
      setEntries(entriesData);
      setStatsData(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Load data only once when authentication state changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAuthenticated && authToken) {
      // Add a small delay to prevent rapid successive calls
      timeoutId = setTimeout(() => {
        manualLoadData();
      }, 100);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated && authToken ? 'loaded' : 'not-loaded']);

  // Calculate stats from API data
  const stats = useMemo(() => {
    if (!statsData) return null;
    return {
      weeklyTotal: statsData.weekly_total || 0,
      dailyAvg: statsData.daily_avg || 0,
      avgMood: statsData.avg_mood || 0,
      totalSessions: statsData.total_sessions || 0
    };
  }, [statsData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = entries.filter(e => e.date === dateStr);
      const totalMg = dayEntries.reduce((sum, e) => sum + (e.thc_mg || e.thcMg || 0), 0);
      const avgMood = dayEntries.length > 0 
        ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length 
        : null;
      
      last30Days.push({
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        thc: totalMg,
        mood: avgMood,
        sessions: dayEntries.length
      });
    }
    
    // Chart data ready
    
    return last30Days;
  }, [entries]);

  const methodDistribution = useMemo(() => {
    const dist = entries.reduce((acc: {[key: string]: number}, e) => {
      acc[e.method] = (acc[e.method] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(dist).map(([method, count]) => ({
      name: methods.find(m => m.value === method)?.label || method,
      value: count
    }));
  }, [entries, methods]);

  const effectsRadar = useMemo(() => {
    if (entries.length === 0) return [];
    
    const avgEffects = {
      Mood: entries.reduce((sum, e) => sum + e.mood, 0) / entries.length,
      Energy: entries.reduce((sum, e) => sum + e.energy, 0) / entries.length,
      Focus: entries.reduce((sum, e) => sum + e.focus, 0) / entries.length,
      Creativity: entries.reduce((sum, e) => sum + e.creativity, 0) / entries.length,
      Calm: entries.reduce((sum, e) => sum + (10 - e.anxiety), 0) / entries.length
    };
    
    return Object.entries(avgEffects).map(([key, value]) => ({
      effect: key,
      value: value
    }));
  }, [entries]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Show login/register forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Activity className="text-green-500" />
              Cannabis Tracker
            </h1>
            <p className="text-gray-600 mt-2">Track, analyze, and optimize your consumption</p>
          </div>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Login</h2>
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Don't have an account? Register
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Register</h2>
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-green-500" />
                Cannabis Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {currentUser?.username}! Track, analyze, and optimize your consumption
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={manualLoadData}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                New Entry
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['dashboard', 'analytics', 'history', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white shadow-md text-blue-600'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats ? (
              <>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Weekly Total</span>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{stats.weeklyTotal}mg</div>
                  <div className="text-sm text-gray-500 mt-1">THC consumed</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Daily Average</span>
                    <Calendar className="text-blue-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{stats.dailyAvg.toFixed(1)}mg</div>
                  <div className="text-sm text-gray-500 mt-1">Per day</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Avg Mood</span>
                    <Brain className="text-purple-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{stats.avgMood.toFixed(1)}/10</div>
                  <div className="text-sm text-gray-500 mt-1">This week</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Sessions</span>
                    <Hash className="text-orange-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
                  <div className="text-sm text-gray-500 mt-1">Last 7 days</div>
                </div>
              </>
            ) : (
              <div className="col-span-4 bg-white rounded-xl shadow-md p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No entries yet. Click "New Entry" to start tracking!</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">30-Day Consumption</h3>
              {entries.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="thc" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Method Distribution</h3>
              {methodDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={methodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {methodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Mood Correlation</h3>
              {entries.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.filter(d => d.mood !== null)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                    <Line type="monotone" dataKey="sessions" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Average Effects</h3>
              {effectsRadar.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={effectsRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="effect" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar name="Effects" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.slice().reverse().slice(0, 10).map((entry) => (
                  <div key={entry.id} className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{entry.date}</span>
                          <span className="text-gray-600">{entry.time}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {entry.thc_mg || entry.thcMg || 0}mg THC
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {methods.find(m => m.value === entry.method)?.label}
                          </span>
                        </div>
                        {entry.strain && (
                          <div className="text-sm text-gray-600 mt-1">Strain: {entry.strain}</div>
                        )}
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Mood: {entry.mood}/10</span>
                          <span>Energy: {entry.energy}/10</span>
                          <span>Focus: {entry.focus}/10</span>
                          <span>Anxiety: {entry.anxiety}/10</span>
                        </div>
                        {entry.activities.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {entry.activities.map((act) => (
                              <span key={act} className="text-xs px-2 py-1 bg-gray-200 rounded">
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.notes && (
                          <div className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</div>
                        )}
                      </div>
                        <button
                          onClick={async () => {
                           if (window.confirm('Are you sure you want to delete this entry?')) {
                             try {
                               await apiRequest(`/entries/${entry.id}`, {
                                 method: 'DELETE',
                               });
                               setEntries(entries.filter(e => e.id !== entry.id));
                             } catch (error: any) {
                               alert('Failed to delete entry: ' + error.message);
                             }
                           }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No entries yet. Start tracking to see your history!</p>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                AI Insights & Recommendations
              </h3>
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Start tracking your consumption to get personalized insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Quick Stats</h4>
                  <p className="text-purple-700">You've tracked {entries.length} sessions. Your average mood is {stats?.avgMood.toFixed(1)}/10.</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">📊 Pattern Insights</h4>
                  <p className="text-green-700">You're averaging {stats?.dailyAvg.toFixed(1)}mg THC per day over the last week.</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Recommendations</h4>
                  <p className="text-yellow-700">Track consistently for at least 2 weeks to identify your optimal dosage and timing patterns.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Entry Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">New Entry</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Method</label>
                    <div className="grid grid-cols-4 gap-3">
                      {methods.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setFormData({...formData, method: method.value})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.method === method.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <method.icon className="mx-auto mb-1" size={24} />
                          <div className="text-sm">{method.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {(formData.method === 'vape' || formData.method === 'smoke') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Puffs</label>
                        <input
                          type="number"
                          value={formData.puffs || ''}
                          onChange={(e) => setFormData({...formData, puffs: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">THC %</label>
                        <input
                          type="number"
                          value={formData.thcPercent}
                          onChange={(e) => setFormData({...formData, thcPercent: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 75"
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  {(formData.method === 'edible' || formData.method === 'tincture') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">THC Amount (mg)</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Strain (optional)</label>
                    <input
                      type="text"
                      value={formData.strain}
                      onChange={(e) => setFormData({...formData, strain: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Blue Dream"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium mb-2">Effects</label>
                    
                    {[
                      { key: 'mood', label: 'Mood', color: 'green' },
                      { key: 'energy', label: 'Energy', color: 'yellow' },
                      { key: 'focus', label: 'Focus', color: 'blue' },
                      { key: 'creativity', label: 'Creativity', color: 'purple' },
                      { key: 'anxiety', label: 'Anxiety', color: 'red' }
                    ].map((effect) => (
                      <div key={effect.key} className="flex items-center gap-3">
                        <span className="w-20 text-sm">{effect.label}</span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={formData[effect.key as keyof FormData]}
                          onChange={(e) => setFormData({...formData, [effect.key as keyof FormData]: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="w-8 text-center font-medium">{formData[effect.key as keyof FormData]}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Activities</label>
                    <div className="grid grid-cols-3 gap-2">
                      {activities.map((activity) => (
                        <button
                          key={activity}
                          type="button"
                          onClick={() => {
                            const updated = formData.activities.includes(activity)
                              ? formData.activities.filter(a => a !== activity)
                              : [...formData.activities, activity];
                            setFormData({...formData, activities: updated});
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            formData.activities.includes(activity)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      rows={3}
                      placeholder="Any additional observations..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all"
                    >
                      Save Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CannabisTracker;