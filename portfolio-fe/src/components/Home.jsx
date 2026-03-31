import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Heart, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { anniversaryApi, eventsApi } from '../services/api';
import { USERS } from '../constants/users';

const myUserId = parseInt(localStorage.getItem('userId')) || 1;
const partnerId = myUserId === 1 ? 2 : 1;
const ME = USERS[myUserId];
const PARTNER = USERS[partnerId];

const Home = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', eventDate: '', emoji: '🎉' });

  useEffect(() => {
    loadAnniversaryData();
    loadEvents();
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

  const loadEvents = async () => {
    try {
      const res = await eventsApi.getUpcoming();
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.eventDate) return;
    try {
      const res = await eventsApi.create(newEvent);
      if (res.success) {
        setEvents(prev => [...prev, res.data].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
        setNewEvent({ title: '', eventDate: '', emoji: '🎉' });
        setShowAddEvent(false);
      }
    } catch (err) {
      console.error('Add event failed:', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    try { await eventsApi.delete(id); } catch (err) { loadEvents(); }
  };

  const getDaysUntil = (dateStr) => {
    const diff = differenceInDays(new Date(dateStr), new Date());
    if (diff === 0) return 'Today! 🎉';
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    return `${diff} days left`;
  };

  // Refresh counter every minute
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
              src={ME.avatar}
              alt={ME.name}
              className="avatar animate-float"
              style={{ animationDelay: '0s' }}
            />
            <Heart size={36} className="heart-icon animate-pulse-heart" />
            <img
              src={PARTNER.avatar}
              alt={PARTNER.name}
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <CalendarIcon size={24} color="var(--primary)" /> Upcoming
        </h3>
        <button
          onClick={() => setShowAddEvent(p => !p)}
          style={{ background: 'none', border: '1px solid var(--primary-light)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {showAddEvent && (
        <form onSubmit={handleAddEvent} className="glass-panel" style={{ padding: '16px', marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            placeholder="Event name"
            value={newEvent.title}
            onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
            style={{ flex: '1 1 140px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--primary-light)', fontFamily: 'inherit', outline: 'none' }}
          />
          <input
            type="date"
            value={newEvent.eventDate}
            onChange={e => setNewEvent(p => ({ ...p, eventDate: e.target.value }))}
            style={{ flex: '1 1 120px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--primary-light)', fontFamily: 'inherit', outline: 'none' }}
          />
          <input
            type="text"
            placeholder="Emoji"
            value={newEvent.emoji}
            onChange={e => setNewEvent(p => ({ ...p, emoji: e.target.value }))}
            style={{ width: '60px', padding: '8px', borderRadius: '10px', border: '1px solid var(--primary-light)', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }}
          />
          <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
          <button type="button" onClick={() => setShowAddEvent(false)} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
        </form>
      )}

      <div className="glass-panel milestone-list" style={{ padding: '8px' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            No upcoming events. Add one! 💝
          </div>
        ) : events.map((event) => (
          <div key={event.id} className="milestone-item">
            <div className="milestone-date" style={{ fontSize: '1.3rem', background: 'transparent', color: 'inherit' }}>
              {event.emoji}
            </div>
            <div className="milestone-info">
              <h4>{event.title}</h4>
              <p>{format(new Date(event.eventDate), 'MMM dd, yyyy')}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                {getDaysUntil(event.eventDate)}
              </span>
              <button onClick={() => handleDeleteEvent(event.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.5, padding: 0 }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
