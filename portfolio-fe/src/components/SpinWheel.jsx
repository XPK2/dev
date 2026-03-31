import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, RotateCcw, ChefHat, Coffee, Loader2, CalendarCheck } from 'lucide-react';
import { spinApi, eventsApi } from '../services/api';

// ─── Segment colours ─────────────────────────────────────────────────────────
const SEGMENT_COLORS = [
  '#ff4d6d', '#ff758f', '#ff85a1', '#c9184a',
  '#ff6b9d', '#ff4081', '#f50057', '#ff80ab',
  '#e91e63', '#ad1457', '#880e4f', '#fc4e7b',
];

// ─── Draw wheel onto canvas (arrow rendered as HTML div) ─────────────────────
const drawWheel = (canvas, places, rotation) => {
  if (!canvas || places.length === 0) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) - 4;
  const arc = (2 * Math.PI) / places.length;

  ctx.clearRect(0, 0, W, H);

  // Clip to circle so segments stay inside the boundary
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.clip();

  places.forEach((place, i) => {
    const startAngle = rotation + i * arc;
    const endAngle = startAngle + arc;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vẽ chữ
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    const maxLen = 16;
    const label = place.name.length > maxLen ? place.name.slice(0, maxLen - 1) + '…' : place.name;
    const fontSize = places.length > 10 ? 10 : places.length > 6 ? 12 : 14;
    ctx.font = `700 ${fontSize}px Outfit, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText(label, R - 12, 5);
    ctx.restore();
  });

  ctx.restore(); // end clip

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Centre circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#ff4d6d';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Heart icon
  ctx.font = '14px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❤️', cx, cy);
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SpinWheel = () => {
  const [tab, setTab] = useState('food'); // 'food' | 'drink'
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [allPlaces, setAllPlaces] = useState({ food: [], drink: [] });
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const canvasRef = useRef(null);
  const rotationRef  = useRef(0);        // current angle (radians)
  const animFrameRef = useRef(null);

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await spinApi.getAll();
      if (res.success) {
        const food = res.data.filter(p => p.category === 'food');
        const drink = res.data.filter(p => p.category === 'drink');
        setAllPlaces({ food, drink });
      }
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);

  // Reset result on tab change
  useEffect(() => {
    setPlaces(allPlaces[tab] || []);
    setResult(null);
    setAddedToCalendar(false);
    rotationRef.current = 0;
  }, [tab, allPlaces]);

  // ── Redraw canvas when places change ─────────────────────────────────────
  useEffect(() => {
    drawWheel(canvasRef.current, places, rotationRef.current);
  }, [places]);

  // ── Spin logic ────────────────────────────────────────────────────────────
  const spin = () => {
    if (spinning || places.length === 0) return;
    setResult(null);
    setAddedToCalendar(false);
    setSpinning(true);

    const canvas = canvasRef.current;
    const totalSegments = places.length;
    const arc = (2 * Math.PI) / totalSegments;

    // Minimum 5 full rotations + random offset
    const extraSpins = 5 + Math.random() * 5;
    const extraAngle = Math.random() * 2 * Math.PI;
    const totalAngle = extraSpins * 2 * Math.PI + extraAngle;

    const duration = 4000 + Math.random() * 1500; // 4–5.5 s
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const easeOut = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentAngle = startRotation + totalAngle * easeOut(progress);
      rotationRef.current = currentAngle;

      drawWheel(canvas, places, currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Arrow points at angle 0 (right side) — normalise to [0, 2π)
        const normalized = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const angleAtArrow = (2 * Math.PI - normalized) % (2 * Math.PI);
        const winIndex = Math.floor(angleAtArrow / arc) % totalSegments;
        setResult(places[winIndex]);
        setSpinning(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); }, []);

  // ── Add place ─────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPlace.name.trim()) return;
    setSaving(true);
    try {
      const res = await spinApi.create({ ...newPlace, category: tab });
      if (res.success) {
        setAllPlaces(prev => ({
          ...prev,
          [tab]: [...prev[tab], res.data],
        }));
        setNewPlace({ name: '', address: '' });
        setShowAdd(false);
      }
    } catch (err) {
      console.error('Add failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Remove place ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setAllPlaces(prev => ({
      ...prev,
      [tab]: prev[tab].filter(p => p.id !== id),
    }));
    try { await spinApi.delete(id); } catch { loadPlaces(); }
  };

  // ── Add to today's calendar at 20:00 ─────────────────────────────────────
  const addToCalendar = async () => {
    if (!result || addedToCalendar) return;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const emoji = tab === 'food' ? '🍜' : '🧋';
    try {
      const res = await eventsApi.create({
        title: result.name,
        eventDate: today,
        emoji,
      });
      if (res.success) setAddedToCalendar(true);
    } catch (err) {
      console.error('Add to calendar failed:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 className="title-gradient" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
          Where to today? 🎡
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
          Let fate decide!
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
        {[
          { key: 'food',  label: 'Food',  icon: <ChefHat size={16} /> },
          { key: 'drink', label: 'Drinks', icon: <Coffee  size={16} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 24px', borderRadius: '24px',
              border: tab === key ? 'none' : '1.5px solid var(--primary-light)',
              background: tab === key
                ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                : 'transparent',
              color: tab === key ? '#fff' : 'var(--primary)',
              fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
              boxShadow: tab === key ? '0 4px 15px rgba(255,77,109,0.4)' : 'none',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Spin wheel */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
            {places.length === 0 ? (
              <div style={{ padding: '40px 20px', color: 'var(--text-light)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍽️</p>
                <p>No places yet! Add some below 👇</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {/* Canvas + arrow */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    style={{ borderRadius: '50%', boxShadow: '0 8px 32px rgba(255,77,109,0.25)', display: 'block' }}
                  />
                </div>

                {/* Result */}
                {result && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fff0f3, #ffccd5)',
                    border: '2px solid var(--primary-light)',
                    borderRadius: '20px',
                    padding: '16px 24px',
                    animation: 'fadeInUp 0.5s ease',
                    maxWidth: '100%',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      🎯 Fate has chosen...
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '4px' }}>
                      {result.name}
                    </div>
                    {result.address && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '12px' }}>
                        📍 {result.address}
                      </div>
                    )}
                    {/* Add to calendar */}
                    <button
                      onClick={addToCalendar}
                      disabled={addedToCalendar}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: addedToCalendar
                          ? 'rgba(0,0,0,0.06)'
                          : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        color: addedToCalendar ? 'var(--text-light)' : '#fff',
                        border: 'none', borderRadius: '20px',
                        padding: '8px 18px', fontSize: '0.85rem', fontWeight: '600',
                        cursor: addedToCalendar ? 'default' : 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      <CalendarCheck size={15} />
                      {addedToCalendar ? '✅ Added to calendar!' : "Add to today's plans"}
                    </button>
                  </div>
                )}

                {/* Spin button */}
                <button
                  onClick={spin}
                  disabled={spinning}
                  style={{
                    background: spinning
                      ? '#ccc'
                      : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '28px',
                    padding: '14px 48px',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    cursor: spinning ? 'not-allowed' : 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    boxShadow: spinning ? 'none' : '0 6px 20px rgba(255,77,109,0.4)',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <RotateCcw size={20} style={{ animation: spinning ? 'spin 0.6s linear infinite' : 'none' }} />
                  {spinning ? 'Spinning...' : '✨ Spin!'}
                </button>
              </div>
            )}
          </div>

          {/* Places list */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>
                {tab === 'food' ? '🍜' : '🧋'} List ({places.length})
              </h3>
              <button
                onClick={() => { setShowAdd(p => !p); setNewPlace({ name: '', address: '' }); }}
                style={{
                  background: showAdd ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: showAdd ? 'var(--primary)' : '#fff',
                  border: showAdd ? '1.5px solid var(--primary-light)' : 'none',
                  borderRadius: '20px', padding: '6px 16px', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Outfit, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={14} /> {showAdd ? 'Cancel' : 'Add place'}
              </button>
            </div>

            {/* Add form */}
            {showAdd && (
              <form onSubmit={handleAdd} style={{
                background: 'rgba(255,77,109,0.06)', borderRadius: '14px',
                padding: '14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <input
                  type="text"
                  placeholder={`${tab === 'food' ? 'Restaurant' : 'Café / drink place'} name...`}
                  value={newPlace.name}
                  onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))}
                  required
                  style={{
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--primary-light)', outline: 'none',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="Address (optional)..."
                  value={newPlace.address}
                  onChange={e => setNewPlace(p => ({ ...p, address: e.target.value }))}
                  style={{
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1px solid #e8c0ca', outline: 'none',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={saving || !newPlace.name.trim()}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '10px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : '✅ Add to wheel'}
                </button>
              </form>
            )}

            {/* Empty state */}
            {places.length === 0 ? (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
                No places yet. Add one above! 🙂
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {places.map((place, idx) => (
                  <div
                    key={place.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '12px',
                      background: `${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}15`,
                      border: `1px solid ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}40`,
                    }}
                  >
                    <div
                      style={{
                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                        background: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                        {place.name}
                      </div>
                      {place.address && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          📍 {place.address}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(place.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ccc', padding: '4px', borderRadius: '6px',
                        transition: 'color 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff4d6d'}
                      onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpinWheel;
