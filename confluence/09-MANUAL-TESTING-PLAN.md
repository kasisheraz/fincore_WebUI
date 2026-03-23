# Manual Testing Plan

**Comprehensive manual testing checklist for Fincore Platform UI**

---

## 📋 Overview

This document provides a complete manual testing plan for the Fincore WebUI. Use this checklist to verify all features are working correctly before releases.

**Testing Environment:**
- **Frontend URL**: https://fincore-webui-lfd6ooarra-nw.a.run.app
- **Backend API**: https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api
- **Test Data**: Use test accounts and sample data

**Before You Begin:**
- [ ] Clear browser cache
- [ ] Open browser DevTools (F12)
- [ ] Check Console for errors
- [ ] Use Chrome, Firefox, and Edge for cross-browser testing

---

## 🔐 1. Authentication & Login

### 1.1 Login Flow

**Test Case 1: Successful Login**
- [ ] Navigate to application URL
- [ ] Enter valid phone number: `+1234567890`
- [ ] Click "Request OTP"
- [ ] Verify OTP appears on screen (dev mode) or receive SMS
- [ ] Enter the 6-digit OTP
- [ ] Click "Verify OTP"
- [ ] **Expected**: Redirect to Dashboard
- [ ] **Expected**: Token stored in localStorage
- [ ] **Expected**: User info displayed in header

**Test Case 2: Invalid Phone Number**
- [ ] Enter phone without country code: `1234567890`
- [ ] Click "Request OTP"
- [ ] **Expected**: Validation error "Phone number must include country code"
- [ ] Enter invalid format: `abc123`
- [ ] **Expected**: Validation error

**Test Case 3: Wrong OTP**
- [ ] Request OTP for valid phone number
- [ ] Enter wrong OTP: `000000`
- [ ] Click "Verify OTP"
- [ ] **Expected**: Error message "Invalid OTP"
- [ ] **Expected**: Stay on login page

**Test Case 4: Expired OTP**
- [ ] Request OTP
- [ ] Wait 6+ minutes
- [ ] Enter the OTP
- [ ] **Expected**: Error message "OTP expired, please request a new one"

**Test Case 5: Request New OTP**
- [ ] Request OTP
- [ ] Click "Request New OTP" button
- [ ] **Expected**: New OTP generated
- [ ] **Expected**: Old OTP invalidated
- [ ] Enter new OTP
- [ ] **Expected**: Login successful

### 1.2 Session Management

**Test Case 6: Logout**
- [ ] Login successfully
- [ ] Click user menu (top right)
- [ ] Click "Logout"
- [ ] **Expected**: Redirect to login page
- [ ] **Expected**: Token removed from localStorage
- [ ] Try to access /dashboard directly
- [ ] **Expected**: Redirect to login

**Test Case 7: Token Expiration**
- [ ] Login successfully
- [ ] Wait for token expiration (1 hour)
- [ ] Make any API call (e.g., navigate to Users page)
- [ ] **Expected**: Automatic redirect to login
- [ ] **Expected**: Error message "Session expired, please login again"

**Test Case 8: Refresh Page While Logged In**
- [ ] Login successfully
- [ ] Navigate to any page
- [ ] Press F5 to refresh
- [ ] **Expected**: Stay on same page
- [ ] **Expected**: User remains logged in

---

## 👥 2. User Management

### 2.1 View Users List

**Test Case 9: Display All Users**
- [ ] Navigate to "Users" page
- [ ] **Expected**: Table with columns: ID, Full Name, Email, Phone, Role, Status, Actions
- [ ] **Expected**: Data loads within 2 seconds
- [ ] **Expected**: Users displayed with proper formatting

**Test Case 10: Pagination**
- [ ] Verify pagination controls at bottom
- [ ] Click "Next" button
- [ ] **Expected**: Load page 2
- [ ] **Expected**: URL updates with `?page=1`
- [ ] Click "Previous" button
- [ ] **Expected**: Return to page 1
- [ ] Click page number "3"
- [ ] **Expected**: Jump to page 3
- [ ] Verify "Showing X to Y of Z results" text

**Test Case 11: Search Users**
- [ ] Enter name in search box: "John"
- [ ] **Expected**: Filter results to show only matching users
- [ ] Clear search box
- [ ] **Expected**: Show all users again
- [ ] Enter email: "john@example.com"
- [ ] **Expected**: Filter by email

**Test Case 12: Sort Users**
- [ ] Click "Full Name" column header
- [ ] **Expected**: Sort alphabetically A-Z
- [ ] Click again
- [ ] **Expected**: Sort Z-A (descending)
- [ ] Click "Created At" column
- [ ] **Expected**: Sort by date (newest first)

### 2.2 Create New User

**Test Case 13: Create User - Success**
- [ ] Click "New User" button
- [ ] Fill in form:
  - Full Name: "Jane Smith"
  - Email: "jane.smith@example.com"
  - Phone: "+1987654321"
  - Role: "USER"
- [ ] Click "Create User"
- [ ] **Expected**: Success message "User created successfully"
- [ ] **Expected**: Modal closes
- [ ] **Expected**: New user appears in list
- [ ] **Expected**: User has "ACTIVE" status

**Test Case 14: Create User - Validation**
- [ ] Click "New User"
- [ ] Leave all fields empty
- [ ] Click "Create User"
- [ ] **Expected**: Validation errors:
  - "Full name is required"
  - "Email is required"
  - "Phone number is required"
- [ ] Enter invalid email: "notanemail"
- [ ] **Expected**: "Invalid email format"
- [ ] Enter phone without country code: "1234567890"
- [ ] **Expected**: "Phone must include country code"

**Test Case 15: Create User - Duplicate Email**
- [ ] Click "New User"
- [ ] Enter email that already exists: "jane.smith@example.com"
- [ ] Fill other fields
- [ ] Click "Create User"
- [ ] **Expected**: Error "Email already exists"

### 2.3 Edit User

**Test Case 16: Edit User - Success**
- [ ] Find user in list
- [ ] Click "Edit" icon (pencil)
- [ ] Update full name: "Jane Smith Updated"
- [ ] Update role to "ADMIN"
- [ ] Click "Save Changes"
- [ ] **Expected**: Success message "User updated successfully"
- [ ] **Expected**: Changes reflected in list
- [ ] Refresh page
- [ ] **Expected**: Changes persisted

**Test Case 17: Edit User - Cancel**
- [ ] Click "Edit" on a user
- [ ] Change some fields
- [ ] Click "Cancel"
- [ ] **Expected**: Modal closes
- [ ] **Expected**: No changes saved
- [ ] Verify original data still showing

### 2.4 Delete User

**Test Case 18: Delete User - Success**
- [ ] Click "Delete" icon (trash) on a user
- [ ] **Expected**: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] **Expected**: Success message "User deleted successfully"
- [ ] **Expected**: User removed from list
- [ ] Refresh page
- [ ] **Expected**: User still deleted

**Test Case 19: Delete User - Cancel**
- [ ] Click "Delete" on a user
- [ ] Click "Cancel" in confirmation dialog
- [ ] **Expected**: User not deleted
- [ ] **Expected**: User still in list

---

## 🏢 3. Organization Management

### 3.1 View Organizations

**Test Case 20: Display Organizations List**
- [ ] Navigate to "Organizations" page
- [ ] **Expected**: Table showing: Legal Name, Registration #, Type, Status, Created Date, Actions
- [ ] **Expected**: Badge colors:
  - ACTIVE = Green
  - PENDING = Yellow
  - SUSPENDED = Red
  - REJECTED = Gray

**Test Case 21: Organization Search**
- [ ] Enter organization name: "Acme"
- [ ] **Expected**: Filter to matching organizations
- [ ] Search by registration number
- [ ] **Expected**: Find by registration number
- [ ] Use advanced filters (status, type)
- [ ] **Expected**: Filter by status and type

**Test Case 22: Organization Details View**
- [ ] Click organization name/row
- [ ] **Expected**: Navigate to organization details page
- [ ] **Expected**: Display all fields:
  - Legal information
  - Business information
  - Registered address
  - Business address
  - Contact details
  - KYC status
  - Document status

### 3.2 Create New Organization

**Test Case 23: Create Organization - Basic Info**
- [ ] Click "New Organization"
- [ ] Enter legal name: "Tech Innovations Ltd"
- [ ] Enter registration number: "12345678"
- [ ] Select organization type: "LTD"
- [ ] Enter incorporation date: "2025-01-15"
- [ ] Select country: "United Kingdom"
- [ ] Click "Next" or continue to address section

**Test Case 24: Create Organization - Registered Address**
- [ ] Enter address line 1: "10 Tech Plaza"
- [ ] Enter address line 2: "Suite 100"
- [ ] Enter city: "London"
- [ ] Enter state/county: "Greater London"
- [ ] Enter postal code: "EC1A 1BB"
- [ ] Select country: "United Kingdom"
- [ ] Toggle "Business address same as registered"
- [ ] **Expected**: Business address auto-filled

**Test Case 25: Create Organization - Business Address (Different)**
- [ ] Uncheck "Same as registered address"
- [ ] **Expected**: Business address fields enabled
- [ ] Enter different business address
- [ ] Click "Create Organization"
- [ ] **Expected**: Success message
- [ ] **Expected**: Organization created with PENDING status

**Test Case 26: Create Organization - Validation**
- [ ] Click "New Organization"
- [ ] Leave required fields empty
- [ ] Click "Create"
- [ ] **Expected**: Show validation errors for:
  - Legal name required
  - Registration number required
  - Organization type required
  - Incorporation date required
  - Country required
  - Registered address required

**Test Case 27: Create Organization - Duplicate Registration**
- [ ] Enter registration number that already exists
- [ ] Fill other fields
- [ ] Click "Create"
- [ ] **Expected**: Error "Organization with this registration number already exists"

### 3.3 Edit Organization

**Test Case 28: Edit Organization - Basic Info**
- [ ] Open organization details
- [ ] Click "Edit" button
- [ ] Update business name
- [ ] Update website
- [ ] Update number of branches
- [ ] Click "Save Changes"
- [ ] **Expected**: Success message
- [ ] **Expected**: Changes reflected immediately

**Test Case 29: Edit Organization - Update Address**
- [ ] Click "Edit Address" on registered address
- [ ] Change address line 1
- [ ] Change postal code
- [ ] Click "Save"
- [ ] **Expected**: Address updated
- [ ] **Expected**: History log created (if audit enabled)

**Test Case 30: Change Organization Status**
- [ ] Open organization details
- [ ] Click "Change Status" dropdown
- [ ] Select "SUSPENDED"
- [ ] Enter reason: "Pending verification"
- [ ] Click "Confirm"
- [ ] **Expected**: Status changed to SUSPENDED
- [ ] **Expected**: Status badge color changes
- [ ] **Expected**: Reason stored

### 3.4 Organization Export

**Test Case 31: Export to Excel**
- [ ] On organizations list page
- [ ] Click "Export" button
- [ ] **Expected**: Excel file downloads
- [ ] Open Excel file
- [ ] **Expected**: All visible organizations included
- [ ] **Expected**: All columns exported correctly
- [ ] **Expected**: Date formatting correct

**Test Case 32: Export with Filters**
- [ ] Apply filters (e.g., Status = ACTIVE)
- [ ] Click "Export"
- [ ] **Expected**: Only filtered organizations exported

---

## 📄 4. KYC Document Management

### 4.1 View Documents

**Test Case 33: Organization Documents List**
- [ ] Open organization details
- [ ] Navigate to "Documents" tab
- [ ] **Expected**: List of uploaded documents
- [ ] **Expected**: Each document shows:
  - Document type
  - Document number
  - Upload date
  - Status (Pending/Verified/Rejected)
  - Actions (View, Download, Delete)

**Test Case 34: Filter Documents by Type**
- [ ] Use document type filter
- [ ] Select "Certificate of Incorporation"
- [ ] **Expected**: Show only certificates
- [ ] Select "All Documents"
- [ ] **Expected**: Show all documents

**Test Case 35: Filter by Status**
- [ ] Filter by "Pending" status
- [ ] **Expected**: Show only pending documents
- [ ] Filter by "Verified"
- [ ] **Expected**: Show only verified documents

### 4.2 Upload Documents

**Test Case 36: Upload Document - Success**
- [ ] Click "Upload Document" button
- [ ] Select document type: "Certificate of Incorporation"
- [ ] Enter document number: "CERT-2025-001"
- [ ] Select issue date
- [ ] Enter issuing authority: "Companies House"
- [ ] Click "Choose File"
- [ ] Select PDF file (<5MB)
- [ ] Click "Upload"
- [ ] **Expected**: Upload progress bar
- [ ] **Expected**: Success message
- [ ] **Expected**: Document appears in list with "PENDING" status

**Test Case 37: Upload Document - File Size Validation**
- [ ] Try to upload file >5MB
- [ ] **Expected**: Error "File size must be less than 5MB"
- [ ] **Expected**: Upload prevented

**Test Case 38: Upload Document - File Type Validation**
- [ ] Try to upload .exe or .zip file
- [ ] **Expected**: Error "Only PDF, JPG, PNG files allowed"

**Test Case 39: Upload Multiple Documents**
- [ ] Upload "Articles of Association"
- [ ] Upload "Proof of Address"
- [ ] Upload "Bank Statement"
- [ ] **Expected**: All documents uploaded successfully
- [ ] **Expected**: Each has unique entry in list

### 4.3 Verify Documents (Admin Only)

**Test Case 40: Verify Document - Approve**
- [ ] Login as admin user
- [ ] Open pending document
- [ ] Click "Verify" button
- [ ] Add verification notes: "All information verified"
- [ ] Select "Approve"
- [ ] Click "Submit Verification"
- [ ] **Expected**: Status changes to "VERIFIED"
- [ ] **Expected**: Verification date recorded
- [ ] **Expected**: Verifier name stored

**Test Case 41: Verify Document - Reject**
- [ ] Open pending document
- [ ] Click "Verify"
- [ ] Add notes: "Document expired"
- [ ] Select "Reject"
- [ ] Click "Submit"
- [ ] **Expected**: Status = "REJECTED"
- [ ] **Expected**: Rejection reason visible to organization

### 4.4 Document Actions

**Test Case 42: View Document**
- [ ] Click "View" icon on document
- [ ] **Expected**: Document opens in new tab or preview modal
- [ ] **Expected**: PDF renders correctly
- [ ] **Expected**: Can zoom and navigate

**Test Case 43: Download Document**
- [ ] Click "Download" button
- [ ] **Expected**: File downloads to Downloads folder
- [ ] **Expected**: Filename includes document type and number
- [ ] Open downloaded file
- [ ] **Expected**: File is valid and readable

**Test Case 44: Delete Document**
- [ ] Click "Delete" on document
- [ ] **Expected**: Confirmation dialog
- [ ] Click "Confirm"
- [ ] **Expected**: Document deleted
- [ ] **Expected**: Success message
- [ ] **Expected**: Document removed from list

---

## ✅ 5. KYC Verification Module

### 5.1 View Verification Status

**Test Case 45: User KYC Status**
- [ ] View user profile
- [ ] Check "KYC Status" section
- [ ] **Expected**: Display verification level (BASIC/ENHANCED/FULL)
- [ ] **Expected**: Display status (PENDING/APPROVED/REJECTED)
- [ ] **Expected**: Display risk level (LOW/MEDIUM/HIGH)

**Test Case 46: Verification History**
- [ ] Open user KYC history
- [ ] **Expected**: List of all verification attempts
- [ ] **Expected**: Show submission date, reviewer, outcome

### 5.2 Submit KYC Verification

**Test Case 47: Submit Basic Verification**
- [ ] Open user profile
- [ ] Click "Submit for KYC Verification"
- [ ] Select level: "BASIC"
- [ ] Upload required documents
- [ ] Click "Submit"
- [ ] **Expected**: Verification status = "PENDING"
- [ ] **Expected**: Confirmation email sent (if enabled)

**Test Case 48: Submit Enhanced Verification**
- [ ] Select level: "ENHANCED"
- [ ] Upload additional documents
- [ ] Add reference information
- [ ] Submit
- [ ] **Expected**: Status = PENDING
- [ ] **Expected**: More documents required notification

**Test Case 49: Submit Full Verification**
- [ ] Select level: "FULL"
- [ ] Upload all required documents
- [ ] Complete questionnaire
- [ ] Submit
- [ ] **Expected**: Comprehensive verification initiated

### 5.3 Review Verification (Admin)

**Test Case 50: Approve Verification**
- [ ] Login as admin
- [ ] Navigate to pending verifications
- [ ] Open verification request
- [ ] Review all documents
- [ ] Set risk level: "LOW"
- [ ] Add approval notes
- [ ] Click "Approve"
- [ ] **Expected**: Status = APPROVED
- [ ] **Expected**: User notified
- [ ] **Expected**: Access level updated

**Test Case 51: Reject Verification**
- [ ] Open verification request
- [ ] Add rejection reason: "Insufficient documentation"
- [ ] Click "Reject"
- [ ] **Expected**: Status = REJECTED
- [ ] **Expected**: User notified with reason
- [ ] **Expected**: Can resubmit

---

## ❓ 6. Questionnaire Module

### 6.1 View Questionnaires

**Test Case 52: Display Question List**
- [ ] Navigate to "Questionnaire" page
- [ ] **Expected**: List of questions by category:
  - Personal Info
  - Financial
  - Employment
  - Identification
  - Risk Assessment
  - Compliance

**Test Case 53: Filter by Category**
- [ ] Select category: "Financial"
- [ ] **Expected**: Show only financial questions
- [ ] Select "All Categories"
- [ ] **Expected**: Show all questions

**Test Case 54: View Question Details**
- [ ] Click on a question
- [ ] **Expected**: Display:
  - Question text
  - Category
  - Display order
  - Status (Active/Inactive)
  - Created by
  - Created date

### 6.2 Manage Questions (Admin)

**Test Case 55: Create New Question**
- [ ] Click "New Question"
- [ ] Enter question text: "What is your annual income?"
- [ ] Select category: "FINANCIAL"
- [ ] Set display order: 5
- [ ] Click "Create"
- [ ] **Expected**: Question created with ACTIVE status
- [ ] **Expected**: Appears in question list

**Test Case 56: Edit Question**
- [ ] Click "Edit" on question
- [ ] Change question text
- [ ] Change display order
- [ ] Click "Save"
- [ ] **Expected**: Changes saved
- [ ] **Expected**: Updated in list

**Test Case 57: Activate/Deactivate Question**
- [ ] Click toggle switch on active question
- [ ] **Expected**: Status changes to INACTIVE
- [ ] **Expected**: Not shown to users
- [ ] Toggle again
- [ ] **Expected**: Back to ACTIVE

**Test Case 58: Delete Question**
- [ ] Click "Delete" on question
- [ ] Confirm deletion
- [ ] **Expected**: Question deleted
- [ ] **Expected**: Any existing answers preserved (archived)

### 6.3 Answer Questions (User)

**Test Case 59: Complete Questionnaire**
- [ ] Login as regular user
- [ ] Navigate to "My Questionnaire"
- [ ] **Expected**: See all active questions
- [ ] **Expected**: Show completion percentage: 0%
- [ ] Answer first question
- [ ] Click "Save Answer"
- [ ] **Expected**: Progress updates
- [ ] Answer all questions
- [ ] **Expected**: Progress = 100%

**Test Case 60: Edit Previous Answer**
- [ ] Click "Edit" on answered question
- [ ] Change answer text
- [ ] Click "Save"
- [ ] **Expected**: Answer updated
- [ ] **Expected**: Timestamp updated

**Test Case 61: Skip Optional Questions**
- [ ] Skip optional question
- [ ] Continue to next
- [ ] **Expected**: Can skip
- [ ] **Expected**: Progress calculated correctly

---

## 🎨 7. UI/UX Testing

### 7.1 Responsive Design

**Test Case 62: Desktop View (1920x1080)**
- [ ] Test on Chrome at 1920x1080
- [ ] **Expected**: Layout uses full width
- [ ] **Expected**: Tables readable
- [ ] **Expected**: Forms well-spaced

**Test Case 63: Laptop View (1366x768)**
- [ ] Resize browser to 1366x768
- [ ] **Expected**: Layout adjusts
- [ ] **Expected**: No horizontal scroll
- [ ] **Expected**: All elements accessible

**Test Case 64: Tablet View (768x1024)**
- [ ] Use Chrome DevTools device emulation
- [ ] Select iPad
- [ ] **Expected**: Mobile menu activated
- [ ] **Expected**: Tables scroll horizontally
- [ ] **Expected**: Forms stack vertically

**Test Case 65: Mobile View (375x667)**
- [ ] Emulate iPhone SE
- [ ] **Expected**: Hamburger menu
- [ ] **Expected**: Single column layout
- [ ] **Expected**: Touch-friendly buttons (min 44px)

### 7.2 Theme and Styling

**Test Case 66: Dark/Light Theme Toggle**
- [ ] Click theme toggle button
- [ ] **Expected**: Switch to dark mode
- [ ] **Expected**: All text readable
- [ ] **Expected**: Proper contrast maintained
- [ ] Refresh page
- [ ] **Expected**: Theme preference persisted

**Test Case 67: Color Contrast**
- [ ] Check all text on backgrounds
- [ ] **Expected**: Contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Check button states (hover, active, disabled)
- [ ] **Expected**: Clear visual feedback

### 7.3 Forms and Inputs

**Test Case 68: Input Field Validation**
- [ ] Focus on required field
- [ ] Leave empty and blur
- [ ] **Expected**: Validation error shown
- [ ] Enter invalid data
- [ ] **Expected**: Format validation error
- [ ] Enter valid data
- [ ] **Expected**: Error clears, success indicator shown

**Test Case 69: Date Picker**
- [ ] Click date input
- [ ] **Expected**: Calendar popup opens
- [ ] Select a date
- [ ] **Expected**: Date populates field in correct format
- [ ] Try to select future date (if not allowed)
- [ ] **Expected**: Disabled or validation error

**Test Case 70: Dropdown/Select Menus**
- [ ] Click dropdown
- [ ] **Expected**: Options list appears
- [ ] Type to search (if searchable)
- [ ] **Expected**: Filter options
- [ ] Select option
- [ ] **Expected**: Dropdown closes, value selected

**Test Case 71: File Upload**
- [ ] Click upload button
- [ ] **Expected**: File browser opens
- [ ] Select file
- [ ] **Expected**: File name and size shown
- [ ] **Expected**: Upload progress indicator
- [ ] Click "Remove" before upload completes
- [ ] **Expected**: Upload cancelled

### 7.4 Loading States

**Test Case 72: Page Load Spinner**
- [ ] Navigate to data-heavy page
- [ ] **Expected**: Loading spinner shown
- [ ] **Expected**: Background content hidden or dimmed
- [ ] Data loads
- [ ] **Expected**: Spinner disappears

**Test Case 73: Button Loading State**
- [ ] Click "Save" on form
- [ ] **Expected**: Button shows loading spinner
- [ ] **Expected**: Button disabled during processing
- [ ] **Expected**: Text changes to "Saving..."
- [ ] Operation completes
- [ ] **Expected**: Button returns to normal

**Test Case 74: Skeleton Loaders**
- [ ] Load list page with slow network
- [ ] **Expected**: Skeleton placeholders shown
- [ ] **Expected**: Shape matches final content
- [ ] Data loads
- [ ] **Expected**: Smooth transition to real content

### 7.5 Error Handling

**Test Case 75: API Error Display**
- [ ] Disconnect network
- [ ] Try to load data
- [ ] **Expected**: Error message shown: "Unable to connect to server"
- [ ] **Expected**: Retry button available
- [ ] Reconnect network
- [ ] Click "Retry"
- [ ] **Expected**: Data loads successfully

**Test Case 76: Form Submission Error**
- [ ] Submit form with server error response
- [ ] **Expected**: Error toast/alert shown
- [ ] **Expected**: Form stays populated
- [ ] **Expected**: User can correct and resubmit

**Test Case 77: 404 Page**
- [ ] Navigate to non-existent route: `/nonexistent`
- [ ] **Expected**: 404 page displayed
- [ ] **Expected**: "Back to Home" link
- [ ] Click link
- [ ] **Expected**: Navigate to dashboard

---

## 🚀 8. Performance Testing

### 8.1 Page Load Times

**Test Case 78: Initial Load**
- [ ] Clear cache
- [ ] Open application
- [ ] Measure time to interactive
- [ ] **Expected**: First paint < 1.5s
- [ ] **Expected**: Full page load < 3s

**Test Case 79: Navigation Speed**
- [ ] Navigate between pages
- [ ] **Expected**: Page transition < 500ms
- [ ] **Expected**: No flash of unstyled content

**Test Case 80: Large Data Sets**
- [ ] Load organization list with 1000+ records
- [ ] **Expected**: Pagination working
- [ ] **Expected**: Page renders in < 2s
- [ ] **Expected**: Scrolling smooth (60 FPS)

### 8.2 Network Performance

**Test Case 81: Slow 3G Network**
- [ ] Use Chrome DevTools
- [ ] Throttle to "Slow 3G"
- [ ] Load application
- [ ] **Expected**: Progressive loading
- [ ] **Expected**: Critical content loads first
- [ ] **Expected**: Images lazy-loaded

**Test Case 82: Offline Functionality**
- [ ] Go offline
- [ ] **Expected**: Offline message shown
- [ ] **Expected**: Cached pages still accessible (if PWA)
- [ ] Go back online
- [ ] **Expected**: Auto-reconnect and sync

---

## 🔒 9. Security Testing

### 9.1 Authentication Security

**Test Case 83: Direct URL Access (Unauthorized)**
- [ ] Logout
- [ ] Try to access `/dashboard` directly
- [ ] **Expected**: Redirect to login
- [ ] Try to access `/users` directly
- [ ] **Expected**: Redirect to login

**Test Case 84: Token Tampering**
- [ ] Login successfully
- [ ] Open DevTools → Application → LocalStorage
- [ ] Modify JWT token
- [ ] Make API request
- [ ] **Expected**: 401 Unauthorized
- [ ] **Expected**: Redirect to login

**Test Case 85: XSS Prevention**
- [ ] Try to enter `<script>alert('XSS')</script>` in form field
- [ ] Submit form
- [ ] **Expected**: Script sanitized, not executed
- [ ] **Expected**: Stored as plain text

**Test Case 86: SQL Injection Prevention**
- [ ] Enter `'; DROP TABLE users; --` in search field
- [ ] Submit search
- [ ] **Expected**: Treated as literal string
- [ ] **Expected**: No database error

### 9.2 Authorization

**Test Case 87: Role-Based Access (Admin)**
- [ ] Login as admin
- [ ] **Expected**: See "User Management" menu
- [ ] **Expected**: See "Verify Documents" buttons
- [ ] **Expected**: Can access admin-only features

**Test Case 88: Role-Based Access (Regular User)**
- [ ] Login as regular user
- [ ] **Expected**: No "User Management" menu
- [ ] **Expected**: Cannot verify documents
- [ ] Try to access `/admin` directly
- [ ] **Expected**: 403 Forbidden or redirect

---

## 🌍 10. Cross-Browser Testing

### 10.1 Chrome

**Test Case 89: Chrome Desktop**
- [ ] Test all critical features on Chrome
- [ ] **Expected**: All features working
- [ ] **Expected**: No console errors
- [ ] **Expected**: UI renders correctly

### 10.2 Firefox

**Test Case 90: Firefox Desktop**
- [ ] Test all critical features on Firefox
- [ ] **Expected**: All features working
- [ ] **Expected**: Date pickers work
- [ ] **Expected**: File uploads work

### 10.3 Edge

**Test Case 91: Microsoft Edge**
- [ ] Test all critical features on Edge
- [ ] **Expected**: All features working
- [ ] **Expected**: No rendering issues

### 10.4 Safari (if available)

**Test Case 92: Safari Desktop**
- [ ] Test on Safari
- [ ] **Expected**: All features working
- [ ] **Expected**: Flex/Grid layouts correct

---

## 📊 11. Data Validation

### 11.1 Input Validation

**Test Case 93: Email Validation**
- [ ] Enter invalid emails:
  - `notanemail`
  - `@example.com`
  - `user@`
  - `user @example.com` (space)
- [ ] **Expected**: All rejected with error

**Test Case 94: Phone Number Validation**
- [ ] Enter invalid phone numbers:
  - `123` (too short)
  - `abcdefghij` (letters)
  - `1234567890` (no country code)
- [ ] **Expected**: All rejected

**Test Case 95: Date Validation**
- [ ] Enter incorporation date in future
- [ ] **Expected**: Error "Date cannot be in future"
- [ ] Enter date before 1900
- [ ] **Expected**: Error "Invalid date"

**Test Case 96: Postal Code Validation**
- [ ] For UK address, enter: `SW1A 1AA`
- [ ] **Expected**: Accepted
- [ ] Enter: `12345`
- [ ] **Expected**: Warning or validation based on country

### 11.2 Business Logic Validation

**Test Case 97: Duplicate Prevention**
- [ ] Try to create organization with existing registration number
- [ ] **Expected**: Error "Registration number already exists"

**Test Case 98: Status Transitions**
- [ ] Try to change REJECTED org to ACTIVE
- [ ] **Expected**: Warning or confirmation required
- [ ] PENDING → ACTIVE (with verification)
- [ ] **Expected**: Allowed

**Test Case 99: Document Expiry**
- [ ] Upload document with expiry date in past
- [ ] **Expected**: Warning shown
- [ ] **Expected**: Status set to "EXPIRED"

---

## ✅ 12. Accessibility Testing

### 12.1 Keyboard Navigation

**Test Case 100: Tab Navigation**
- [ ] Press Tab key repeatedly
- [ ] **Expected**: Focus moves through all interactive elements
- [ ] **Expected**: Focus indicator visible
- [ ] **Expected**: Can reach all buttons and links

**Test Case 101: Form Navigation**
- [ ] Fill form using only keyboard
- [ ] **Expected**: Can tab through all fields
- [ ] **Expected**: Can select from dropdowns with arrow keys
- [ ] **Expected**: Can submit with Enter key

**Test Case 102: Modal Keyboard Access**
- [ ] Open modal using keyboard (Enter on button)
- [ ] **Expected**: Focus trapped in modal
- [ ] Press Esc key
- [ ] **Expected**: Modal closes, focus returns to trigger

### 12.2 Screen Reader Compatibility

**Test Case 103: ARIA Labels**
- [ ] Use screen reader (NVDA or JAWS)
- [ ] Navigate form
- [ ] **Expected**: All fields have labels
- [ ] **Expected**: Required fields announced
- [ ] **Expected**: Error messages read aloud

**Test Case 104: Alt Text**
- [ ] Check all images have alt attributes
- [ ] **Expected**: Descriptive alt text
- [ ] **Expected**: Decorative images have alt=""

---

## 🎯 Test Execution Tracking

### Test Summary Template

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| Authentication | 8 | | | | |
| User Management | 11 | | | | |
| Organizations | 13 | | | | |
| KYC Documents | 12 | | | | |
| KYC Verification | 7 | | | | |
| Questionnaire | 10 | | | | |
| UI/UX | 13 | | | | |
| Performance | 5 | | | | |
| Security | 6 | | | | |
| Cross-Browser | 4 | | | | |
| Data Validation | 7 | | | | |
| Accessibility | 5 | | | | |
| **TOTAL** | **104** | | | | |

---

## 🐛 Bug Report Template

When you find a bug, document it:

```
**Bug ID**: BUG-001
**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2 / P3

**Title**: Login fails with valid credentials

**Test Case**: TC-01 - Successful Login

**Steps to Reproduce**:
1. Navigate to login page
2. Enter phone: +1234567890
3. Click "Request OTP"
4. Enter OTP: 123456
5. Click "Verify OTP"

**Expected Result**: Redirect to dashboard

**Actual Result**: Error message "Invalid credentials"

**Browser**: Chrome 120.0.6099.109
**OS**: Windows 11
**URL**: https://fincore-webui-lfd6ooarra-nw.a.run.app

**Screenshots**: [Attach screenshot]
**Console Errors**: 
```
POST /api/auth/verify-otp 401 (Unauthorized)
```

**Additional Notes**: Issue occurs only in production, works in dev
```

---

## 📋 Test Execution Checklist

Before starting testing:
- [ ] Test environment is accessible
- [ ] Test data is prepared
- [ ] Browser DevTools open
- [ ] Screen recording tool ready (if needed)
- [ ] Bug tracking system accessible

During testing:
- [ ] Document all bugs immediately
- [ ] Take screenshots of issues
- [ ] Record console errors
- [ ] Note reproducibility (always/sometimes/once)

After testing:
- [ ] Update test summary table
- [ ] Report critical bugs immediately
- [ ] Create detailed bug reports
- [ ] Suggest improvements

---

## 🚀 Suggested Test Execution Order

### Day 1: Core Features (4-6 hours)
1. Authentication (TC 1-8)
2. User Management (TC 9-19)
3. Organizations - Basic (TC 20-30)

### Day 2: Advanced Features (4-6 hours)
1. KYC Documents (TC 33-44)
2. KYC Verification (TC 45-51)
3. Questionnaire (TC 52-61)

### Day 3: Quality & Polish (3-4 hours)
1. UI/UX Testing (TC 62-77)
2. Performance (TC 78-82)
3. Security (TC 83-88)

### Day 4: Compatibility (2-3 hours)
1. Cross-Browser (TC 89-92)
2. Data Validation (TC 93-99)
3. Accessibility (TC 100-104)

---

## 📞 Support

**Questions or Issues During Testing?**
- **Slack**: #fincore-qa
- **Email**: qa-team@fincore.com
- **Bug Reports**: GitHub Issues

---

**Total Test Cases**: 104  
**Estimated Testing Time**: 13-19 hours  
**Last Updated**: March 23, 2026  
**Version**: 1.0
