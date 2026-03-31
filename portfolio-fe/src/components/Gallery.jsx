import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Trash2, ZoomIn, ChevronLeft, ChevronRight, Calendar, Image, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { photoApi } from '../services/api';
import { USERS } from '../constants/users';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_BASE64_BYTES = 4.5 * 1024 * 1024;
const MAX_DIMENSION   = 1920;
const SPIN_STYLE      = { animation: 'spin 1s linear infinite' };

// ── Compress image via offscreen canvas ───────────────────────────────────────
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width  = Math.round(width  * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl;
        do {
          dataUrl  = canvas.toDataURL('image/jpeg', quality);
          quality -= 0.1;
        } while (dataUrl.length > MAX_BASE64_BYTES && quality > 0.2);

        resolve(dataUrl);
      };
      img.src = target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Group flat list into sorted month buckets ─────────────────────────────────
function groupByMonth(photos) {
  const map = {};
  photos.forEach((p) => {
    const key = p.takenDate ? p.takenDate.slice(0, 7) : 'unknown';
    (map[key] ??= []).push(p);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

function monthLabel(key) {
  if (key === 'unknown') return 'Unknown date';
  try {
    return format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: enUS });
  } catch {
    return key;
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ userId, size = 24 }) {
  const user = USERS[userId];
  if (!user) return null;
  return (
    <img
      src={user.avatar}
      alt={user.name}
      title={user.name}
      style={{
        width: size, height: size,
        borderRadius: '50%', objectFit: 'cover',
        border: '2px solid rgba(255,255,255,.85)',
        flexShrink: 0,
      }}
    />
  );
}

// ── Nav Arrow (Lightbox) ──────────────────────────────────────────────────────
function NavArrow({ dir, onClick }) {
  const isLeft = dir === 'left';
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        [isLeft ? 'left' : 'right']: 12,
        top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
        width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
        transition: 'background .2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.3)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}
      aria-label={isLeft ? 'Previous photo' : 'Next photo'}
    >
      {isLeft ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onNav }) {
  const photo = photos[index];
  const [src,     setSrc]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSrc(null);
    setLoading(true);
    photoApi.getOne(photo.id)
      .then((res) => setSrc(res.data?.data ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [photo.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(to bottom,rgba(0,0,0,.6),transparent)',
          zIndex: 1001,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar userId={photo.uploadedBy} size={28} />
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
            {USERS[photo.uploadedBy]?.name ?? 'Unknown'}
          </span>
          {photo.takenDate && (
            <span style={{ color: 'rgba(255,255,255,.55)', fontSize: 13 }}>
              · {format(parseISO(photo.takenDate), 'dd MMM yyyy')}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Image */}
      <div
        style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <Loader2 size={48} color="#fff" style={SPIN_STYLE} />
        ) : src ? (
          <img
            src={src}
            alt={photo.caption ?? ''}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
            draggable={false}
          />
        ) : (
          <span style={{ color: 'rgba(255,255,255,.55)' }}>Failed to load image</span>
        )}
      </div>

      {/* Caption */}
      {photo.caption && (
        <div
          style={{
            position: 'absolute', bottom: 54, left: 0, right: 0,
            textAlign: 'center', color: '#fff', fontSize: 14,
            padding: '0 48px', textShadow: '0 1px 6px rgba(0,0,0,.8)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {photo.caption}
        </div>
      )}

      {/* Counter */}
      <div style={{ position: 'absolute', bottom: 18, color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
        {index + 1} / {photos.length}
      </div>

      {index > 0                  && <NavArrow dir="left"  onClick={(e) => { e.stopPropagation(); onNav(-1); }} />}
      {index < photos.length - 1  && <NavArrow dir="right" onClick={(e) => { e.stopPropagation(); onNav(1);  }} />}
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ userId, onClose, onUploaded }) {
  const [preview,   setPreview]   = useState(null);
  const [dataUrl,   setDataUrl]   = useState(null);
  const [caption,   setCaption]   = useState('');
  const [takenDate, setDate]      = useState(format(new Date(), 'yyyy-MM-dd'));
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) { setError('Only image files are accepted.'); return; }
    setError('');
    const compressed = await compressImage(file);
    setPreview(compressed);
    setDataUrl(compressed);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const onSubmit = async () => {
    if (!dataUrl) { setError('Please select a photo first.'); return; }
    setUploading(true);
    setError('');
    try {
      await photoApi.upload({ data: dataUrl, caption, takenDate, uploadedBy: userId });
      onUploaded();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255,255,255,.97)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          padding: '24px 20px',
          width: '100%', maxWidth: 400,
          display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 17, color: '#333' }}>📸 Add Photo</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
            <X size={20} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${preview ? '#e8a4c0' : '#f0c0d0'}`,
            borderRadius: 12,
            minHeight: preview ? 'auto' : 130,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
            background: 'rgba(255,192,203,.05)',
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#c87fa0', padding: 20 }}>
              <Upload size={28} style={{ marginBottom: 8, opacity: .65 }} />
              <div style={{ fontSize: 14 }}>Drag & drop or click to select</div>
              <div style={{ fontSize: 12, marginTop: 4, color: '#ccc' }}>JPEG / PNG · up to ~5 MB</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); }}
          />
        </div>

        <input
          type="text"
          placeholder="Add a caption... (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            border: '1.5px solid #f0c0d0', borderRadius: 10,
            padding: '9px 14px', fontSize: 14, outline: 'none',
            fontFamily: 'Outfit, sans-serif',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} color="#c87fa0" />
          <input
            type="date"
            value={takenDate}
            onChange={(e) => setDate(e.target.value)}
            style={{
              border: '1.5px solid #f0c0d0', borderRadius: 10,
              padding: '8px 12px', fontSize: 14, outline: 'none', flex: 1,
              fontFamily: 'Outfit, sans-serif',
            }}
          />
        </div>

        {error && <div style={{ color: '#e05070', fontSize: 13 }}>{error}</div>}

        <button
          onClick={onSubmit}
          disabled={uploading || !dataUrl}
          style={{
            background: uploading || !dataUrl ? '#eee' : 'linear-gradient(135deg,#ff9a9e,#f06092)',
            border: 'none', borderRadius: 12, padding: '12px 0',
            fontSize: 15, fontWeight: 700,
            color: uploading || !dataUrl ? '#bbb' : '#fff',
            cursor: uploading || !dataUrl ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .2s',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {uploading
            ? <><Loader2 size={16} style={SPIN_STYLE} /> Uploading...</>
            : <><Upload size={16} /> Upload</>}
        </button>
      </div>
    </div>
  );
}

// ── Thumbnail (lazy via IntersectionObserver) ─────────────────────────────────
function PhotoThumb({ photo, onClick, onDelete }) {
  const [src,    setSrc]    = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [hover,  setHover]  = useState(false);
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        photoApi.getOne(photo.id)
          .then((res) => setSrc(res.data?.data ?? res.data))
          .catch(() => {});
        io.disconnect();
      },
      { threshold: 0.05, rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [photo.id]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(255,192,203,.15)',
        cursor: 'pointer',
        boxShadow: hover ? '0 6px 20px rgba(0,0,0,.18)' : '0 2px 8px rgba(0,0,0,.1)',
        transform: hover ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform .2s, box-shadow .2s',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={photo.caption ?? ''}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: loaded ? 1 : 0, transition: 'opacity .3s',
          }}
          onLoad={() => setLoaded(true)}
          onClick={onClick}
          draggable={false}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={22} color="#f0a0b0" style={SPIN_STYLE} />
        </div>
      )}

      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,.3)',
          opacity: hover ? 1 : 0, transition: 'opacity .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: hover ? 'auto' : 'none',
        }}
        onClick={onClick}
      >
        <ZoomIn size={26} color="#fff" />
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
        aria-label="Delete"
        style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: '50%',
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          opacity: hover ? 1 : 0, transition: 'opacity .2s',
          pointerEvents: hover ? 'auto' : 'none',
        }}
      >
        <Trash2 size={13} />
      </button>

      {/* Uploader */}
      <div style={{ position: 'absolute', bottom: 5, left: 5 }}>
        <Avatar userId={photo.uploadedBy} size={20} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Gallery({ userId }) {
  const [groups,     setGroups]  = useState([]);
  const [loading,    setLoading] = useState(true);
  const [showUpload, setUpload]  = useState(false);
  const [lbIndex,    setLbIndex] = useState(null);

  const allPhotos = groups.flatMap(([, list]) => list);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await photoApi.list();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setGroups(groupByMonth(list));
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    setGroups((prev) =>
      prev
        .map(([k, list]) => [k, list.filter((p) => p.id !== id)])
        .filter(([, list]) => list.length > 0),
    );
    try {
      await photoApi.delete(id);
    } catch {
      fetchPhotos();
    }
  }, [fetchPhotos]);

  const openLightbox = useCallback((photo) => {
    const idx = allPhotos.findIndex((p) => p.id === photo.id);
    if (idx >= 0) setLbIndex(idx);
  }, [allPhotos]);

  const navLightbox = useCallback((delta) => {
    setLbIndex((prev) => {
      const next = (prev ?? 0) + delta;
      return next >= 0 && next < allPhotos.length ? next : prev;
    });
  }, [allPhotos.length]);

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 21, color: '#c86090', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image size={21} /> Photo Album
        </h2>
        <button
          onClick={() => setUpload(true)}
          style={{
            background: 'linear-gradient(135deg,#ff9a9e,#f06092)',
            border: 'none', borderRadius: 12, padding: '9px 18px',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 3px 12px rgba(240,96,146,.35)',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <Upload size={15} /> Add Photo
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#c87fa0' }}>
          <Loader2 size={36} style={SPIN_STYLE} />
          <div style={{ marginTop: 12, fontSize: 14 }}>Loading photos...</div>
        </div>
      ) : allPhotos.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#c87fa0',
            background: 'rgba(255,192,203,.08)',
            borderRadius: 20,
            border: '2px dashed rgba(255,150,180,.22)',
          }}
        >
          <Image size={48} style={{ opacity: .3, marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No photos yet</div>
          <div style={{ fontSize: 13, marginTop: 6, opacity: .55 }}>
            Tap "Add Photo" to save your first memory 💕
          </div>
        </div>
      ) : (
        groups.map(([key, list]) => (
          <div key={key} style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 14, fontWeight: 700, color: '#c86090',
                marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 7,
                textTransform: 'capitalize',
              }}
            >
              <Calendar size={14} />
              {monthLabel(key)}
              <span style={{ fontSize: 12, color: '#ccc', fontWeight: 400 }}>
                ({list.length} {list.length === 1 ? 'photo' : 'photos'})
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 10,
              }}
            >
              {list.map((photo) => (
                <PhotoThumb
                  key={photo.id}
                  photo={photo}
                  onClick={() => openLightbox(photo)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {showUpload && (
        <UploadModal userId={userId} onClose={() => setUpload(false)} onUploaded={fetchPhotos} />
      )}

      {lbIndex !== null && (
        <Lightbox
          photos={allPhotos}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onNav={navLightbox}
        />
      )}
    </div>
  );
}
