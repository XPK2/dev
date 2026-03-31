import React, { useState, useEffect } from 'react';
import { ClipboardList, Star, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { rulesApi } from '../services/api';

const FamilyRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const res = await rulesApi.getAll();
      if (res.success) setRules(res.data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      const res = await rulesApi.create(newContent.trim());
      if (res.success) {
        setRules(prev => [...prev, res.data]);
        setNewContent('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Create rule failed:', err);
    }
  };

  const handleEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      const res = await rulesApi.update(id, editContent.trim());
      if (res.success) {
        setRules(prev => prev.map(r => r.id === id ? res.data : r));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Update rule failed:', err);
    }
  };

  const handleDelete = async (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
    try {
      await rulesApi.delete(id);
    } catch (err) {
      console.error('Delete failed:', err);
      loadRules();
    }
  };

  return (
    <div className="fade-in pb-20">
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <ClipboardList color="var(--primary)" size={32} className="animate-float" />
        <h2 style={{ fontSize: '1.5rem', marginTop: '12px' }}>Family Rules</h2>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
          Promises we keep for a happy home. 💑
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '8px', marginBottom: '16px' }}>
        <div className="milestone-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)' }}>Loading...</div>
          ) : rules.map((rule, index) => (
            <div
              key={rule.id}
              className="milestone-item"
              style={{ borderBottom: index !== rules.length - 1 ? '1px solid var(--glass-border)' : 'none' }}
            >
              <div className="milestone-date" style={{ background: 'var(--primary)', minWidth: '40px' }}>{index + 1}</div>

              {editingId === rule.id ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(rule.id); if (e.key === 'Escape') setEditingId(null); }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--primary-light)', fontFamily: 'inherit', outline: 'none', fontSize: '0.95rem' }}
                  />
                  <button onClick={() => handleEdit(rule.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Check size={18} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X size={18} /></button>
                </div>
              ) : (
                <div className="milestone-info" style={{ flex: 1 }}>
                  <p style={{ fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '500' }}>{rule.content}</p>
                </div>
              )}

              {editingId !== rule.id && (
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  <button
                    onClick={() => { setEditingId(rule.id); setEditContent(rule.content); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.6 }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <Star color="var(--primary-light)" size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            autoFocus
            placeholder="Add a new rule..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{ flex: 1, padding: '12px', border: '1px solid var(--primary-light)', borderRadius: '12px', fontFamily: 'inherit', outline: 'none' }}
          />
          <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
            Save
          </button>
          <button type="button" onClick={() => { setIsAdding(false); setNewContent(''); }} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0 12px', borderRadius: '12px', cursor: 'pointer' }}>
            Cancel
          </button>
        </form>
      ) : (
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Add new rule
        </button>
      )}
    </div>
  );
};

export default FamilyRules;

