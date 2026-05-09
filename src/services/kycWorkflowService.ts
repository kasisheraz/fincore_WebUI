import apiService from './apiService';

/**
 * Types for KYC Workflow
 */
export interface WorkflowStatus {
  verificationId: number;
  userId: number;
  level: string;
  status: string;
  steps: {
    USER_INFO: boolean;
    DOCUMENT_VERIFICATION: boolean;
    QUESTIONNAIRE: boolean;
    REVIEW: boolean;
    COMPLETED: boolean;
  };
  progressPercentage: number;
  currentStep: string;
  submittedAt: string;
  reviewedAt?: string;
  riskLevel?: string;
}

export interface WorkflowProgress {
  verificationId: number;
  progressPercentage: number;
  currentStep: string;
  status: string;
}

export interface StartWorkflowRequest {
  level: 'BASIC' | 'ENHANCED' | 'FULL';
}

export interface CompleteStep2Request {
  sumsubApplicantId: string;
}

export interface QuestionAnswer {
  questionId: number;
  answerText: string;
}

export interface CompleteStep3Request {
  answers: QuestionAnswer[];
}

/**
 * Service for KYC Workflow operations
 * Integrates with backend /api/kyc/workflow endpoints
 */
class KYCWorkflowService {
  private readonly BASE_PATH = '/kyc/workflow';

  /**
   * Start a new KYC workflow
   */
  async startWorkflow(level: 'BASIC' | 'ENHANCED' | 'FULL'): Promise<WorkflowStatus> {
    const response = await apiService.post<WorkflowStatus>(
      `${this.BASE_PATH}/start?level=${level}`
    );
    return response.data;
  }

  /**
   * Complete Step 1: User Information
   */
  async completeStep1(verificationId: number): Promise<WorkflowStatus> {
    const response = await apiService.post<WorkflowStatus>(
      `${this.BASE_PATH}/${verificationId}/step1/user-info`
    );
    return response.data;
  }

  /**
   * Complete Step 2: Document Verification
   */
  async completeStep2(verificationId: number, sumsubApplicantId: string): Promise<WorkflowStatus> {
    const response = await apiService.post<WorkflowStatus>(
      `${this.BASE_PATH}/${verificationId}/step2/sumsub`,
      { sumsubApplicantId }
    );
    return response.data;
  }

  /**
   * Complete Step 3: Compliance Questionnaire
   */
  async completeStep3(verificationId: number, answers: QuestionAnswer[]): Promise<WorkflowStatus> {
    const response = await apiService.post<WorkflowStatus>(
      `${this.BASE_PATH}/${verificationId}/step3/questionnaire`,
      { answers }
    );
    return response.data;
  }

  /**
   * Complete Step 4: Final Review
   */
  async completeStep4(verificationId: number): Promise<WorkflowStatus> {
    const response = await apiService.post<WorkflowStatus>(
      `${this.BASE_PATH}/${verificationId}/step4/review`
    );
    return response.data;
  }

  /**
   * Get detailed workflow status
   */
  async getStatus(verificationId: number): Promise<WorkflowStatus> {
    const response = await apiService.get<WorkflowStatus>(
      `${this.BASE_PATH}/${verificationId}/status`
    );
    return response.data;
  }

  /**
   * Get simplified workflow progress
   */
  async getProgress(verificationId: number): Promise<WorkflowProgress> {
    const response = await apiService.get<WorkflowProgress>(
      `${this.BASE_PATH}/${verificationId}/progress`
    );
    return response.data;
  }
}

const kycWorkflowService = new KYCWorkflowService();
export default kycWorkflowService;
