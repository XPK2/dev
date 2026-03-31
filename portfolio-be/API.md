# API Documentation

## Overview
Backend API cho ứng dụng Couple (chia sẻ ảnh/video & chat).

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
Các endpoint (trừ `/auth/login` và `/health`) yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## 1. Auth Endpoints

### 1.1 Login
**Endpoint:** `POST /auth/login`  
**Auth Required:** No  
**Description:** Đăng nhập bằng mã code

**Request:**
```json
{
  "code": "101203"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "username": "Huy",
    "userId": 1
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid login code"
}
```

**Valid Codes:**
- `101203` → Huy (userId: 1)
- `030403` → Hà (userId: 2)

---

## 2. Health Endpoints

### 2.1 Health Check
**Endpoint:** `GET /health`  
**Auth Required:** No  
**Description:** Kiểm tra server đang chạy

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Health check passed"
}
```

---

## 3. Anniversary Endpoints

### 3.1 Get Days Count
**Endpoint:** `GET /anniversary/days`  
**Auth Required:** No  
**Description:** Lấy số ngày yêu từ 24/12/2025 đến nay

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Days count calculated",
  "data": {
    "days": 98,
    "startDate": "2025-12-24",
    "endDate": "2026-03-30",
    "description": "Đếm từ 24/12/2025 đến nay"
  }
}
```

### 3.2 Get Anniversary Details
**Endpoint:** `GET /anniversary/details`  
**Auth Required:** No  
**Description:** Lấy chi tiết số ngày, giờ, phút yêu nhau

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Anniversary details calculated",
  "data": {
    "days": 98,
    "hours": 12,
    "minutes": 45,
    "totalHours": 2364,
    "totalMinutes": 141885,
    "startDate": "2025-12-24",
    "endDate": "2026-03-30",
    "timestamp": "2026-03-30T17:04:22"
  }
}
```

---

## 4. Chat Endpoints

### 4.1 Send Message
**Endpoint:** `POST /chat/send/{receiverId}`  
**Auth Required:** Yes  
**Description:** Gửi tin nhắn cho người dùng khác

**Path Parameters:**
- `receiverId` (long): ID của người nhận

**Request:**
```json
{
  "content": "Chào bạn! 👋"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "content": "Chào bạn! 👋",
    "createdAt": "2024-03-30T10:15:30"
  }
}
```

### 4.2 Get Conversation
**Endpoint:** `GET /chat/conversation/{otherUserId}?page=0&size=20`  
**Auth Required:** Yes  
**Description:** Lấy danh sách tin nhắn trong cuộc trò chuyện

**Path Parameters:**
- `otherUserId` (long): ID của người dùng khác

**Query Parameters:**
- `page` (int): Page number (default: 0)
- `size` (int): Messages per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Messages retrieved",
  "data": {
    "content": [
      {
        "id": 2,
        "senderId": 2,
        "receiverId": 1,
        "content": "Hi! How are you?",
        "createdAt": "2024-03-30T10:16:00"
      },
      {
        "id": 1,
        "senderId": 1,
        "receiverId": 2,
        "content": "Chào bạn! 👋",
        "createdAt": "2024-03-30T10:15:30"
      }
    ],
    "totalPages": 1,
    "totalElements": 2,
    "size": 20,
    "number": 0
  }
}
```

---

## Error Responses


### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "Code is required",
    "content": "Content is required"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error: ..."
}
```

---

## Response Format

Tất cả response theo format chung:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": object (optional)
}
```

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"101203"}'
```

### Health Check
```bash
curl -X GET http://localhost:8080/api/v1/health
```

### Get Days Count (Anniversary)
```bash
curl -X GET http://localhost:8080/api/v1/anniversary/days
```

### Get Anniversary Details
```bash
curl -X GET http://localhost:8080/api/v1/anniversary/details
```

### Send Message
```bash
curl -X POST http://localhost:8080/api/v1/chat/send/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"Hello!"}'
```

### Get Conversation
```bash
curl -X GET "http://localhost:8080/api/v1/chat/conversation/2?page=0&size=20" \
  -H "Authorization: Bearer <token>"
```

### Health Check
```bash
curl -X GET http://localhost:8080/api/v1/health
```

### Get Days Count (Anniversary)
```bash
curl -X GET http://localhost:8080/api/v1/anniversary/days
```

### Get Anniversary Details
```bash
curl -X GET http://localhost:8080/api/v1/anniversary/details
```
