# API Endpoints Reference

**Complete API documentation for Fincore Platform**

---

## 📋 Overview

The Fincore Platform exposes **56+ RESTful API endpoints** across 8 functional modules. All endpoints require JWT authentication except for login operations.

**Base URLs:**
- **Development**: `http://localhost:8080/api`
- **Production (NPE)**: `https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api`

---

## 🔐 1. Authentication Module

**Base Path**: `/api/auth`

### 1.1 Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

**Response**: `200 OK`
```json
{
  "devOtp": "123456",
  "message": "OTP sent successfully"
}
```

### 1.2 Verify OTP & Login
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### 1.3 Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "USER",
  "status": "ACTIVE"
}
```

---

## 👥 2. User Management Module

**Base Path**: `/api/users`

### 2.1 List All Users
```http
GET /api/users
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-03-10T14:20:00Z"
  }
]
```

### 2.2 Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

### 2.3 Create New User
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1987654321",
  "role": "USER"
}
```

**Response**: `201 Created`

### 2.4 Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "status": "ACTIVE"
}
```

**Response**: `200 OK`

### 2.5 Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

**Response**: `204 No Content`

---

## 📍 3. Address Management Module

**Base Path**: `/api/addresses`

### Address Type Codes
| Code | Type | Description |
|------|------|-------------|
| 1 | Residential | Primary home address |
| 2 | Business | Business operating address |
| 3 | Registered | Legal registered address |
| 4 | Correspondence | Mailing address |
| 5 | Postal | PO Box address |

### 3.1 List All Addresses
```http
GET /api/addresses
Authorization: Bearer {token}
```

### 3.2 Get by Address Type
```http
GET /api/addresses/type/{typeCode}
Authorization: Bearer {token}
```

### 3.3 Get by Country
```http
GET /api/addresses/country/{country}
Authorization: Bearer {token}
```

### 3.4 Create Address
```http
POST /api/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "typeCode": 1,
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "London",
  "stateCode": "LDN",
  "postalCode": "SW1A 1AA",
  "country": "United Kingdom",
  "statusDescription": "ACTIVE"
}
```

**Response**: `201 Created`

### 3.5 Update Address
```http
PUT /api/addresses/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### 3.6 Delete Address
```http
DELETE /api/addresses/{id}
Authorization: Bearer {token}
```

---

## 🏢 4. Organization Management Module

**Base Path**: `/api/organisations`

### Organization Types
- `LTD` - Limited Company
- `PLC` - Public Limited Company
- `SOLE_TRADER` - Sole Proprietor
- `PARTNERSHIP` - Partnership
- `LLP` - Limited Liability Partnership

### Organization Status
- `PENDING` - Awaiting verification
- `ACTIVE` - Approved and active
- `SUSPENDED` - Temporarily suspended
- `REJECTED` - Application rejected

### 4.1 List Organizations (Paginated)
```http
GET /api/organisations?page=0&size=20&sortBy=createdAt&sortDirection=DESC
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "legalName": "Acme Corporation Ltd",
      "businessName": "Acme Corp",
      "registrationNumber": "12345678",
      "organisationType": "LTD",
      "incorporationDate": "2020-05-15",
      "countryOfIncorporation": "United Kingdom",
      "status": "ACTIVE",
      "websiteAddress": "https://acmecorp.com",
      "registeredAddress": { ... },
      "businessAddress": { ... },
      "createdAt": "2026-01-20T09:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 45,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

### 4.2 Get Organization by ID
```http
GET /api/organisations/{id}
Authorization: Bearer {token}
```

### 4.3 Get by Owner
```http
GET /api/organisations/owner/{ownerId}
Authorization: Bearer {token}
```

### 4.4 Get by Status
```http
GET /api/organisations/status/{status}
Authorization: Bearer {token}
```

### 4.5 Check if Registration Number Exists
```http
GET /api/organisations/exists/registration/{regNo}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
true
```

### 4.6 Create Organization
```http
POST /api/organisations
Authorization: Bearer {token}
Content-Type: application/json

{
  "ownerId": 1,
  "legalName": "Tech Innovations Ltd",
  "businessName": "TechInnov",
  "registrationNumber": "87654321",
  "organisationType": "LTD",
  "incorporationDate": "2025-03-01",
  "countryOfIncorporation": "United Kingdom",
  "businessDescription": "Technology solutions provider",
  "websiteAddress": "https://techinnovations.com",
  "numberOfBranches": 3,
  "numberOfAgents": 15,
  "registeredAddress": {
    "typeCode": 3,
    "addressLine1": "10 Tech Plaza",
    "city": "London",
    "stateCode": "LDN",
    "postalCode": "EC1A 1BB",
    "country": "United Kingdom"
  }
}
```

**Response**: `201 Created`

### 4.7 Search Organizations (Advanced)
```http
POST /api/organisations/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "searchTerm": "tech",
  "status": "ACTIVE",
  "organisationType": "LTD",
  "page": 0,
  "size": 10,
  "sortBy": "legalName",
  "sortDirection": "ASC"
}
```

### 4.8 Update Organization
```http
PUT /api/organisations/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### 4.9 Update Organization Status
```http
PATCH /api/organisations/{id}/status?status=SUSPENDED&reason=Pending+review
Authorization: Bearer {token}
```

### 4.10 Delete Organization
```http
DELETE /api/organisations/{id}
Authorization: Bearer {token}
```

---

## 📄 5. KYC Document Management Module

**Base Path**: `/api/kyc-documents`

### Document Types
- `ARTICLES_OF_ASSOCIATION` - Company articles
- `CERTIFICATE_OF_INCORPORATION` - Incorporation certificate
- `PROOF_OF_ADDRESS` - Address verification
- `BANK_STATEMENT` - Financial proof
- `TAX_CERTIFICATE` - Tax registration
- `DIRECTOR_ID` - Director identification
- `SHAREHOLDER_AGREEMENT` - Ownership docs

### Document Status
- `PENDING` - Awaiting verification
- `VERIFIED` - Approved by admin
- `REJECTED` - Not acceptable
- `EXPIRED` - Past expiry date

### 5.1 Get Document by ID
```http
GET /api/kyc-documents/{id}
Authorization: Bearer {token}
```

### 5.2 Get Documents by Organization
```http
GET /api/kyc-documents/organisation/{orgId}
Authorization: Bearer {token}
```

### 5.3 Get Documents (Paginated)
```http
GET /api/kyc-documents/organisation/{orgId}/paged?page=0&size=10
Authorization: Bearer {token}
```

### 5.4 Get by Status
```http
GET /api/kyc-documents/status/{status}
Authorization: Bearer {token}
```

### 5.5 Get Pending Documents
```http
GET /api/kyc-documents/pending
Authorization: Bearer {token}
```

### 5.6 Get by Organization & Type
```http
GET /api/kyc-documents/organisation/{orgId}/type/{type}
Authorization: Bearer {token}
```

### 5.7 Count Verified Documents
```http
GET /api/kyc-documents/organisation/{orgId}/verified/count
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
5
```

### 5.8 Upload Document
```http
POST /api/kyc-documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "organisationId": 1,
  "documentType": "CERTIFICATE_OF_INCORPORATION",
  "documentNumber": "CERT-2025-001",
  "issueDate": "2025-03-01",
  "issuingAuthority": "Companies House",
  "documentUrl": "https://storage.googleapis.com/fincore/docs/cert-001.pdf"
}
```

**Response**: `201 Created`

### 5.9 Verify Document
```http
POST /api/kyc-documents/{id}/verify?verifierId=5&status=VERIFIED&reason=All+checks+passed
Authorization: Bearer {token}
```

**Response**: `200 OK`

### 5.10 Update Document
```http
PUT /api/kyc-documents/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### 5.11 Delete Document
```http
DELETE /api/kyc-documents/{id}
Authorization: Bearer {token}
```

---

## ✅ 6. KYC Verification Module

**Base Path**: `/api/v1/kyc-verification`

### Verification Levels
- `BASIC` - Basic identity check
- `ENHANCED` - Additional checks
- `FULL` - Comprehensive verification

### Verification Status
- `PENDING` - Under review
- `APPROVED` - Verification complete
- `REJECTED` - Failed verification
- `EXPIRED` - Needs renewal

### Risk Levels
- `LOW` - Low risk profile
- `MEDIUM` - Moderate risk
- `HIGH` - High risk (requires review)

### 6.1 Get Verification by ID
```http
GET /api/v1/kyc-verification/{id}
Authorization: Bearer {token}
```

### 6.2 Get Verification by User
```http
GET /api/v1/kyc-verification/user/{userId}
Authorization: Bearer {token}
```

### 6.3 Get Expired Verifications
```http
GET /api/v1/kyc-verification/expired
Authorization: Bearer {token}
```

### 6.4 Get by Status
```http
GET /api/v1/kyc-verification/status/{status}
Authorization: Bearer {token}
```

### 6.5 Count by Status
```http
GET /api/v1/kyc-verification/count/{status}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
42
```

### 6.6 Check if User Approved
```http
GET /api/v1/kyc-verification/approved/{userId}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
true
```

### 6.7 Submit Verification
```http
POST /api/v1/kyc-verification/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "verificationLevel": "ENHANCED",
  "sumsubApplicantId": "5f8a9b2c3d1e4f5a6b7c8d9e"
}
```

**Response**: `201 Created`
```json
{
  "verificationId": 10,
  "userId": 1,
  "verificationLevel": "ENHANCED",
  "status": "PENDING",
  "submittedAt": "2026-03-16T10:00:00Z"
}
```

### 6.8 Update Verification Status
```http
PUT /api/v1/kyc-verification/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "APPROVED",
  "riskLevel": "LOW",
  "reviewerComments": "All documents verified successfully",
  "approvalReason": "Meets all KYC requirements"
}
```

### 6.9 Delete Verification
```http
DELETE /api/v1/kyc-verification/{id}
Authorization: Bearer {token}
```

---

## ❓ 7. Questionnaire Management Module

**Base Path**: `/api/v1/questions`

### Question Categories
- `PERSONAL_INFO` - Personal details
- `FINANCIAL` - Financial information
- `EMPLOYMENT` - Employment history
- `IDENTIFICATION` - ID verification
- `RISK_ASSESSMENT` - Risk profiling
- `COMPLIANCE` - Regulatory compliance

### Question Status
- `ACTIVE` - Currently in use
- `INACTIVE` - Temporarily disabled
- `ARCHIVED` - No longer used

### 7.1 Get All Questions
```http
GET /api/v1/questions
Authorization: Bearer {token}
```

### 7.2 Get Question by ID
```http
GET /api/v1/questions/{id}
Authorization: Bearer {token}
```

### 7.3 Get Active Questions
```http
GET /api/v1/questions/active
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
[
  {
    "questionId": 1,
    "questionText": "What is your current employment status?",
    "questionCategory": "EMPLOYMENT",
    "displayOrder": 1,
    "status": "ACTIVE",
    "createdBy": 5
  }
]
```

### 7.4 Get Questions by Category
```http
GET /api/v1/questions/category/{category}
Authorization: Bearer {token}
```

### 7.5 Count Active Questions
```http
GET /api/v1/questions/active/count
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
15
```

### 7.6 Create Question
```http
POST /api/v1/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionText": "What is your annual income range?",
  "questionCategory": "FINANCIAL",
  "displayOrder": 5
}
```

**Response**: `201 Created`

### 7.7 Update Question
```http
PUT /api/v1/questions/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### 7.8 Activate Question
```http
PATCH /api/v1/questions/{id}/activate
Authorization: Bearer {token}
```

### 7.9 Inactivate Question
```http
PATCH /api/v1/questions/{id}/inactivate
Authorization: Bearer {token}
```

### 7.10 Delete Question
```http
DELETE /api/v1/questions/{id}
Authorization: Bearer {token}
```

---

## 💬 8. Customer Answers Module

**Base Path**: `/api/v1/answers`

### 8.1 Get Answer by ID
```http
GET /api/v1/answers/{id}
Authorization: Bearer {token}
```

### 8.2 Get All Answers for User
```http
GET /api/v1/answers/user/{userId}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
[
  {
    "answerId": 1,
    "userId": 10,
    "questionId": 1,
    "answerText": "Employed full-time",
    "answeredAt": "2026-03-15T14:30:00Z"
  },
  {
    "answerId": 2,
    "userId": 10,
    "questionId": 5,
    "answerText": "$50,000 - $75,000",
    "answeredAt": "2026-03-15T14:32:00Z"
  }
]
```

### 8.3 Get Completed Answers
```http
GET /api/v1/answers/completed
Authorization: Bearer {token}
```

### 8.4 Get Specific Answer
```http
GET /api/v1/answers/user/{userId}/question/{questionId}
Authorization: Bearer {token}
```

### 8.5 Check if Question Answered
```http
GET /api/v1/answers/answered?userId={userId}&questionId={questionId}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
true
```

### 8.6 Count User Answers
```http
GET /api/v1/answers/user/{userId}/count
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
12
```

### 8.7 Get Completion Rate
```http
GET /api/v1/answers/completion-rate/{totalQuestions}?userId={userId}
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
80.0
```

### 8.8 Submit Answer
```http
POST /api/v1/answers
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 10,
  "questionId": 3,
  "answerText": "Self-employed"
}
```

**Response**: `201 Created`

### 8.9 Update Answer
```http
PUT /api/v1/answers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "answerText": "Employed full-time (updated)"
}
```

### 8.10 Delete Answer
```http
DELETE /api/v1/answers/{id}
Authorization: Bearer {token}
```

### 8.11 Delete All User Answers
```http
DELETE /api/v1/answers/user/{userId}
Authorization: Bearer {token}
```

---

## 🔧 Common Patterns

### Authentication Header
All authenticated endpoints require JWT token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Pagination Query Parameters
```http
?page=0&size=20&sortBy=createdAt&sortDirection=DESC
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Page number (0-indexed) |
| size | integer | 20 | Items per page |
| sortBy | string | varies | Sort field name |
| sortDirection | string | ASC | ASC or DESC |

### Standard HTTP Status Codes
| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Internal error |

### Common Response Formats

**Success Response**:
```json
{
  "id": 1,
  "field": "value",
  "timestamp": "2026-03-16T10:00:00Z"
}
```

**Error Response**:
```json
{
  "timestamp": "2026-03-16T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Paginated Response**:
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## 🧪 Testing with Postman

### Import Collections
1. Import `postman_collection.json` (Phase 1 endpoints)
2. Import `phase2-postman-collection.json` (Phase 2 endpoints)

### Environment Setup
```json
{
  "base_url": "https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api",
  "jwt_token": "{{auto-populated-after-login}}"
}
```

### Authentication Flow
1. **Request OTP**: `POST /auth/request-otp`
2. **Verify OTP**: `POST /auth/verify-otp` → saves JWT token
3. **All other requests**: Automatically use saved token

---

## 📝 Best Practices

### Frontend Integration
```typescript
// apiService.ts
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
  'Content-Type': 'application/json'
});

export const apiService = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
};
```

### Error Handling
```typescript
try {
  const data = await apiService.get('/users');
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    navigate('/login');
  } else if (error.status === 404) {
    // Show not found message
    showError('Resource not found');
  } else {
    // Show generic error
    showError('An error occurred');
  }
}
```

---

## 📚 Additional Resources

- **Postman Collections**: Located in repository root
- **API Backend**: [userManagementApi Repository](https://github.com/kasisheraz/userManagementApi)
- **Swagger Documentation**: `{base_url}/swagger-ui.html`
- **Health Check**: `{base_url}/actuator/health`

---

**Total Endpoints**: 56+  
**Authentication**: JWT Bearer Token  
**API Version**: v1  
**Last Updated**: March 16, 2026
