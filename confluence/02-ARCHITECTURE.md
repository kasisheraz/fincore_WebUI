# Architecture Documentation

**Last Updated**: March 16, 2026

---

## 🏗️ System Architecture Overview

Fincore is a modern cloud-native financial platform built on microservices architecture, deployed on Google Cloud Platform.

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       Users / Clients                         │
└────────────┬─────────────────────────────────┬───────────────┘
             │                                 │
             ▼                                 ▼
    ┌────────────────┐                ┌────────────────┐
    │   React SPA    │                │  Mobile App    │
    │  (fincore_WebUI│                │   (Future)     │
    └────────┬───────┘                └────────┬───────┘
             │                                 │
             └────────────┬────────────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │    API Gateway         │
             │  (Cloud Load Balancer) │
             └────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │    Backend API (Cloud Run)      │
        │   userManagementApi             │
        │   - User Management             │
        │   - Authentication (JWT + OTP)  │
        │   - Organization Management     │
        │   - KYC Verification            │
        │   - Questionnaire Management    │
        └──────────────┬──────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Cloud SQL (MySQL)  │
            │   - Primary Database │
            │   - Private Access   │
            │   - Auto Backups     │
            └──────────────────────┘
```

---

## 🎯 Architecture Principles

### 1. **Cloud-Native Design**
- Containerized applications (Docker)
- Serverless compute (Cloud Run)
- Managed services (Cloud SQL)
- Infrastructure as Code (Terraform)

### 2. **Security First**
- Zero-trust network architecture
- Private database (no public IP)
- JWT-based authentication
- HTTPS everywhere
- Secrets in Secret Manager

### 3. **Scalability**
- Horizontal auto-scaling (Cloud Run)
- Stateless API design
- Database connection pooling
- CDN for static assets

### 4. **Reliability**
- Multi-region capability
- Automated health checks
- Graceful degradation
- Circuit breakers

---

## 📦 Component Architecture

### Frontend Architecture (fincore_WebUI)

```
fincore_WebUI/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components (buttons, inputs)
│   │   ├── layout/         # Layout components (header, sidebar)
│   │   ├── organizations/  # Organization-specific components
│   │   └── users/          # User management components
│   ├── pages/              # Page components (routes)
│   ├── services/           # API service layer
│   │   ├── apiService.ts   # Base API client
│   │   ├── authService.ts  # Authentication service
│   │   └── userService.ts  # User management service
│   ├── context/            # React Context (state management)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utility functions
│   └── config/             # Configuration
└── tests/                  # E2E tests (Playwright)
```

**Key Technologies**:
- React 18 (UI library)
- TypeScript (type safety)
- Material-UI (component library)
- React Router v6 (routing)
- Axios (HTTP client)
- React Context (state management)

### Backend Architecture (userManagementApi)

```
userManagementApi/
├── src/main/java/com/fincore/api/
│   ├── config/                # Configuration classes
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   └── DatabaseConfig.java
│   ├── controller/            # REST controllers
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── OrganizationController.java
│   │   └── KycController.java
│   ├── service/               # Business logic
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   └── KycService.java
│   ├── repository/            # Data access layer
│   │   ├── UserRepository.java
│   │   └── OrganizationRepository.java
│   ├── model/                 # JPA entities
│   │   ├── User.java
│   │   ├── Organization.java
│   │   └── KycDocument.java
│   ├── dto/                   # Data Transfer Objects
│   ├── security/              # Security components
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── exception/             # Exception handling
└── src/test/java/             # Unit & integration tests
```

**Key Technologies**:
- Java 17 (LTS)
- Spring Boot 3.2 (framework)
- Spring Security (authentication/authorization)
- Spring Data JPA (ORM)
- MySQL 8.0 (database)
- JUnit 5 (testing)
- Maven (build tool)

### Infrastructure Architecture (fincore_Iasc)

```
fincore_Iasc/
├── terraform/
│   ├── main.tf              # Main infrastructure definition
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── modules/
│   │   ├── cloud-run/      # Cloud Run module
│   │   ├── cloud-sql/      # Cloud SQL module
│   │   ├── networking/     # VPC & networking
│   │   └── iam/            # IAM roles & permissions
│   └── environments/
│       ├── npe/            # Non-production environment
│       └── prod/           # Production environment
├── scripts/                 # Automation scripts
└── docs/                   # Infrastructure documentation
```

**Key Technologies**:
- Terraform 1.5+ (IaC)
- Google Cloud Platform
- Cloud Run (container hosting)
- Cloud SQL (managed MySQL)
- VPC (networking)
- Secret Manager (secrets)

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User enters phone number
   ↓
2. POST /api/auth/request-otp
   ↓
3. Backend generates 6-digit OTP
   Stores: {phone, otp, expiry: 5min}
   ↓
4. OTP sent to user (SMS in production, logged in dev)
   ↓
5. User enters OTP
   ↓
6. POST /api/auth/verify-otp
   ↓
7. Backend validates OTP
   - Checks expiry
   - Checks attempts
   ↓
8. Generate JWT tokens
   - Access Token (24h expiry)
   - Refresh Token (7d expiry)
   ↓
9. Return tokens to client
   ↓
10. Client stores tokens (memory only, no localStorage)
    ↓
11. Subsequent requests:
    Authorization: Bearer <access-token>
    ↓
12. Backend validates JWT on every request
    - Verify signature
    - Check expiry
    - Extract user info
```

### Authorization (RBAC)

```
Roles Hierarchy:
SUPER_ADMIN → Full system access
    ↓
ADMIN → Administrative functions
    ↓
MANAGER → Team management
    ↓
USER → Basic access
```

**Permissions Matrix**:

| Resource | USER | MANAGER | ADMIN | SUPER_ADMIN |
|----------|------|---------|-------|-------------|
| View Users | ✅ | ✅ | ✅ | ✅ |
| Create Users | ❌ | ✅ | ✅ | ✅ |
| Update Users | ❌ | ✅ | ✅ | ✅ |
| Delete Users | ❌ | ❌ | ✅ | ✅ |
| Manage Organizations | ❌ | ✅ | ✅ | ✅ |
| KYC Approval | ❌ | ❌ | ✅ | ✅ |
| System Config | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │   1:N   │ Organization │   1:N   │   Address   │
│─────────────│◄────────┤──────────────│◄────────┤─────────────│
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ phoneNumber │         │ name         │         │ typeCode    │
│ email       │         │ type         │         │ addressLine1│
│ fullName    │         │ status       │         │ city        │
│ role        │         │ userId (FK)  │         │ country     │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │ 1:N                    │ 1:N
       ▼                        ▼
┌─────────────┐         ┌──────────────┐
│  OtpToken   │         │ KycDocument  │
│─────────────│         │──────────────│
│ id (PK)     │         │ id (PK)      │
│ phoneNumber │         │ documentType │
│ otp         │         │ filePath     │
│ expiresAt   │         │ status       │
│ userId (FK) │         │ orgId (FK)   │
└─────────────┘         └──────────────┘
```

### Key Tables

#### users
- Stores user information and credentials
- Indexed on: email, phoneNumber
- Soft delete enabled (status field)

#### organizations
- Stores organization details
- Types: LTD, PLC, LLP, SOLE_TRADER, CHARITY, PARTNERSHIP
- Indexed on: name, type, status

#### kyc_documents
- Stores KYC document metadata
- Actual files in Cloud Storage
- Statuses: PENDING → UNDER_REVIEW → VERIFIED/REJECTED

#### questionnaires & customer_answers
- Dynamic questionnaire system
- Supports multiple question types
- Tracks completion rate

---

## 🚀 Deployment Architecture

### Google Cloud Platform Resources

#### Cloud Run Services

**Frontend Service**:
- Name: `fincore-webui-npe`
- Region: `europe-west2`
- Container: Nginx serving React SPA
- Auto-scaling: 0-3 instances
- Memory: 512MB
- CPU: 1 vCPU
- Timeout: 60s

**Backend Service**:
- Name: `fincore-npe-api`
- Region: `europe-west2`
- Container: Java 17 + Spring Boot
- Auto-scaling: 0-3 instances
- Memory: 1GB
- CPU: 1 vCPU
- Timeout: 300s

#### Cloud SQL

- Instance: `fincore-database`
- Version: MySQL 8.0
- Region: `europe-west2`
- Machine Type: `db-f1-micro` (NPE), `db-n1-standard-1` (Prod)
- Storage: 10GB SSD (auto-scaling enabled)
- Backups: Daily automated backups
- High Availability: Enabled in production

#### Networking

- VPC: `fincore-vpc`
- Subnet: `fincore-subnet` (10.0.0.0/24)
- Cloud SQL Proxy: Private IP connection
- Load Balancer: HTTPS only
- Firewall: Restricted to Cloud Run IPs

---

## 📊 Scalability Strategy

### Horizontal Scaling
- Cloud Run auto-scales based on:
  - CPU utilization (target: 60%)
  - Request concurrency (50 requests/instance)
  - Custom metrics (response time)

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling (HikariCP)
- Query optimization and indexing
- Caching layer (Redis - future)

### CDN & Caching
- Cloud CDN for static assets
- Browser caching headers
- API response caching (future)

---

## 🔄 CI/CD Pipeline

### Build & Deploy Flow

```
Git Push → GitHub Actions → Build → Test → Deploy
     ↓             ↓           ↓       ↓       ↓
  main/PR    Checkout    Docker   Unit    Cloud Run
               ↓           Build   Tests   Deploy
          Install Deps      ↓       ↓       ↓
               ↓         Push GCR  E2E    Update
          Run Linter        ↓     Tests   Service
                       Tag Image    ↓
                                 Report
```

**Stages**:
1. **Code Quality**: Linting, formatting checks
2. **Build**: Docker image creation
3. **Test**: Unit tests + E2E tests
4. **Security**: Vulnerability scanning
5. **Deploy**: Push to Cloud Run
6. **Verify**: Health checks

---

## 📈 Monitoring & Observability

### Metrics Collected
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- CPU & memory utilization
- Database connections
- Active users

### Logging
- Application logs → Cloud Logging
- Structured JSON logging
- Correlation IDs for request tracing
- Log retention: 30 days (NPE), 90 days (Prod)

### Alerting (Future)
- High error rate (>5%)
- Slow response time (>2s p95)
- Database connection pool exhausted
- Deployment failures

---

## 🔮 Future Architecture Enhancements

### Planned Improvements

1. **Microservices Split**
   - Auth Service (dedicated)
   - User Service
   - Organization Service
   - KYC Service
   - Notification Service

2. **Message Queue**
   - Cloud Pub/Sub for async operations
   - Email notifications
   - KYC processing
   - Report generation

3. **Caching Layer**
   - Redis for session storage
   - API response caching
   - Rate limiting

4. **API Gateway**
   - Cloud Endpoints or Kong
   - Rate limiting
   - API versioning
   - Request transformation

5. **Observability**
   - Distributed tracing (Cloud Trace)
   - Custom dashboards
   - SLO/SLI monitoring
   - Automated alerting

---

**Last Updated**: March 16, 2026  
**Next Review**: April 2026
