import kycWorkflowService, { WorkflowStatus, WorkflowProgress, QuestionAnswer } from './kycWorkflowService';
import apiService from './apiService';

jest.mock('./apiService');

const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('KYCWorkflowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startWorkflow', () => {
    it('should start workflow with correct level', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: false,
          DOCUMENT_VERIFICATION: false,
          QUESTIONNAIRE: false,
          REVIEW: false,
          COMPLETED: false,
        },
        progressPercentage: 0,
        currentStep: 'USER_INFO',
        submittedAt: '2026-05-09T10:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.startWorkflow('ENHANCED');

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/start?level=ENHANCED');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockedApiService.post.mockRejectedValue(new Error('Network error'));

      await expect(kycWorkflowService.startWorkflow('BASIC')).rejects.toThrow('Network error');
    });
  });

  describe('completeStep1', () => {
    it('should complete step 1 successfully', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: false,
          QUESTIONNAIRE: false,
          REVIEW: false,
          COMPLETED: false,
        },
        progressPercentage: 20,
        currentStep: 'DOCUMENT_VERIFICATION',
        submittedAt: '2026-05-09T10:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.completeStep1(100);

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/100/step1/user-info');
      expect(result.steps.USER_INFO).toBe(true);
      expect(result.progressPercentage).toBe(20);
    });
  });

  describe('completeStep2', () => {
    it('should complete step 2 with SumSub applicant ID', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: true,
          QUESTIONNAIRE: false,
          REVIEW: false,
          COMPLETED: false,
        },
        progressPercentage: 40,
        currentStep: 'QUESTIONNAIRE',
        submittedAt: '2026-05-09T10:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.completeStep2(100, 'MOCK_ABC123');

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/100/step2/sumsub', {
        sumsubApplicantId: 'MOCK_ABC123',
      });
      expect(result.steps.DOCUMENT_VERIFICATION).toBe(true);
      expect(result.progressPercentage).toBe(40);
    });
  });

  describe('completeStep3', () => {
    it('should complete step 3 with answers', async () => {
      const answers: QuestionAnswer[] = [
        { questionId: 1, answerText: 'Answer 1' },
        { questionId: 2, answerText: 'Answer 2' },
      ];

      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: true,
          QUESTIONNAIRE: true,
          REVIEW: false,
          COMPLETED: false,
        },
        progressPercentage: 60,
        currentStep: 'REVIEW',
        submittedAt: '2026-05-09T10:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.completeStep3(100, answers);

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/100/step3/questionnaire', {
        answers,
      });
      expect(result.steps.QUESTIONNAIRE).toBe(true);
      expect(result.progressPercentage).toBe(60);
    });

    it('should handle empty answers', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: true,
          QUESTIONNAIRE: false,
          REVIEW: false,
          COMPLETED: false,
        },
        progressPercentage: 40,
        currentStep: 'QUESTIONNAIRE',
        submittedAt: '2026-05-09T10:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.completeStep3(100, []);

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/100/step3/questionnaire', {
        answers: [],
      });
    });
  });

  describe('completeStep4', () => {
    it('should complete step 4 and submit for review', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'ENHANCED',
        status: 'PENDING',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: true,
          QUESTIONNAIRE: true,
          REVIEW: true,
          COMPLETED: false,
        },
        progressPercentage: 80,
        currentStep: 'COMPLETED',
        submittedAt: '2026-05-09T10:00:00',
        reviewedAt: '2026-05-09T11:00:00',
      };

      mockedApiService.post.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.completeStep4(100);

      expect(apiService.post).toHaveBeenCalledWith('/kyc/workflow/100/step4/review');
      expect(result.steps.REVIEW).toBe(true);
      expect(result.reviewedAt).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should retrieve workflow status', async () => {
      const mockResponse: WorkflowStatus = {
        verificationId: 100,
        userId: 1,
        level: 'FULL',
        status: 'APPROVED',
        steps: {
          USER_INFO: true,
          DOCUMENT_VERIFICATION: true,
          QUESTIONNAIRE: true,
          REVIEW: true,
          COMPLETED: true,
        },
        progressPercentage: 100,
        currentStep: 'COMPLETED',
        submittedAt: '2026-05-09T10:00:00',
        reviewedAt: '2026-05-09T11:00:00',
        riskLevel: 'LOW',
      };

      mockedApiService.get.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.getStatus(100);

      expect(apiService.get).toHaveBeenCalledWith('/kyc/workflow/100/status');
      expect(result.status).toBe('APPROVED');
      expect(result.riskLevel).toBe('LOW');
      expect(result.progressPercentage).toBe(100);
    });
  });

  describe('getProgress', () => {
    it('should retrieve simplified progress', async () => {
      const mockResponse: WorkflowProgress = {
        verificationId: 100,
        progressPercentage: 60,
        currentStep: 'REVIEW',
        status: 'PENDING',
      };

      mockedApiService.get.mockResolvedValue(mockResponse);

      const result = await kycWorkflowService.getProgress(100);

      expect(apiService.get).toHaveBeenCalledWith('/kyc/workflow/100/progress');
      expect(result.progressPercentage).toBe(60);
      expect(result.currentStep).toBe('REVIEW');
    });
  });
});
