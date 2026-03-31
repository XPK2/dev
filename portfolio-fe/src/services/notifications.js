// src/services/notifications.js
// Browser Push Notification — hoàn toàn miễn phí, không cần server

/**
 * Đăng ký Service Worker và xin quyền thông báo
 * Gọi 1 lần khi user login
 */
export const initNotifications = async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;

  // Đăng ký SW
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.warn('SW register failed:', e);
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Hiển thị thông báo ngay lập tức (không cần server push)
 * Gọi từ WebSocket khi nhận tin nhắn mới
 */
export const showMessageNotification = (senderName, message, avatarUrl) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Không hiện nếu tab đang active
  if (document.visibilityState === 'visible') return;

  const n = new Notification(`${senderName} 💌`, {
    body: message.length > 80 ? message.slice(0, 77) + '...' : message,
    icon: avatarUrl || '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'chat-message',
    renotify: true,
    silent: false,
  });

  n.onclick = () => {
    window.focus();
    n.close();
  };

  // Tự đóng sau 5 giây
  setTimeout(() => n.close(), 5000);
};
