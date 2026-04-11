// Organization Types

export type OrganizationType = 'GOVERNMENT' | 'PRIVATE' | 'NON_PROFIT' | 'PUBLIC';
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface Address {
  id: number;
  addressType?: string;
  typeCode: number; // 1=Registered, 2=Business, 3=Correspondence, etc.
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  stateCode?: string; // Backend uses stateCode
  postalCode?: string;
  country: string;
  statusDescription?: string;
  createdDatetime?: string;
}

export interface Organization {
  id: number;
  ownerId: number;
  ownerName?: string;
  
  // Basic Information
  legalName: string;
  organisationType: OrganizationType;
  registrationNumber?: string;
  sicCode?: string;
  businessName?: string;
  businessDescription?: string;
  incorporationDate?: string;
  countryOfIncorporation?: string;
  typeOfBusinessCode?: string;
  
  // Contact Information
  websiteAddress?: string;
  
  // Regulatory Information
  hmrcMlrNumber?: string;
  hmrcExpiryDate?: string;
  fcaNumber?: string;
  icoNumber?: string;
  
  // Business Structure
  numberOfBranches?: string;
  numberOfAgents?: string;
  mlroDetails?: string;
  complianceConsultantDetails?: string;
  accountantDetails?: string;
  technologyServiceProviderDetails?: string;
  payoutPartnerName?: string;
  
  // Registration Details
  registrationInformation?: string;
  companyNumber?: string;
  sicCodes?: string;
  businessLicenseNumber?: string;
  
  // Remittance Information
  primaryRemittanceDestinationCountry?: string;
  secondaryRemittanceDestinationCountry?: string;
  
  // Transaction Volumes
  monthlyTurnoverRange?: string;
  numberOfIncomingTransactions?: string;
  numberOfOutgoingTransactions?: string;
  valueOfIncomingTransactions?: string;
  valueOfOutgoingTransactions?: string;
  maxValueOfIncomingPayments?: string;
  maxValueOfOutgoingPayments?: string;
  productDescription?: string;
  
  // Addresses
  registeredAddress?: Address;
  businessAddress?: Address;
  correspondenceAddress?: Address;
  
  // Status and Audit
  statusDescription: OrganizationStatus;
  reasonDescription?: string;
  legacyIdentifier?: string;
  createdDatetime: string;
  lastModifiedDatetime: string;
}

export interface CreateOrganizationDTO {
  // Required fields
  ownerId: number; // Required
  legalName: string; // Required
  organisationType: OrganizationType; // Required
  
  // Basic Information
  registrationNumber?: string;
  sicCode?: string;
  businessName?: string;
  businessDescription?: string;
  incorporationDate?: string; // LocalDate format
  countryOfIncorporation?: string;
  typeOfBusinessCode?: string;
  
  // Contact Information (mapped from websiteAddress in backend)
  websiteAddress?: string;
  
  // Regulatory Information
  hmrcMlrNumber?: string;
  hmrcExpiryDate?: string; // LocalDate format
  fcaNumber?: string;
  icoNumber?: string;
  
  // Business Structure
  numberOfBranches?: string;
  numberOfAgents?: string;
  mlroDetails?: string;
  complianceConsultantDetails?: string;
  accountantDetails?: string;
  technologyServiceProviderDetails?: string;
  payoutPartnerName?: string;
  
  // Registration Details
  registrationInformation?: string;
  companyNumber?: string;
  sicCodes?: string;
  businessLicenseNumber?: string;
  
  // Remittance Information
  primaryRemittanceDestinationCountry?: string;
  secondaryRemittanceDestinationCountry?: string;
  
  // Transaction Volume Information
  monthlyTurnoverRange?: string;
  numberOfIncomingTransactions?: string;
  numberOfOutgoingTransactions?: string;
  valueOfIncomingTransactions?: string;
  valueOfOutgoingTransactions?: string;
  maxValueOfIncomingPayments?: string;
  maxValueOfOutgoingPayments?: string;
  productDescription?: string;
  
  // Addresses (nested objects)
  registeredAddress?: CreateAddressDTO;
  businessAddress?: CreateAddressDTO;
  correspondenceAddress?: CreateAddressDTO;
  
  // Other
  legacyIdentifier?: string;
  
  // KYC Documents
  kycDocuments?: KYCDocumentUpload[];
}

export interface KYCDocumentUpload {
  documentType: string;
  fileName?: string;
  fileUrl?: string;
  file?: File;
}

export interface UpdateOrganizationDTO {
  // Basic Information
  legalName?: string;
  organisationType?: OrganizationType;
  registrationNumber?: string;
  sicCode?: string;
  businessName?: string;
  businessDescription?: string;
  incorporationDate?: string;
  countryOfIncorporation?: string;
  typeOfBusinessCode?: string;
  
  // Contact Information
  websiteAddress?: string;
  
  // Regulatory Information
  hmrcMlrNumber?: string;
  hmrcExpiryDate?: string;
  fcaNumber?: string;
  icoNumber?: string;
  
  // Business Structure
  numberOfBranches?: string;
  numberOfAgents?: string;
  mlroDetails?: string;
  complianceConsultantDetails?: string;
  accountantDetails?: string;
  technologyServiceProviderDetails?: string;
  payoutPartnerName?: string;
  
  // Registration Details
  registrationInformation?: string;
  companyNumber?: string;
  sicCodes?: string;
  businessLicenseNumber?: string;
  
  // Remittance Information
  primaryRemittanceDestinationCountry?: string;
  secondaryRemittanceDestinationCountry?: string;
  
  // Transaction Volumes
  monthlyTurnoverRange?: string;
  numberOfIncomingTransactions?: string;
  numberOfOutgoingTransactions?: string;
  valueOfIncomingTransactions?: string;
  valueOfOutgoingTransactions?: string;
  maxValueOfIncomingPayments?: string;
  maxValueOfOutgoingPayments?: string;
  productDescription?: string;
  
  // Status
  statusDescription?: OrganizationStatus;
  ownerId?: number;
  
  // Other
  legacyIdentifier?: string;
}

export interface CreateAddressDTO {
  typeCode: number; // Required: 1=Registered, 2=Business, 3=Correspondence
  addressLine1: string; // Required
  addressLine2?: string;
  postalCode?: string;
  stateCode?: string; // Backend uses stateCode
  city?: string;
  country: string; // Required
}

export interface UpdateAddressDTO {
  typeCode?: number;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  stateCode?: string; // Backend uses stateCode
  city?: string;
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
