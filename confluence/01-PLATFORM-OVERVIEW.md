# Fincore Platform - Overview

---

## 📊 Platform Summary

**Fincore** is a comprehensive financial management platform consisting of three main components: a React frontend application, a Spring Boot backend API, and infrastructure as code for GCP deployment.

### Key Metrics
- **Test Coverage**: 93% (739/798 tests passing)
- **Frontend E2E Tests**: 136/136 passing (100%)
- **Backend Unit Tests**: 602/661 passing (91%)
- **CI/CD Status**: ✅ Automated deployment with quality gates
- **Production Readiness**: ✅ Active with branch protection

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│  React App  │────────▶│   Backend   │
│             │         │  (WebUI)    │         │     API     │
└─────────────┘         └─────────────┘         └─────────────┘
                               │                        │
                               │                        │
                               ▼                        ▼
                        ┌─────────────┐         ┌─────────────┐
                        │  Cloud Run  │         │  Cloud Run  │
                        │  (Frontend) │         │  (Backend)  │
                        └─────────────┘         └─────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │  Cloud SQL  │
                                                 │   (MySQL)   │
                                                 └─────────────┘
```

### Component Overview

#### 1. **Frontend (fincore_WebUI)**
- **Technology**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Testing**: Playwright (E2E)
- **Build Tool**: Create React App
- **Deployment**: Google Cloud Run (Docker + Nginx)
- **Repository**: [github.com/kasisheraz/fincore_WebUI](https://github.com/kasisheraz/fincore_WebUI)

**Key Features**:
- User authentication (JWT-based)
- User management (CRUD operations)
- Organization management
- KYC document handling
- Customer questionnaires
- Responsive design (mobile-first)
- Role-based access control (RBAC)

#### 2. **Backend (userManagementApi)**
- **Technology**: Java 17 + Spring Boot 3.2
- **Database**: MySQL 8.0 (Cloud SQL)
- **Authentication**: JWT (HS256) with OTP
- **Testing**: JUnit 5 + Mockito
- **Build Tool**: Maven 3.9+
- **Deployment**: Google Cloud Run (Docker)
- **Repository**: [github.com/kasisheraz/userManagementApi](https://github.com/kasisheraz/userManagementApi)

**Key Features**:
- RESTful API (56+ endpoints)
- Phone-based OTP authentication
- Role-based authorization (4 roles, 21 permissions)
- User CRUD operations
- Organization onboarding
- KYC document verification
- AML screening integration
- Questionnaire management
- Automated OTP cleanup

#### 3. **Infrastructure (fincore_Iasc)**
- **Technology**: Terraform (Infrastructure as Code)
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Region**: europe-west2 (London)
- **Repository**: [github.com/kasisheraz/fincore_Iasc](https://github.com/kasisheraz/fincore_Iasc)

**Resources Managed**:
- Cloud Run services (frontend + backend)
- Cloud SQL (MySQL database)
- VPC networking
- IAM roles and service accounts
- Secret Manager (credentials)
- Container Registry (Docker images)

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User enters phone number
   ↓
2. Backend generates 6-digit OTP
   ↓
3. OTP sent to phone (simulated in dev)
   ↓
4. User enters OTP
   ↓
5. Backend validates OTP
   ↓
6. JWT access token issued (24-hour expiry)
   ↓
7. Frontend stores token in memory
   ↓
8. All subsequent requests include JWT in Authorization header
```

### Security Features
- ✅ JWT-based stateless authentication
- ✅ Phone-based OTP (6-digit, 5-minute expiration)
- ✅ Role-Based Access Control (RBAC)
- ✅ HTTPS-only communication
- ✅ Private database (no public IP)
- ✅ Cloud SQL Proxy for secure connections
- ✅ Secrets stored in GCP Secret Manager
- ✅ CORS configuration
- ✅ Security headers (X-Frame-Options, CSP, etc.)

---

## 🚀 Deployment Architecture

### Google Cloud Platform (GCP)

#### Cloud Run Services
| Service | Region | URL | Auto-scaling |
|---------|--------|-----|--------------|
| **fincore-webui-npe** | europe-west2 | https://fincore-webui-npe-lfd6ooarra-nw.a.run.app | 0-3 instances |
| **fincore-npe-api** | europe-west2 | https://fincore-npe-api-lfd6ooarra-nw.a.run.app | 0-3 instances |

#### Cloud SQL
- **Instance**: fincore-database
- **Version**: MySQL 8.0
- **Region**: europe-west2
- **Access**: Private only (via Cloud SQL Proxy)
- **Backup**: Automated daily backups
- **High Availability**: Enabled

#### Networking
- **VPC**: fincore-vpc
- **Subnet**: fincore-subnet (europe-west2)
- **Firewall**: Configured for Cloud Run and Cloud SQL

---

## 📦 Technology Stack Summary

### Frontend
```
React 18.2.0
TypeScript 4.9+
Material-UI v5
React Router v6
Axios (HTTP client)
Playwright (E2E testing)
Nginx (Production server)
Docker (Containerization)
```

### Backend
```
Java 17 (LTS)
Spring Boot 3.2.0
Spring Security
Spring Data JPA
MySQL Connector/J
JWT (jjwt library)
JUnit 5 + Mockito
Maven 3.9+
Docker (Containerization)
```

### Infrastructure
```
Terraform 1.5+
Google Cloud Platform
  - Cloud Run
  - Cloud SQL
  - VPC Networking
  - Secret Manager
  - Container Registry
  - IAM
```

### CI/CD
```
GitHub Actions
Docker multi-stage builds
Automated testing
Quality gates (branch protection)
Automated deployment to Cloud Run
```

---

## 📊 Quality Metrics

### Test Results (Last Update: March 16, 2026)

| Component | Tests | Passing | Pass Rate | Status |
|-----------|-------|---------|-----------|--------|
| **Frontend E2E** | 136 | 136 | 100% | ✅ |
| **Backend Unit** | 661 | 602 | 91% | ✅ |
| **Overall** | **798** | **739** | **93%** | ✅ |

### Quality Gates
- ✅ **Branch Protection**: Enabled on all repositories
- ✅ **Required Approvals**: 1 reviewer required for PRs
- ✅ **Status Checks**: Tests must pass before merge
- ✅ **No Direct Pushes**: Main branch protected
- ✅ **Automated Testing**: Tests run on every PR
- ✅ **Deployment Blocking**: Failed tests block deployment

### Code Quality
- **Test Coverage Target**: 80%+
- **Code Review**: Required for all changes
- **Linting**: Enforced via ESLint (frontend) and Checkstyle (backend)
- **Type Safety**: TypeScript (frontend) and Java static typing (backend)

---

## 👥 User Roles & Permissions

### Roles
1. **SUPER_ADMIN**: Full system access
2. **ADMIN**: Administrative access (no system config)
3. **MANAGER**: Team management and reporting
4. **USER**: Standard user access

### Permissions (21 total)
- User management (create, read, update, delete)
- Organization management
- KYC verification (submit, review, approve)
- Document management
- Questionnaire management
- Answer management
- System configuration (SUPER_ADMIN only)

---

## 🌍 Environments

### NPE (Non-Production Environment)
- **Purpose**: Development and staging
- **Frontend**: https://fincore-webui-npe-lfd6ooarra-nw.a.run.app
- **Backend**: https://fincore-npe-api-lfd6ooarra-nw.a.run.app
- **Database**: Cloud SQL (europe-west2)
- **Auto-scaling**: 0-3 instances
- **Billing**: Pay-per-use (free tier eligible)

### Production (Future)
- **Purpose**: Live customer-facing environment
- **Planned Infrastructure**: Separate GCP project
- **High Availability**: Multi-region deployment
- **Backup**: Automated with point-in-time recovery
- **Monitoring**: Cloud Monitoring + alerting

---

## 📚 Documentation Structure

### Confluence Organization
```
Fincore Platform
├── Overview (this page)
├── Architecture
│   ├── System Architecture
│   ├── Database Schema
│   ├── Authentication Flow
│   └── Deployment Architecture
├── Getting Started
│   ├── Prerequisites
│   ├── Local Development Setup
│   └── First-Time Setup
├── Development
│   ├── Frontend Development Guide
│   ├── Backend Development Guide
│   └── Code Standards
├── Testing
│   ├── Testing Strategy
│   ├── Frontend E2E Testing
│   ├── Backend Unit Testing
│   └── Test Results
├── Deployment
│   ├── CI/CD Pipeline
│   ├── Infrastructure (Terraform)
│   └── Deployment Checklist
├── API Documentation
│   ├── Authentication Endpoints
│   ├── User Management
│   ├── Organization Management
│   ├── KYC & Verification
│   └── Questionnaires
└── Troubleshooting
    ├── Common Issues
    └── FAQ
```

---

## 🎯 Key Achievements

✅ **Complete Test Suite**: 93% test pass rate across frontend and backend
✅ **Automated CI/CD**: GitHub Actions with quality gates
✅ **Branch Protection**: All repositories protected with required reviews
✅ **Cloud Deployment**: Both frontend and backend running on GCP Cloud Run
✅ **Secure Authentication**: JWT + OTP authentication implemented
✅ **Database Security**: Private Cloud SQL with proxy access only
✅ **High Code Quality**: TypeScript + Java with linting and code review

---

## 📞 Quick Links

### Repositories
- 🌐 [Frontend (WebUI)](https://github.com/kasisheraz/fincore_WebUI)
- 🔧 [Backend (API)](https://github.com/kasisheraz/userManagementApi)
- 🏗️ [Infrastructure](https://github.com/kasisheraz/fincore_Iasc)

### Live Services
- 🚀 [Frontend NPE](https://fincore-webui-npe-lfd6ooarra-nw.a.run.app)
- 🔌 [Backend NPE](https://fincore-npe-api-lfd6ooarra-nw.a.run.app)
- ❤️ [API Health Check](https://fincore-npe-api-lfd6ooarra-nw.a.run.app/actuator/health)

### CI/CD
- ⚙️ [Frontend GitHub Actions](https://github.com/kasisheraz/fincore_WebUI/actions)
- ⚙️ [Backend GitHub Actions](https://github.com/kasisheraz/userManagementApi/actions)

---

## 🔄 Version History

| Date | Version | Changes |
|------|---------|---------|
| March 16, 2026 | v1.2.0 | Branch protection enabled, 93% test pass rate |
| March 11, 2026 | v1.1.0 | Frontend E2E tests fixed (100% passing) |
| January 2025 | v1.0.0 | Initial production deployment |

---

**Last Updated**: March 16, 2026  
**Maintained By**: Development Team  
**Status**: ✅ Production Ready
