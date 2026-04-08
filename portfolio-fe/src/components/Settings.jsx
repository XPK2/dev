import React, { useState } from 'react';
import { Check, AlertCircle, RotateCcw } from 'lucide-react';
import { USERS } from '../constants/users';
import { authApi } from '../services/api';
import '../styles/Settings.css';

const Settings = () => {
  const myUserId = parseInt(localStorage.getItem('userId')) || 1;
  const me = USERS[myUserId];
  
  const [bgImageUrl, setBgImageUrl] = useState(
    localStorage.getItem('customBgImage') || ''
  );
  const [bgPreview, setBgPreview] = useState(
    localStorage.getItem('customBgImage') || ''
  );
  const [bgLoading, setBgLoading] = useState(false);
  const [bgMessage, setBgMessage] = useState({ type: '', text: '' });

  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem(`customAvatar_${myUserId}`) || ''
  );
  const [avatarPreview, setAvatarPreview] = useState(
    localStorage.getItem(`customAvatar_${myUserId}`) || ''
  );
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState({ type: '', text: '' });

  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleBgPreview = async () => {
    if (!bgImageUrl.trim()) {
      setBgMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setBgLoading(true);
    const isValid = await validateImageUrl(bgImageUrl);
    setBgLoading(false);

    if (isValid) {
      setBgPreview(bgImageUrl);
      setBgMessage({ type: 'success', text: 'Image loaded successfully' });
    } else {
      setBgMessage({ type: 'error', text: 'Invalid image URL or CORS issue' });
    }
  };

  const handleBgApply = () => {
    if (!bgPreview) {
      setBgMessage({ type: 'error', text: 'Please preview an image first' });
      return;
    }

    localStorage.setItem('customBgImage', bgImageUrl);
    document.documentElement.style.setProperty('--bg-image', `url(${bgPreview})`);
    setBgMessage({ type: 'success', text: 'Background applied!' });
  };

  const handleBgReset = () => {
    setBgImageUrl('');
    setBgPreview('');
    localStorage.removeItem('customBgImage');
    document.documentElement.style.setProperty('--bg-image', `url('/src/assets/bg.jpg')`);
    setBgMessage({ type: 'success', text: 'Background reset to default' });
  };

  const handleAvatarPreview = async () => {
    if (!avatarUrl.trim()) {
      setAvatarMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setAvatarLoading(true);
    const isValid = await validateImageUrl(avatarUrl);
    setAvatarLoading(false);

    if (isValid) {
      setAvatarPreview(avatarUrl);
      setAvatarMessage({ type: 'success', text: 'Avatar loaded successfully' });
    } else {
      setAvatarMessage({ type: 'error', text: 'Invalid image URL or CORS issue' });
    }
  };

  const handleAvatarApply = async () => {
    if (!avatarPreview) {
      setAvatarMessage({ type: 'error', text: 'Please preview an image first' });
      return;
    }

    setAvatarLoading(true);
    try {
      const response = await authApi.updateAvatar(avatarUrl);
      if (response.success) {
        setAvatarMessage({ type: 'success', text: 'Avatar updated! Reloading...' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setAvatarMessage({ type: 'error', text: response.message || 'Failed to update avatar' });
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      setAvatarMessage({ type: 'error', text: 'Failed to update avatar: ' + error.message });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarReset = async () => {
    setAvatarLoading(true);
    try {
      const response = await authApi.updateAvatar('');
      if (response.success) {
        setAvatarUrl('');
        setAvatarPreview('');
        setAvatarMessage({ type: 'success', text: 'Avatar reset to default! Reloading...' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setAvatarMessage({ type: 'error', text: response.message || 'Failed to reset avatar' });
      }
    } catch (error) {
      console.error('Error resetting avatar:', error);
      setAvatarMessage({ type: 'error', text: 'Failed to reset avatar: ' + error.message });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-section">
        <h2 className="section-title">🎨 Background Image</h2>
        <p className="section-description">Customize your app background with any image URL</p>

        {bgPreview && (
          <div className="preview-container">
            <div
              className="bg-preview"
              style={{
                backgroundImage: `url(${bgPreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <p className="preview-label">Preview</p>
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            value={bgImageUrl}
            onChange={(e) => setBgImageUrl(e.target.value)}
            placeholder="Paste image URL (e.g., https://...)"
            className="settings-input"
          />
          <button
            onClick={handleBgPreview}
            disabled={bgLoading}
            className="btn btn-secondary"
          >
            {bgLoading ? 'Loading...' : 'Preview'}
          </button>
        </div>

        {bgMessage.text && (
          <div className={`message ${bgMessage.type}`}>
            {bgMessage.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <Check size={16} />
            )}
            <span>{bgMessage.text}</span>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleBgApply}
            disabled={!bgPreview}
            className="btn btn-primary"
          >
            Apply Background
          </button>
          <button
            onClick={handleBgReset}
            className="btn btn-outline"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <hr className="settings-divider" />

      <div className="settings-section">
        <h2 className="section-title">👤 Avatar Image</h2>
        <p className="section-description">Change your profile picture with any image URL</p>

        {avatarPreview && (
          <div className="preview-container">
            <div
              className="avatar-preview"
              style={{
                backgroundImage: `url(${avatarPreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <p className="preview-label">Preview (100x100)</p>
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Paste image URL (e.g., https://...)"
            className="settings-input"
          />
          <button
            onClick={handleAvatarPreview}
            disabled={avatarLoading}
            className="btn btn-secondary"
          >
            {avatarLoading ? 'Loading...' : 'Preview'}
          </button>
        </div>

        {avatarMessage.text && (
          <div className={`message ${avatarMessage.type}`}>
            {avatarMessage.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <Check size={16} />
            )}
            <span>{avatarMessage.text}</span>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleAvatarApply}
            disabled={!avatarPreview}
            className="btn btn-primary"
          >
            Apply Avatar
          </button>
          <button
            onClick={handleAvatarReset}
            className="btn btn-outline"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
