# Troubleshooting Guide

**Common issues and solutions for Fincore Platform**

---

## 📋 Overview

This guide covers common problems developers encounter when working with the Fincore Platform, along with their solutions. Issues are organized by category for quick reference.

---

## 🔐 Authentication Issues

### Issue: "Invalid OTP" Error During Login

**Symptoms**:
- User enters OTP but receives "Invalid OTP" error
- Login fails even with correct OTP

**Causes**:
1. OTP expired (valid for 5 minutes)
2. Wrong phone number format
3. Backend OTP service not running
4. Database connection issue

**Solutions**:

```powershell
# 1. Check backend is running
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}

# 2. Verify phone number format
# Must be: +[country code][number]
# Example: +1234567890 (not 1234567890 or +1 234 567 8900)

# 3. Check backend logs
cd C:\Development\git\userManagementApi
# Look for OTP generation log
grep "OTP generated" logs/application.log

# 4. Test OTP endpoint directly
curl -X POST http://localhost:8080/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890"}'
# Should return: {"devOtp":"123456"}
```

**Prevention**:
- Use consistent phone number format
- Request new OTP if >5 minutes old
- Ensure backend is running before frontend

---

### Issue: JWT Token Expired - Constant Redirect to Login

**Symptoms**:
- User logged in successfully
- After some time, automatically redirected to login
- Every API call returns 401 Unauthorized

**Causes**:
1. Token expired (default expiration: 1 hour)
2. Token not refreshed properly
3. System clock mismatch

**Solutions**:

```typescript
// 1. Implement token refresh logic
// src/services/authService.ts

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('jwt_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    return accessToken;
  } else {
    // Refresh failed, redirect to login
    window.location.href = '/login';
  }
};

// 2. Add axios interceptor for automatic refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return axios(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

```powershell
# 3. Check system clock (if on WSL)
# WSL clock can drift
wsl sudo hwclock -s

# 4. Increase token expiration (backend)
# src/main/resources/application.properties
jwt.expiration=7200000  # 2 hours instead of 1
```

---

### Issue: CORS Errors When Calling API

**Symptoms**:
```
Access to fetch at 'http://localhost:8080/api/users' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Causes**:
1. Backend CORS configuration missing
2. Wrong API URL in frontend
3. Preflight OPTIONS request failing

**Solutions**:

```java
// 1. Add CORS configuration (backend)
// src/main/java/com/fincore/config/CorsConfig.java

@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://fincore-webui-lfd6ooarra-nw.a.run.app"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

```typescript
// 2. Ensure correct API URL (frontend)
// .env.local
REACT_APP_API_URL=http://localhost:8080/api

// src/config/config.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

---

## 🌐 Frontend Issues

### Issue: Blank Page After Build

**Symptoms**:
- `npm start` works fine
- After `npm run build`, page is blank
- Console shows "Failed to load resource: 404"

**Causes**:
1. Incorrect `homepage` in package.json
2. Routing issue with React Router
3. Missing environment variables in build

**Solutions**:

```json
// 1. Fix package.json
{
  "name": "fincore-webui",
  "homepage": ".",  // Important for relative paths
  "version": "1.0.0"
}
```

```typescript
// 2. Add BrowserRouter basename
// src/index.tsx
import { BrowserRouter } from 'react-router-dom';

root.render(
  <BrowserRouter basename="/">
    <App />
  </BrowserRouter>
);
```

```powershell
# 3. Build with environment variables
$env:REACT_APP_API_URL="https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api"
npm run build

# 4. Test build locally
npm install -g serve
serve -s build
# Open http://localhost:3000
```

---

### Issue: Playwright Tests Failing Locally

**Symptoms**:
```
Error: navigationTimeout: Timeout 30000ms exceeded
```

**Causes**:
1. Backend not running
2. Wrong test configuration
3. Slow network/machine
4. Database not seeded

**Solutions**:

```powershell
# 1. Ensure backend is running
cd C:\Development\git\userManagementApi
mvn spring-boot:run

# 2. Ensure frontend is running
cd C:\Development\git\fincore_WebUI
npm start
```

```typescript
// 3. Increase timeout in playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds instead of 30
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000
  }
});
```

```powershell
# 4. Run tests with debug info
npm test -- --debug

# 5. Run tests in headed mode
npm test -- --headed

# 6. Run single test file
npm test -- tests/e2e/auth/login.spec.ts
```

---

### Issue: React Component Not Re-rendering

**Symptoms**:
- State updated but UI doesn't change
- Props changed but component doesn't re-render

**Causes**:
1. Mutating state directly
2. Reference equality issue
3. Missing dependency in useEffect

**Solutions**:

```typescript
// ❌ Bad - Mutating state directly
const [users, setUsers] = useState([]);
users.push(newUser); // Wrong!

// ✅ Good - Create new array
const [users, setUsers] = useState([]);
setUsers([...users, newUser]);

// ❌ Bad - Missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// ✅ Good - Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Bad - Object reference issue
const [formData, setFormData] = useState({ name: '', email: '' });
formData.name = 'John'; // Wrong!

// ✅ Good - Create new object
setFormData({ ...formData, name: 'John' });
```

---

## 🔧 Backend Issues

### Issue: Database Connection Failed

**Symptoms**:
```
java.sql.SQLException: Connection refused
```

**Causes**:
1. MySQL not running
2. Wrong connection string
3. Firewall blocking connection
4. Database doesn't exist

**Solutions**:

```powershell
# 1. Check MySQL is running
# On Windows:
Get-Service -Name "MySQL*"
# Should show "Running"

# If stopped:
Start-Service -Name "MySQL80"

# On Linux/WSL:
sudo service mysql status
sudo service mysql start

# 2. Test connection
mysql -u fincore_user -p -h localhost fincore_db
# Enter password when prompted
```

```properties
# 3. Verify application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/fincore_db
spring.datasource.username=fincore_user
spring.datasource.password=<your_password>
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# For Cloud SQL:
spring.datasource.url=jdbc:mysql:///fincore_db?cloudSqlInstance=project-id:region:instance-name&socketFactory=com.google.cloud.sql.mysql.SocketFactory
spring.cloud.gcp.sql.instance-connection-name=project-id:region:instance-name
spring.cloud.gcp.sql.database-name=fincore_db
```

```sql
-- 4. Create database if missing
CREATE DATABASE IF NOT EXISTS fincore_db;
CREATE USER IF NOT EXISTS 'fincore_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fincore_db.* TO 'fincore_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Issue: Tests Failing After Code Changes

**Symptoms**:
- Tests were passing, now failing
- Error: "NullPointerException" or "AssertionError"

**Causes**:
1. Missing mocks
2. Test data changed
3. Breaking change in code
4. Test isolation issue

**Solutions**:

```java
// 1. Check test setup
@BeforeEach
void setUp() {
    // Reset mocks before each test
    Mockito.reset(userRepository, emailService);
    
    // Initialize test data
    testUser = createTestUser();
}

@AfterEach
void tearDown() {
    // Clean up test data
    userRepository.deleteAll();
}

// 2. Verify mocks are set up correctly
@Test
void testCreateUser() {
    // Arrange
    UserCreateDTO dto = new UserCreateDTO("John", "john@example.com");
    User savedUser = new User(1L, "John", "john@example.com");
    
    // Mock repository behavior
    when(userRepository.existsByEmail(anyString())).thenReturn(false);
    when(userRepository.save(any(User.class))).thenReturn(savedUser);
    
    // Act
    UserDTO result = userService.createUser(dto);
    
    // Assert
    assertNotNull(result);
    assertEquals("John", result.getFullName());
    
    // Verify interactions
    verify(userRepository, times(1)).existsByEmail("john@example.com");
    verify(userRepository, times(1)).save(any(User.class));
}
```

```powershell
# 3. Run single test to isolate issue
mvn test -Dtest=UserServiceTest#testCreateUser

# 4. Run tests in debug mode
mvn test -Dmaven.surefire.debug

# Then attach debugger on port 5005
```

---

### Issue: Spring Boot Application Won't Start

**Symptoms**:
```
***************************
APPLICATION FAILED TO START
***************************

Description:
...
```

**Causes**:
1. Port already in use
2. Missing configuration
3. Bean creation error
4. Circular dependency

**Solutions**:

```powershell
# 1. Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process using port
taskkill /PID <PID> /F

# Or change port
# application.properties
server.port=8081
```

```yaml
# 2. Check for missing required properties
# application.yml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/fincore_db}
    username: ${SPRING_DATASOURCE_USERNAME:fincore_user}
    password: ${SPRING_DATASOURCE_PASSWORD}  # Must be set!
  
jwt:
  secret: ${JWT_SECRET}  # Must be set!
  expiration: 3600000
```

```java
// 3. Fix circular dependency
// ❌ Bad
@Service
public class UserService {
    @Autowired
    private OrganizationService orgService;
}

@Service
public class OrganizationService {
    @Autowired
    private UserService userService;  // Circular!
}

// ✅ Good - Use @Lazy
@Service
public class OrganizationService {
    private final UserService userService;
    
    public OrganizationService(@Lazy UserService userService) {
        this.userService = userService;
    }
}
```

---

## 🐳 Docker Issues

### Issue: Docker Build Fails

**Symptoms**:
```
ERROR [internal] load metadata for docker.io/library/node:18
```

**Causes**:
1. Docker daemon not running
2. Network issue
3. Wrong Dockerfile syntax
4. Build context too large

**Solutions**:

```powershell
# 1. Start Docker Desktop
Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
# If not running, start Docker Desktop

# 2. Test Docker
docker --version
docker ps

# 3. Check Dockerfile syntax
# Frontend Dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 4. Add .dockerignore
echo "node_modules" > .dockerignore
echo "build" >> .dockerignore
echo ".git" >> .dockerignore
echo "*.md" >> .dockerignore
```

```powershell
# 5. Build with verbose output
docker build --progress=plain -t fincore-webui:test .

# 6. Build without cache
docker build --no-cache -t fincore-webui:test .
```

---

### Issue: Container Exits Immediately After Start

**Symptoms**:
- Container starts but exits within seconds
- `docker ps` doesn't show running container
- Cloud Run deployment failing

**Causes**:
1. Nginx running as daemon (exits immediately)
2. Application crashes on startup
3. No foreground process

**Solutions**:

```dockerfile
# ❌ Bad - Nginx runs as daemon, container exits
FROM nginx:alpine
COPY build /usr/share/nginx/html

# ✅ Good - Nginx runs in foreground
FROM nginx:alpine
COPY build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
```

```powershell
# Check container logs
docker logs <container-id>

# Run container in interactive mode
docker run -it fincore-webui:test /bin/sh

# Inside container, test nginx
nginx -t
nginx -g "daemon off;"
```

---

## ☁️ GCP Deployment Issues

### Issue: "Billing Not Enabled" Error

**Symptoms**:
```
ERROR: (gcloud.run.deploy) This API method requires billing to be enabled
```

**Cause**: GCP billing account not linked to project

**Solution**:

```powershell
# 1. List billing accounts
gcloud beta billing accounts list

# 2. Link billing account to project
gcloud beta billing projects link 994490239798 `
  --billing-account=015B82-6BAF14-3A135F

# 3. Verify billing enabled
gcloud beta billing projects describe 994490239798
# Should show: billingEnabled: true

# 4. Retry deployment
gcloud run deploy fincore-webui --region=europe-west2 ...
```

---

### Issue: Cloud Run 429 Rate Limit Errors

**Symptoms**:
- All requests to Cloud Run service return 429
- Service appears to be running
- Container restarts frequently

**Causes**:
1. Container exiting immediately (Nginx daemon issue)
2. Health check failing repeatedly
3. Actual rate limiting

**Solutions**:

```dockerfile
# 1. Fix Dockerfile (most common cause)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]  # Critical!
```

```nginx
# 2. Fix nginx.conf health check
server {
    listen 80;
    server_name _;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

```powershell
# 3. Check Cloud Run logs
gcloud run services logs read fincore-webui --region=europe-west2 --limit=50

# Look for:
# - Container exiting
# - Health check failures
# - Application errors

# 4. Redeploy with fix
gcloud run deploy fincore-webui `
  --image=europe-west2-docker.pkg.dev/.../fincore-webui:latest `
  --region=europe-west2 `
  --port=80 `
  --allow-unauthenticated
```

---

### Issue: GitHub Actions Deployment Failing

**Symptoms**:
- Tests pass but deployment fails
- Error: "Permission denied" or "Authentication failed"

**Causes**:
1. GCP service account key invalid
2. Missing IAM permissions
3. Wrong secret configuration

**Solutions**:

```powershell
# 1. Verify service account has required roles
gcloud projects get-iam-policy 994490239798 `
  --flatten="bindings[].members" `
  --filter="bindings.members:serviceAccount:fincore-cloudrun@*"

# Required roles:
# - roles/run.admin
# - roles/storage.admin
# - roles/iam.serviceAccountUser

# 2. Add missing roles
gcloud projects add-iam-policy-binding 994490239798 `
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" `
  --role="roles/run.admin"

# 3. Regenerate service account key
gcloud iam service-accounts keys create gcp-key.json `
  --iam-account=fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com

# 4. Update GitHub secret
# Copy contents of gcp-key.json
# Go to GitHub → Settings → Secrets → Actions
# Update GCP_SA_KEY with new key
```

---

## 🔍 Performance Issues

### Issue: Slow API Response Times

**Symptoms**:
- API calls taking >2 seconds
- Frontend feels sluggish
- Timeout errors

**Causes**:
1. Missing database index
2. N+1 query problem
3. No caching
4. Large payload

**Solutions**:

```java
// 1. Add database index
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_phone", columnList = "phone_number")
})
public class User {
    // ...
}
```

```java
// 2. Fix N+1 query with fetch join
// ❌ Bad - N+1 queries
List<Organization> orgs = organizationRepository.findAll();
for (Organization org : orgs) {
    org.getAddresses().size();  // Lazy load, generates N queries
}

// ✅ Good - Single query with join fetch
@Query("SELECT o FROM Organization o LEFT JOIN FETCH o.addresses WHERE o.id = :id")
Optional<Organization> findByIdWithAddresses(@Param("id") Long id);
```

```java
// 3. Add caching
@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#id")
    public UserDTO getUser(Long id) {
        // Cached after first call
        return userRepository.findById(id)
            .map(UserMapper::toDto)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }
    
    @CacheEvict(value = "users", key = "#id")
    public void updateUser(Long id, UserUpdateDTO dto) {
        // Clears cache when user updated
        // ...
    }
}
```

```typescript
// 4. Implement pagination (frontend)
const [page, setPage] = useState(0);
const [size, setSize] = useState(20);

const fetchOrganizations = async () => {
  const response = await fetch(
    `/api/organisations?page=${page}&size=${size}&sortBy=createdAt&sortDirection=DESC`
  );
  const data = await response.json();
  setOrganizations(data.content);
  setTotalPages(data.totalPages);
};
```

---

### Issue: High Memory Usage

**Symptoms**:
- Application slows down over time
- OutOfMemoryError exceptions
- Cloud Run instances getting killed

**Causes**:
1. Memory leak
2. Large object retention
3. Too much caching
4. Insufficient memory allocation

**Solutions**:

```powershell
# 1. Increase Cloud Run memory
gcloud run services update fincore-npe-api `
  --memory=1Gi `  # Increase from 512Mi to 1Gi
  --region=europe-west2

# 2. Add JVM memory options (backend)
# Dockerfile
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
```

```java
// 3. Fix memory leaks
// ❌ Bad - Static collections grow unbounded
public class UserCache {
    private static Map<Long, User> cache = new HashMap<>();  // Memory leak!
}

// ✅ Good - Use bounded cache
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        return new CaffeineCacheManager("users", "organizations") {{
            setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)  // Max 1000 entries
                .expireAfterWrite(10, TimeUnit.MINUTES)  // Expire after 10 min
                .recordStats());
        }};
    }
}
```

---

## 🆘 Getting More Help

### Check Logs

**Frontend**:
```powershell
# Browser console
F12 → Console tab

# Playwright test logs
start playwright-report/index.html

# Development server logs
npm start
# Output shows in terminal
```

**Backend**:
```powershell
# Local logs
cd C:\Development\git\userManagementApi
Get-Content logs/application.log -Tail 50 -Wait

# Cloud Run logs
gcloud run services logs read fincore-npe-api --region=europe-west2 --limit=100

# Follow logs in real-time
gcloud run services logs tail fincore-npe-api --region=europe-west2
```

### Enable Debug Mode

**Frontend**:
```typescript
// .env.local
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

// src/utils/logger.ts
const logger = {
  debug: (...args) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('[DEBUG]', ...args);
    }
  }
};
```

**Backend**:
```properties
# application-local.properties
logging.level.root=INFO
logging.level.com.fincore=DEBUG
logging.level.org.springframework=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Contact Team

- **Slack**: #fincore-dev
- **Email**: fincore-dev@company.com
- **GitHub Issues**: https://github.com/kasisheraz/fincore_WebUI/issues

---

## 📚 Additional Resources

- **GitHub Discussions**: https://github.com/kasisheraz/fincore_WebUI/discussions
- **Stack Overflow**: Tag your questions with `fincore` `spring-boot` `react`
- **GCP Status**: https://status.cloud.google.com
- **Spring Boot Docs**: https://docs.spring.io/spring-boot/docs/current/reference/html/
- **React Docs**: https://react.dev
- **Playwright Docs**: https://playwright.dev

---

**Last Updated**: March 16, 2026  
**Maintained By**: Fincore Platform Team
