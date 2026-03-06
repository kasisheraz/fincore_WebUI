# FinCore WebUI - API Endpoints Reference

## Quick Reference Guide for All API Endpoints

This document provides a quick reference for all 56+ API endpoints that need to be integrated.

---

## 🔐 Authentication Module

### Base URL: `/api/auth`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/request-otp` | Request OTP for login | `{ phoneNumber: string }` | `{ devOtp: string }` |
| POST | `/verify-otp` | Verify OTP and get JWT | `{ phoneNumber: string, otp: string }` | `{ accessToken: string, refreshToken: string }` |
| GET | `/me` | Get current user info | - | `{ user: UserDTO }` |

---

## 👥 User Management Module

### Base URL: `/api/users`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | List all users | - | `UserDTO[]` |
| GET | `/{id}` | Get user by ID | - | `UserDTO` |
| POST | `/` | Create new user | `UserCreateDTO` | `UserDTO` |
| PUT | `/{id}` | Update user | `UserUpdateDTO` | `UserDTO` |
| DELETE | `/{id}` | Delete user | - | `void` |

### DTOs
```typescript
interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UserCreateDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface UserUpdateDTO {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
}
```

---

## 📍 Address Management Module

### Base URL: `/api/addresses`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | List all addresses | - | `AddressDTO[]` |
| GET | `/{id}` | Get address by ID | - | `AddressDTO` |
| GET | `/type/{typeCode}` | Get by type | - | `AddressDTO[]` |
| GET | `/country/{country}` | Get by country | - | `AddressDTO[]` |
| POST | `/` | Create address | `AddressCreateDTO` | `AddressDTO` |
| PUT | `/{id}` | Update address | `AddressUpdateDTO` | `AddressDTO` |
| DELETE | `/{id}` | Delete address | - | `void` |

### DTOs
```typescript
interface AddressDTO {
  id: number;
  typeCode: number; // 1=Residential, 2=Business, 3=Registered, 4=Correspondence, 5=Postal
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  postalCode: string;
  country: string;
  statusDescription: string;
}

interface AddressCreateDTO {
  typeCode: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  postalCode: string;
  country: string;
  statusDescription: string;
}
```

---

## 🏢 Organization Management Module

### Base URL: `/api/organisations`

| Method | Endpoint | Description | Request Body | Response | Query Params |
|--------|----------|-------------|--------------|----------|--------------|
| GET | `/` | List all (paginated) | - | `PagedResponse<OrganizationDTO>` | `page, size, sortBy, sortDirection` |
| GET | `/{id}` | Get by ID | - | `OrganizationDTO` | - |
| GET | `/owner/{ownerId}` | Get by owner | - | `OrganizationDTO[]` | - |
| GET | `/status/{status}` | Get by status | - | `OrganizationDTO[]` | - |
| GET | `/exists/registration/{regNo}` | Check if exists | - | `boolean` | - |
| POST | `/` | Create organization | `OrganizationCreateDTO` | `OrganizationDTO` | - |
| POST | `/search` | Search with filters | `OrganizationSearchDTO` | `PagedResponse<OrganizationDTO>` | - |
| PUT | `/{id}` | Update organization | `OrganizationUpdateDTO` | `OrganizationDTO` | - |
| PATCH | `/{id}/status` | Update status | - | `OrganizationDTO` | `status, reason` |
| DELETE | `/{id}` | Delete organization | - | `void` | - |

### DTOs
```typescript
interface OrganizationDTO {
  id: number;
  legalName: string;
  businessName?: string;
  registrationNumber: string;
  companyNumber?: string;
  organisationType: string; // LTD, PLC, SOLE_TRADER, PARTNERSHIP, etc.
  sicCode?: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  businessDescription?: string;
  websiteAddress?: string;
  fcaNumber?: string;
  hmrcMlrNumber?: string;
  numberOfBranches?: number;
  numberOfAgents?: number;
  registeredAddress?: AddressDTO;
  businessAddress?: AddressDTO;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationCreateDTO {
  ownerId: number;
  legalName: string;
  businessName?: string;
  registrationNumber: string;
  companyNumber?: string;
  organisationType: string;
  sicCode?: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  businessDescription?: string;
  websiteAddress?: string;
  fcaNumber?: string;
  hmrcMlrNumber?: string;
  numberOfBranches?: number;
  numberOfAgents?: number;
  registeredAddress?: AddressCreateDTO;
  businessAddress?: AddressCreateDTO;
}

interface OrganizationSearchDTO {
  searchTerm?: string;
  status?: string;
  organisationType?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

---

## 📄 KYC Document Management Module

### Base URL: `/api/kyc-documents`

| Method | Endpoint | Description | Request Body | Response | Query Params |
|--------|----------|-------------|--------------|----------|--------------|
| GET | `/{id}` | Get by ID | - | `KycDocumentDTO` | - |
| GET | `/organisation/{orgId}` | Get by organization | - | `KycDocumentDTO[]` | - |
| GET | `/organisation/{orgId}/paged` | Get paginated | - | `PagedResponse<KycDocumentDTO>` | `page, size` |
| GET | `/status/{status}` | Get by status | - | `KycDocumentDTO[]` | - |
| GET | `/pending` | Get pending | - | `KycDocumentDTO[]` | - |
| GET | `/organisation/{orgId}/type/{type}` | Get by org & type | - | `KycDocumentDTO[]` | - |
| GET | `/organisation/{orgId}/verified/count` | Count verified | - | `number` | - |
| POST | `/` | Upload document | `KycDocumentCreateDTO` | `KycDocumentDTO` | - |
| POST | `/{id}/verify` | Verify document | - | `KycDocumentDTO` | `verifierId, status, reason` |
| PUT | `/{id}` | Update document | `KycDocumentUpdateDTO` | `KycDocumentDTO` | - |
| DELETE | `/{id}` | Delete document | - | `void` | - |

### DTOs
```typescript
interface KycDocumentDTO {
  id: number;
  organisationId: number;
  documentType: string; // ARTICLES_OF_ASSOCIATION, CERTIFICATE_OF_INCORPORATION, etc.
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  verifierId?: number;
  verificationDate?: string;
  verificationNotes?: string;
  uploadedAt: string;
}

interface KycDocumentCreateDTO {
  organisationId: number;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl: string;
}

interface KycDocumentUpdateDTO {
  documentType?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl?: string;
}
```

---

## ✅ KYC Verification Module

### Base URL: `/api/v1/kyc-verification`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/{id}` | Get by ID | - | `KycVerificationResponseDTO` |
| GET | `/user/{userId}` | Get by user | - | `KycVerificationResponseDTO` |
| GET | `/expired` | Get expired | - | `KycVerificationResponseDTO[]` |
| GET | `/status/{status}` | Get by status | - | `KycVerificationResponseDTO[]` |
| GET | `/count/{status}` | Count by status | - | `number` |
| GET | `/approved/{userId}` | Check if approved | - | `boolean` |
| POST | `/submit` | Submit verification | `KycVerificationRequestDTO` | `KycVerificationResponseDTO` |
| PUT | `/{id}/status` | Update status | `KycVerificationUpdateDTO` | `KycVerificationResponseDTO` |
| DELETE | `/{id}` | Delete verification | - | `void` |

### DTOs
```typescript
interface KycVerificationResponseDTO {
  verificationId: number;
  userId: number;
  sumsubApplicantId?: string;
  verificationLevel: 'BASIC' | 'ENHANCED' | 'FULL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  reviewResult?: {
    reviewerId: number;
    comments: string;
    approvalReason: string;
  };
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  expiresAt?: string;
}

interface KycVerificationRequestDTO {
  userId: number;
  verificationLevel: 'BASIC' | 'ENHANCED' | 'FULL';
  sumsubApplicantId?: string;
}

interface KycVerificationUpdateDTO {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  reviewerComments?: string;
  approvalReason?: string;
}
```

---

## ❓ Questionnaire Management Module

### Base URL: `/api/v1/questions`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Get all questions | - | `QuestionnaireQuestionResponseDTO[]` |
| GET | `/{id}` | Get by ID | - | `QuestionnaireQuestionResponseDTO` |
| GET | `/active` | Get active | - | `QuestionnaireQuestionResponseDTO[]` |
| GET | `/category/{category}` | Get by category | - | `QuestionnaireQuestionResponseDTO[]` |
| GET | `/active/count` | Count active | - | `number` |
| POST | `/` | Create question | `QuestionnaireQuestionRequestDTO` | `QuestionnaireQuestionResponseDTO` |
| PUT | `/{id}` | Update question | `QuestionnaireQuestionRequestDTO` | `QuestionnaireQuestionResponseDTO` |
| PATCH | `/{id}/activate` | Activate | - | `QuestionnaireQuestionResponseDTO` |
| PATCH | `/{id}/inactivate` | Inactivate | - | `QuestionnaireQuestionResponseDTO` |
| DELETE | `/{id}` | Delete question | - | `void` |

### DTOs
```typescript
interface QuestionnaireQuestionResponseDTO {
  questionId: number;
  questionText: string;
  questionCategory: QuestionCategory;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdBy?: number;
}

interface QuestionnaireQuestionRequestDTO {
  questionText: string;
  questionCategory: QuestionCategory;
  displayOrder: number;
}

enum QuestionCategory {
  PERSONAL_INFO = 'PERSONAL_INFO',
  FINANCIAL = 'FINANCIAL',
  EMPLOYMENT = 'EMPLOYMENT',
  IDENTIFICATION = 'IDENTIFICATION',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  COMPLIANCE = 'COMPLIANCE'
}
```

---

## 💬 Customer Answers Module

### Base URL: `/api/v1/answers`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/{id}` | Get by ID | - | `CustomerAnswerResponseDTO` |
| GET | `/user/{userId}` | Get all for user | - | `CustomerAnswerResponseDTO[]` |
| GET | `/completed` | Get completed | - | `CustomerAnswerResponseDTO[]` |
| GET | `/user/{userId}/question/{questionId}` | Get specific | - | `CustomerAnswerResponseDTO` |
| GET | `/answered` | Check if answered | - | `boolean` |
| GET | `/user/{userId}/count` | Count answers | - | `number` |
| GET | `/completion-rate/{totalQuestions}` | Get completion % | - | `number` |
| POST | `/` | Submit answer | `CustomerAnswerRequestDTO` | `CustomerAnswerResponseDTO` |
| PUT | `/{id}` | Update answer | `CustomerAnswerRequestDTO` | `CustomerAnswerResponseDTO` |
| DELETE | `/{id}` | Delete answer | - | `void` |
| DELETE | `/user/{userId}` | Delete all for user | - | `void` |

### DTOs
```typescript
interface CustomerAnswerResponseDTO {
  answerId: number;
  userId: number;
  questionId: number;
  answerText: string;
  answeredAt: string;
}

interface CustomerAnswerRequestDTO {
  userId: number;
  questionId: number;
  answerText: string;
}
```

---

## 🔗 API Configuration

### Base URL
```typescript
// Local Development
const BASE_URL = 'http://localhost:8080/api';

// Production (GCP Cloud Run)
const BASE_URL = 'https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api';
```

### Authentication Header
```typescript
headers: {
  'Authorization': `Bearer ${jwt_token}`,
  'Content-Type': 'application/json'
}
```

### Common HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Show error message |

---

## 📊 Pagination Parameters

All paginated endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 0 | Page number (0-indexed) |
| `size` | number | 20 | Items per page |
| `sortBy` | string | varies | Field to sort by |
| `sortDirection` | string | 'ASC' | 'ASC' or 'DESC' |

---

## 🔍 Common Query Parameters

### Status Values
```typescript
// Organization Status
'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

// KYC Document Status
'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

// KYC Verification Status
'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

// Question Status
'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
```

### Verification Levels
```typescript
'BASIC' | 'ENHANCED' | 'FULL'
```

### Risk Levels
```typescript
'LOW' | 'MEDIUM' | 'HIGH'
```

### Address Type Codes
```typescript
1 // Residential
2 // Business
3 // Registered
4 // Correspondence
5 // Postal
```

---

## 🛠️ Testing with Postman

The API includes comprehensive Postman collections:

1. **Phase 1 Collection** (`postman_collection.json`)
   - Authentication
   - Users
   - Addresses
   - Organizations
   - KYC Documents

2. **Phase 2 Collection** (`phase2-postman-collection.json`)
   - KYC Verification
   - Questionnaire
   - Customer Answers

### Using Collections
1. Import collection into Postman
2. Set `base_url` variable
3. Run "Request OTP" → "Verify OTP" to get JWT token
4. Token is auto-saved and used in subsequent requests

---

## 📝 Notes

1. **Authentication Required**: All endpoints except `/auth/request-otp` and `/auth/verify-otp` require JWT token
2. **Pagination**: Use server-side pagination for all list endpoints
3. **Validation**: All create/update endpoints have validation
4. **File Upload**: Document upload can be base64 or multipart/form-data
5. **Date Format**: All dates in ISO 8601 format (e.g., `2026-03-03T10:00:00Z`)
6. **Phone Format**: International format (e.g., `+1234567890`)

---

**Document Version**: 1.0  
**API Version**: v1 (for Phase 2 endpoints), no version for Phase 1  
**Last Updated**: March 3, 2026
