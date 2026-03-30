// KYC Document Types (Corporate/Organisation Documents)

export type DocumentType = 'ARTICLES_OF_ASSOCIATION' | 'CERTIFICATE_OF_INCORPORATION' | 'PROOF_OF_ADDRESS' | 'DIRECTOR_ID' | 'SHAREHOLDER_REGISTER' | 'BANK_STATEMENT' | 'TAX_REGISTRATION' | 'OTHER';
export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface KYCDocument {
  id: number;
  organisationId: number;
  documentType: DocumentType;
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

export interface CreateKYCDocumentDTO {
  organisationId: number;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl: string;
}

export interface UpdateKYCDocumentDTO {
  documentType?: DocumentType;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentUrl?: string;
}

export interface KYCDocumentFilters {
  organisationId?: number;
  documentType?: DocumentType;
  status?: DocumentStatus;
}
