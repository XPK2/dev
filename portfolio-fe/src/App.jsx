import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Heart, Image as ImageIcon, MessageCircle, ListTodo, Home as HomeIcon, ClipboardList } from 'lucide-react';
import Landing from './components/Landing';
import Home from './components/Home';
import Chat from './components/Chat';
import BucketList from './components/BucketList';
import FamilyRules from './components/FamilyRules';
import Login from './components/Login';

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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'chat':
        return <Chat />;
      case 'bucket':
        return <BucketList />;
      case 'rules':
        return <FamilyRules />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <nav className="top-nav" style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', justifyContent: 'flex-start' }}>
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
          className="nav-item"
          onClick={handleLogout}
        >
          <span style={{color: 'var(--primary-dark)', fontWeight: 'bold'}}>Thoát (Logout)</span>
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
        <Route path="/login" element={
          <div className="app-container" style={{ paddingTop: 0 }}>
            <Landing />
            <Login />
          </div>
        } />
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
