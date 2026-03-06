// KYC Document Types

export type DocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'UTILITY_BILL' | 'BANK_STATEMENT' | 'TAX_RETURN' | 'OTHER';
export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface KYCDocument {
  id: number;
  userId: number;
  documentType: DocumentType;
  documentNumber: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: number;
  rejectionReason?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKYCDocumentDTO {
  userId: number;
  documentType: DocumentType;
  documentNumber: string;
  file: File;
  expiryDate?: string;
  notes?: string;
}

export interface UpdateKYCDocumentDTO {
  documentType?: DocumentType;
  documentNumber?: string;
  status?: DocumentStatus;
  expiryDate?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface KYCDocumentFilters {
  userId?: number;
  documentType?: DocumentType;
  status?: DocumentStatus;
  uploadDateFrom?: string;
  uploadDateTo?: string;
}
