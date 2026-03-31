import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Trash2, ZoomIn, ChevronLeft, ChevronRight, Calendar, Image, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { photoApi } from '../services/api';
import { USERS } from '../constants/users';

const MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5MB base64 safe limit
const MAX_DIMENSION = 1920;

/* ── compress image via canvas ─────────────────────────── */
function compressImage(file) {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        // Try quality from 0.85 down until under limit
        let quality = 0.85;
        let dataUrl;
        do {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          quality -= 0.1;
        } while (dataUrl.length > MAX_SIZE_BYTES && quality > 0.2);

        resolve(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  });
}

/* ── group photos by month ──────────────────────────────── */
function groupByMonth(photos) {
  const groups = {};
  photos.forEach((p) => {
    const key = p.takenDate ? p.takenDate.slice(0, 7) : 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatMonthLabel(key) {
  if (key === 'unknown') return 'Không rõ ngày';
  try {
    return format(parseISO(key + '-01'), 'MMMM yyyy', { locale: vi });
  } catch {
    return key;
  }
}

/* ── avatar helper ──────────────────────────────────────── */
function Avatar({ userId, size = 24 }) {
  const user = USERS[userId];
  if (!user) return null;
  return (
    <img
      src={user.avatar}
      alt={user.name}
      title={user.name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
    />
  );
}

/* ── Lightbox ───────────────────────────────────────────── */
function Lightbox({ photos, index, onClose, onNav }) {
  const p = photos[index];
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSrc(null);
    setLoading(true);
    photoApi.getOne(p.id).then((res) => {
      setSrc(res.data?.data || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [p.id]);

  // keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNav]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* top bar */}
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
          <Avatar userId={p.uploadedBy} size={28} />
          <span style={{ color: '#fff', fontSize: 14 }}>
            {USERS[p.uploadedBy]?.name || 'Unknown'}
          </span>
          {p.takenDate && (
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>
              · {format(parseISO(p.takenDate), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <X size={24} />
        </button>
      </div>

      {/* image */}
      <div
        style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <Loader2 size={48} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
        ) : src ? (
          <img
            src={src}
            alt={p.caption || ''}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
          />
        ) : (
          <span style={{ color: '#fff' }}>Không tải được ảnh</span>
        )}
      </div>

      {/* caption */}
      {p.caption && (
        <div
          style={{
            position: 'absolute', bottom: 60, left: 0, right: 0,
            textAlign: 'center', color: '#fff', fontSize: 14,
            padding: '0 32px',
            textShadow: '0 1px 4px rgba(0,0,0,.8)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {p.caption}
        </div>
      )}

      {/* nav arrows */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(-1); }}
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(1); }}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* counter */}
      <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}

/* ── Upload Modal ───────────────────────────────────────── */
function UploadModal({ userId, onClose, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [takenDate, setTakenDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }
    setError('');
    const compressed = await compressImage(file);
    setPreview(compressed);
    setDataUrl(compressed);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!dataUrl) { setError('Chưa chọn ảnh'); return; }
    setUploading(true);
    setError('');
    try {
      await photoApi.upload({ data: dataUrl, caption, takenDate, uploadedBy: userId });
      onUploaded();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#333' }}>📸 Thêm ảnh</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #e8a4c0',
            borderRadius: 12,
            minHeight: preview ? 'auto' : 140,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
            background: 'rgba(255,192,203,.08)',
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#c87fa0', padding: 20 }}>
              <Upload size={32} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14 }}>Kéo thả hoặc click để chọn ảnh</div>
              <div style={{ fontSize: 12, marginTop: 4, color: '#bbb' }}>JPEG / PNG · tối đa ~5MB</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        {/* caption */}
        <input
          type="text"
          placeholder="Caption (tuỳ chọn)..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            border: '1.5px solid #f0c0d0', borderRadius: 10,
            padding: '10px 14px', fontSize: 14, outline: 'none',
            background: 'rgba(255,255,255,.8)',
          }}
        />

        {/* date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="#c87fa0" />
          <input
            type="date"
            value={takenDate}
            onChange={(e) => setTakenDate(e.target.value)}
            style={{
              border: '1.5px solid #f0c0d0', borderRadius: 10,
              padding: '8px 12px', fontSize: 14, outline: 'none',
              background: 'rgba(255,255,255,.8)', flex: 1,
            }}
          />
        </div>

        {error && <div style={{ color: '#e05070', fontSize: 13 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={uploading || !dataUrl}
          style={{
            background: uploading || !dataUrl ? '#ddd' : 'linear-gradient(135deg,#ff9a9e,#fecfef)',
            border: 'none', borderRadius: 12, padding: '12px 0',
            fontSize: 15, fontWeight: 600, color: '#fff',
            cursor: uploading || !dataUrl ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {uploading ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải lên...</>
          ) : (
            <><Upload size={18} /> Tải lên</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Thumbnail component (lazy-loads full image on demand) ─ */
function PhotoThumb({ photo, onClick, onDelete, currentUserId }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          photoApi.getOne(photo.id)
            .then((res) => { setThumbSrc(res.data?.data || res.data); })
            .catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [photo.id]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(255,192,203,.2)',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
        transition: 'transform .2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {thumbSrc ? (
        <img
          src={thumbSrc}
          alt={photo.caption || ''}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: loaded ? 1 : 0, transition: 'opacity .3s',
          }}
          onLoad={() => setLoaded(true)}
          onClick={onClick}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={24} color="#f0a0b0" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* hover overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,.35)',
          opacity: 0, transition: 'opacity .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        className="thumb-overlay"
        onClick={onClick}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
      >
        <ZoomIn size={28} color="#fff" />
      </div>

      {/* delete btn — top-right */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
        title="Xoá ảnh"
        style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: '50%',
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          opacity: 0, transition: 'opacity .2s',
        }}
        className="thumb-delete"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
      >
        <Trash2 size={14} />
      </button>

      {/* uploader avatar — bottom-left */}
      <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
        <Avatar userId={photo.uploadedBy} size={22} />
      </div>
    </div>
  );
}

/* ── Main Gallery component ─────────────────────────────── */
export default function Gallery({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // flat sorted list for lightbox navigation
  const allPhotos = photos.flatMap(([, list]) => list);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await photoApi.list();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPhotos(groupByMonth(list));
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá ảnh này?')) return;
    try {
      await photoApi.delete(id);
      fetchPhotos();
    } catch {
      alert('Xoá thất bại');
    }
  };

  const openLightbox = (photo) => {
    const idx = allPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIdx(idx >= 0 ? idx : null);
  };

  const navLightbox = (delta) => {
    setLightboxIdx((prev) => {
      const next = prev + delta;
      if (next < 0 || next >= allPhotos.length) return prev;
      return next;
    });
  };

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: '#c86090', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image size={22} /> Album ảnh
        </h2>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            background: 'linear-gradient(135deg,#ff9a9e,#fecfef)',
            border: 'none', borderRadius: 12,
            padding: '9px 18px',
            color: '#fff', fontWeight: 600, fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(255,100,150,.3)',
          }}
        >
          <Upload size={16} /> Thêm ảnh
        </button>
      </div>

      {/* content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#c87fa0' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 12, fontSize: 14 }}>Đang tải ảnh...</div>
        </div>
      ) : allPhotos.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#c87fa0',
            background: 'rgba(255,192,203,.12)',
            borderRadius: 20,
            border: '2px dashed rgba(255,150,180,.3)',
          }}
        >
          <Image size={48} style={{ opacity: .4, marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có ảnh nào</div>
          <div style={{ fontSize: 13, marginTop: 6, opacity: .6 }}>
            Nhấn "Thêm ảnh" để lưu kỷ niệm đầu tiên 💕
          </div>
        </div>
      ) : (
        photos.map(([monthKey, list]) => (
          <div key={monthKey} style={{ marginBottom: 32 }}>
            {/* month label */}
            <div
              style={{
                fontSize: 15, fontWeight: 600, color: '#c86090',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                textTransform: 'capitalize',
              }}
            >
              <Calendar size={15} />
              {formatMonthLabel(monthKey)}
              <span style={{ fontSize: 12, color: '#bbb', fontWeight: 400 }}>
                ({list.length} ảnh)
              </span>
            </div>

            {/* grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 10,
              }}
            >
              {list.map((photo) => (
                <PhotoThumb
                  key={photo.id}
                  photo={photo}
                  onClick={() => openLightbox(photo)}
                  onDelete={handleDelete}
                  currentUserId={userId}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          userId={userId}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchPhotos}
        />
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={allPhotos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNav={navLightbox}
        />
      )}
    </div>
  );
}
