// Organization Types

export type OrganizationType = 'GOVERNMENT' | 'PRIVATE' | 'NON_PROFIT' | 'PUBLIC';
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  legalName: string; // Backend uses legalName
  organisationType: OrganizationType; // Backend uses organisationType
  registrationNumber: string;
  taxId?: string;
  email: string;
  phoneNumber: string;
  website?: string;
  description?: string;
  statusDescription: OrganizationStatus; // Backend uses statusDescription
  ownerId: number; // Owner user ID
  addresses?: Address[];
  createdDatetime: string; // Backend uses createdDatetime
  lastModifiedDatetime: string; // Backend uses lastModifiedDatetime
}

export interface CreateOrganizationDTO {
  legalName: string; // Backend requires legalName
  organisationType: OrganizationType; // Backend requires organisationType
  registrationNumber: string;
  taxId?: string;
  email: string;
  phoneNumber: string;
  website?: string;
  description?: string;
  ownerId: number; // Backend requires ownerId
}

export interface UpdateOrganizationDTO {
  legalName?: string;
  organisationType?: OrganizationType;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  description?: string;
  statusDescription?: OrganizationStatus;
  ownerId?: number;
}

export interface CreateAddressDTO {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  organizationId: number;
}

export interface UpdateAddressDTO {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrganizationSearchParams {
  legalName?: string;
  organisationType?: OrganizationType;
  statusDescription?: OrganizationStatus;
  email?: string;
  phoneNumber?: string;
}

export interface OrganizationFilters {
  organisationType?: OrganizationType;
  statusDescription?: OrganizationStatus;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}
