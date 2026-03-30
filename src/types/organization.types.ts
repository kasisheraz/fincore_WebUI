// Organization Types

export type OrganizationType = 'LTD' | 'PLC' | 'SOLE_TRADER' | 'PARTNERSHIP' | 'LLP' | 'CHARITY' | 'CIC';
export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface Address {
  id: number;
  typeCode: number; // 1=Residential, 2=Business, 3=Registered, 4=Correspondence, 5=Postal
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  postalCode: string;
  country: string;
  statusDescription: string;
}

export interface Organization {
  id: number;
  legalName: string;
  businessName?: string;
  registrationNumber: string;
  companyNumber?: string;
  organisationType: OrganizationType;
  sicCode?: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  status: OrganizationStatus;
  businessDescription?: string;
  websiteAddress?: string;
  fcaNumber?: string;
  hmrcMlrNumber?: string;
  numberOfBranches?: number;
  numberOfAgents?: number;
  registeredAddress?: Address;
  businessAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDTO {
  ownerId: number;
  legalName: string;
  businessName?: string;
  registrationNumber: string;
  companyNumber?: string;
  organisationType: OrganizationType;
  sicCode?: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  businessDescription?: string;
  websiteAddress?: string;
  fcaNumber?: string;
  hmrcMlrNumber?: string;
  numberOfBranches?: number;
  numberOfAgents?: number;
  registeredAddress?: CreateAddressDTO;
  businessAddress?: CreateAddressDTO;
}

export interface UpdateOrganizationDTO {
  legalName?: string;
  businessName?: string;
  registrationNumber?: string;
  companyNumber?: string;
  organisationType?: OrganizationType;
  sicCode?: string;
  incorporationDate?: string;
  countryOfIncorporation?: string;
  status?: OrganizationStatus;
  businessDescription?: string;
  websiteAddress?: string;
  fcaNumber?: string;
  hmrcMlrNumber?: string;
  numberOfBranches?: number;
  numberOfAgents?: number;
  registeredAddress?: CreateAddressDTO;
  businessAddress?: CreateAddressDTO;
}

export interface CreateAddressDTO {
  typeCode: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  postalCode: string;
  country: string;
  statusDescription: string;
}

export interface UpdateAddressDTO {
  typeCode?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  country?: string;
  statusDescription?: string;
}

export interface OrganizationSearchDTO {
  searchTerm?: string;
  status?: OrganizationStatus;
  organisationType?: OrganizationType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface OrganizationSearchParams {
  legalName?: string;
  organisationType?: OrganizationType;
  status?: OrganizationStatus;
  searchTerm?: string;
}

export interface OrganizationFilters {
  organisationType?: OrganizationType;
  status?: OrganizationStatus;
}
