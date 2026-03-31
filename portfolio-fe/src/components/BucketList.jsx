import React, { useState } from 'react';
import { ListTodo, Check, Plus, Star } from 'lucide-react';

const BucketList = () => {
  const [items, setItems] = useState([
    { id: 1, text: "Travel to Da Lat together", completed: true },
    { id: 2, text: "Cook a romantic dinner", completed: true },
    { id: 3, text: "Watch sunset at the beach", completed: false },
    { id: 4, text: "Wear matching clothes in public", completed: false },
    { id: 5, text: "Late night movie date", completed: false },
    { id: 6, text: "Surprise gifts for no reason", completed: false }
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now(),
      text: newItemText,
      completed: false
    };

    setItems([...items, newItem]);
    setNewItemText('');
    setIsAdding(false);
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="fade-in pb-20">
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <Star color="var(--primary)" size={32} className="animate-pulse-heart" />
        <h2 style={{ fontSize: '1.5rem', marginTop: '12px' }}>Our Bucket List</h2>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
          Completed {completedCount}/{items.length} experiences
        </p>
        
        {/* Progress Bar */}
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
      </div>

      <div className="glass-panel bucket-list">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`bucket-item ${item.completed ? 'completed' : ''}`}
            onClick={() => toggleItem(item.id)}
          >
            <div className="checkbox">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="bucket-text">{item.text}</span>
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
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0 20px', 
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Save
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
