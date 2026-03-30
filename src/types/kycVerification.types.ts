// KYC Verification Types

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type VerificationLevel = 'BASIC' | 'ENHANCED' | 'FULL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ReviewResult {
  reviewerId: number;
  comments: string;
  approvalReason: string;
}

export interface KYCVerification {
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

export interface CreateKYCVerificationDTO {
  userId: number;
  verificationLevel: VerificationLevel;
  sumsubApplicantId?: string;
}

export interface UpdateKYCVerificationDTO {
  status: VerificationStatus;
  riskLevel?: RiskLevel;
  reviewerComments?: string;
  approvalReason?: string;
}

export interface ApproveVerificationDTO {
  riskLevel: RiskLevel;
  approvalReason?: string;
  reviewerComments?: string;
}

export interface RejectVerificationDTO {
  reviewerComments: string;
  approvalReason?: string;
}

export interface KYCVerificationFilters {
  userId?: number;
  status?: VerificationStatus;
  verificationLevel?: VerificationLevel;
  riskLevel?: RiskLevel;
}
