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
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  taxId: string;
  email: string;
  phoneNumber: string;
  website?: string;
  description?: string;
  status: OrganizationStatus;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDTO {
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  taxId: string;
  email: string;
  phoneNumber: string;
  website?: string;
  description?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  type?: OrganizationType;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  description?: string;
  status?: OrganizationStatus;
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
  name?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  email?: string;
  phoneNumber?: string;
}

export interface OrganizationFilters {
  type?: OrganizationType;
  status?: OrganizationStatus;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}
