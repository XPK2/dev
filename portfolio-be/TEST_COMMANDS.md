# Test Commands - Couple Backend API

## 1. Login - Huy (101203)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"101203"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "username": "Huy",
    "userId": 1
  }
}
```

---

## 2. Login - Hà (030403)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"030403"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "username": "Hà",
    "userId": 2
  }
}
```

---

## 3. Health Check
```bash
curl -X GET http://localhost:8080/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Health check passed"
}
```

---

## 4. Send Message (Huy gửi cho Hà)
Lấy token từ bước 1, thay `{TOKEN_HUY}` bằng token:

```bash
curl -X POST http://localhost:8080/api/v1/chat/send/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN_HUY}" \
  -d '{"content":"Chào Hà! 👋"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "content": "Chào Hà! 👋",
    "createdAt": "2024-03-30T10:15:30"
  }
}
```

---

## 5. Get Conversation (Huy xem chat với Hà)
```bash
curl -X GET "http://localhost:8080/api/v1/chat/conversation/2?page=0&size=20" \
  -H "Authorization: Bearer {TOKEN_HUY}"
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved",
  "data": {
    "content": [
      {
        "id": 1,
        "senderId": 1,
        "receiverId": 2,
        "content": "Chào Hà! 👋",
        "createdAt": "2024-03-30T10:15:30"
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "size": 20,
    "number": 0
  }
}
```

---

## Quick Test Script

```bash
#!/bin/bash

# Login Huy
HUY_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"101203"}' | jq -r '.data.token')

# Login Hà
HA_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"030403"}' | jq -r '.data.token')

echo "Huy Token: $HUY_TOKEN"
echo "Hà Token: $HA_TOKEN"

# Health check
echo "\n=== Health Check ==="
curl -s http://localhost:8080/api/v1/health | jq .

# Huy gửi tin cho Hà
echo "\n=== Huy gửi tin cho Hà ==="
curl -s -X POST http://localhost:8080/api/v1/chat/send/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HUY_TOKEN" \
  -d '{"content":"Chào Hà, bạn khỏe không?"}' | jq .

# Hà gửi tin cho Huy
echo "\n=== Hà gửi tin cho Huy ==="
curl -s -X POST http://localhost:8080/api/v1/chat/send/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HA_TOKEN" \
  -d '{"content":"Mình khỏe! Bạn thì sao?"}' | jq .

# Huy xem chat
echo "\n=== Huy xem chat với Hà ==="
curl -s -X GET "http://localhost:8080/api/v1/chat/conversation/2?page=0&size=20" \
  -H "Authorization: Bearer $HUY_TOKEN" | jq .
```

Save as `test.sh` and run:
```bash
chmod +x test.sh
./test.sh
```

---

## Setup Instructions

### 1. Prerequisites
- Java 21
- PostgreSQL 14+ running
- Maven 3.9+

### 2. Start Server
```bash
cd /Users/macbook/SourceCode/portfolio-be
mvn spring-boot:run
```

Server sẽ start trên `http://localhost:8080`

### 3. Database Setup (nếu chưa có)
```bash
psql -U postgres -c "CREATE DATABASE couple_db;"
```

Flyway sẽ auto-migrate schema khi server start.

### 4. Run Tests
```bash
mvn clean test
```

All 6 tests should pass ✅

---

## User Info

| Code | Name | User ID |
|------|------|---------|
| 101203 | Huy | 1 |
| 030403 | Hà | 2 |

## API Response Format

```json
{
  "success": true/false,
  "message": "Description",
  "data": {...},
  "errors": {...}  // optional, chỉ khi có lỗi
}
```

## Authentication
Tất cả endpoint (trừ `/auth/login` và `/health`) yêu cầu JWT token:
```
Authorization: Bearer <token>
```

---

## Troubleshooting

### "Migration checksum mismatch"
```bash
mvn flyway:repair -Dflyway.url=jdbc:postgresql://localhost:5432/postgres \
  -Dflyway.user=postgres -Dflyway.password=123456
```

### "Database couple_db does not exist"
```bash
psql -U postgres -c "CREATE DATABASE couple_db;"
```

### Port 8080 already in use
```bash
lsof -i :8080
kill -9 <PID>
```

Or use different port:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```
