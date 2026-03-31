# 🚀 Deploy Guide — Couple App

## Stack
| Layer    | Service       | Free tier            |
|----------|---------------|----------------------|
| Database | Neon Tech     | 0.5 GB PostgreSQL    |
| Backend  | Render.com    | 512 MB RAM, sleep after 15min idle (health check tự wake) |
| Frontend | Vercel        | Unlimited static     |

---

## 1️⃣ Database — Neon Tech

1. Đăng ký tại https://neon.tech (dùng GitHub login)
2. **New Project** → đặt tên `couple-app`
3. Chọn region gần nhất (Singapore hoặc Tokyo)
4. Copy **Connection string** dạng:
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. ⚠️ Thêm `?sslmode=require` vào cuối nếu chưa có
6. Lưu lại — đây là giá trị `DATABASE_URL`

---

## 2️⃣ Backend — Render.com

### Setup
1. Đăng ký https://render.com → Connect GitHub repo
2. **New Web Service** → chọn repo `dev` → chọn thư mục `portfolio-be`
3. Cấu hình:
   - **Name**: `couple-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `portfolio-be`
   - **Runtime**: Docker ← Render tự detect `Dockerfile`
   - **Instance Type**: Free

### Environment Variables (Render Dashboard → Environment)
```
DATABASE_URL     = postgresql://...@....neon.tech/neondb?sslmode=require
JWT_SECRET       = [random string 64+ ký tự - generate tại https://generate-secret.vercel.app/64]
ALLOWED_ORIGINS  = https://your-fe.vercel.app
SPRING_PROFILES_ACTIVE = prod
```

### Sau khi deploy
- URL BE sẽ là: `https://couple-backend-xxxx.onrender.com`
- Kiểm tra health: `https://couple-backend-xxxx.onrender.com/actuator/health`
- ℹ️ Free tier sẽ sleep sau 15 phút — **HealthCheckScheduler** tự wake lại sau mỗi 5 phút

---

## 3️⃣ Frontend — Vercel

### Setup
1. Đăng ký https://vercel.com → Import repo từ GitHub
2. **New Project** → chọn repo `dev`
3. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `portfolio-fe`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)
```
VITE_API_URL  = https://couple-backend-xxxx.onrender.com/api/v1
VITE_WS_URL   = wss://couple-backend-xxxx.onrender.com/ws/websocket
```
> ⚠️ Thay `couple-backend-xxxx` bằng URL thật từ Render

### File `vercel.json` đã có sẵn:
- SPA routing (React Router hoạt động khi refresh)
- Cache headers cho assets
- Service Worker headers

---

## 4️⃣ Thứ tự deploy

```
Neon Tech (DB) → Render (BE) → cập nhật ALLOWED_ORIGINS → Vercel (FE) → cập nhật VITE_API_URL
```

---

## 5️⃣ Sau deploy — cập nhật file local

Sửa `.env.production` trong `portfolio-fe/`:
```env
VITE_API_URL=https://couple-backend-xxxx.onrender.com/api/v1
VITE_WS_URL=wss://couple-backend-xxxx.onrender.com/ws/websocket
```

---

## ✅ Checklist

- [ ] Neon DB tạo xong, có Connection String
- [ ] Render: tất cả ENV vars đã set
- [ ] Render: deploy thành công, `/actuator/health` trả về `{"status":"UP"}`
- [ ] Flyway migrations V1→V5 đã chạy trên Neon DB
- [ ] Vercel: ENV vars `VITE_API_URL` và `VITE_WS_URL` đã set đúng URL Render
- [ ] Vercel: SPA routing hoạt động (thử refresh trang /chat)
- [ ] Login được với code `101203` hoặc `030403`
- [ ] Push notification hoạt động (cần HTTPS — Vercel tự có)
- [ ] WebSocket chat hoạt động (wss:// thay ws://)

---

## 🔧 Troubleshooting

### Flyway error trên Neon
```sql
-- Chạy trên Neon SQL Editor nếu cần reset
DELETE FROM flyway_schema_history WHERE success = false;
```

### CORS error
Kiểm tra `ALLOWED_ORIGINS` trên Render phải khớp đúng domain Vercel (không có trailing slash):
```
https://couple-app.vercel.app
```

### WebSocket không connect (wss://)
Render free tier hỗ trợ WebSocket. Đảm bảo dùng `wss://` (không phải `ws://`) trên production.

### Neon DB connection timeout
Neon free tier có thể sleep — connection pool `minimum-idle=1` giữ connection sống.
