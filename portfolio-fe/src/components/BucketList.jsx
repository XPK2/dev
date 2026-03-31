import React, { useState, useEffect } from 'react';
import { ListTodo, Check, Plus, Star, Trash2, Loader } from 'lucide-react';
import { bucketApi } from '../services/api';

const BucketList = () => {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await bucketApi.getAll();
      if (res.success) setItems(res.data);
    } catch (err) {
      console.error('Failed to load bucket list:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (id) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    try {
      await bucketApi.toggle(id);
    } catch (err) {
      console.error('Toggle failed:', err);
      loadItems(); // revert on error
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await bucketApi.create(newItemText.trim());
      if (res.success) {
        setItems(prev => [...prev, res.data]);
        setNewItemText('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Create failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      await bucketApi.delete(id);
    } catch (err) {
      console.error('Delete failed:', err);
      loadItems();
    }
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="fade-in pb-20">
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <Star color="var(--primary)" size={32} className="animate-pulse-heart" />
        <h2 style={{ fontSize: '1.5rem', marginTop: '12px' }}>Our Bucket List</h2>
        {loading ? (
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>Loading...</p>
        ) : (
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
            Completed {completedCount}/{items.length} experiences ✨
          </p>
        )}

        {/* Progress Bar */}
        {!loading && items.length > 0 && (
          <div style={{ marginTop: '16px', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary-light), var(--primary))',
                width: `${(completedCount / items.length) * 100}%`,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        )}
      </div>

      <div className="glass-panel bucket-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)' }}>
            <Loader size={24} className="animate-spin" />
          </div>
        ) : items.map((item) => (
          <div
            key={item.id}
            className={`bucket-item ${item.completed ? 'completed' : ''}`}
            onClick={() => toggleItem(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="checkbox">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="bucket-text" style={{ flex: 1 }}>{item.text}</span>
            <button
              onClick={(e) => handleDelete(e, item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.5, padding: '4px' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginTop: '16px', padding: '16px', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            autoFocus
            placeholder="What do you want to do together..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--primary-light)',
              borderRadius: '12px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0 20px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setNewItemText(''); }}
            style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0 12px', borderRadius: '12px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Add new wish
        </button>
      )}
    </div>
  );
};

export default BucketList;

