import { apiClient } from './apiClient';

export interface EnumOption {
  value: string;
  label: string;
  description?: string;
}

export interface Enums {
  userStatus: EnumOption[];
  organizationStatus: EnumOption[];
  organizationType: EnumOption[];
  documentType: EnumOption[];
  documentStatus: EnumOption[];
  addressType: EnumOption[];
  verificationStatus: EnumOption[];
  verificationLevel: EnumOption[];
  screeningType: EnumOption[];
  riskLevel: EnumOption[];
  questionCategory: EnumOption[];
}

class EnumService {
  private cache: Enums | null = null;
  private loading: Promise<Enums> | null = null;

  /**
   * Get all enums in a single call (with caching)
   */
  async getAllEnums(): Promise<Enums> {
    // Return cached data if available
    if (this.cache) {
      return this.cache;
    }

    // Return existing promise if already loading
    if (this.loading) {
      return this.loading;
    }

    // Start loading
    this.loading = apiClient.get<Enums>('/enums')
      .then(response => {
        this.cache = response.data;
        this.loading = null;
        return response.data;
      })
      .catch(error => {
        this.loading = null;
        throw error;
      });

    return this.loading;
  }

  /**
   * Get user status options
   */
  async getUserStatus(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.userStatus;
  }

  /**
   * Get organization status options
   */
  async getOrganizationStatus(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.organizationStatus;
  }

  /**
   * Get organization type options
   */
  async getOrganizationType(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.organizationType;
  }

  /**
   * Get document type options
   */
  async getDocumentType(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.documentType;
  }

  /**
   * Get document status options
   */
  async getDocumentStatus(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.documentStatus;
  }

  /**
   * Get address type options
   */
  async getAddressType(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.addressType;
  }

  /**
   * Get verification status options
   */
  async getVerificationStatus(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.verificationStatus;
  }

  /**
   * Get verification level options
   */
  async getVerificationLevel(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.verificationLevel;
  }

  /**
   * Get screening type options
   */
  async getScreeningType(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.screeningType;
  }

  /**
   * Get risk level options
   */
  async getRiskLevel(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.riskLevel;
  }

  /**
   * Get question category options
   */
  async getQuestionCategory(): Promise<EnumOption[]> {
    const enums = await this.getAllEnums();
    return enums.questionCategory;
  }

  /**
   * Clear cache (useful for testing or if data changes)
   */
  clearCache(): void {
    this.cache = null;
    this.loading = null;
  }
}

export default new EnumService();
