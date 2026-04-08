import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ListTodo, ClipboardList, LogOut, Dices, Image, Settings as SettingsIcon } from 'lucide-react';
import bgImage from './assets/bg.jpg';
import Landing from './components/Landing';
import Home from './components/Home';
import Chat from './components/Chat';
import BucketList from './components/BucketList';
import FamilyRules from './components/FamilyRules';
import SpinWheel from './components/SpinWheel';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import Login from './components/Login';
import { USERS } from './constants/users';

// Inject background via CSS variable so ::before pseudo-element can apply blur
document.documentElement.style.setProperty('--bg-image', `url(${bgImage})`);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Layout with Nav
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const myUserId = parseInt(localStorage.getItem('userId')) || 1;
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch current user from API
    const fetchUser = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const apiResponse = await response.json();
          // Extract data from ApiResponse wrapper
          let userData = apiResponse.data || apiResponse;
          // Map avatar field if it exists
          if (!userData.avatar && userData.imageLink) {
            userData.avatar = userData.imageLink;
          }
          setMe(userData);
        } else {
          // Fallback to constants
          setMe(USERS[myUserId]);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Fallback to constants
        setMe(USERS[myUserId]);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [myUserId, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home currentUser={me} />;
      case 'chat':
        return <Chat />;
      case 'bucket':
        return <BucketList />;
      case 'rules':
        return <FamilyRules />;
      case 'spin':
        return <SpinWheel />;
      case 'gallery':
        return <Gallery userId={myUserId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Home currentUser={me} />;
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <nav className="top-nav">
          <p>Loading...</p>
        </nav>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="top-nav" style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', justifyContent: 'flex-start' }}>

        {/* Current user avatar */}
        {me && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', minWidth: 'fit-content' }}>
            <img
              src={me.avatar || USERS[myUserId]?.avatar}
              alt={me.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-dark)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {me.name}
            </span>
          </div>
        )}

        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Heart className="nav-icon" size={18} />
          <span>Counter</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle className="nav-icon" size={18} />
          <span>Chat</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'bucket' ? 'active' : ''}`}
          onClick={() => setActiveTab('bucket')}
        >
          <ListTodo className="nav-icon" size={18} />
          <span>Bucket</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <ClipboardList className="nav-icon" size={18} />
          <span>Rules</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'spin' ? 'active' : ''}`}
          onClick={() => setActiveTab('spin')}
        >
          <Dices className="nav-icon" size={18} />
          <span>Spin</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Image className="nav-icon" size={18} />
          <span>Album</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon className="nav-icon" size={18} />
          <span>Settings</span>
        </button>

        <button className="nav-item" onClick={handleLogout}>
          <LogOut className="nav-icon" size={18} />
          <span>Logout</span>
        </button>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
