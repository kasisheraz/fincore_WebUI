# Getting Started with Fincore Platform

**Prerequisites | Setup | First Steps**

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 18.x or 20.x | Frontend development | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x+ | Package manager | Included with Node.js |
| **Java JDK** | 17 (LTS) | Backend development | [adoptium.net](https://adoptium.net) |
| **Maven** | 3.9+ | Java build tool | [maven.apache.org](https://maven.apache.org) |
| **Docker** | 24.x+ | Containerization | [docker.com](https://docker.com) |
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |
| **MySQL** | 8.0 | Local database | [mysql.com](https://mysql.com) |

### Optional Tools

- **VS Code** - Recommended IDE (with extensions: ESLint, Prettier, Java Extension Pack)
- **Postman** - API testing
- **DBeaver** - Database management
- **Google Cloud SDK** - For GCP deployment

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone Repositories

```bash
# Create workspace directory
mkdir fincore-workspace
cd fincore-workspace

# Clone all three repositories
git clone https://github.com/kasisheraz/fincore_WebUI.git
git clone https://github.com/kasisheraz/userManagementApi.git
git clone https://github.com/kasisheraz/fincore_Iasc.git
```

### Step 2: Start Backend API

```bash
cd userManagementApi

# Configure database (edit application.yml)
cp src/main/resources/application.yml.example src/main/resources/application.yml

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

**Backend will start on**: `http://localhost:8080`

### Step 3: Start Frontend

```bash
cd ../fincore_WebUI

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will start on**: `http://localhost:3000`

### Step 4: Verify Setup

1. Open browser: `http://localhost:3000`
2. You should see the login page
3. Backend health check: `http://localhost:8080/actuator/health`

✅ **Success!** You're ready to develop.

---

## 📦 Detailed Setup Instructions

### Backend Setup (userManagementApi)

#### 1. Database Setup

**Option A: Local MySQL**

```bash
# Start MySQL server
mysql.server start  # macOS
# or
sudo service mysqld start  # Linux
# or
net start MySQL80  # Windows

# Create database
mysql -u root -p
```

```sql
CREATE DATABASE fincore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fincore_user'@'localhost' IDENTIFIED BY 'fincore_password';
GRANT ALL PRIVILEGES ON fincore_db.* TO 'fincore_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option B: Docker MySQL**

```bash
docker run --name fincore-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=fincore_db \
  -e MYSQL_USER=fincore_user \
  -e MYSQL_PASSWORD=fincore_password \
  -p 3306:3306 \
  -d mysql:8.0
```

#### 2. Configure Application

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/fincore_db?useSSL=false&allowPublicKeyRetrieval=true
    username: fincore_user
    password: fincore_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Creates tables automatically
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: your-secret-key-change-this-in-production-min-256-bits
  expiration: 86400000  # 24 hours in milliseconds
```

#### 3. Run Backend

```bash
# Clean build
mvn clean install

# Run application
mvn spring-boot:run

# Or run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Verify**: `curl http://localhost:8080/actuator/health`

Expected response: `{"status":"UP"}`

#### 4. Run Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Skip tests
mvn install -DskipTests
```

---

### Frontend Setup (fincore_WebUI)

#### 1. Install Dependencies

```bash
cd fincore_WebUI
npm install
```

#### 2. Configure Environment

Create `.env.development.local`:

```env
# Backend API URL
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Enable mock authentication for development (optional)
REACT_APP_MOCK_AUTH=false

# Environment
REACT_APP_ENV=development
```

#### 3. Start Development Server

```bash
# Standard development mode
npm start

# With mock authentication (for testing without backend)
REACT_APP_MOCK_AUTH=true npm start
```

**Application opens at**: `http://localhost:3000`

#### 4. Run Tests

```bash
# Run E2E tests (requires backend running)
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Debug tests
npx playwright test --debug
```

---

## 🔐 First Time Login

### Test Credentials

**Development Environment**:

```
Phone Number: +1234567890
OTP: 123456 (hardcoded in development mode)
```

**Flow**:
1. Navigate to `http://localhost:3000`
2. Enter phone number: `+1234567890`
3. Click "Request OTP"
4. Enter OTP: `123456`
5. Click "Verify"
6. You'll be redirected to the dashboard

### Create Admin User

```bash
# Connect to database
mysql -u fincore_user -p fincore_db

# Insert admin user
INSERT INTO users (phone_number, email, full_name, role, status, created_at, updated_at)
VALUES ('+1234567890', 'admin@fincore.com', 'Admin User', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW());
```

---

## 🛠️ Development Workflow

### Recommended Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Write tests
   - Test locally

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create PR on GitHub

5. **Wait for CI/CD**
   - Tests run automatically
   - Code review required
   - Merge when approved

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code restructuring
test: Add tests
chore: Maintenance tasks
```

---

## 🐛 Common Issues & Solutions

### Backend Won't Start

**Issue**: `Connection to database failed`

**Solution**:
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'fincore_db'"

# Recreate database if needed
mysql -u root -p < init-database.sql
```

### Frontend Build Errors

**Issue**: `Cannot find module '@mui/material'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: `Port 3000 already in use`

**Solution**:
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### E2E Tests Failing

**Issue**: `Error: Failed to connect to backend`

**Solution**:
1. Ensure backend is running on `localhost:8080`
2. Check `.env.test.local` has correct backend URL
3. Enable mock auth: `REACT_APP_MOCK_AUTH=true`

---

## 📚 Next Steps

Now that you have the platform running locally:

1. 📖 Read the [Development Guide](04-DEVELOPMENT-GUIDE.md)
2. 🧪 Explore the [Testing Guide](05-TESTING-GUIDE.md)
3. 📡 Learn the [API Documentation](06-API-DOCUMENTATION.md)
4. 🚀 Understand [Deployment](07-DEPLOYMENT-GUIDE.md)

---

## 🆘 Getting Help

- **Issues**: Create an issue on GitHub
- **Questions**: Check the [Troubleshooting Guide](08-TROUBLESHOOTING.md)
- **Confluence**: Browse this documentation space

---

**Last Updated**: March 16, 2026  
**Maintained By**: Development Team
