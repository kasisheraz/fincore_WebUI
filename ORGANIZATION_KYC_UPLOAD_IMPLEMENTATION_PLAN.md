# Organization Creation with KYC Document Upload - Implementation Plan

**Date**: April 20, 2026  
**Status**: Planning Phase  
**Priority**: High  

---

## 📋 Executive Summary

### Current Behavior
1. Organization creation is a **9-step wizard** with tabs
2. **Auto-save exists**: When user navigates to Tab 7 (KYC Documents), organization is automatically saved as PENDING with org-id
3. **Current limitation**: Tab 7 shows info message only - users must upload KYC documents separately from KYC Documents page after creation

### Required Behavior
1. **KYC documents must be uploaded during organization creation** (as part of the wizard)
2. **Data persistence on "Next" button**: Each step's data should persist to database
3. **Org-id requirement**: KYC upload needs org-id, which is created when completing Step 1 (Basic Info)

### Solution Approach
**Leverage existing auto-save functionality** and enhance Tab 7 to support inline file uploads with immediate backend persistence.

---

## 🎯 Requirements Analysis

### Functional Requirements

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| FR-1 | Upload multiple KYC documents during organization creation | HIGH | **Medium** |
| FR-2 | Auto-persist organization data when clicking "Next" from Tab 0 | HIGH | **Low** (Already exists!) |
| FR-3 | Use auto-saved org-id for KYC document uploads | HIGH | **Low** (Already exists!) |
| FR-4 | Support multiple document types (PASSPORT, DRIVERS_LICENSE, etc.) | HIGH | **Low** |
| FR-5 | File validation (type, size, format) | MEDIUM | **Low** |
| FR-6 | Upload progress indicator for large files | MEDIUM | **Low** |
| FR-7 | Delete uploaded documents before final submission | LOW | **Low** |
| FR-8 | Preview uploaded documents | LOW | **Medium** |

### Non-Functional Requirements

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-1 | Upload file size limit | 10MB | Already supported by backend |
| NFR-2 | Supported file types | PDF, JPG, PNG | Already supported by GCS |
| NFR-3 | Upload timeout | 60s | Configurable |
| NFR-4 | UI responsiveness | < 200ms | Except during file upload |
| NFR-5 | Browser compatibility | Chrome, Firefox, Edge, Safari | Standard React |

---

## 🏗️ Technical Architecture

### Current State

```
┌──────────────────────────────────────────────────────────┐
│ OrganizationForm (Multi-step Wizard)                    │
├──────────────────────────────────────────────────────────┤
│ Tab 0: Basic Info (Required)                            │
│   → Auto-saves when clicking Next to Tab 7              │
│   → Creates organization with PENDING status             │
│   → Returns org-id and stores in savedOrganizationId    │
├──────────────────────────────────────────────────────────┤
│ Tab 1-6: Additional Info (Optional)                     │
│   → Data stored in local state only                     │
│   → Persisted on final "Save" button                    │
├──────────────────────────────────────────────────────────┤
│ Tab 7: KYC Documents (Required but empty)               │
│   → Currently shows info message only                   │
│   → Tells user to upload documents later                │
├──────────────────────────────────────────────────────────┤
│ Tab 8: Other Info (Optional)                            │
└──────────────────────────────────────────────────────────┘
```

### Target State

```
┌──────────────────────────────────────────────────────────┐
│ OrganizationForm (Multi-step Wizard)                    │
├──────────────────────────────────────────────────────────┤
│ Tab 0: Basic Info (Required)                            │
│   ✅ Auto-saves when clicking Next to Tab 7             │
│   ✅ Creates organization with PENDING status            │
│   ✅ Returns org-id → savedOrganizationId               │
├──────────────────────────────────────────────────────────┤
│ Tab 1-6: Additional Info (Optional)                     │
│   ✅ Data stored in local state                         │
│   🆕 Optional: Auto-update org on Next                  │
│   ✅ Final update on "Save" button                      │
├──────────────────────────────────────────────────────────┤
│ Tab 7: KYC Documents (Required) 🆕                       │
│   ✅ Organization already saved (has org-id)             │
│   🆕 File upload UI with drag-n-drop                    │
│   🆕 Document type selection (dropdown)                 │
│   🆕 Upload button → Immediate upload to backend        │
│   🆕 List of uploaded documents (with delete option)    │
│   🆕 Document status indicators (PENDING/UPLOADED)      │
├──────────────────────────────────────────────────────────┤
│ Tab 8: Other Info (Optional)                            │
│   → Save button updates org + navigates to list         │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Component Design

### New Component: KYCDocumentsUploadTab

**Location**: `src/components/organizations/KYCDocumentsUploadTab.tsx`

**Props Interface**:
```typescript
interface KYCDocumentsUploadTabProps {
  organizationId: number | null;  // From savedOrganizationId
  onDocumentsChange?: (count: number) => void;  // Callback for parent
}
```

**Features**:
1. **Upload Section**:
   - Document type dropdown (PASSPORT, DRIVERS_LICENSE, NATIONAL_ID_CARD, etc.)
   - Drag-and-drop file area
   - File input button
   - File validation (type, size)
   - Upload button with progress indicator

2. **Uploaded Documents List**:
   - DataTable showing: Document Type, File Name, Size, Status, Actions
   - Delete button (only for PENDING/uploaded documents)
   - Download/Preview button (optional)

3. **State Management**:
   - Local state for current upload (documentType, selectedFile)
   - Uploaded documents list (fetched from backend)
   - Upload progress state

4. **API Integration**:
   - `kycDocumentService.upload()` - Upload document immediately
   - `kycDocumentService.getByOrganizationId()` - Fetch uploaded docs
   - `kycDocumentService.delete()` - Delete before submission

**Code Structure**:
```typescript
const KYCDocumentsUploadTab: React.FC<KYCDocumentsUploadTabProps> = ({
  organizationId,
  onDocumentsChange
}) => {
  // State
  const [uploadForm, setUploadForm] = useState({
    documentType: 'PASSPORT',
    file: null
  });
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load existing documents
  useEffect(() => {
    if (organizationId) {
      fetchDocuments();
    }
  }, [organizationId]);

  // Upload handler
  const handleUpload = async () => {
    if (!organizationId) {
      showError('Organization must be saved first');
      return;
    }
    
    setUploading(true);
    try {
      const result = await kycDocumentService.upload({
        organisationId: organizationId,
        documentType: uploadForm.documentType,
        file: uploadForm.file
      });
      
      // Refresh list
      await fetchDocuments();
      
      // Reset form
      setUploadForm({ documentType: 'PASSPORT', file: null });
      
      showSuccess('Document uploaded successfully');
    } catch (error) {
      showError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (docId: number) => {
    await kycDocumentService.delete(docId);
    await fetchDocuments();
  };

  return (
    <Box>
      {/* Upload Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Upload Document</Typography>
        
        {/* Document Type Selector */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={uploadForm.documentType}
            onChange={(e) => setUploadForm(prev => ({
              ...prev,
              documentType: e.target.value
            }))}
          >
            <MenuItem value="PASSPORT">Passport</MenuItem>
            <MenuItem value="DRIVERS_LICENSE">Driver's License</MenuItem>
            <MenuItem value="NATIONAL_ID_CARD">National ID Card</MenuItem>
            {/* ... other types */}
          </Select>
        </FormControl>

        {/* Drag-Drop Area */}
        <FileDropZone
          onFileSelect={(file) => setUploadForm(prev => ({ ...prev, file }))}
          accept=".pdf,.jpg,.jpeg,.png"
          maxSize={10 * 1024 * 1024}
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!uploadForm.file || uploading}
          startIcon={<UploadIcon />}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </Paper>

      {/* Uploaded Documents List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Uploaded Documents ({uploadedDocuments.length})</Typography>
        <DataTable
          data={uploadedDocuments}
          columns={columns}
          onDelete={handleDelete}
        />
      </Paper>
    </Box>
  );
};
```

---

## 🔄 Data Flow

### Scenario 1: Create Organization with KYC Documents

```
USER                    FRONTEND                    BACKEND
│                       │                           │
├─ Fill Basic Info      │                           │
│  (Tab 0)              │                           │
│                       │                           │
├─ Click "Next" ────────┼─→ Validate Tab 0         │
│                       │                           │
│                       ├─→ POST /api/organizations │
│                       │   (auto-save)             │
│                       │   ┌─────────────────────┐ │
│                       │   │ legalName           │ │
│                       │   │ organisationType    │ │
│                       │   │ ownerId             │ │
│                       │   │ status: PENDING     │ │
│                       │   └─────────────────────┘ │
│                       │                           │
│                       │ ←─────────────────────────┼─ { id: 123, ... }
│                       │                           │
│                       ├─ Save to state:          │
│                       │   savedOrganizationId=123 │
│                       │   isDraftSaved=true       │
│                       │                           │
│                       ├─→ Navigate to Tab 7      │
│                       │                           │
├─ View Tab 7 ←─────────┤                           │
│  (KYC Documents)      │                           │
│                       │                           │
│                       ├─→ GET /api/kyc-documents  │
│                       │   ?organisationId=123     │
│                       │ ←─────────────────────────┼─ { content: [] }
│                       │                           │
├─ Select doc type      │                           │
│  (PASSPORT)           │                           │
│                       │                           │
├─ Choose file ─────────┼─→ Store in local state   │
│  (passport.pdf)       │                           │
│                       │                           │
├─ Click "Upload" ──────┼─→ POST /api/kyc-documents│
│                       │   /upload                 │
│                       │   (FormData)              │
│                       │   ┌─────────────────────┐ │
│                       │   │ organisationId: 123 │ │
│                       │   │ documentType:       │ │
│                       │   │   PASSPORT          │ │
│                       │   │ file: passport.pdf  │ │
│                       │   └─────────────────────┘ │
│                       │                           │
│                       │                           ├─→ Upload to GCS
│                       │                           │   (bucket: fincore-kyc-documents)
│                       │                           │
│                       │ ←─────────────────────────┼─ { id: 456, fileName, fileUrl, ... }
│                       │                           │
│                       ├─→ Refresh documents list │
│                       │                           │
├─ See uploaded doc ←───┤                           │
│  in table             │                           │
│                       │                           │
├─ Upload more docs     │                           │
│  (repeat above)       │                           │
│                       │                           │
├─ Click "Save" ────────┼─→ PUT /api/organizations  │
│  (final step)         │   /123                    │
│                       │   (update with tabs 1-8)  │
│                       │                           │
│                       │ ←─────────────────────────┼─ { id: 123, ... }
│                       │                           │
│                       ├─→ Close dialog            │
│                       ├─→ Refresh org list        │
│                       │                           │
├─ Click "Submit for    │                           │
│  Review" ─────────────┼─→ PUT /api/organizations  │
│  (from org list)      │   /123/submit             │
│                       │                           │
│                       │ ←─────────────────────────┼─ { status: UNDER_REVIEW }
│                       │                           │
└─ Done                 └─                          └─
```

### Scenario 2: Edit Organization with Existing Documents

```
USER                    FRONTEND                    BACKEND
│                       │                           │
├─ Click Edit ──────────┼─→ Open OrganizationForm  │
│  (org id=123)         │   mode='edit'             │
│                       │   savedOrganizationId=123 │
│                       │                           │
├─ Navigate to Tab 7 ───┼─→ GET /api/kyc-documents  │
│                       │   ?organisationId=123     │
│                       │ ←─────────────────────────┼─ { content: [doc1, doc2] }
│                       │                           │
├─ See existing docs ←──┤                           │
│  - passport.pdf       │                           │
│  - id_card.jpg        │                           │
│                       │                           │
├─ Delete doc1 ─────────┼─→ DELETE /api/kyc-docs/  │
│                       │   456                     │
│                       │                           │
│                       │                           ├─→ Delete from GCS
│                       │ ←─────────────────────────┼─ 204 No Content
│                       │                           │
├─ Upload new doc       │                           │
│  (same as Scenario 1) │                           │
│                       │                           │
└─ Click "Save" ────────┼─→ PUT /api/organizations  │
                        │   /123                    │
                        └─                          └─
```

---

## 🛠️ Implementation Steps

### Phase 1: Backend Verification ✅ (Already Done)

**Status**: ✅ **COMPLETE** - All backend endpoints already exist!

1. ✅ `POST /api/kyc-documents/upload` - Upload document
2. ✅ `GET /api/kyc-documents?organisationId={id}` - List org documents
3. ✅ `DELETE /api/kyc-documents/{id}` - Delete document
4. ✅ GCS integration working
5. ✅ Auto-save organization on Tab 0→Tab 7 navigation

### Phase 2: Frontend Components (NEW)

**Estimated Effort**: 2-3 days

#### Step 2.1: Create FileDropZone Component
**File**: `src/components/common/FileDropZone.tsx`

**Features**:
- Drag-and-drop file area
- Click to browse
- File validation (type, size)
- Visual feedback (hover, selected)

**Acceptance Criteria**:
- [ ] Accepts PDF, JPG, PNG files
- [ ] Rejects files > 10MB
- [ ] Shows file preview (name, size, type)
- [ ] Provides clear error messages

#### Step 2.2: Create KYCDocumentsUploadTab Component
**File**: `src/components/organizations/KYCDocumentsUploadTab.tsx`

**Features**:
- Document type selector
- FileDropZone integration
- Upload button with progress
- Uploaded documents table
- Delete document functionality

**Acceptance Criteria**:
- [ ] Only enabled when organizationId exists
- [ ] Shows loading state during upload
- [ ] Refreshes document list after upload/delete
- [ ] Handles errors gracefully
- [ ] Notifies parent component of document count changes

#### Step 2.3: Integrate into OrganizationForm
**File**: `src/components/organizations/OrganizationForm.tsx`

**Changes**:
```typescript
// Replace Tab 7 content (around line 1150)
<TabPanel value={currentTab} index={7}>
  <KYCDocumentsUploadTab
    organizationId={savedOrganizationId}
    onDocumentsChange={(count) => {
      // Update tab completion status
      setTabsCompleted(prev => {
        const newState = [...prev];
        newState[7] = count > 0;  // Complete if at least 1 doc uploaded
        return newState;
      });
    }}
  />
</TabPanel>
```

**Acceptance Criteria**:
- [ ] Tab 7 shows upload UI when savedOrganizationId exists
- [ ] Tab 7 shows info message when no savedOrganizationId
- [ ] Tab completion updates based on uploaded document count
- [ ] Auto-save still works on Tab 0→Tab 7 navigation

### Phase 3: Service Layer Enhancement (MINIMAL)

**Estimated Effort**: 1 hour

#### Step 3.1: Add getByOrganizationId method
**File**: `src/services/kycDocumentService.ts`

```typescript
/**
 * Get KYC documents by organization ID
 */
async getByOrganizationId(
  organisationId: number,
  params?: PaginationParams
): Promise<PaginatedResponse<KYCDocument>> {
  const response = await apiService.get<PaginatedResponse<KYCDocument>>(
    `${this.BASE_PATH}`,
    {
      params: { organisationId, ...params }
    }
  );
  return response.data;
}
```

**Acceptance Criteria**:
- [ ] Method added to kycDocumentService
- [ ] Returns paginated response
- [ ] Filters by organisationId
- [ ] Handles errors gracefully

### Phase 4: Type Definitions Enhancement

**Estimated Effort**: 30 minutes

#### Step 4.1: Update KYCDocument types
**File**: `src/types/kycDocument.types.ts`

**Add document type enum options**:
```typescript
export type DocumentType =
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'NATIONAL_ID_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'PROOF_OF_ADDRESS'
  | 'BANK_STATEMENT'
  | 'UTILITY_BILL'
  | 'TAX_RETURN'
  | 'CERTIFICATE_OF_INCORPORATION'
  | 'MEMORANDUM_OF_ASSOCIATION'
  | 'ARTICLES_OF_ASSOCIATION'
  | 'DIRECTORS_REGISTER'
  | 'SHAREHOLDERS_REGISTER'
  | 'TAX_REGISTRATION'
  | 'REGULATORY_LICENSE'
  | 'OTHER';
```

**Acceptance Criteria**:
- [ ] All backend document types mapped
- [ ] Used in dropdown component

### Phase 5: Testing

**Estimated Effort**: 1-2 days

#### Step 5.1: Unit Tests
- [ ] FileDropZone component tests
- [ ] KYCDocumentsUploadTab component tests
- [ ] kycDocumentService tests

#### Step 5.2: Integration Tests
- [ ] Organization creation with KYC upload workflow
- [ ] Edit organization and modify KYC documents
- [ ] Error handling (network failures, invalid files)

#### Step 5.3: E2E Tests
**File**: `tests/e2e/organization-kyc-upload.spec.ts`

**Test Scenarios**:
1. Create organization, auto-save triggered, upload 3 documents, submit
2. Edit organization, delete 1 document, upload new document, save
3. Try to upload invalid file (wrong type, too large)
4. Navigate back from Tab 7 without uploading, verify auto-save persists

**Acceptance Criteria**:
- [ ] All E2E tests passing
- [ ] Test coverage > 80%

### Phase 6: Documentation

**Estimated Effort**: 2 hours

#### Step 6.1: Update User Guide
**File**: `docs/USER_GUIDE.md`

**Sections**:
- Organization creation with KYC upload workflow
- Supported document types
- File size/type limits
- Troubleshooting common upload issues

#### Step 6.2: Update API Documentation
**File**: `docs/API_REFERENCE.md`

**Sections**:
- Document upload workflow
- Required vs optional documents
- GCS storage path structure

#### Step 6.3: Update FEATURES_SUMMARY.md
Add section on inline KYC document upload during organization creation

---

## 🎨 UI/UX Design

### Tab 7: KYC Documents Upload Tab

**Before Organization Saved (No org-id)**:
```
┌────────────────────────────────────────────────────────┐
│ KYC & Compliance Documents                    Required │
└────────────────────────────────────────────────────────┘

ℹ️  The organization will be automatically saved as a draft 
   when you navigate to this tab, enabling you to upload 
   KYC documents immediately.

⚠️  IMPORTANT: KYC documents are required for organization 
   approval. You can upload documents after the 
   organization is saved.
```

**After Organization Saved (Has org-id)**:
```
┌────────────────────────────────────────────────────────┐
│ KYC & Compliance Documents                    Required │
└────────────────────────────────────────────────────────┘

✓ Organization saved as draft (ID: 123). You can now upload 
  KYC documents.

┌─ Upload Document ─────────────────────────────────────┐
│                                                        │
│  Document Type: [Passport ▾]                          │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  📄  Drag and drop your file here              │  │
│  │      or click to browse                         │  │
│  │                                                  │  │
│  │  Supported: PDF, JPG, PNG (max 10MB)           │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Selected: passport.pdf (2.3 MB)                     │
│                                                        │
│  [Cancel]  [Upload Document →]                        │
└────────────────────────────────────────────────────────┘

┌─ Uploaded Documents (2) ──────────────────────────────┐
│                                                        │
│  Type          File Name       Size    Status  Actions│
│  ─────────────────────────────────────────────────────│
│  Passport      passport.pdf    2.3MB   PENDING  🗑️    │
│  Drivers Lic.  license.jpg     1.1MB   PENDING  🗑️    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Responsive Behaviors

**Desktop** (> 960px):
- Full-width drag-drop area
- Document table with all columns visible

**Tablet** (600px - 960px):
- Slightly smaller drag-drop area
- Document table scrollable horizontally

**Mobile** (< 600px):
- Stack document type and file selector vertically
- Simplified document list (cards instead of table)
- Upload button full-width

---

## 🧪 Test Plan

### Test Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| TC-1 | Create org, navigate to Tab 7 before completing Tab 0 | Error: "Complete Basic Info first" | HIGH |
| TC-2 | Complete Tab 0, click Next to Tab 7 | Organization auto-saved, org-id available | HIGH |
| TC-3 | Upload valid PDF document (PASSPORT) | Document uploaded, appears in list | HIGH |
| TC-4 | Upload file > 10MB | Error: "File too large" | HIGH |
| TC-5 | Upload .exe file | Error: "Invalid file type" | HIGH |
| TC-6 | Upload 5 documents of different types | All uploaded successfully | MEDIUM |
| TC-7 | Delete uploaded document | Document removed from list | MEDIUM |
| TC-8 | Navigate back to Tab 0, then forward to Tab 7 | Documents still visible (persisted) | HIGH |
| TC-9 | Edit existing organization with documents | Existing documents loaded correctly | HIGH |
| TC-10 | Network failure during upload | Error shown, upload can be retried | MEDIUM |
| TC-11 | Upload same document twice | Allowed (different IDs) | LOW |
| TC-12 | Click "Save" without uploading documents | Warning shown, save allowed | MEDIUM |

---

## 📊 Acceptance Criteria

### Definition of Done

- [x] **Backend Verification**: All required endpoints functional ✅
- [ ] **Component Development**: FileDropZone and KYCDocumentsUploadTab created
- [ ] **Integration**: Components integrated into OrganizationForm Tab 7
- [ ] **Service Methods**: `getByOrganizationId` added to kycDocumentService
- [ ] **Type Safety**: All TypeScript types properly defined
- [ ] **Unit Tests**: > 80% coverage for new components
- [ ] **Integration Tests**: All workflow scenarios pass
- [ ] **E2E Tests**: Complete workflow tested end-to-end
- [ ] **Documentation**: User guide and API docs updated
- [ ] **Code Review**: All code reviewed and approved
- [ ] **QA Testing**: Manual testing completed
- [ ] **Deployment**: Changes deployed to NPE environment
- [ ] **User Acceptance**: Product owner sign-off

---

## ⏱️ Timeline Estimate

| Phase | Tasks | Estimated Effort | Dependencies |
|-------|-------|------------------|--------------|
| **Phase 1** | Backend Verification | ✅ COMPLETE | - |
| **Phase 2** | Frontend Components | 2-3 days | Phase 1 |
| **Phase 3** | Service Layer | 1 hour | Phase 2 |
| **Phase 4** | Type Definitions | 30 minutes | Phase 2 |
| **Phase 5** | Testing | 1-2 days | Phases 2-4 |
| **Phase 6** | Documentation | 2 hours | Phase 5 |
| **QA & Deploy** | Testing & Deployment | 1 day | Phase 6 |

**Total Estimated Time**: **4-6 days** (1 developer, full-time)

**Critical Path**: Phase 2 (Frontend Components) → Phase 5 (Testing)

---

## 🚀 Deployment Plan

### Deployment Steps

1. **Build Frontend**:
   ```bash
   cd c:\Development\git\fincore_WebUI
   npm run build
   ```

2. **Deploy to Cloud Run** (NPE):
   ```bash
   gcloud run deploy fincore-npe-ui \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Smoke Test**:
   - Login as test user
   - Create new organization
   - Verify auto-save on Tab 7 navigation
   - Upload 2-3 KYC documents
   - Verify documents appear in list
   - Save organization
   - Submit for review
   - Verify documents transferred to UNDER_REVIEW status

4. **Monitor**:
   - Check Cloud Run logs for errors
   - Monitor GCS bucket for uploads
   - Check database for document records

### Rollback Plan

If issues occur:
1. Immediately revert to previous frontend revision
2. Investigate root cause
3. Fix in development environment
4. Re-test before re-deploying

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Upload Success Rate | > 95% | (Successful uploads / Total attempts) x 100 |
| Average Upload Time (< 5MB) | < 5 seconds | Server-side metrics |
| User Completion Rate | > 80% | Users who complete org creation with KYC docs |
| Document Rejection Rate | < 10% | Rejected docs / Total uploaded docs |
| Bug Reports (post-launch) | < 5 per week | Support tickets |

---

## 🔒 Security Considerations

1. **File Validation**:
   - Client-side: File type and size checks
   - Server-side: Magic byte verification, virus scanning (optional)

2. **Access Control**:
   - Only organization owner can upload documents
   - Admin users can view/verify but not modify

3. **Data Protection**:
   - Files encrypted in transit (HTTPS)
   - Files encrypted at rest (GCS default encryption)
   - Secure file URLs (signed URLs with expiration)

4. **Input Sanitization**:
   - File names sanitized to prevent path traversal
   - Document metadata validated

---

## 🐛 Known Limitations & Future Enhancements

### Current Limitations
1. No document preview in upload tab (must download to view)
2. No bulk upload (must upload one at a time)
3. No document versioning (replacing requires delete + upload)
4. No progress bar for upload percentage

### Future Enhancements
1. **Document Preview**: PDF/image preview in modal
2. **Bulk Upload**: Multi-file selection with batch upload
3. **Document Versioning**: Keep history of replaced documents
4. **OCR Integration**: Auto-extract data from uploaded documents
5. **AI Verification**: Auto-verify document authenticity
6. **Email Notifications**: Notify user when admin reviews documents

---

## 📝 Notes

### Design Decisions

1. **Why auto-save on Tab 7 navigation?**
   - Ensures org-id exists before allowing document upload
   - Prevents data loss if user closes browser
   - Simplifies UX (no manual "Save Draft" button needed)

2. **Why immediate upload vs batch upload on Save?**
   - **Immediate upload** (chosen):
     - Better UX: instant feedback
     - Prevents data loss
     - Reduces memory usage (no large files in browser state)
   - Batch upload alternative:
     - Would require storing files in state
     - Risk of browser crash losing all uploads
     - More complex error handling

3. **Why require at least Tab 0 completion?**
   - Legal name and organization type are minimum required fields
   - Ensures meaningful organization record exists
   - Aligns with business requirements

### Migration Considerations

**For existing organizations**:
- Organizations created before this feature will have status PENDING without documents
- Users can edit organization and navigate to Tab 7 to upload documents
- No database migration needed (schema unchanged)

---

## ✅ Conclusion

This implementation plan leverages **existing auto-save functionality** to enable KYC document uploads during organization creation. The approach is:

- ✅ **Minimal backend changes** (all endpoints exist!)
- ✅ **Reuses existing components** (FileDropZone pattern from KYCDocumentsPage)
- ✅ **Maintains data integrity** (immediate persistence on upload)
- ✅ **Excellent UX** (auto-save prevents data loss)
- ✅ **Type-safe** (full TypeScript support)
- ✅ **Testable** (clear component boundaries)

**Recommended Next Step**: Proceed with **Phase 2 (Frontend Components)** implementation.

---

*Document Version: 1.0*  
*Last Updated: April 20, 2026*  
*Author: GitHub Copilot*
