# FinCore WebUI - Implementation Plan for User Management API Integration

## 📋 Executive Summary
This document outlines the complete plan to develop UI screens for all endpoints in the User Management API (https://github.com/kasisheraz/userManagementApi). The plan follows the existing UI architecture, design patterns, and styling conventions.

---

## 🎯 Project Overview

### Current State Analysis
- **API**: 56+ endpoints across 8 major modules (Authentication, Users, Addresses, Organizations, KYC Documents, KYC Verification, Questionnaire, Customer Answers)
- **UI**: Basic dashboard with placeholder screens
- **Stack**: React + TypeScript + Material-UI (MUI) + React Router
- **Theme**: FinCore Dark Green (#003D2A) with burgundy alternate
- **Architecture**: Component-based with centralized API service

### Scope
- **Phase 1**: Authentication, Users, Addresses, Organizations, KYC Documents (26 endpoints)
- **Phase 2**: KYC Verification, Questionnaire, Customer Answers (30 endpoints)
- **Total**: 56+ endpoints requiring UI implementation

---

## 🏗️ Architecture & Design Patterns

### 1. Project Structure (Enhanced)
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx              [NEW]
│   │   ├── OTPVerification.tsx        [NEW]
│   │   └── ProtectedRoute.tsx         [EXISTS]
│   ├── common/
│   │   ├── PageHeader.tsx             [EXISTS]
│   │   ├── StepIndicator.tsx          [EXISTS]
│   │   ├── ThemeSwitcher.tsx          [EXISTS]
│   │   ├── DataTable.tsx              [NEW]
│   │   ├── FilterPanel.tsx            [NEW]
│   │   ├── SearchBar.tsx              [NEW]
│   │   ├── StatusChip.tsx             [NEW]
│   │   ├── ConfirmDialog.tsx          [NEW]
│   │   ├── FormDialog.tsx             [NEW]
│   │   └── LoadingSpinner.tsx         [NEW]
│   ├── layout/
│   │   ├── Header.tsx                 [EXISTS]
│   │   └── Sidebar.tsx                [EXISTS]
│   ├── users/                         [NEW MODULE]
│   │   ├── UserList.tsx
│   │   ├── UserForm.tsx
│   │   ├── UserDetails.tsx
│   │   └── UserFilters.tsx
│   ├── organizations/                 [NEW MODULE]
│   │   ├── OrganizationList.tsx
│   │   ├── OrganizationForm.tsx
│   │   ├── OrganizationDetails.tsx
│   │   ├── OrganizationSearch.tsx
│   │   └── components/
│   │       ├── AddressForm.tsx
│   │       └── AddressCard.tsx
│   ├── kyc-documents/                 [NEW MODULE]
│   │   ├── DocumentList.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentVerification.tsx
│   │   └── DocumentDetails.tsx
│   ├── kyc-verification/              [NEW MODULE]
│   │   ├── VerificationList.tsx
│   │   ├── VerificationForm.tsx
│   │   ├── VerificationDetails.tsx
│   │   └── VerificationReview.tsx
│   ├── questionnaire/                 [NEW MODULE]
│   │   ├── QuestionList.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── QuestionManagement.tsx
│   │   └── QuestionFilters.tsx
│   └── customer-answers/              [NEW MODULE]
│       ├── AnswersList.tsx
│       ├── AnswerForm.tsx
│       ├── CompletionProgress.tsx
│       └── AnswerDetails.tsx
├── pages/
│   ├── Dashboard.tsx                  [EXISTS]
│   ├── Profile.tsx                    [EXISTS]
│   ├── Reports.tsx                    [EXISTS]
│   ├── Settings.tsx                   [EXISTS]
│   ├── Applications.tsx               [EXISTS]
│   ├── IndividualApplication.tsx      [EXISTS]
│   ├── auth/                          [NEW]
│   │   └── Login.tsx
│   ├── users/                         [NEW]
│   │   └── UsersPage.tsx
│   ├── organizations/                 [NEW]
│   │   └── OrganizationsPage.tsx
│   ├── kyc/                           [NEW]
│   │   ├── DocumentsPage.tsx
│   │   └── VerificationPage.tsx
│   └── questionnaire/                 [NEW]
│       ├── QuestionnairePage.tsx
│       └── AnswersPage.tsx
├── services/
│   ├── apiService.ts                  [EXISTS]
│   ├── authService.ts                 [NEW]
│   ├── userService.ts                 [NEW]
│   ├── organizationService.ts         [NEW]
│   ├── addressService.ts              [NEW]
│   ├── kycDocumentService.ts          [NEW]
│   ├── kycVerificationService.ts      [NEW]
│   ├── questionnaireService.ts        [NEW]
│   └── answerService.ts               [NEW]
├── types/
│   ├── index.ts                       [EXISTS]
│   ├── auth.types.ts                  [NEW]
│   ├── user.types.ts                  [NEW]
│   ├── organization.types.ts          [NEW]
│   ├── address.types.ts               [NEW]
│   ├── kycDocument.types.ts           [NEW]
│   ├── kycVerification.types.ts       [NEW]
│   ├── questionnaire.types.ts         [NEW]
│   └── answer.types.ts                [NEW]
├── hooks/                             [NEW]
│   ├── useAuth.ts
│   ├── usePagination.ts
│   ├── useFilters.ts
│   ├── useSearch.ts
│   └── useConfirmDialog.ts
├── utils/                             [NEW]
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── helpers.ts
└── context/
    ├── ThemeContext.tsx               [EXISTS]
    └── AuthContext.tsx                [NEW]
```

---

## 📊 Module Breakdown

### Module 1: Authentication (Priority: CRITICAL)
**Endpoints**: 3 endpoints
- POST `/api/auth/request-otp` - Request OTP
- POST `/api/auth/verify-otp` - Verify OTP and get JWT
- GET `/api/auth/me` - Get current user

**UI Components**:
1. **Login Page** (`src/pages/auth/Login.tsx`)
   - Phone number input with international format
   - Request OTP button
   - Clean, centered layout
   
2. **OTP Verification Component** (`src/components/auth/OTPVerification.tsx`)
   - 6-digit OTP input
   - Resend OTP functionality
   - Auto-submit on complete
   - Timer countdown

3. **Auth Context** (`src/context/AuthContext.tsx`)
   - JWT token management
   - User state management
   - Logout functionality
   - Auto-redirect on 401

**Service Methods**:
```typescript
// authService.ts
- requestOTP(phoneNumber: string)
- verifyOTP(phoneNumber: string, otp: string)
- getCurrentUser()
- logout()
- isAuthenticated()
```

**Design Considerations**:
- Use FinCore green primary color (#003D2A)
- Material-UI TextField with phone number mask
- Clear error messaging
- Loading states for API calls
- Automatic navigation after successful auth

---

### Module 2: User Management (Priority: HIGH)
**Endpoints**: 6 endpoints
- GET `/api/users` - List all users
- GET `/api/users/{id}` - Get user by ID
- POST `/api/users` - Create user
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user
- GET `/api/users/search` - Search users

**UI Components**:
1. **Users Page** (`src/pages/users/UsersPage.tsx`)
   - Header with "Users" title and "Add User" button
   - Search bar and filters (role, status)
   - Paginated data table
   - Actions: View, Edit, Delete

2. **User List Component** (`src/components/users/UserList.tsx`)
   - Material-UI Table with columns:
     - ID
     - Full Name
     - Email
     - Phone Number
     - Role (chip)
     - Status (chip)
     - Actions (IconButtons)
   - Click row to view details
   - Pagination (20 per page)

3. **User Form Dialog** (`src/components/users/UserForm.tsx`)
   - Create/Edit mode
   - Fields:
     - Full Name *
     - Email *
     - Phone Number *
     - Role (dropdown)
     - Status (dropdown)
   - Validation: email format, phone format, required fields
   - Submit/Cancel buttons

4. **User Details Dialog** (`src/components/users/UserDetails.tsx`)
   - Read-only view with all user information
   - Edit button to switch to edit mode
   - Delete button (with confirmation)
   - Created/Updated timestamps

**Service Methods**:
```typescript
// userService.ts
- getAllUsers(): Promise<UserDTO[]>
- getUserById(id: number): Promise<UserDTO>
- createUser(data: UserCreateDTO): Promise<UserDTO>
- updateUser(id: number, data: UserUpdateDTO): Promise<UserDTO>
- deleteUser(id: number): Promise<void>
- searchUsers(query: string): Promise<UserDTO[]>
```

**Types**:
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

### Module 3: Address Management (Priority: MEDIUM)
**Endpoints**: 4 endpoints
- GET `/api/addresses` - List all addresses
- GET `/api/addresses/{id}` - Get address by ID
- POST `/api/addresses` - Create address
- PUT `/api/addresses/{id}` - Update address
- DELETE `/api/addresses/{id}` - Delete address
- GET `/api/addresses/type/{type}` - Get by type
- GET `/api/addresses/country/{country}` - Get by country

**UI Components**:
1. **Address Form Component** (`src/components/organizations/components/AddressForm.tsx`)
   - Reusable form for addresses (used in Organization creation)
   - Fields:
     - Type Code (dropdown: 1=Residential, 2=Business, 3=Registered, 4=Correspondence, 5=Postal)
     - Address Line 1 *
     - Address Line 2
     - City *
     - State/Province *
     - Postal Code *
     - Country * (dropdown with common countries)
     - Status (Active/Inactive)
   - Validation: required fields, postal code format

2. **Address Card Component** (`src/components/organizations/components/AddressCard.tsx`)
   - Display address in card format
   - Show type badge
   - Edit/Delete actions
   - Used in Organization details

**Service Methods**:
```typescript
// addressService.ts
- getAllAddresses(): Promise<AddressDTO[]>
- getAddressById(id: number): Promise<AddressDTO>
- createAddress(data: AddressCreateDTO): Promise<AddressDTO>
- updateAddress(id: number, data: AddressUpdateDTO): Promise<AddressDTO>
- deleteAddress(id: number): Promise<void>
- getAddressesByType(typeCode: number): Promise<AddressDTO[]>
- getAddressesByCountry(country: string): Promise<AddressDTO[]>
```

**Types**:
```typescript
interface AddressDTO {
  id: number;
  typeCode: number;
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

### Module 4: Organization Management (Priority: HIGH)
**Endpoints**: 10 endpoints
- GET `/api/organisations` - List all (paginated)
- GET `/api/organisations/{id}` - Get by ID
- POST `/api/organisations` - Create organization
- PUT `/api/organisations/{id}` - Update organization
- DELETE `/api/organisations/{id}` - Delete organization
- POST `/api/organisations/search` - Search with filters
- GET `/api/organisations/owner/{ownerId}` - Get by owner
- GET `/api/organisations/status/{status}` - Get by status
- PATCH `/api/organisations/{id}/status` - Update status
- GET `/api/organisations/exists/registration/{regNo}` - Check existence

**UI Components**:
1. **Organizations Page** (`src/pages/organizations/OrganizationsPage.tsx`)
   - Header: "Organizations" + "Add Organization" button
   - Search and filter panel
   - Paginated table with 20 items per page
   - Status filter: All, Pending, Active, Suspended, Rejected

2. **Organization List Component** (`src/components/organizations/OrganizationList.tsx`)
   - Table columns:
     - ID
     - Legal Name
     - Business Name
     - Registration Number
     - Status (color-coded chip)
     - Type
     - Created Date
     - Actions
   - Click row to view details
   - Quick status change dropdown

3. **Organization Form Dialog** (`src/components/organizations/OrganizationForm.tsx`)
   - Multi-step form (3 steps):
     - **Step 1: Basic Information**
       - Legal Name *
       - Business Name
       - Registration Number *
       - Company Number
       - Organization Type * (LTD, PLC, SOLE_TRADER, etc.)
       - SIC Code
       - Incorporation Date *
       - Country of Incorporation *
     - **Step 2: Business Details**
       - Business Description
       - Website Address
       - FCA Number
       - HMRC MLR Number
       - Number of Branches
       - Number of Agents
       - Primary Remittance Destination Country
       - Monthly Turnover Range
     - **Step 3: Addresses**
       - Registered Address (AddressForm component)
       - Business Address (AddressForm component)
       - Option to "Same as Registered Address"
   - Form validation with real-time feedback
   - Progress indicator at top
   - Back/Next/Submit buttons

4. **Organization Details Component** (`src/components/organizations/OrganizationDetails.tsx`)
   - Tabbed interface:
     - **Overview Tab**:
       - All organization details in read-only cards
       - Status with actions (Approve, Reject, Suspend)
     - **Addresses Tab**:
       - List of associated addresses
       - Add/Edit/Delete address
     - **Documents Tab**:
       - List of KYC documents (linked to KYC module)
       - Upload new document button
     - **Activity Tab**:
       - Audit log of changes
       - Status history

5. **Organization Search Component** (`src/components/organizations/OrganizationSearch.tsx`)
   - Advanced search panel:
     - Search term (legal name, business name)
     - Status filter
     - Organization type filter
     - Date range filter
   - Collapsible filter panel
   - Clear filters button
   - Export to CSV button

**Service Methods**:
```typescript
// organizationService.ts
- getAllOrganizations(page: number, size: number, sortBy: string, sortDirection: string): Promise<PagedResponse<OrganizationDTO>>
- getOrganizationById(id: number): Promise<OrganizationDTO>
- createOrganization(data: OrganizationCreateDTO): Promise<OrganizationDTO>
- updateOrganization(id: number, data: OrganizationUpdateDTO): Promise<OrganizationDTO>
- deleteOrganization(id: number): Promise<void>
- searchOrganizations(criteria: OrganizationSearchDTO): Promise<PagedResponse<OrganizationDTO>>
- getOrganizationsByOwner(ownerId: number): Promise<OrganizationDTO[]>
- getOrganizationsByStatus(status: string): Promise<OrganizationDTO[]>
- updateOrganizationStatus(id: number, status: string, reason?: string): Promise<OrganizationDTO>
- checkRegistrationNumberExists(regNo: string): Promise<boolean>
```

**Types**:
```typescript
interface OrganizationDTO {
  id: number;
  legalName: string;
  businessName?: string;
  registrationNumber: string;
  companyNumber?: string;
  organisationType: string;
  sicCode?: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  status: OrganisationStatus;
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
  registeredAddress?: AddressCreateDTO;
  businessAddress?: AddressCreateDTO;
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

enum OrganisationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}
```

---

### Module 5: KYC Document Management (Priority: HIGH)
**Endpoints**: 10 endpoints
- POST `/api/kyc-documents` - Upload document
- GET `/api/kyc-documents/{id}` - Get by ID
- GET `/api/kyc-documents/organisation/{orgId}` - Get by organization
- GET `/api/kyc-documents/organisation/{orgId}/paged` - Get paginated
- GET `/api/kyc-documents/status/{status}` - Get by status
- GET `/api/kyc-documents/pending` - Get pending documents
- GET `/api/kyc-documents/organisation/{orgId}/type/{type}` - Get by org and type
- PUT `/api/kyc-documents/{id}` - Update document
- POST `/api/kyc-documents/{id}/verify` - Verify document
- DELETE `/api/kyc-documents/{id}` - Delete document

**UI Components**:
1. **KYC Documents Page** (`src/pages/kyc/DocumentsPage.tsx`)
   - Header: "KYC Documents" + "Upload Document" button
   - Filter tabs: All, Pending, Verified, Rejected, Expired
   - Document cards in grid layout
   - Search by organization

2. **Document List Component** (`src/components/kyc-documents/DocumentList.tsx`)
   - Grid view (cards) or Table view toggle
   - Card view:
     - Document type icon/badge
     - Organization name
     - Status badge
     - Upload date
     - Actions: View, Verify, Delete
   - Table view:
     - ID, Organization, Document Type, Status, Upload Date, Verified By, Actions

3. **Document Upload Dialog** (`src/components/kyc-documents/DocumentUpload.tsx`)
   - Fields:
     - Organization (searchable dropdown) *
     - Document Type * (Articles of Association, Certificate of Incorporation, etc.)
     - Document Number *
     - Issue Date *
     - Expiry Date
     - Issuing Authority
     - Document URL/File Upload *
   - Drag-and-drop file upload
   - File validation: PDF, JPG, PNG, max 10MB
   - Preview uploaded document

4. **Document Verification Dialog** (`src/components/kyc-documents/DocumentVerification.tsx`)
   - Display document details
   - Embedded PDF viewer
   - Verification form:
     - Status (Approved, Rejected)
     - Verifier notes *
     - Rejection reason (if rejected)
   - Submit verification button

5. **Document Details Component** (`src/components/kyc-documents/DocumentDetails.tsx`)
   - Full document information
   - Download document button
   - Verification history
   - Edit/Delete actions (if pending)

**Service Methods**:
```typescript
// kycDocumentService.ts
- createDocument(data: KycDocumentCreateDTO): Promise<KycDocumentDTO>
- getDocumentById(id: number): Promise<KycDocumentDTO>
- getDocumentsByOrganization(orgId: number): Promise<KycDocumentDTO[]>
- getDocumentsByOrganizationPaged(orgId: number, page: number, size: number): Promise<PagedResponse<KycDocumentDTO>>
- getDocumentsByStatus(status: string): Promise<KycDocumentDTO[]>
- getPendingDocuments(): Promise<KycDocumentDTO[]>
- getDocumentsByOrganizationAndType(orgId: number, type: string): Promise<KycDocumentDTO[]>
- updateDocument(id: number, data: KycDocumentUpdateDTO): Promise<KycDocumentDTO>
- verifyDocument(id: number, verifierId: number, status: string, reason?: string): Promise<KycDocumentDTO>
- deleteDocument(id: number): Promise<void>
```

**Types**:
```typescript
interface KycDocumentDTO {
  id: number;
  organisationId: number;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl: string;
  status: DocumentStatus;
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

enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}
```

---

### Module 6: KYC Verification (Priority: HIGH)
**Endpoints**: 9 endpoints
- POST `/api/v1/kyc-verification/submit` - Submit verification
- GET `/api/v1/kyc-verification/{id}` - Get by ID
- GET `/api/v1/kyc-verification/user/{userId}` - Get by user
- PUT `/api/v1/kyc-verification/{id}/status` - Update status
- GET `/api/v1/kyc-verification/expired` - Get expired
- GET `/api/v1/kyc-verification/status/{status}` - Get by status
- GET `/api/v1/kyc-verification/count/{status}` - Count by status
- GET `/api/v1/kyc-verification/approved/{userId}` - Check if approved
- DELETE `/api/v1/kyc-verification/{id}` - Delete verification

**UI Components**:
1. **KYC Verification Page** (`src/pages/kyc/VerificationPage.tsx`)
   - Header with statistics cards:
     - Total Verifications
     - Pending Review
     - Approved
     - Rejected
   - Filter tabs: All, Pending, Approved, Rejected, Expired
   - Verification list table

2. **Verification List Component** (`src/components/kyc-verification/VerificationList.tsx`)
   - Table columns:
     - Verification ID
     - User Name
     - Verification Level (BASIC, ENHANCED, FULL)
     - Status (color-coded)
     - Risk Level (LOW, MEDIUM, HIGH)
     - Submitted Date
     - Reviewed Date
     - Actions: Review, View Details

3. **Verification Form Component** (`src/components/kyc-verification/VerificationForm.tsx`)
   - Submit new verification:
     - User Selection (searchable dropdown) *
     - Verification Level * (BASIC, ENHANCED, FULL)
     - SumSub Applicant ID
     - Additional notes
   - Submit button

4. **Verification Review Dialog** (`src/components/kyc-verification/VerificationReview.tsx`)
   - Display verification details
   - AML screening results (if available)
   - Review form:
     - Status (Approve, Reject, Expire)
     - Risk Level (LOW, MEDIUM, HIGH)
     - Reviewer Comments *
     - Approval/Rejection Reason *
   - Submit review button

5. **Verification Details Component** (`src/components/kyc-verification/VerificationDetails.tsx`)
   - Full verification information
   - User details card
   - AML screening results card
   - Timeline of status changes
   - Download verification report button

**Service Methods**:
```typescript
// kycVerificationService.ts
- submitVerification(data: KycVerificationRequestDTO): Promise<KycVerificationResponseDTO>
- getVerificationById(id: number): Promise<KycVerificationResponseDTO>
- getVerificationByUser(userId: number): Promise<KycVerificationResponseDTO>
- updateVerificationStatus(id: number, data: KycVerificationUpdateDTO): Promise<KycVerificationResponseDTO>
- getExpiredVerifications(): Promise<KycVerificationResponseDTO[]>
- getVerificationsByStatus(status: string): Promise<KycVerificationResponseDTO[]>
- countByStatus(status: string): Promise<number>
- hasApprovedVerification(userId: number): Promise<boolean>
- deleteVerification(id: number): Promise<void>
```

**Types**:
```typescript
interface KycVerificationResponseDTO {
  verificationId: number;
  userId: number;
  sumsubApplicantId?: string;
  verificationLevel: VerificationLevel;
  status: VerificationStatus;
  riskLevel?: RiskLevel;
  reviewResult?: ReviewResult;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  expiresAt?: string;
}

interface KycVerificationRequestDTO {
  userId: number;
  verificationLevel: VerificationLevel;
  sumsubApplicantId?: string;
}

interface KycVerificationUpdateDTO {
  status: VerificationStatus;
  riskLevel?: RiskLevel;
  reviewerComments?: string;
  approvalReason?: string;
}

enum VerificationLevel {
  BASIC = 'BASIC',
  ENHANCED = 'ENHANCED',
  FULL = 'FULL'
}

enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
```

---

### Module 7: Questionnaire Management (Priority: MEDIUM)
**Endpoints**: 10 endpoints
- GET `/api/v1/questions` - Get all questions
- GET `/api/v1/questions/{id}` - Get by ID
- GET `/api/v1/questions/active` - Get active questions
- GET `/api/v1/questions/category/{category}` - Get by category
- POST `/api/v1/questions` - Create question
- PUT `/api/v1/questions/{id}` - Update question
- PATCH `/api/v1/questions/{id}/activate` - Activate question
- PATCH `/api/v1/questions/{id}/inactivate` - Inactivate question
- DELETE `/api/v1/questions/{id}` - Delete question
- GET `/api/v1/questions/active/count` - Count active questions

**UI Components**:
1. **Questionnaire Page** (`src/pages/questionnaire/QuestionnairePage.tsx`)
   - Header: "Questions" + "Add Question" button
   - Filter by category: All, Personal Info, Financial, Employment, Identification, Risk Assessment, Compliance
   - Toggle: Show All / Show Active Only
   - Question cards in list format

2. **Question List Component** (`src/components/questionnaire/QuestionList.tsx`)
   - List view with cards:
     - Question text
     - Category badge
     - Display order
     - Status toggle (Active/Inactive)
     - Actions: Edit, Delete, Reorder
   - Drag-and-drop to reorder questions
   - Bulk actions: Activate, Inactivate, Delete

3. **Question Form Dialog** (`src/components/questionnaire/QuestionForm.tsx`)
   - Fields:
     - Question Text * (textarea)
     - Category * (dropdown: PERSONAL_INFO, FINANCIAL, EMPLOYMENT, etc.)
     - Display Order * (number)
     - Status (Active/Inactive)
   - Character limit indicator for question text
   - Preview of question
   - Submit button

4. **Question Management Component** (`src/components/questionnaire/QuestionManagement.tsx`)
   - Admin interface for managing questions
   - Bulk operations toolbar
   - Category-wise organization
   - Statistics: Total questions, Active questions, by category

**Service Methods**:
```typescript
// questionnaireService.ts
- getAllQuestions(): Promise<QuestionnaireQuestionResponseDTO[]>
- getQuestionById(id: number): Promise<QuestionnaireQuestionResponseDTO>
- getActiveQuestions(): Promise<QuestionnaireQuestionResponseDTO[]>
- getQuestionsByCategory(category: string): Promise<QuestionnaireQuestionResponseDTO[]>
- createQuestion(data: QuestionnaireQuestionRequestDTO): Promise<QuestionnaireQuestionResponseDTO>
- updateQuestion(id: number, data: QuestionnaireQuestionRequestDTO): Promise<QuestionnaireQuestionResponseDTO>
- activateQuestion(id: number): Promise<QuestionnaireQuestionResponseDTO>
- inactivateQuestion(id: number): Promise<QuestionnaireQuestionResponseDTO>
- deleteQuestion(id: number): Promise<void>
- countActiveQuestions(): Promise<number>
```

**Types**:
```typescript
interface QuestionnaireQuestionResponseDTO {
  questionId: number;
  questionText: string;
  questionCategory: QuestionCategory;
  displayOrder: number;
  status: QuestionStatus;
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

enum QuestionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}
```

---

### Module 8: Customer Answers (Priority: MEDIUM)
**Endpoints**: 11 endpoints
- POST `/api/v1/answers` - Submit answer
- GET `/api/v1/answers/{id}` - Get by ID
- GET `/api/v1/answers/user/{userId}` - Get all for user
- GET `/api/v1/answers/completed` - Get completed answers
- GET `/api/v1/answers/user/{userId}/question/{questionId}` - Get specific answer
- GET `/api/v1/answers/answered` - Check if answered
- PUT `/api/v1/answers/{id}` - Update answer
- DELETE `/api/v1/answers/{id}` - Delete answer
- DELETE `/api/v1/answers/user/{userId}` - Delete all for user
- GET `/api/v1/answers/user/{userId}/count` - Count answers
- GET `/api/v1/answers/completion-rate/{totalQuestions}` - Get completion rate

**UI Components**:
1. **Answers Page** (`src/pages/questionnaire/AnswersPage.tsx`)
   - User selector (for admin view)
   - Completion progress bar
   - List of questions with answers
   - Filter: All, Completed, Incomplete

2. **Answers List Component** (`src/components/customer-answers/AnswersList.tsx`)
   - Table/List view:
     - Question text
     - Answer text
     - Answered date
     - Actions: Edit, Delete
   - Pagination
   - Export answers to CSV

3. **Answer Form Component** (`src/components/customer-answers/AnswerForm.tsx`)
   - User view: Answer questionnaire
   - Display questions one by one or all at once
   - Text area for answer input
   - Character limit
   - Save draft / Submit answer
   - Navigation: Previous / Next question

4. **Completion Progress Component** (`src/components/customer-answers/CompletionProgress.tsx`)
   - Circular progress indicator
   - Percentage completed
   - Number of answered / total questions
   - List of incomplete questions
   - "Continue Questionnaire" button

5. **Answer Details Component** (`src/components/customer-answers/AnswerDetails.tsx`)
   - Display question and answer
   - Answered date
   - Edit history (if applicable)
   - Edit/Delete actions

**Service Methods**:
```typescript
// answerService.ts
- submitAnswer(data: CustomerAnswerRequestDTO): Promise<CustomerAnswerResponseDTO>
- getAnswerById(id: number): Promise<CustomerAnswerResponseDTO>
- getAllAnswersForUser(userId: number): Promise<CustomerAnswerResponseDTO[]>
- getCompletedAnswers(): Promise<CustomerAnswerResponseDTO[]>
- getAnswerByUserAndQuestion(userId: number, questionId: number): Promise<CustomerAnswerResponseDTO>
- checkIfAnswered(userId: number, questionId: number): Promise<boolean>
- updateAnswer(id: number, data: CustomerAnswerRequestDTO): Promise<CustomerAnswerResponseDTO>
- deleteAnswer(id: number): Promise<void>
- deleteAllUserAnswers(userId: number): Promise<void>
- countAnswersForUser(userId: number): Promise<number>
- getCompletionRate(userId: number, totalQuestions: number): Promise<number>
```

**Types**:
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

## 🎨 Design System & Styling Guidelines

### Color Palette
```typescript
// Primary Colors
primary: '#003D2A'        // FinCore Dark Green
primaryLight: '#2E8B67'   // Light Green
primaryDark: '#002418'    // Darker Green

// Secondary Colors
secondary: '#1F7A5C'      // Action Green
secondaryLight: '#4CAF50' // Bright Green
secondaryDark: '#0D5940'  // Deep Green

// Status Colors
success: '#2D8A6A'        // Success Green
warning: '#F59E0B'        // Amber Warning
error: '#EF4444'          // Red Error
info: '#3B82F6'           // Blue Info

// Status Specific
pending: '#F59E0B'        // Amber
approved: '#2D8A6A'       // Green
rejected: '#EF4444'       // Red
expired: '#6B7280'        // Grey

// Backgrounds
background: '#F5F7FA'     // Light grey background
paper: '#ffffff'          // White paper
```

### Typography
```typescript
fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'

h1: { fontSize: '2.5rem', fontWeight: 700 }
h2: { fontSize: '2rem', fontWeight: 700 }
h3: { fontSize: '1.75rem', fontWeight: 600 }
h4: { fontSize: '1.5rem', fontWeight: 600 }
h5: { fontSize: '1.25rem', fontWeight: 600 }
h6: { fontSize: '1rem', fontWeight: 600 }
body1: { fontSize: '1rem', lineHeight: 1.6 }
body2: { fontSize: '0.875rem', lineHeight: 1.5 }
```

### Component Patterns

#### Status Chip
```tsx
<Chip 
  label={status}
  sx={{
    backgroundColor: getStatusBg(status),
    color: getStatusColor(status),
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
  }}
/>
```

#### Action Button
```tsx
<Button
  variant="contained"
  color="primary"
  sx={{
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    py: 1,
  }}
>
  Action
</Button>
```

#### Data Table
```tsx
<TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
  <Table>
    <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
      <TableRow>
        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Column</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {/* Rows */}
    </TableBody>
  </Table>
</TableContainer>
```

#### Form Dialog
```tsx
<Dialog 
  open={open} 
  onClose={onClose}
  maxWidth="md"
  fullWidth
>
  <DialogTitle sx={{ backgroundColor: '#003D2A', color: '#ffffff' }}>
    Title
  </DialogTitle>
  <DialogContent sx={{ pt: 3 }}>
    {/* Form fields */}
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained" onClick={onSubmit}>Submit</Button>
  </DialogActions>
</Dialog>
```

---

## 🔄 Reusable Components Library

### 1. DataTable Component
**Path**: `src/components/common/DataTable.tsx`
**Purpose**: Generic table with pagination, sorting, and filtering
**Props**:
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}
```

### 2. FilterPanel Component
**Path**: `src/components/common/FilterPanel.tsx`
**Purpose**: Collapsible filter panel with search and filters
**Props**:
```typescript
interface FilterPanelProps {
  filters: Filter[];
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}
```

### 3. SearchBar Component
**Path**: `src/components/common/SearchBar.tsx`
**Purpose**: Search input with debounce
**Props**:
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceDelay?: number;
}
```

### 4. StatusChip Component
**Path**: `src/components/common/StatusChip.tsx`
**Purpose**: Color-coded status chip
**Props**:
```typescript
interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}
```

### 5. ConfirmDialog Component
**Path**: `src/components/common/ConfirmDialog.tsx`
**Purpose**: Confirmation dialog for destructive actions
**Props**:
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
}
```

### 6. FormDialog Component
**Path**: `src/components/common/FormDialog.tsx`
**Purpose**: Generic form dialog wrapper
**Props**:
```typescript
interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}
```

### 7. LoadingSpinner Component
**Path**: `src/components/common/LoadingSpinner.tsx`
**Purpose**: Centered loading spinner
**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}
```

---

## 📝 Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up core infrastructure and authentication

#### Week 1: Core Setup
1. **Day 1-2**: Types & Interfaces
   - Create all TypeScript interfaces for DTOs
   - Set up enums and constants
   - Create utility functions (formatters, validators)

2. **Day 3-4**: API Services
   - Update `apiService.ts` with base configuration
   - Create service files for all modules
   - Implement HTTP methods with proper error handling

3. **Day 5**: Reusable Components
   - Build DataTable component
   - Build FilterPanel component
   - Build SearchBar component
   - Build StatusChip component
   - Build ConfirmDialog component

#### Week 2: Authentication
1. **Day 1-2**: Auth Context & Services
   - Create AuthContext with JWT management
   - Implement authService with OTP flow
   - Add token refresh logic
   - Update ProtectedRoute component

2. **Day 3-4**: Login UI
   - Create Login page
   - Create OTPVerification component
   - Implement phone number validation
   - Add loading and error states

3. **Day 5**: Testing & Polish
   - Test authentication flow
   - Handle edge cases
   - Polish UI/UX

### Phase 2: User & Organization Management (Week 3-4)
**Goal**: Implement user and organization CRUD operations

#### Week 3: User Management
1. **Day 1-2**: User List & Details
   - Create UsersPage
   - Create UserList component
   - Create UserDetails component
   - Implement pagination

2. **Day 3-4**: User Forms
   - Create UserForm component
   - Implement create/edit functionality
   - Add validation
   - Implement delete with confirmation

3. **Day 5**: User Search & Filters
   - Add search functionality
   - Add role and status filters
   - Test CRUD operations

#### Week 4: Organization Management
1. **Day 1-2**: Organization List
   - Create OrganizationsPage
   - Create OrganizationList component
   - Implement pagination and search

2. **Day 3-4**: Organization Form
   - Create multi-step OrganizationForm
   - Integrate AddressForm component
   - Implement validation

3. **Day 5**: Organization Details
   - Create OrganizationDetails with tabs
   - Implement status management
   - Add address management

### Phase 3: KYC Documents & Verification (Week 5-6)
**Goal**: Implement KYC document management and verification workflows

#### Week 5: KYC Documents
1. **Day 1-2**: Document List & Upload
   - Create DocumentsPage
   - Create DocumentList component
   - Create DocumentUpload component
   - Implement file upload

2. **Day 3-4**: Document Verification
   - Create DocumentVerification component
   - Implement document viewer
   - Add verification workflow

3. **Day 5**: Document Details & Management
   - Create DocumentDetails component
   - Implement filters and search
   - Test document lifecycle

#### Week 6: KYC Verification
1. **Day 1-2**: Verification List
   - Create VerificationPage
   - Create VerificationList component
   - Add statistics cards

2. **Day 3-4**: Verification Workflow
   - Create VerificationForm component
   - Create VerificationReview component
   - Implement status management

3. **Day 5**: Verification Details
   - Create VerificationDetails component
   - Add AML results display
   - Test verification workflow

### Phase 4: Questionnaire & Answers (Week 7)
**Goal**: Implement questionnaire management and customer answers

#### Week 7: Questionnaire & Answers
1. **Day 1-2**: Questionnaire Management
   - Create QuestionnairePage
   - Create QuestionList component
   - Create QuestionForm component
   - Implement activate/inactivate

2. **Day 3-4**: Customer Answers
   - Create AnswersPage
   - Create AnswersList component
   - Create AnswerForm component
   - Implement answer submission

3. **Day 5**: Completion Tracking
   - Create CompletionProgress component
   - Add completion rate calculation
   - Test questionnaire flow

### Phase 5: Integration & Testing (Week 8)
**Goal**: Integration, testing, and polish

#### Week 8: Final Integration
1. **Day 1-2**: Integration
   - Integrate all modules
   - Update navigation/routing
   - Update Sidebar with new menu items

2. **Day 3-4**: Testing
   - End-to-end testing
   - Fix bugs and issues
   - Cross-browser testing

3. **Day 5**: Documentation & Handoff
   - Update README
   - Create user guide
   - Prepare deployment

---

## 🚀 Navigation & Routing Updates

### Updated Sidebar Menu Items
```tsx
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Organizations', icon: <Business />, path: '/organizations' },
  { text: 'KYC Documents', icon: <Description />, path: '/kyc/documents' },
  { text: 'KYC Verification', icon: <VerifiedUser />, path: '/kyc/verification' },
  { text: 'Questionnaire', icon: <Quiz />, path: '/questionnaire' },
  { text: 'Customer Answers', icon: <QuestionAnswer />, path: '/answers' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];
```

### Updated App Routes
```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  
  {/* Protected Routes */}
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
  {/* User Management */}
  <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
  
  {/* Organization Management */}
  <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
  
  {/* KYC Management */}
  <Route path="/kyc/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
  <Route path="/kyc/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
  
  {/* Questionnaire */}
  <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
  <Route path="/answers" element={<ProtectedRoute><AnswersPage /></ProtectedRoute>} />
  
  {/* Existing Routes */}
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
</Routes>
```

---

## 🛠️ Technical Considerations

### Error Handling
```typescript
// Centralized error handling in apiService.ts
private handleError(error: AxiosError): never {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        throw new Error('Access forbidden');
      case 404:
        throw new Error('Resource not found');
      case 409:
        throw new Error('Resource already exists');
      case 500:
        throw new Error('Server error');
      default:
        throw new Error('An error occurred');
    }
  }
  throw error;
}
```

### Loading States
- Use `CircularProgress` from MUI for loading indicators
- Show skeleton loaders for table/list loading
- Disable buttons during API calls
- Show toast notifications for success/error

### Validation
- Use `yup` or `zod` for form validation
- Real-time validation feedback
- Consistent error message display
- Required field indicators

### Pagination
- Default page size: 20 items
- Page size options: [10, 20, 50, 100]
- Show total count
- First/Last page navigation

### Responsive Design
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Collapsible sidebar on mobile
- Stack form fields on mobile

---

## 📊 Dashboard Updates

### Enhanced Dashboard Widgets
1. **Statistics Cards**:
   - Total Users
   - Total Organizations
   - Pending Verifications
   - Approved Verifications
   - Pending Documents
   - Expired Documents

2. **Recent Activity Feed**:
   - Recent organization registrations
   - Recent verifications
   - Recent document uploads

3. **Charts**:
   - Organization registrations over time (line chart)
   - Verification status breakdown (pie chart)
   - Document status breakdown (bar chart)

4. **Quick Actions**:
   - Add User
   - Add Organization
   - Upload Document
   - Submit Verification

---

## 🔒 Security Considerations

1. **Authentication**:
   - JWT token stored in localStorage
   - Token expiry handling
   - Auto-logout on 401 errors
   - Secure token transmission

2. **Authorization**:
   - Role-based access control
   - Route protection
   - Action-level permissions
   - Hide UI elements based on permissions

3. **Data Validation**:
   - Client-side validation
   - Server-side validation expected
   - Sanitize inputs
   - Prevent XSS attacks

4. **HTTPS**:
   - All API calls over HTTPS in production
   - Secure cookie flags
   - CORS configuration

---

## 📝 Testing Strategy

### Unit Tests
- Test individual components
- Test service methods
- Test utility functions
- Target: 80% code coverage

### Integration Tests
- Test component interactions
- Test API integration
- Test form submissions
- Test navigation flows

### E2E Tests
- Test complete user workflows
- Test authentication flow
- Test CRUD operations
- Test error scenarios

### Testing Tools
- Jest for unit tests
- React Testing Library for component tests
- Cypress or Playwright for E2E tests

---

## 📚 Documentation

### Code Documentation
- JSDoc comments for all functions
- README for each module
- API service documentation
- Component prop documentation

### User Documentation
- User guide for each module
- Admin guide for management features
- FAQ section
- Video tutorials (optional)

---

## 🎯 Success Criteria

### Functional
- ✅ All 56+ endpoints integrated
- ✅ CRUD operations working for all modules
- ✅ Authentication and authorization working
- ✅ Pagination, search, and filters working
- ✅ Form validation working
- ✅ Error handling working

### Non-Functional
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance: Page load < 2 seconds
- ✅ Accessibility: WCAG 2.1 Level AA
- ✅ Browser compatibility: Chrome, Firefox, Safari, Edge
- ✅ Code quality: Clean, maintainable, documented
- ✅ User experience: Intuitive, consistent, polished

---

## 📦 Deliverables

1. **Source Code**:
   - All components, pages, services, and types
   - Updated routing and navigation
   - Reusable component library

2. **Documentation**:
   - API integration guide
   - Component documentation
   - User guide
   - Deployment guide

3. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests
   - Test reports

4. **Deployment**:
   - Production build
   - Docker configuration
   - CI/CD pipeline setup

---

## 🔄 Maintenance & Future Enhancements

### Immediate (Post-Launch)
- Monitor API performance
- Collect user feedback
- Fix bugs and issues
- Optimize performance

### Short-term (1-3 months)
- Add advanced search
- Add bulk operations
- Add data export features
- Add audit logging UI

### Long-term (3-6 months)
- Add analytics dashboard
- Add reporting module
- Add notification system
- Add user preferences

---

## 📞 Support & Communication

### During Implementation
- Daily stand-ups (if team)
- Weekly progress reviews
- Slack/Teams channel for questions
- GitHub issues for bug tracking

### Post-Launch
- Bug tracking system
- Feature request system
- User support documentation
- Regular update schedule

---

## ✅ Next Steps

1. **Review and Approve Plan**: Review this plan and provide feedback
2. **Set Up Development Environment**: Ensure all tools and dependencies are installed
3. **Start Phase 1**: Begin with foundation and authentication
4. **Iterative Development**: Follow the phased approach with regular check-ins
5. **Testing and QA**: Test each module before moving to the next
6. **Deployment**: Deploy to staging for testing, then production

---

## 📊 Estimated Timeline

- **Phase 1 (Foundation)**: 2 weeks
- **Phase 2 (User & Organization)**: 2 weeks
- **Phase 3 (KYC Documents & Verification)**: 2 weeks
- **Phase 4 (Questionnaire & Answers)**: 1 week
- **Phase 5 (Integration & Testing)**: 1 week

**Total Estimated Time**: 8 weeks (2 months)

---

## 💰 Resource Requirements

### Development
- 1 Full-stack Developer (React + TypeScript + REST APIs)
- 1 UI/UX Designer (optional, for custom designs)
- 1 QA Engineer (optional, for dedicated testing)

### Tools & Services
- VS Code / WebStorm
- Postman for API testing
- Git for version control
- GitHub/GitLab for code hosting
- Figma for design (if needed)

---

**Document Version**: 1.0  
**Created**: March 3, 2026  
**Last Updated**: March 3, 2026  
**Status**: ⏳ Awaiting Review
