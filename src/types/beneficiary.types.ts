// Beneficiary Types

export type BeneficiaryStatus = 
  | 'PENDING'           // Draft - editable by user
  | 'UNDER_REVIEW'      // Submitted for admin review - read-only
  | 'ACTIVE'            // Approved by admin - fully active
  | 'REJECTED'          // Permanently rejected by admin
  | 'SUSPENDED';        // Temporarily suspended by admin

export interface Address {
  id: number;
  addressType?: string;
  typeCode: number;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  country: string;
  statusDescription?: string;
  createdDatetime?: string;
}

export interface Beneficiary {
  id: number;
  ownerId: number;
  ownerName?: string;
  
  // Core Fields
  beneficiaryName: string;
  nickName?: string;
  businessName?: string;
  country: string;
  
  // Address
  registeredAddress?: Address;
  
  // Counter Over Counter Fields
  isCounterOverCounter: boolean;
  collectorContactNumber?: string;
  
  // Workflow Fields
  status: BeneficiaryStatus;
  reasonDescription?: string;
  
  // Audit Fields
  createdDatetime: string;
  createdByName?: string;
  lastModifiedDatetime: string;
  lastModifiedByName?: string;
  
  // Computed Fields (for UI convenience)
  canBeEdited: boolean;
  canBeSubmitted: boolean;
  isActive: boolean;
}

export interface CreateBeneficiaryDTO {
  beneficiaryName: string;
  nickName?: string;
  businessName?: string;
  country: string;
  registeredAddressId: number;
  isCounterOverCounter: boolean;
  collectorContactNumber?: string;
}

export interface UpdateBeneficiaryDTO {
  beneficiaryName: string;
  nickName?: string;
  businessName?: string;
  country: string;
  registeredAddressId: number;
  isCounterOverCounter: boolean;
  collectorContactNumber?: string;
}

export interface BeneficiaryRejectionDTO {
  reason: string;
}

export interface BeneficiaryCountResponse {
  count: number;
  limit: number;
  remaining: number;
  canCreateMore: boolean;
}

export interface BeneficiaryStatistics {
  [key: string]: number;  // Status → Count mapping
}

export interface BeneficiarySearchParams {
  status?: BeneficiaryStatus;
  query?: string;
  country?: string;
}
