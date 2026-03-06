// KYC Verification Types

export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_UPDATE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KYCVerification {
  id: number;
  userId: number;
  userName?: string;
  status: VerificationStatus;
  riskLevel?: RiskLevel;
  verifiedBy?: number;
  verifierName?: string;
  verificationDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
  notes?: string;
  documentsVerified: number;
  totalDocuments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKYCVerificationDTO {
  userId: number;
  notes?: string;
}

export interface UpdateKYCVerificationDTO {
  status?: VerificationStatus;
  riskLevel?: RiskLevel;
  notes?: string;
  rejectionReason?: string;
}

export interface ApproveVerificationDTO {
  riskLevel: RiskLevel;
  notes?: string;
}

export interface RejectVerificationDTO {
  rejectionReason: string;
  notes?: string;
}

export interface KYCVerificationFilters {
  userId?: number;
  status?: VerificationStatus;
  riskLevel?: RiskLevel;
  verifiedBy?: number;
  dateFrom?: string;
  dateTo?: string;
}
