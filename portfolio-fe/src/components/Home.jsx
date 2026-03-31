import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Heart, Calendar as CalendarIcon, Gift } from 'lucide-react';
import { anniversaryApi } from '../services/api';

const Home = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnniversaryData();
  }, []);

  const loadAnniversaryData = async () => {
    try {
      setLoading(true);
      const res = await anniversaryApi.getDetails();
      if (res.success) {
        setDays(res.data.days);
        setHours(res.data.hours);
        setMinutes(res.data.minutes);
        setStartDate(new Date(res.data.startDate));
      } else {
        setError(res.message || 'Failed to fetch anniversary data');
      }
    } catch (err) {
      console.error('Failed to fetch anniversary:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data every minute
  useEffect(() => {
    const interval = setInterval(loadAnniversaryData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in">
      <div className="glass-panel counter-card">
        <div className="counter-content">
          <div className="avatar-row">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
              alt="You" 
              className="avatar animate-float"
              style={{ animationDelay: '0s' }}
            />
            <Heart size={36} className="heart-icon animate-pulse-heart" />
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" 
              alt="Partner" 
              className="avatar animate-float"
              style={{ animationDelay: '1s' }}
            />
          </div>
          
          <h2 className="title-gradient">Together For</h2>
          {loading ? (
            <div className="days-label" style={{ marginTop: '20px' }}>Loading...</div>
          ) : error ? (
            <div className="days-label" style={{ marginTop: '20px', color: 'var(--primary-light)' }}>{error}</div>
          ) : (
            <>
              <div className="days-number">{days}</div>
              <div className="days-label">Days</div>
              
              <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                <div>{hours}h {minutes}m</div>
              </div>
              
              <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>
                Since {startDate ? format(startDate, 'MMM dd, yyyy') : ''}
              </p>
            </>
          )}
        </div>
      </div>

      <h3 className="section-title">
        <CalendarIcon size={24} color="var(--primary)" /> 
        Upcoming
      </h3>
      
      <div className="glass-panel milestone-list" style={{ padding: '8px' }}>
        <div className="milestone-item">
          <div className="milestone-date">14/2</div>
          <div className="milestone-info">
            <h4>Valentine's Day</h4>
            <p>February 14, 2026</p>
          </div>
          <Gift color="var(--primary-light)" style={{ marginLeft: 'auto' }} />
        </div>
        
        <div className="milestone-item">
          <div className="milestone-date">01/1</div>
          <div className="milestone-info">
            <h4>3rd Anniversary</h4>
            <p>January 1, 2026</p>
          </div>
          <Heart color="var(--primary-light)" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </div>
  );
};

export default Home;
