# Couple App Backend

Backend Java Spring Boot cho ứng dụng chia sẻ ảnh/video và chat giữa 2 người dùng.

## Features

✅ **Authentication**: Login bằng mã code 6 chữ số (JWT Token)  
✅ **Media Management**: Lấy danh sách ảnh/video từ Google Drive  
✅ **Chat**: Gửi và nhận tin nhắn  
✅ **Database**: PostgreSQL với Flyway migration  
✅ **Security**: Spring Security + JWT  
✅ **CORS**: Cấu hình cho Frontend  

## Tech Stack

- **Java 21**
- **Spring Boot 3.3.0**
- **Spring Security 6.x**
- **JPA/Hibernate**
- **PostgreSQL 14+**
- **Flyway 10.2**
- **JWT (JJWT 0.11.5)**
- **Google Drive API**

## Prerequisites

### Cài đặt yêu cầu

1. **Java 21+**: [Download](https://jdk.java.net/21/)
2. **Maven 3.9+**: [Download](https://maven.apache.org/)
3. **PostgreSQL 14+**: [Download](https://www.postgresql.org/)
4. **Git**: [Download](https://git-scm.com/)

### Kiểm tra cài đặt

```bash
java -version
mvn --version
psql --version
```

## Installation & Setup

### 1. Tạo Database

```bash
# Kết nối vào PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE couple_db;
CREATE USER couple_user WITH PASSWORD 'couple_password';
ALTER ROLE couple_user SET client_encoding TO 'utf8';
ALTER ROLE couple_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE couple_user SET default_transaction_deferrable TO on;
ALTER ROLE couple_user SET default_transaction_read_committed TO on;
ALTER USER couple_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE couple_db TO couple_user;

# Thoát khỏi psql
\q
```

**Hoặc nếu muốn dùng user `postgres` trực tiếp (mặc định):**
```bash
psql -U postgres -c "CREATE DATABASE couple_db;"
```

### 2. Clone & Setup Project

```bash
# Clone repository
git clone <your-repo-url> portfolio-be
cd portfolio-be

# Cài đặt dependencies
mvn clean install
```

### 3. Cấu hình Environment Variables

Tạo file `.env` hoặc thêm biến môi trường hệ thống:

```bash
# Database
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/couple_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=123456

# JWT Secret (thay đổi trong production)
export JWT_SECRET=my-super-secret-key-that-is-at-least-32-characters-long-for-jwt-signing
export JWT_EXPIRATION=86400000

# Google Drive (nếu cần)
export GOOGLE_API_KEY=<your-google-api-key>
export GOOGLE_DRIVE_FOLDER_ID=<your-public-folder-id>
```

### 4. Chạy Database Migration

```bash
# Migration tự động chạy khi start app
# Nhưng có thể test bằng:
mvn flyway:migrate
```

## CORS Configuration

Frontend (localhost:5173, localhost:3000) có thể call API từ backend.

**Cấu hình CORS:**
- Cho phép origin: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`
- Cho phép methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Cho phép headers: * (tất cả)
- Cho phép credentials: true

**File config:** `src/main/java/com/couple/backend/CoupleBackendApplication.java`

Frontend có thể call API bình thường:
```javascript
// React example
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: '101203' })
});
const data = await response.json();
```

---

## Running the Application

### Development Mode

```bash
# Từ IDE (IntelliJ, Eclipse, VS Code)
# Chạy class: CoupleBackendApplication.main()

# Hoặc từ Terminal
mvn spring-boot:run

# App sẽ khởi động tại: http://localhost:8080
```

### Production Mode

```bash
# Build JAR file
mvn clean package

# Chạy JAR file
java -jar target/couple-backend-0.0.1-SNAPSHOT.jar
```

### Docker (tùy chọn)

```bash
# Build Docker image
docker build -t couple-backend .

# Run container
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/couple_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  couple-backend
```

## Testing

### Chạy tất cả tests

```bash
mvn clean test
```

### Chạy test cụ thể

```bash
# Health check test
mvn test -Dtest=HealthControllerTest

# Auth test
mvn test -Dtest=AuthControllerTest
```

### Expected Output

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.couple.backend.CoupleBackendApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.5 s
[INFO] Running com.couple.backend.auth.AuthControllerTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.8 s
[INFO] Running com.couple.backend.common.HealthControllerTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.9 s
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] -------------------------------------------------------
```

## Google Drive Setup (quan trọng)

### Lý do kỹ thuật

Public folder link không có quyền upload file. Cần dùng:
1. **API Key + Public Folder ID** (chỉ đọc danh sách)
2. **Service Account + OAuth** (upload file)

### Setup Google Drive API

#### Step 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Enable APIs:
   - Google Drive API
   - Google Docs API

#### Step 2: Tạo API Key (để list files)

1. Vào **APIs & Services** > **Credentials**
2. Chọn **+ Create Credentials** > **API Key**
3. Copy API Key, lưu vào biến env: `GOOGLE_API_KEY`

#### Step 3: Lấy Public Folder ID

1. Truy cập [Google Drive](https://drive.google.com)
2. Tạo folder công khai (right-click > Share > Anyone with the link)
3. Mở folder, URL: `https://drive.google.com/drive/folders/1bA1EEDd1ngBDD0_6Bu8yBFd7krajoryw`
4. Folder ID = `1bA1EEDd1ngBDD0_6Bu8yBFd7krajoryw`
5. Lưu vào biến env: `GOOGLE_DRIVE_FOLDER_ID`

#### Step 4: (Tùy chọn) Tạo Service Account để upload

1. Vào **APIs & Services** > **Credentials**
2. Chọn **+ Create Credentials** > **Service Account**
3. Điền thông tin, tạo key JSON
4. Download JSON file, lưu tại `src/main/resources/service-account-key.json`
5. Chia sẻ folder với email service account (quyền Editor)

#### Step 5: Set Environment Variables

```bash
export GOOGLE_API_KEY=<api-key-from-step-2>
export GOOGLE_DRIVE_FOLDER_ID=1bA1EEDd1ngBDD0_6Bu8yBFd7krajoryw
export GOOGLE_SERVICE_ACCOUNT_PATH=src/main/resources/service-account-key.json
```

### Test Google Drive Connection

```bash
# Sau khi start app, test API:
curl -X GET "http://localhost:8080/api/v1/media/drive-list?page=0&size=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## API Documentation

Xem chi tiết tại file [API.md](./API.md)

### Quick Examples

#### 1. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"101203"}'

# Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "token": "eyJhbGciOiJIUzUxMiJ9...",
#     "username": "User 1",
#     "userId": 1
#   }
# }
```

#### 2. List Media from Google Drive

```bash
TOKEN="<token-từ-login>"

curl -X GET "http://localhost:8080/api/v1/media/drive-list?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. Send Message

```bash
TOKEN="<token-của-user-1>"

curl -X POST http://localhost:8080/api/v1/chat/send/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Hi there! 👋"}'
```

#### 4. Get Conversation

```bash
TOKEN="<token-của-user-1>"

curl -X GET "http://localhost:8080/api/v1/chat/conversation/2?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
portfolio-be/
├── src/main/java/com/couple/backend/
│   ├── CoupleBackendApplication.java
│   ├── config/              (Security, Google Drive)
│   ├── auth/                (Login, JWT, User entity)
│   ├── media/               (Media management, Google Drive integration)
│   ├── chat/                (Messaging)
│   └── common/              (DTO, Exception, Security filters)
├── src/main/resources/
│   ├── application.yml      (Configuration)
│   └── db/migration/        (Flyway SQL)
├── src/test/java/          (Unit tests)
├── pom.xml                  (Maven dependencies)
├── README.md                (This file)
├── API.md                   (API documentation)
└── docker-compose.yml       (PostgreSQL container)
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Users:**
- ID: 1, Code: `101203`, Name: "User 1"
- ID: 2, Code: `030403`, Name: "User 2"

### Media Table

```sql
CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    uploaded_by BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    media_type VARCHAR(50),  -- 'image' or 'video'
    file_type VARCHAR(50),   -- 'jpg', 'mp4', etc.
    file_size BIGINT,
    google_drive_file_id VARCHAR(255) UNIQUE,
    google_drive_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table

```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Build Errors

**Problem**: `mvn clean test` không pass
```
SOLUTION:
1. Đảm bảo PostgreSQL đang chạy
2. Database `couple_db` đã tạo
3. Check: psql -U postgres -l
4. Run: mvn clean install -DskipTests
5. Sau đó: mvn test
```

**Problem**: "Connection refused" khi start app
```
SOLUTION:
1. Kiểm tra PostgreSQL: sudo systemctl status postgresql
2. Hoặc dùng: createdb couple_db -U postgres
3. Update application.yml với đúng credentials
```

### JWT Token Issues

**Problem**: "Invalid or expired token"
```
SOLUTION:
1. Token hết hạn sau 24h (config trong jwt.expiration)
2. Login lại để lấy token mới
3. Hoặc thay đổi jwt.expiration trong application.yml
```

### Google Drive API Issues

**Problem**: "Empty or invalid folder ID"
```
SOLUTION:
1. Kiểm tra GOOGLE_DRIVE_FOLDER_ID đúng
2. Folder phải public (Anyone with link)
3. Enable Google Drive API trong Cloud Console
4. API Key phải đúng
```

## Development Tips

### Hot Reload (DevTools)

Spring Boot DevTools tự động reload khi file thay đổi:
```bash
# Tự động bật nếu chạy bằng:
mvn spring-boot:run

# Hoặc từ IDE
# Sửa file → Save → Auto-rebuild
```

### Logging

```yaml
# Trong application.yml
logging:
  level:
    root: INFO
    com.couple.backend: DEBUG
```

### Database Console (H2 - tùy chọn)

```yaml
# Thêm H2 database cho development
# spring.h2.console.enabled=true
# http://localhost:8080/h2-console
```

## Deployment

### AWS ECS / EC2

```bash
# Build JAR
mvn clean package

# Upload to server
scp target/couple-backend-0.0.1-SNAPSHOT.jar user@server:/app/

# Run on server
ssh user@server
cd /app
java -jar couple-backend-0.0.1-SNAPSHOT.jar
```

### Heroku / Railway

```bash
# Deploy using Git
git push heroku main

# Or using Docker
heroku container:push web
heroku container:release web
```

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

## License

MIT License - See LICENSE file

## Support

- Email: support@couple-app.com
- Issues: GitHub Issues

---

**Last Updated**: March 30, 2024  
**Version**: 0.0.1-SNAPSHOT

## Run PostgreSQL
```bash
docker compose up -d
```

## Run app
```bash
./mvnw spring-boot:run
```

If you do not have Maven Wrapper yet, run with local Maven:
```bash
mvn spring-boot:run
```

## Health check
- `GET http://localhost:8080/api/health`

## Current status
- Core app skeleton done
- DB + Flyway connected
- Basic security config added

Next step: implement auth by fixed codes and domain APIs (media/chat/drive import).

