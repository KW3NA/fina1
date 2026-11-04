# Document Verification Feature

## Overview

A document verification system has been added as the first step before accessing the E-Literacy Practitioner Dashboard. Users must upload 2 specific documents to verify their practitioner credentials, but can also skip this step and complete it later. The entire interface uses an orange color theme consistent with the platform design.

### Required Documents (Business Rules):

1. **Valid ID** - Driver's License, Passport, National ID, etc.
2. **Proof of Reference for Area of Practice** - Certificate, License, Accreditation, etc.

## Features

### 1. Document Upload Page (`/verify-documents`)

- **Modern UI**: Beautiful orange gradient background with a clean, modern card-based design
- **Drag & Drop**: Users can drag and drop files or click to browse
- **File Type Validation**: Accepts PDF, DOC, DOCX, JPG, JPEG, PNG files
- **File Size Limit**: Maximum 10MB per file
- **Real-time Feedback**: Shows upload progress and validation errors
- **Minimum Requirement**: Requires exactly 2 specific documents before submission
- **Document Checklist**: Visual checklist showing required documents with checkmarks
- **File Preview**: Displays uploaded files with name, size, and file type icons
- **Remove Files**: Users can remove uploaded files before submission
- **Skip Option**: Users can skip verification for one-time access only (prompted again on any navigation or refresh)
- **Orange Theme**: All interactive elements use the orange color scheme consistent with the platform

### 2. Access Control

The platform now has a three-layer verification system:

1. **Root Page** (`app/page.tsx`): Checks verification status and redirects appropriately
2. **Platform Layout** (`app/(platform)/layout.tsx`): Protects all platform routes
3. **Settings Management**: Allows users to view and reset verification status

### 3. Settings Integration

A new "Document Verification" section has been added to the Settings page:

- **Verification Status**: Shows if documents are verified, skipped, or not completed
- **Verification Date**: Displays when verification was completed
- **Re-verification**: Allows users to reset and re-upload documents
- **Visual Indicators**:
  - Green success alerts for verified documents
  - Amber warning alerts for skipped verification
  - Red destructive alerts for unverified
- **Orange Button Theme**: All action buttons use the orange color scheme

## User Flow

```
1. User visits site → Root page (/)
2. Check verification status
   ├─ Not Verified → /verify-documents
   │  ├─ Upload ≥2 documents → /dashboard (permanent access)
   │  └─ Skip for now → /dashboard (one-time access)
   │     └─ Any navigation/refresh → /verify-documents (prompted again)
   └─ Verified → /dashboard (permanent access)
```

## Technical Implementation

### Files Created

1. **`app/verify-documents/page.tsx`**

   - Main verification page component
   - Handles file upload, validation, and submission
   - Beautiful UI with drag-and-drop functionality

2. **`lib/verification.ts`**
   - Utility functions for managing verification state
   - Functions:
     - `isDocumentVerified()`: Check if user is verified
     - `isVerificationSkipped()`: Check if user skipped verification
     - `setDocumentVerified(verified: boolean)`: Update verification status
     - `getVerificationDate()`: Get the date of verification
     - `resetVerification()`: Clear verification and skipped status

### Files Modified

1. **`app/page.tsx`**

   - Changed from server-side redirect to client-side routing
   - Checks verification status before redirecting

2. **`app/(platform)/layout.tsx`**

   - Added verification check with redirect
   - Shows loading state while checking verification
   - Protects all platform routes

3. **`app/(platform)/settings/page.tsx`**
   - Added Document Verification section
   - Shows verification status and date
   - Allows re-verification

## Supported File Types

- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG
- **Size Limit**: 10MB per file

## Security Features

- Client-side file validation
- File type checking
- File size limits
- Multiple verification points to prevent bypass
- Secure storage indication in UI

## Future Enhancements

Consider implementing these features:

1. **Server-side Upload**: Currently simulated; implement actual file upload to server
2. **Database Storage**: Store verification status in database instead of localStorage
3. **Document Status**: Track document review status (pending, approved, rejected)
4. **Email Notifications**: Send confirmation emails when documents are reviewed
5. **Document Expiry**: Require re-verification after a certain period
6. **Admin Review Portal**: Allow administrators to review and approve documents
7. **Multi-language Support**: Add translations for international users
8. **Accessibility**: Enhanced screen reader support and keyboard navigation

## Testing

To test the verification flow:

### Full Verification Flow:

1. Visit the site - you'll be redirected to `/verify-documents`
2. Upload at least 2 documents (any supported file type)
3. Click "Continue to Dashboard" (orange button)
4. Access the dashboard and all platform features
5. Go to Settings → Document Verification to view verified status
6. Click "Re-verify Documents" to reset and test again

### Skip Flow:

1. Visit the site - you'll be redirected to `/verify-documents`
2. Click "Skip for Now" button (without uploading documents)
3. View the dashboard briefly (one-time access)
4. Try to navigate to any other page (e.g., click "Analytics" in sidebar) → **Redirected back to verification**
5. OR refresh the page (F5) → **Redirected back to verification**
6. Go to Settings → Document Verification to see amber "Skipped" warning
7. Complete verification for permanent access

### Color Theme Testing:

- All primary buttons should be orange (#f97316 / orange-500)
- Hover states should be darker orange (#ea580c / orange-600)
- Drag & drop area should highlight with orange when dragging
- Settings verification section buttons use orange theme

## Developer Notes

- Verification status is currently stored in `localStorage`
- Skip mechanism uses timestamp-based sessionStorage (2-second validity window)
- Platform layout checks verification on every route change via `usePathname()` hook
- For production, implement server-side verification and database storage
- The upload process is simulated with a 2-second delay
- All verification checks are client-side only (implement server-side for production)

### How Skip Works Technically:

1. User clicks "Skip" → Sets timestamp in `sessionStorage`
2. Navigation to dashboard → Platform layout checks timestamp
3. If timestamp is < 2 seconds old → Allow access for this ONE page load
4. Timestamp is immediately cleared after check
5. Any subsequent navigation or refresh → No valid timestamp → Redirect to verification
6. This ensures skip only works for immediate navigation, not persistent access

## Support

For issues or questions about the document verification feature, please refer to the main project documentation or contact the development team.
