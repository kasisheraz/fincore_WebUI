# API-UI Field Gap Analysis

## Document Overview
This document compares the backend API specifications with the current UI implementation to identify missing fields and plan the necessary updates.

**Analysis Date:** March 30, 2026  
**Backend API:** http://localhost:8081/swagger-ui/index.html  
**Repositories Analyzed:**
- Backend: `userManagementApi`
- Frontend: `fincore_WebUI`

---

## 1. USER MANAGEMENT

### 1.1 User API Specification (Backend)

**Source:** `UserCreateDTO.java`

```java
@Required Fields:
- phoneNumber: String (max 20) ✅ In UI
- firstName: String (max 100) ✅ In UI
- lastName: String (max 100) ✅ In UI

@Optional Fields:
- email: String (max 50) ✅ In UI
- middleName: String (max 100) ✅ In UI
- dateOfBirth: LocalDate ✅ In UI
- gender: String ❌ MISSING IN UI
- residentialAddressIdentifier: Long ❌ MISSING IN UI
- postalAddressIdentifier: Long ❌ MISSING IN UI
- statusDescription: String ❌ MISSING IN UI (only in edit mode)
- role: String ❌ PARTIALLY IN UI (only in create mode)
```

### 1.2 Current UI Implementation

**Source:** `UserForm.tsx`, `CreateUserDTO` TypeScript type

**Fields Present in UI:**
- ✅ firstName
- ✅ middleName
- ✅ lastName
- ✅ email
- ✅ phoneNumber
- ✅ dateOfBirth
- ✅ role (create mode only)
- ✅ statusDescription (edit mode only)

**Fields MISSING from UI:**
- ❌ gender (removed or never added)
- ❌ residentialAddressIdentifier
- ❌ postalAddressIdentifier

### 1.3 User Fields Gap Summary

| Field Name | Backend Required | UI Present | Status | Priority |
|------------|------------------|------------|--------|----------|
| phoneNumber | ✅ Required | ✅ Yes | OK | - |
| firstName | ✅ Required | ✅ Yes | OK | - |
| lastName | ✅ Required | ✅ Yes | OK | - |
| email | Optional | ✅ Yes | OK | - |
| middleName | Optional | ✅ Yes | OK | - |
| dateOfBirth | Optional | ✅ Yes | OK | - |
| **gender** | **Optional** | **❌ No** | **MISSING** | **HIGH** |
| **residentialAddressIdentifier** | **Optional** | **❌ No** | **MISSING** | **MEDIUM** |
| **postalAddressIdentifier** | **Optional** | **❌ No** | **MISSING** | **MEDIUM** |
| role | Optional | ✅ Yes (create) | OK | - |
| statusDescription | Optional | ✅ Yes (edit) | OK | - |

**Impact:** 3 fields missing (1 high priority, 2 medium priority)

---

## 2. ORGANIZATION MANAGEMENT

### 2.1 Organization API Specification (Backend)

**Source:** `OrganisationCreateDTO.java`

```java
@Required Fields:
- ownerId: Long ✅ In UI
- legalName: String (max 100) ✅ In UI
- organisationType: String ✅ In UI

@Basic Information (Optional):
- registrationNumber: String (max 20) ✅ In UI
- sicCode: String (max 20) ❌ MISSING
- businessName: String (max 100) ❌ MISSING
- businessDescription: String (max 255) ✅ In UI (as 'description')
- incorporationDate: LocalDate ❌ MISSING
- countryOfIncorporation: String (max 100) ❌ MISSING
- typeOfBusinessCode: String (max 50) ❌ MISSING

@Contact Information:
- email: String ✅ In UI (not in backend DTO!)
- phoneNumber: String ✅ In UI (not in backend DTO!)
- websiteAddress: String (max 100) ✅ In UI (as 'website')

@Regulatory Information:
- hmrcMlrNumber: String (max 50) ❌ MISSING
- hmrcExpiryDate: LocalDate ❌ MISSING
- fcaNumber: String (max 20) ❌ MISSING
- icoNumber: String (max 20) ❌ MISSING

@Business Structure:
- numberOfBranches: String (max 10) ❌ MISSING
- numberOfAgents: String (max 10) ❌ MISSING
- mlroDetails: String (max 100) ❌ MISSING
- complianceConsultantDetails: String (max 100) ❌ MISSING
- accountantDetails: String (max 100) ❌ MISSING
- technologyServiceProviderDetails: String (max 100) ❌ MISSING
- payoutPartnerName: String (max 50) ❌ MISSING

@Registration Details:
- registrationInformation: String (max 100) ❌ MISSING
- companyNumber: String (max 20) ❌ MISSING
- sicCodes: String (max 50) ❌ MISSING
- businessLicenseNumber: String (max 50) ❌ MISSING

@Remittance Information:
- primaryRemittanceDestinationCountry: String (max 50) ❌ MISSING
- secondaryRemittanceDestinationCountry: String (max 50) ❌ MISSING

@Transaction Volume Information:
- monthlyTurnoverRange: String (max 50) ❌ MISSING
- numberOfIncomingTransactions: String (max 20) ❌ MISSING
- numberOfOutgoingTransactions: String (max 20) ❌ MISSING
- valueOfIncomingTransactions: String (max 50) ❌ MISSING
- valueOfOutgoingTransactions: String (max 50) ❌ MISSING
- maxValueOfIncomingPayments: String (max 50) ❌ MISSING
- maxValueOfOutgoingPayments: String (max 50) ❌ MISSING
- productDescription: String (max 255) ❌ MISSING

@Address Information:
- registeredAddress: AddressCreateDTO ❌ MISSING
- businessAddress: AddressCreateDTO ❌ MISSING
- correspondenceAddress: AddressCreateDTO ❌ MISSING

@Other:
- legacyIdentifier: String (max 20) ❌ MISSING
```

### 2.2 Current UI Implementation

**Source:** `OrganizationForm.tsx`, `CreateOrganizationDTO` TypeScript type

**Fields Present in UI:**
- ✅ legalName
- ✅ organisationType
- ✅ registrationNumber
- ✅ taxId (NOT in backend DTO!)
- ✅ email (NOT in backend DTO!)
- ✅ phoneNumber (NOT in backend DTO!)
- ✅ website (as websiteAddress in backend)
- ✅ description (as businessDescription in backend)
- ✅ statusDescription (edit mode only)
- ✅ ownerId

### 2.3 Organization Fields Gap Summary

| Category | Backend Fields | UI Fields | Missing Count |
|----------|----------------|-----------|---------------|
| **Required** | 3 | 3 | 0 |
| **Basic Info** | 7 | 4 | 3 |
| **Contact** | 1 | 2 | -1 (UI has extra) |
| **Regulatory** | 4 | 0 | **4** |
| **Business Structure** | 7 | 0 | **7** |
| **Registration** | 4 | 0 | **4** |
| **Remittance** | 2 | 0 | **2** |
| **Transaction Volume** | 8 | 0 | **8** |
| **Addresses** | 3 | 0 | **3** |
| **Other** | 1 | 0 | 1 |
| **TOTAL** | **40** | **10** | **30+ MISSING** |

**Critical Finding:** The UI has only ~25% of the required organization fields!

---

## 3. ADDRESS MANAGEMENT

### 3.1 Address API Specification (Backend)

**Source:** `AddressCreateDTO.java`

```java
@Required Fields:
- typeCode: Integer (1=Registered, 2=Business, 3=Correspondence, etc.)
- addressLine1: String (max 100)
- country: String (max 50)

@Optional Fields:
- addressLine2: String (max 100)
- postalCode: String (max 20)
- stateCode: String (max 20)
- city: String (max 50)
```

### 3.2 Current UI Implementation

**Status:** ❌ NO ADDRESS FORM EXISTS

The UI has type definitions in `organization.types.ts`:
```typescript
export interface CreateAddressDTO {
  userId: number;  // ❌ Wrong - backend uses typeCode, not userId
  typeCode: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;  // ❌ Wrong - backend uses stateCode
  postalCode: string;
  country: string;
  isPrimary?: boolean;  // ❌ Not in backend DTO
}
```

**Issues:**
1. TypeScript definition doesn't match backend DTO
2. No address form component exists
3. User addresses are referenced in backend but not in UI
4. Organization addresses are embedded in OrganisationCreateDTO but not in UI

---

## 4. PRIORITY ASSESSMENT

### 4.1 Critical Issues (Must Fix)

1. **User Gender Field Missing**
   - **Impact:** High - Basic user information
   - **Effort:** Low - Single dropdown field
   - **Priority:** ⭐⭐⭐ CRITICAL

2. **Organization Form Missing 75% of Fields**
   - **Impact:** CRITICAL - Cannot properly onboard organizations
   - **Effort:** High - Requires complete form redesign
   - **Priority:** ⭐⭐⭐ CRITICAL

3. **Address Management Completely Missing**
   - **Impact:** High - User and org addresses not supported
   - **Effort:** Medium - Need address form component
   - **Priority:** ⭐⭐⭐ CRITICAL

### 4.2 High Priority Issues

4. **User Address Fields Missing**
   - residentialAddressIdentifier
   - postalAddressIdentifier
   - **Impact:** Medium - User profile incomplete
   - **Effort:** Low - Add dropdown to select existing addresses
   - **Priority:** ⭐⭐ HIGH

5. **TypeScript Types Don't Match Backend**
   - Address types mismatch
   - Organization fields don't align
   - **Impact:** Medium - Type safety compromised
   - **Effort:** Low - Update type definitions
   - **Priority:** ⭐⭐ HIGH

### 4.3 Medium Priority Issues

6. **Organization Contact Fields Not in Backend**
   - UI has email, phoneNumber, taxId
   - Backend DTO doesn't have these
   - **Impact:** Low - May cause API errors
   - **Effort:** Low - Remove or verify with backend team
   - **Priority:** ⭐ MEDIUM

---

## 5. RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: User Management Fixes (1-2 days)

**Goal:** Add missing user fields and address support

**Tasks:**
1. ✅ Add gender field to UserForm.tsx
   - Update CreateUserDTO and UpdateUserDTO types
   - Add dropdown with gender options
   - Add validation

2. ✅ Create Address Form Component
   - Create AddressForm.tsx
   - Fix AddressCreateDTO type definition
   - Add address validation

3. ✅ Add Address Selection to User Form
   - Add residential address field
   - Add postal address field
   - Support creating new addresses inline
   - Support selecting existing addresses

4. ✅ Update User Types
   - Add missing fields to TypeScript types
   - Ensure alignment with backend DTOs

**Estimated Time:** 1-2 days  
**Complexity:** Medium  
**Risk:** Low

---

### Phase 2: Organization Management Overhaul (3-5 days)

**Goal:** Add all missing organization fields with proper UX

**Tasks:**
1. ✅ Redesign Organization Form with Tabs/Sections
   - **Tab 1: Basic Information** (current fields + missing basic)
   - **Tab 2: Regulatory Information** (HMRC, FCA, ICO)
   - **Tab 3: Business Structure** (branches, agents, MLRO, etc.)
   - **Tab 4: Registration Details** (company numbers, SIC codes)
   - **Tab 5: Remittance Information** (destination countries)
   - **Tab 6: Transaction Volumes** (turnover, transaction counts/values)
   - **Tab 7: Addresses** (registered, business, correspondence)
   - **Tab 8: Additional Details** (product description, legacy ID)

2. ✅ Create Sub-Components
   - RegulatoryInfoSection.tsx
   - BusinessStructureSection.tsx
   - TransactionVolumeSection.tsx
   - OrganizationAddressesSection.tsx

3. ✅ Update Organization TypeScript Types
   - Add all missing fields to CreateOrganizationDTO
   - Add all missing fields to Organization interface
   - Ensure exact match with backend DTOs

4. ✅ Add Form Validation
   - Required field validation
   - Format validation (dates, numbers)
   - Max length validation
   - Conditional validation (e.g., expiry date if HMRC number provided)

5. ✅ Implement Progressive Disclosure
   - Show required fields first
   - Optional sections collapsible
   - Smart defaults where possible
   - Field dependencies (enable/disable based on other fields)

**Estimated Time:** 3-5 days  
**Complexity:** High  
**Risk:** Medium

---

### Phase 3: Backend Alignment & Testing (1-2 days)

**Goal:** Ensure complete alignment and test all flows

**Tasks:**
1. ✅ Verify Contact Fields
   - Check if backend accepts email/phone/taxId for organizations
   - Update backend DTO if needed OR remove from UI

2. ✅ Integration Testing
   - Test user creation with all fields
   - Test organization creation with all fields
   - Test address creation and linking
   - Test validation errors

3. ✅ E2E Testing
   - Update Playwright tests for new fields
   - Test all tabs/sections
   - Test form validation
   - Test data persistence

4. ✅ Documentation
   - Update API documentation
   - Update UI testing guide
   - Create organization onboarding guide

**Estimated Time:** 1-2 days  
**Complexity:** Medium  
**Risk:** Low

---

## 6. DETAILED FIELD MAPPING

### 6.1 User Fields Mapping

| UI Field Name | Backend Field Name | Type | Required | Notes |
|---------------|-------------------|------|----------|-------|
| firstName | firstName | string | Yes | ✅ Matches |
| middleName | middleName | string | No | ✅ Matches |
| lastName | lastName | string | Yes | ✅ Matches |
| email | email | string | No | ✅ Matches |
| phoneNumber | phoneNumber | string | Yes | ✅ Matches |
| dateOfBirth | dateOfBirth | date | No | ✅ Matches |
| **ADD: gender** | gender | string | No | ❌ Missing - Add MALE/FEMALE/OTHER |
| role | role | string | No | ✅ Matches |
| statusDescription | statusDescription | string | No | ✅ Matches |
| **ADD: residentialAddressIdentifier** | residentialAddressIdentifier | number | No | ❌ Missing |
| **ADD: postalAddressIdentifier** | postalAddressIdentifier | number | No | ❌ Missing |

### 6.2 Organization Fields Mapping

| UI Field Name | Backend Field Name | Type | Required | Status |
|---------------|-------------------|------|----------|--------|
| legalName | legalName | string | Yes | ✅ OK |
| organisationType | organisationType | string | Yes | ✅ OK |
| ownerId | ownerId | number | Yes | ✅ OK |
| registrationNumber | registrationNumber | string | No | ✅ OK |
| description | businessDescription | string | No | ✅ OK (renamed) |
| website | websiteAddress | string | No | ✅ OK (renamed) |
| **ADD: sicCode** | sicCode | string | No | ❌ Missing |
| **ADD: businessName** | businessName | string | No | ❌ Missing |
| **ADD: incorporationDate** | incorporationDate | date | No | ❌ Missing |
| **ADD: countryOfIncorporation** | countryOfIncorporation | string | No | ❌ Missing |
| **ADD: typeOfBusinessCode** | typeOfBusinessCode | string | No | ❌ Missing |
| **ADD:hmrcMlrNumber** | hmrcMlrNumber | string | No | ❌ Missing |
| **ADD: hmrcExpiryDate** | hmrcExpiryDate | date | No | ❌ Missing |
| **ADD: fcaNumber** | fcaNumber | string | No | ❌ Missing |
| **ADD: icoNumber** | icoNumber | string | No | ❌ Missing |
| **ADD: numberOfBranches** | numberOfBranches | string | No | ❌ Missing |
| **ADD: numberOfAgents** | numberOfAgents | string | No | ❌ Missing |
| **ADD: mlroDetails** | mlroDetails | string | No | ❌ Missing |
| **ADD: complianceConsultantDetails** | complianceConsultantDetails | string | No | ❌ Missing |
| **ADD: accountantDetails** | accountantDetails | string | No | ❌ Missing |
| **ADD: technologyServiceProviderDetails** | technologyServiceProviderDetails | string | No | ❌ Missing |
| **ADD: payoutPartnerName** | payoutPartnerName | string | No | ❌ Missing |
| **ADD: registrationInformation** | registrationInformation | string | No | ❌ Missing |
| **ADD: companyNumber** | companyNumber | string | No | ❌ Missing |
| **ADD: sicCodes** | sicCodes | string | No | ❌ Missing |
| **ADD: businessLicenseNumber** | businessLicenseNumber | string | No | ❌ Missing |
| **ADD: primaryRemittanceDestinationCountry** | primaryRemittanceDestinationCountry | string | No | ❌ Missing |
| **ADD: secondaryRemittanceDestinationCountry** | secondaryRemittanceDestinationCountry | string | No | ❌ Missing |
| **ADD: monthlyTurnoverRange** | monthlyTurnoverRange | string | No | ❌ Missing |
| **ADD: numberOfIncomingTransactions** | numberOfIncomingTransactions | string | No | ❌ Missing |
| **ADD: numberOfOutgoingTransactions** | numberOfOutgoingTransactions | string | No | ❌ Missing |
| **ADD: valueOfIncomingTransactions** | valueOfIncomingTransactions | string | No | ❌ Missing |
| **ADD: valueOfOutgoingTransactions** | valueOfOutgoingTransactions | string | No | ❌ Missing |
| **ADD: maxValueOfIncomingPayments** | maxValueOfIncomingPayments | string | No | ❌ Missing |
| **ADD: maxValueOfOutgoingPayments** | maxValueOfOutgoingPayments | string | No | ❌ Missing |
| **ADD: productDescription** | productDescription | string | No | ❌ Missing |
| **ADD: registeredAddress** | registeredAddress | AddressCreateDTO | No | ❌ Missing |
| **ADD: businessAddress** | businessAddress | AddressCreateDTO | No | ❌ Missing |
| **ADD: correspondenceAddress** | correspondenceAddress | AddressCreateDTO | No | ❌ Missing |
| **ADD: legacyIdentifier** | legacyIdentifier | string | No | ❌ Missing |
| **VERIFY: email** | ❓ Not in DTO | string | No | ⚠️ May need removal |
| **VERIFY: phoneNumber** | ❓ Not in DTO | string | No | ⚠️ May need removal |
| **VERIFY: taxId** | ❓ Not in DTO | string | No | ⚠️ May need removal |

---

## 7. UX RECOMMENDATIONS

### 7.1 Organization Form UX Strategy

Given the massive number of fields (40+), we recommend:

**Option A: Tabbed Interface** (Recommended)
- 8 tabs for different sections
- Progress indicator showing completion
- Save draft functionality
- Required fields highlighted

**Option B: Wizard/Stepper Interface**
- Multi-step form with Next/Previous
- Progress bar
- Review step at the end
- Can save and resume later

**Option C: Accordion Sections**
- All sections on one page
- Expandable/collapsible sections
- Sticky headers
- Jump-to-section navigation

**Recommendation:** Use **Option A (Tabbed Interface)** because:
- Professional and familiar UX
- Easy to implement with Material-UI
- Users can jump to any section
- Better for editing existing organizations
- Aligns with enterprise financial applications

### 7.2 Address Management UX

**Recommendation:**
- Inline address forms within organization/user forms
- "Add New Address" button opens dialog/drawer
- Dropdown to select from existing addresses (for users)
- Three address types for organizations (registered, business, correspondence)
- Google Places API integration for autocomplete (future enhancement)

---

## 8. RISK ASSESSMENT

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Form complexity impacts performance | Medium | Medium | Use lazy loading, code splitting |
| Validation logic becomes unmaintainable | High | High | Create reusable validation utilities |
| Backend changes during implementation | Medium | High | Maintain close communication; version API |
| Data migration for existing records | Low | High | Not applicable (new implementation) |

### 8.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Users overwhelmed by form complexity | High | Medium | Use progressive disclosure, smart defaults |
| Incomplete data submissions | Medium | Medium | Clearly mark required vs optional fields |
| Compliance requirements change | Low | High | Design flexible form structure |

---

## 9. TESTING STRATEGY

### 9.1 Unit Tests
- Validation functions for each field type
- Form state management
- Address creation logic

### 9.2 Integration Tests
- User creation with all field combinations
- Organization creation with addresses
- Address linking to users/organizations

### 9.3 E2E Tests
- Complete user onboarding flow
- Complete organization onboarding flow
- Edit flows for existing records
- Validation error handling

### 9.4 Manual Testing Checklist
- [ ] All required fields enforced
- [ ] Optional sections collapsible
- [ ] Form saves draft correctly
- [ ] Tab navigation works
- [ ] Address forms submit correctly
- [ ] Existing addresses can be selected
- [ ] Error messages are clear
- [ ] Success feedback is immediate
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 10. ESTIMATED TIMELINE

| Phase | Tasks | Estimated Time | Dependencies |
|-------|-------|----------------|--------------|
| **Phase 1: User Fields** | Add gender, addresses | 1-2 days | None |
| **Phase 2: Organization Overhaul** | Complete form redesign | 3-5 days | Phase 1 addresses |
| **Phase 3: Testing & Polish** | Integration, E2E, docs | 1-2 days | Phases 1-2 |
| **TOTAL** | | **5-9 days** | |

**Buffer for unexpected issues:** +20% = **6-11 days total**

---

## 11. NEXT STEPS

### Immediate Actions:
1. **Review this analysis** with backend team to verify field requirements
2. **Prioritize** which organization fields are must-have vs nice-to-have
3. **Decide on UX approach** (tabs, wizard, or accordion)
4. **Create design mockups** for new organization form
5. **Get approval** to proceed with implementation

### Development Approach:
1. Start with Phase 1 (User fields) - quick wins
2. Create organization form prototype with 2-3 tabs
3. Get feedback before building all 8 tabs
4. Iterate based on user testing
5. Complete remaining tabs
6. Full testing and documentation

---

## 12. QUESTIONS FOR STAKEHOLDERS

1. **Business Priority:**
   - Which organization fields are absolutely required for MVP?
   - Can some fields be added in later phases?
   - Are there regulatory requirements driving specific fields?

2. **UX Approach:**
   - Do users prefer tabs, wizard, or accordion?
   - Should we support "save draft" functionality?
   - Do we need a "minimal" vs "full" organization creation flow?

3. **Technical:**
   - Why do UI and backend have different contact fields for organizations?
   - Should we update backend DTO or remove fields from UI?
   - Are there API versioning considerations?

4. **Timeline:**
   - What is the deadline for this work?
   - Can we phase the rollout (users first, then organizations)?
   - Is there budget for additional resources?

---

## APPENDIX: Backend DTO Snapshots

### A.1 UserCreateDTO.java (Full)
```java
public class UserCreateDTO {
    private String phoneNumber;        // Required, max 20
    private String email;              // Optional, max 50
    private String firstName;          // Required, max 100
    private String middleName;         // Optional, max 100
    private String lastName;           // Required, max 100
    private LocalDate dateOfBirth;    // Optional
    private Long residentialAddressIdentifier;  // Optional (NEW)
    private Long postalAddressIdentifier;       // Optional (NEW)
    private String statusDescription;  // Optional
    private String role;               // Optional
}
```

### A.2 OrganisationCreateDTO.java (Structure)
```
OrganisationCreateDTO (40+ fields)
├── Required
│   ├── ownerId
│   ├── legalName
│   └── organisationType
├── Basic Information (7 fields)
├── Regulatory (4 fields)
├── Business Structure (7 fields)
├── Registration (4 fields)
├── Remittance (2 fields)
├── Transaction Volumes (8 fields)
├── Addresses (3 nested DTOs)
└── Other (1 field)
```

### A.3 AddressCreateDTO.java (Full)
```java
public class AddressCreateDTO {
    private Integer typeCode;         // Required
    private String addressLine1;      // Required, max 100
    private String addressLine2;      // Optional, max 100
    private String postalCode;        // Optional, max 20
    private String stateCode;         // Optional, max 20
    private String city;              // Optional, max 50
    private String country;           // Required, max 50
}
```

---

**Document Status:** Draft for Review  
**Next Review:** After stakeholder feedback  
**Owner:** Development Team  
**Last Updated:** March 30, 2026
