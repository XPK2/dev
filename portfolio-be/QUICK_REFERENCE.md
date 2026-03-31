#!/bin/bash

# Quick Reference Card for All API Endpoints

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                     COUPLE APP - API QUICK REFERENCE                      ║
║                                                                            ║
║             Base URL: http://localhost:8080/api/v1                        ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTH ENDPOINTS (No Auth Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST /auth/login
  Body: { "code": "101203" }
  Returns: { "token": "...", "username": "Huy", "userId": 1 }
  
GET /health
  Returns: { "success": true, "message": "Health check passed" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 ANNIVERSARY ENDPOINTS (No Auth Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET /anniversary/days
  Returns: { 
    "days": 98,
    "startDate": "2025-12-24",
    "endDate": "2026-03-30",
    "description": "Đếm từ 24/12/2025 đến nay"
  }
  Usage: Display on welcome page / main dashboard

GET /anniversary/details
  Returns: { 
    "days": 98,
    "hours": 12,
    "minutes": 45,
    "totalHours": 2364,
    "totalMinutes": 141885,
    "startDate": "2025-12-24",
    "endDate": "2026-03-30",
    "timestamp": "2026-03-30T17:04:22"
  }
  Usage: Update every 60 seconds in FE counter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CHAT ENDPOINTS (Auth Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST /chat/send/{receiverId}
  Headers: Authorization: Bearer {TOKEN}
  Body: { "content": "Chào em! 💕" }
  Returns: { "id": 1, "senderId": 1, "receiverId": 2, "content": "...", ... }

GET /chat/conversation/{otherUserId}?page=0&size=20
  Headers: Authorization: Bearer {TOKEN}
  Returns: { 
    "content": [ ... messages ... ],
    "totalPages": 1,
    "totalElements": 5,
    "size": 20,
    "number": 0
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 USERS IN DATABASE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User 1:
  Code: 101203
  Name: Huy
  ID: 1

User 2:
  Code: 030403
  Name: Hà
  ID: 2

Login and get token:
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"code":"101203"}'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 EXAMPLE TEST COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Health check
curl http://localhost:8080/api/v1/health

# Anniversary (no auth needed)
curl http://localhost:8080/api/v1/anniversary/days
curl http://localhost:8080/api/v1/anniversary/details

# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"101203"}' | jq -r '.data.token')
echo $TOKEN

# Send message
curl -X POST http://localhost:8080/api/v1/chat/send/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Hi Hà! 💕"}'

# Get conversation
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/chat/conversation/2?page=0&size=20"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DOCUMENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API.md                   - Full API documentation
README.md                - Project overview
PHASE_16_SUMMARY.md      - Latest phase summary
IMPLEMENTATION_SUMMARY.md - Technical summary

EOF
