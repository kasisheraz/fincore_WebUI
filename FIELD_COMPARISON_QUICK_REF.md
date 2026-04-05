# Backend API vs Frontend UI - Field Comparison

**Quick Reference Guide**  
Last Updated: March 30, 2026

---

## USER MANAGEMENT COMPARISON

### Backend: UserCreateDTO.java
```java
✅ phoneNumber: String (required, max 20)
✅ firstName: String (required, max 100)
✅ lastName: String (required, max 100)
✅ email: String (optional, max 50)
✅ middleName: String (optional, max 100)
✅ dateOfBirth: LocalDate (optional)
❌ gender: String (optional) ← MISSING IN UI
❌ residentialAddressIdentifier: Long (optional) ← MISSING IN UI
❌ postalAddressIdentifier: Long (optional) ← MISSING IN UI
✅ statusDescription: String (optional)
✅ role: String (optional)
```

### Frontend: UserForm.tsx / CreateUserDTO
```typescript
✅ phoneNumber: string
✅ firstName: string
✅ lastName: string
✅ email: string
✅ middleName?: string
✅ dateOfBirth: string
✅ statusDescription?: Status
✅ role?: string
```

### **GAPS: 3 fields missing**
1. ❌ gender
2. ❌ residentialAddressIdentifier
3. ❌ postalAddressIdentifier

---

## ORGANIZATION MANAGEMENT COMPARISON

### Backend: OrganisationCreateDTO.java (40+ fields)

#### ✅ Required Fields (3):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| ownerId | ✅ ownerId | OK |
| legalName | ✅ legalName | OK |
| organisationType | ✅ organisationType | OK |

#### Basic Information:
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| registrationNumber | ✅ registrationNumber | OK |
| sicCode | ❌ | **MISSING** |
| businessName | ❌ | **MISSING** |
| businessDescription | ✅ description (renamed) | OK |
| incorporationDate | ❌ | **MISSING** |
| countryOfIncorporation | ❌ | **MISSING** |
| typeOfBusinessCode | ❌ | **MISSING** |

#### Contact Information:
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| websiteAddress | ✅ website (renamed) | OK |
| ❌ | ⚠️ email | **NOT IN BACKEND** |
| ❌ | ⚠️ phoneNumber | **NOT IN BACKEND** |
| ❌ | ⚠️ taxId | **NOT IN BACKEND** |

#### Regulatory Information (4 fields):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| hmrcMlrNumber | ❌ | **MISSING** |
| hmrcExpiryDate | ❌ | **MISSING** |
| fcaNumber | ❌ | **MISSING** |
| icoNumber | ❌ | **MISSING** |

#### Business Structure (7 fields):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| numberOfBranches | ❌ | **MISSING** |
| numberOfAgents | ❌ | **MISSING** |
| mlroDetails | ❌ | **MISSING** |
| complianceConsultantDetails | ❌ | **MISSING** |
| accountantDetails | ❌ | **MISSING** |
| technologyServiceProviderDetails | ❌ | **MISSING** |
| payoutPartnerName | ❌ | **MISSING** |

#### Registration Details (4 fields):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| registrationInformation | ❌ | **MISSING** |
| companyNumber | ❌ | **MISSING** |
| sicCodes | ❌ | **MISSING** |
| businessLicenseNumber | ❌ | **MISSING** |

#### Remittance Information (2 fields):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| primaryRemittanceDestinationCountry | ❌ | **MISSING** |
| secondaryRemittanceDestinationCountry | ❌ | **MISSING** |

#### Transaction Volumes (8 fields):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| monthlyTurnoverRange | ❌ | **MISSING** |
| numberOfIncomingTransactions | ❌ | **MISSING** |
| numberOfOutgoingTransactions | ❌ | **MISSING** |
| valueOfIncomingTransactions | ❌ | **MISSING** |
| valueOfOutgoingTransactions | ❌ | **MISSING** |
| maxValueOfIncomingPayments | ❌ | **MISSING** |
| maxValueOfOutgoingPayments | ❌ | **MISSING** |
| productDescription | ❌ | **MISSING** |

#### Addresses (3 nested objects):
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| registeredAddress: AddressCreateDTO | ❌ | **MISSING** |
| businessAddress: AddressCreateDTO | ❌ | **MISSING** |
| correspondenceAddress: AddressCreateDTO | ❌ | **MISSING** |

#### Other:
| Backend Field | Frontend | Status |
|---------------|----------|--------|
| legacyIdentifier | ❌ | **MISSING** |

### **SUMMARY:**
- ✅ **Backend Fields:** 40+
- ✅ **Frontend Fields:** 10
- ❌ **Missing:** 30+
- ⚠️ **Extra in Frontend:** 3 (email, phoneNumber, taxId)

---

## ADDRESS MANAGEMENT COMPARISON

### Backend: AddressCreateDTO.java
```java
✅ typeCode: Integer (required)
✅ addressLine1: String (required, max 100)
✅ country: String (required, max 50)
✅ addressLine2: String (optional, max 100)
✅ postalCode: String (optional, max 20)
✅ stateCode: String (optional, max 20)
✅ city: String (optional, max 50)
```

### Frontend: CreateAddressDTO (type only, no form)
```typescript
❌ NO FORM COMPONENT EXISTS

Type definition (doesn't match backend):
{
  userId: number;         ← NOT IN BACKEND
  typeCode: number;       ← OK
  addressLine1: string;   ← OK
  addressLine2?: string;  ← OK
  city: string;           ← OK
  stateProvince: string;  ← WRONG (backend uses stateCode)
  postalCode: string;     ← OK
  country: string;        ← OK
  isPrimary?: boolean;    ← NOT IN BACKEND
}
```

### **GAPS:**
1. ❌ No AddressForm.tsx component
2. ❌ TypeScript type doesn't match backend
3. ❌ Cannot create or manage addresses

---

## PRIORITY MATRIX

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  HIGH IMPACT + HIGH URGENCY                      │
│  ┌────────────────────────────────────────┐     │
│  │ 1. Organization Fields (30+ missing)   │     │
│  │ 2. Address Management (0% complete)    │     │
│  │ 3. User Gender Field                   │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  MEDIUM IMPACT + MEDIUM URGENCY                  │
│  ┌────────────────────────────────────────┐     │
│  │ 4. User Address Links                  │     │
│  │ 5. Type Definitions Alignment          │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  LOW IMPACT + LOW URGENCY                        │
│  ┌────────────────────────────────────────┐     │
│  │ 6. Contact Field Discrepancy           │     │
│  └────────────────────────────────────────┘     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION ROADMAP

### 🚀 Phase 1: Quick Wins (1-2 days)
```
Day 1:
├── Morning: Add gender field to UserForm
├── Afternoon: Create AddressForm component
└── End of Day: User with gender working

Day 2:
├── Morning: Add address selection to UserForm
├── Afternoon: Test user creation with addresses
└── End of Day: Phase 1 complete, all user tests passing
```

### 🏗️ Phase 2: Organization Overhaul (3-5 days)
```
Day 3:
├── Morning: Design tabbed form structure
├── Afternoon: Create tab container and navigation
└── End of Day: Basic tabs rendering

Day 4:
├── Morning: Build Tab 1 (Basic Info) + Tab 2 (Regulatory)
├── Afternoon: Build Tab 3 (Structure) + Tab 4 (Registration)
└── End of Day: 4 tabs functional

Day 5:
├── Morning: Build Tab 5 (Remittance) + Tab 6 (Transactions)
├── Afternoon: Build Tab 7 (Addresses) + Tab 8 (Other)
└── End of Day: All 8 tabs complete

Day 6-7:
├── Validation implementation
├── Form integration testing
├── UX polish (save draft, progress indicator)
└── Phase 2 complete
```

### ✅ Phase 3: Testing & Polish (1-2 days)
```
Day 8:
├── Backend alignment verification
├── Integration testing
└── E2E test updates

Day 9:
├── Documentation updates
├── Final testing
└── Deployment preparation
```

---

## FIELD COUNT SUMMARY

| Module | Backend | Frontend | Match | Missing | Extra |
|--------|---------|----------|-------|---------|-------|
| **Users** | 11 | 8 | 8 | 3 | 0 |
| **Organizations** | 40+ | 10 | 7 | 30+ | 3 |
| **Addresses** | 7 | 0* | 0 | 7 | 3* |
| **TOTAL** | **58+** | **18** | **15** | **40+** | **6** |

*Type exists but no form component

---

## RISK INDICATORS

### 🔴 Critical Risks
- **Organization onboarding broken** - Cannot capture required regulatory data
- **Address management non-functional** - No way to create or link addresses
- **Data integrity compromised** - Missing fields may cause API errors

### 🟡 Medium Risks
- **User profiles incomplete** - Missing gender and address links
- **Type safety issues** - TypeScript types don't match backend
- **Form complexity** - 40+ fields may overwhelm users

### 🟢 Low Risks
- **Contact field discrepancy** - Clarify with backend team
- **Testing scope** - May need more time for comprehensive testing

---

## RECOMMENDED NEXT STEPS

### ✅ Immediate (Today):
1. Review this analysis with stakeholders
2. Confirm which organization fields are critical for MVP
3. Decide on tabbed vs wizard vs accordion UX
4. Get backend team to clarify contact field requirements

### ✅ Short-term (This Week):
1. Start Phase 1: User fields (gender + addresses)
2. Create design mockups for organization form
3. Set up development branch
4. Write initial test cases

### ✅ Medium-term (Next 2 Weeks):
1. Complete Phase 2: Organization form overhaul
2. Complete Phase 3: Testing and alignment
3. Deploy to NPE for testing
4. Gather user feedback

---

## REFERENCE DOCUMENTS

📄 **[API_UI_FIELD_ANALYSIS.md](./API_UI_FIELD_ANALYSIS.md)**  
   Complete detailed analysis with all fields, validation rules, and backend DTOs

📊 **[IMPLEMENTATION_PLAN_SUMMARY.md](./IMPLEMENTATION_PLAN_SUMMARY.md)**  
   Executive summary with timeline, resources, and acceptance criteria

🔗 **[API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)**  
   Backend API documentation and endpoints

🧪 **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)**  
   Testing approach and test cases

---

**Document Purpose:** Quick reference for developers during implementation  
**Status:** Ready for implementation  
**Last Updated:** March 30, 2026
