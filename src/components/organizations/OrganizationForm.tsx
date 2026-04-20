import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO, CreateAddressDTO } from '../../types/organization.types';
import { isRequired, isValidURL } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import AddressForm from '../common/AddressForm';
import KYCDocumentsUploadTab from './KYCDocumentsUploadTab';
import enumService, { EnumOption } from '../../services/enumService';
import organizationService from '../../services/organizationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface OrganizationFormProps {
  organization: Organization | null;
  onSubmit: (data: CreateOrganizationDTO | UpdateOrganizationDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: CreateOrganizationDTO | UpdateOrganizationDTO) => void;
  onClose?: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  onSubmit,
  mode,
  onValidationChange,
  onDataChange,
  onClose
}) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabsCompleted, setTabsCompleted] = useState<boolean[]>(new Array(9).fill(false));
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0])); // Track visited tabs, start with tab 0
  const [savedOrganizationId, setSavedOrganizationId] = useState<number | null>(organization?.id || null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const [formData, setFormData] = useState<CreateOrganizationDTO>({
    // Required fields
    legalName: '',
    organisationType: 'GOVERNMENT',
    ownerId: user?.id || 0,
    
    // Basic Information
    registrationNumber: '',
    sicCode: '',
    businessName: '',
    businessDescription: '',
    incorporationDate: '',
    countryOfIncorporation: '',
    typeOfBusinessCode: '',
    websiteAddress: '',
    
    // Regulatory Information
    hmrcMlrNumber: '',
    hmrcExpiryDate: '',
    fcaNumber: '',
    icoNumber: '',
    
    // Business Structure
    numberOfBranches: '',
    numberOfAgents: '',
    mlroDetails: '',
    complianceConsultantDetails: '',
    accountantDetails: '',
    technologyServiceProviderDetails: '',
    payoutPartnerName: '',
    
    // Registration Details
    registrationInformation: '',
    companyNumber: '',
    sicCodes: '',
    businessLicenseNumber: '',
    
    // Remittance Information
    primaryRemittanceDestinationCountry: '',
    secondaryRemittanceDestinationCountry: '',
    
    // Transaction Volume Information
    monthlyTurnoverRange: '',
    numberOfIncomingTransactions: '',
    numberOfOutgoingTransactions: '',
    valueOfIncomingTransactions: '',
    valueOfOutgoingTransactions: '',
    maxValueOfIncomingPayments: '',
    maxValueOfOutgoingPayments: '',
    productDescription: '',
    
    // Addresses
    registeredAddress: undefined,
    businessAddress: undefined,
    correspondenceAddress: undefined,
    
    // Other
    legacyIdentifier: '',
    
    // KYC Documents
    kycDocuments: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sameAsRegisteredAddress, setSameAsRegisteredAddress] = useState({
    business: false,
    correspondence: false
  });
  const [addressValidation, setAddressValidation] = useState<{
    registered: boolean;
    business: boolean;
    correspondence: boolean;
  }>({
    registered: true,
    business: true,
    correspondence: true
  });
  const [organizationTypeOptions, setOrganizationTypeOptions] = useState<EnumOption[]>([]);
  const [loadingOrgTypes, setLoadingOrgTypes] = useState<boolean>(true);

  // Initialize form with organization data in edit mode
  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        legalName: organization.legalName || '',
        organisationType: organization.organisationType || 'GOVERNMENT',
        ownerId: organization.ownerId || user?.id || 0,
        registrationNumber: organization.registrationNumber || '',
        sicCode: organization.sicCode || '',
        businessName: organization.businessName || '',
        businessDescription: organization.businessDescription || '',
        incorporationDate: organization.incorporationDate || '',
        countryOfIncorporation: organization.countryOfIncorporation || '',
        typeOfBusinessCode: organization.typeOfBusinessCode || '',
        websiteAddress: organization.websiteAddress || '',
        hmrcMlrNumber: organization.hmrcMlrNumber || '',
        hmrcExpiryDate: organization.hmrcExpiryDate || '',
        fcaNumber: organization.fcaNumber || '',
        icoNumber: organization.icoNumber || '',
        numberOfBranches: organization.numberOfBranches || '',
        numberOfAgents: organization.numberOfAgents || '',
        mlroDetails: organization.mlroDetails || '',
        complianceConsultantDetails: organization.complianceConsultantDetails || '',
        accountantDetails: organization.accountantDetails || '',
        technologyServiceProviderDetails: organization.technologyServiceProviderDetails || '',
        payoutPartnerName: organization.payoutPartnerName || '',
        registrationInformation: organization.registrationInformation || '',
        companyNumber: organization.companyNumber || '',
        sicCodes: organization.sicCodes || '',
        businessLicenseNumber: organization.businessLicenseNumber || '',
        primaryRemittanceDestinationCountry: organization.primaryRemittanceDestinationCountry || '',
        secondaryRemittanceDestinationCountry: organization.secondaryRemittanceDestinationCountry || '',
        monthlyTurnoverRange: organization.monthlyTurnoverRange || '',
        numberOfIncomingTransactions: organization.numberOfIncomingTransactions || '',
        numberOfOutgoingTransactions: organization.numberOfOutgoingTransactions || '',
        valueOfIncomingTransactions: organization.valueOfIncomingTransactions || '',
        valueOfOutgoingTransactions: organization.valueOfOutgoingTransactions || '',
        maxValueOfIncomingPayments: organization.maxValueOfIncomingPayments || '',
        maxValueOfOutgoingPayments: organization.maxValueOfOutgoingPayments || '',
        productDescription: organization.productDescription || '',
        registeredAddress: organization.registeredAddress,
        businessAddress: organization.businessAddress,
        correspondenceAddress: organization.correspondenceAddress,
        legacyIdentifier: organization.legacyIdentifier || '',
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, ownerId: user.id }));
    }
  }, [organization, mode, user]);

  // Fetch organization types from backend
  useEffect(() => {
    const fetchOrganizationTypes = async () => {
      try {
        setLoadingOrgTypes(true);
        console.log('[OrganizationForm] Fetching organization types from backend...');
        const fetchedTypes = await enumService.getOrganizationType();
        console.log('[OrganizationForm] Organization types fetched:', fetchedTypes);
        setOrganizationTypeOptions(fetchedTypes);
      } catch (error) {
        console.error('[OrganizationForm] Error fetching organization types:', error);
        // Keep empty array on error - form will still work
      } finally {
        setLoadingOrgTypes(false);
      }
    };

    fetchOrganizationTypes();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.legalName)) {
      newErrors.legalName = 'Legal name is required';
    }

    if (!isRequired(formData.organisationType)) {
      newErrors.organisationType = 'Organization type is required';
    }

    if (!formData.ownerId || formData.ownerId === 0) {
      newErrors.ownerId = 'Owner ID is required. Please ensure you are logged in.';
    }

    if (formData.websiteAddress && !isValidURL(formData.websiteAddress)) {
      newErrors.websiteAddress = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate current tab
  const validateCurrentTab = (): boolean => {
    if (currentTab === 0) {
      // Tab 0: Basic Info - Required fields
      return validateForm();
    }
    // All other tabs are optional, always valid
    return true;
  };

  // Check if tab has any data entered
  const isTabComplete = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0: // Basic Info - validate required fields
        return isRequired(formData.legalName) && 
               isRequired(formData.organisationType) && 
               formData.ownerId > 0;
      case 1: // Regulatory
        return !!(formData.hmrcMlrNumber || formData.fcaNumber || formData.icoNumber);
      case 2: // Business Structure
        return !!(formData.numberOfBranches || formData.numberOfAgents || formData.mlroDetails);
      case 3: // Registration
        return !!(formData.companyNumber || formData.businessLicenseNumber || formData.registrationInformation);
      case 4: // Remittance
        return !!(formData.primaryRemittanceDestinationCountry || formData.secondaryRemittanceDestinationCountry);
      case 5: // Transactions
        return !!(formData.monthlyTurnoverRange || formData.numberOfIncomingTransactions || formData.numberOfOutgoingTransactions);
      case 6: // Addresses
        return !!(formData.registeredAddress || formData.businessAddress || formData.correspondenceAddress);
      case 7: // KYC Documents - Required tab, considered complete when visited
        return visitedTabs.has(7);
      case 8: // Other
        return !!(formData.legacyIdentifier);
      default:
        return false;
    }
  };

  // Auto-validate on form data change
  useEffect(() => {
    const basicFormValid = validateForm();
    // Addresses are optional, so only validate if they exist
    const addressesValid = 
      (!formData.registeredAddress || addressValidation.registered) &&
      (!formData.businessAddress || addressValidation.business) &&
      (!formData.correspondenceAddress || addressValidation.correspondence);
    
    const isValid = basicFormValid && addressesValid;
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    if (onDataChange) {
      onDataChange(formData as any);
    }
    
    // Update tab completion status
    const newTabsCompleted = Array.from({ length: 9 }, (_, i) => isTabComplete(i));
    setTabsCompleted(newTabsCompleted);
  }, [formData, addressValidation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof CreateOrganizationDTO) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTabChange = async (_event: React.SyntheticEvent, newValue: number) => {
    // Auto-save as draft when navigating TO KYC Documents tab (index 7)
    if (newValue === 7 && !savedOrganizationId && mode === 'create' && tabsCompleted[0]) {
      await saveDraft();
    }
    setCurrentTab(newValue);
    setVisitedTabs(prev => new Set(prev).add(newValue)); // Mark tab as visited
  };

  const handleNext = async () => {
    if (!validateCurrentTab()) {
      return;
    }
    if (currentTab < 8) {
      const nextTab = currentTab + 1;
      
      // Auto-save as draft when navigating TO KYC Documents tab (index 7)
      if (nextTab === 7 && !savedOrganizationId && mode === 'create' && tabsCompleted[0]) {
        await saveDraft();
      }
      
      setCurrentTab(nextTab);
      setVisitedTabs(prev => new Set(prev).add(nextTab)); // Mark next tab as visited
    }
  };

  const handleBack = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const saveDraft = async () => {
    if (!tabsCompleted[0]) {
      setDraftSaveError('Please complete Basic Info tab before proceeding to KYC Documents');
      return;
    }

    setIsSavingDraft(true);
    setDraftSaveError(null);

    try {
      const savedOrg = await organizationService.create(formData as CreateOrganizationDTO);
      setSavedOrganizationId(savedOrg.id);
      setIsDraftSaved(true);
      
      // Update formData with saved organization details
      setFormData(prev => ({
        ...prev,
        ...savedOrg
      }));
      
      console.log('Organization saved as draft with ID:', savedOrg.id);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      setDraftSaveError(error.message || 'Failed to save organization as draft');
      setCurrentTab(0); // Go back to first tab on error
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSave = async () => {
    // If already saved as draft, update it; otherwise create new
    if (savedOrganizationId && mode === 'create') {
      // Organization already exists, just update it
      setIsSubmitting(true);
      try {
        await organizationService.update(savedOrganizationId, formData as UpdateOrganizationDTO);
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error('Error updating organization:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Normal save flow
      if (!validateForm()) {
        setCurrentTab(0); // Go back to first tab if validation fails
        return;
      }
      
      setIsSubmitting(true);
      try {
        await onSubmit(formData as any);
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getTabIcon = (tabIndex: number): React.ReactElement | undefined => {
    if (tabIndex === 0 || tabIndex === 7) {
      // Required tabs (Basic Info and KYC Documents)
      return tabsCompleted[tabIndex] ? 
        <CheckCircleIcon fontSize="small" color="success" /> : 
        <WarningIcon fontSize="small" color="error" />;
    } else {
      // Optional tabs
      return tabsCompleted[tabIndex] ? 
        <CheckCircleIcon fontSize="small" color="success" /> : 
        undefined;
    }
  };

  const totalTabs = 9;
  const completedTabs = tabsCompleted.filter(Boolean).length;
  const progressPercentage = (completedTabs / totalTabs) * 100;
  const isLastTab = currentTab === totalTabs - 1;

  const handleAddressChange = (addressType: 'registered' | 'business' | 'correspondence') => 
    (addressData: CreateAddressDTO, isValid: boolean) => {
      setFormData(prev => ({
        ...prev,
        [`${addressType}Address`]: addressData
      }));
      setAddressValidation(prev => ({
        ...prev,
        [addressType]: isValid
      }));
      
      // If registered address changed and any "same as" checkbox is checked, copy to those addresses
      if (addressType === 'registered') {
        const updates: any = {};
        if (sameAsRegisteredAddress.business) {
          updates.businessAddress = { ...addressData, typeCode: 2 };
        }
        if (sameAsRegisteredAddress.correspondence) {
          updates.correspondenceAddress = { ...addressData, typeCode: 3 };
        }
        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({ ...prev, ...updates }));
        }
      }
    };

  const handleSameAsRegistered = (addressType: 'business' | 'correspondence') => (checked: boolean) => {
    setSameAsRegisteredAddress(prev => ({ ...prev, [addressType]: checked }));
    if (checked && formData.registeredAddress) {
      const typeCode = addressType === 'business' ? 2 : 3;
      setFormData(prev => ({
        ...prev,
        [`${addressType}Address`]: { ...formData.registeredAddress!, typeCode }
      }));
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tab {currentTab + 1} of {totalTabs}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedTabs} of {totalTabs} completed
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage} 
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Organization form tabs"
        >
          <Tab 
            label="Basic Info *" 
            icon={getTabIcon(0)}
            iconPosition="end"
          />
          <Tab 
            label="Regulatory" 
            icon={getTabIcon(1)}
            iconPosition="end"
          />
          <Tab 
            label="Business Structure" 
            icon={getTabIcon(2)}
            iconPosition="end"
          />
          <Tab 
            label="Registration" 
            icon={getTabIcon(3)}
            iconPosition="end"
          />
          <Tab 
            label="Remittance" 
            icon={getTabIcon(4)}
            iconPosition="end"
          />
          <Tab 
            label="Transactions" 
            icon={getTabIcon(5)}
            iconPosition="end"
          />
          <Tab 
            label="Addresses" 
            icon={getTabIcon(6)}
            iconPosition="end"
          />
          <Tab 
            label="KYC Documents *" 
            icon={getTabIcon(7)}
            iconPosition="end"
          />
          <Tab 
            label="Other" 
            icon={getTabIcon(8)}
            iconPosition="end"
          />
        </Tabs>
      </Box>

      {/* Tab 0: Basic Information */}
      <TabPanel value={currentTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Basic Organization Information
          <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Legal Name - Required */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Legal Name"
              value={formData.legalName}
              onChange={handleChange('legalName')}
              error={!!errors.legalName}
              helperText={errors.legalName || 'Official legal name (max 100 chars)'}
              required
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Business Name - Optional */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange('businessName')}
              helperText="Trading name if different (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Organization Type - Required */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Organization Type"
              value={formData.organisationType}
              onChange={handleChange('organisationType')}
              error={!!errors.organisationType}
              helperText={errors.organisationType || 'Select organization type'}
              required
              disabled={loadingOrgTypes}
            >
              {organizationTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Type of Business Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type of Business Code"
              value={formData.typeOfBusinessCode}
              onChange={handleChange('typeOfBusinessCode')}
              helperText="Business classification code (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* SIC Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SIC Code"
              value={formData.sicCode}
              onChange={handleChange('sicCode')}
              helperText="Standard Industrial Classification (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Registration Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Registration Number"
              value={formData.registrationNumber}
              onChange={handleChange('registrationNumber')}
              helperText="Official registration number (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Incorporation Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Incorporation Date"
              value={formData.incorporationDate}
              onChange={handleChange('incorporationDate')}
              helperText="Date of incorporation"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Country of Incorporation */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country of Incorporation"
              value={formData.countryOfIncorporation}
              onChange={handleChange('countryOfIncorporation')}
              helperText="Country where incorporated (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Website Address */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              value={formData.websiteAddress}
              onChange={handleChange('websiteAddress')}
              error={!!errors.websiteAddress}
              helperText={errors.websiteAddress || 'https://example.com (max 100 chars)'}
              placeholder="https://example.com"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Business Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Description"
              value={formData.businessDescription}
              onChange={handleChange('businessDescription')}
              multiline
              rows={3}
              helperText="Describe the organization's business activities (max 255 chars)"
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Regulatory Information */}
      <TabPanel value={currentTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Regulatory & Compliance Information
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* HMRC MLR Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="HMRC MLR Number"
              value={formData.hmrcMlrNumber}
              onChange={handleChange('hmrcMlrNumber')}
              helperText="HM Revenue & Customs Money Laundering Registration (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* HMRC Expiry Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="HMRC Expiry Date"
              value={formData.hmrcExpiryDate}
              onChange={handleChange('hmrcExpiryDate')}
              helperText="HMRC registration expiry date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* FCA Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="FCA Number"
              value={formData.fcaNumber}
              onChange={handleChange('fcaNumber')}
              helperText="Financial Conduct Authority registration (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* ICO Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ICO Number"
              value={formData.icoNumber}
              onChange={handleChange('icoNumber')}
              helperText="Information Commissioner's Office number (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Business Structure */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h6" gutterBottom>
          Business Structure & Key Personnel
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Number of Branches */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Branches"
              value={formData.numberOfBranches}
              onChange={handleChange('numberOfBranches')}
              helperText="Total number of branches (max 10 chars)"
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          {/* Number of Agents */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Agents"
              value={formData.numberOfAgents}
              onChange={handleChange('numberOfAgents')}
              helperText="Total number of agents (max 10 chars)"
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          {/* MLRO Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="MLRO Details"
              value={formData.mlroDetails}
              onChange={handleChange('mlroDetails')}
              helperText="Money Laundering Reporting Officer (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Compliance Consultant */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Compliance Consultant Details"
              value={formData.complianceConsultantDetails}
              onChange={handleChange('complianceConsultantDetails')}
              helperText="External compliance consultant (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Accountant Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Accountant Details"
              value={formData.accountantDetails}
              onChange={handleChange('accountantDetails')}
              helperText="Accounting firm details (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Technology Service Provider */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Technology Service Provider"
              value={formData.technologyServiceProviderDetails}
              onChange={handleChange('technologyServiceProviderDetails')}
              helperText="IT/Tech service provider (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Payout Partner Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Payout Partner Name"
              value={formData.payoutPartnerName}
              onChange={handleChange('payoutPartnerName')}
              helperText="Payment/payout partner (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Registration Details */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h6" gutterBottom>
          Registration & Licensing Details
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Company Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Number"
              value={formData.companyNumber}
              onChange={handleChange('companyNumber')}
              helperText="Companies House number (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Business License Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business License Number"
              value={formData.businessLicenseNumber}
              onChange={handleChange('businessLicenseNumber')}
              helperText="Business license number (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* SIC Codes */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SIC Codes"
              value={formData.sicCodes}
              onChange={handleChange('sicCodes')}
              helperText="Multiple SIC codes (comma-separated, max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Registration Information */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Registration Information"
              value={formData.registrationInformation}
              onChange={handleChange('registrationInformation')}
              multiline
              rows={3}
              helperText="Additional registration details (max 100 chars)"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Remittance Information */}
      <TabPanel value={currentTab} index={4}>
        <Typography variant="h6" gutterBottom>
          Remittance & Destination Information
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Primary Remittance Destination Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary Remittance Destination Country"
              value={formData.primaryRemittanceDestinationCountry}
              onChange={handleChange('primaryRemittanceDestinationCountry')}
              helperText="Main destination country for remittances (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Secondary Remittance Destination Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Remittance Destination Country"
              value={formData.secondaryRemittanceDestinationCountry}
              onChange={handleChange('secondaryRemittanceDestinationCountry')}
              helperText="Secondary destination country (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Transaction Volume Information */}
      <TabPanel value={currentTab} index={5}>
        <Typography variant="h6" gutterBottom>
          Transaction Volume & Financial Information
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Monthly Turnover Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monthly Turnover Range"
              value={formData.monthlyTurnoverRange}
              onChange={handleChange('monthlyTurnoverRange')}
              helperText="e.g., £10,000-£50,000 (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Number of Incoming Transactions */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Incoming Transactions"
              value={formData.numberOfIncomingTransactions}
              onChange={handleChange('numberOfIncomingTransactions')}
              helperText="Monthly incoming transaction count (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Number of Outgoing Transactions */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Outgoing Transactions"
              value={formData.numberOfOutgoingTransactions}
              onChange={handleChange('numberOfOutgoingTransactions')}
              helperText="Monthly outgoing transaction count (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Value of Incoming Transactions */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Value of Incoming Transactions"
              value={formData.valueOfIncomingTransactions}
              onChange={handleChange('valueOfIncomingTransactions')}
              helperText="Total value of incoming (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Value of Outgoing Transactions */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Value of Outgoing Transactions"
              value={formData.valueOfOutgoingTransactions}
              onChange={handleChange('valueOfOutgoingTransactions')}
              helperText="Total value of outgoing (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Max Value of Incoming Payments */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Value of Incoming Payments"
              value={formData.maxValueOfIncomingPayments}
              onChange={handleChange('maxValueOfIncomingPayments')}
              helperText="Maximum single incoming payment (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Max Value of Outgoing Payments */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Value of Outgoing Payments"
              value={formData.maxValueOfOutgoingPayments}
              onChange={handleChange('maxValueOfOutgoingPayments')}
              helperText="Maximum single outgoing payment (max 50 chars)"
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Product Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Description"
              value={formData.productDescription}
              onChange={handleChange('productDescription')}
              multiline
              rows={3}
              helperText="Description of products/services offered (max 255 chars)"
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 6: Addresses */}
      <TabPanel value={currentTab} index={6}>
        <Typography variant="h6" gutterBottom>
          Organization Addresses
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* Registered Address */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            Registered Address
          </Typography>
          <Grid container spacing={3}>
            <AddressForm
              address={formData.registeredAddress || null}
              onDataChange={handleAddressChange('registered')}
              typeCode={1}
              required={false}
            />
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Business Address */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Business Address
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsRegisteredAddress.business}
                  onChange={(e) => handleSameAsRegistered('business')(e.target.checked)}
                />
              }
              label="Same as registered address"
            />
          </Box>
          {!sameAsRegisteredAddress.business && (
            <Grid container spacing={3}>
              <AddressForm
                address={formData.businessAddress || null}
                onDataChange={handleAddressChange('business')}
                typeCode={2}
                required={false}
              />
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Correspondence Address */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Correspondence Address
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsRegisteredAddress.correspondence}
                  onChange={(e) => handleSameAsRegistered('correspondence')(e.target.checked)}
                />
              }
              label="Same as registered address"
            />
          </Box>
          {!sameAsRegisteredAddress.correspondence && (
            <Grid container spacing={3}>
              <AddressForm
                address={formData.correspondenceAddress || null}
                onDataChange={handleAddressChange('correspondence')}
                typeCode={3}
                required={false}
              />
            </Grid>
          )}
        </Box>
      </TabPanel>

      {/* Tab 7: KYC Documents */}
      <TabPanel value={currentTab} index={7}>
        {/* Draft Save Status */}
        {isSavingDraft && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              💾 Saving organization as draft...
            </Typography>
          </Alert>
        )}
        
        {draftSaveError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Error:</strong> {draftSaveError}
            </Typography>
          </Alert>
        )}
        
        {/* KYC Documents Upload Component */}
        <KYCDocumentsUploadTab
          organizationId={savedOrganizationId}
          onDocumentsChange={(count) => {
            // Update tab completion status based on document count
            setTabsCompleted(prev => {
              const newState = [...prev];
              newState[7] = count > 0;  // Tab complete if at least 1 document uploaded
              return newState;
            });
          }}
          disabled={isSubmitting}
        />
      </TabPanel>

      {/* Tab 8: Other Information */}
      <TabPanel value={currentTab} index={8}>
        <Typography variant="h6" gutterBottom>
          Additional Information
          <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Legacy Identifier */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Legacy Identifier"
              value={formData.legacyIdentifier}
              onChange={handleChange('legacyIdentifier')}
              helperText="Legacy system identifier (max 20 chars)"
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          {/* Owner ID (Read-only) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Owner ID"
              value={formData.ownerId}
              disabled
              helperText="Organization owner (current user)"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Error Summary */}
      {hasErrors && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the errors in the Basic Info tab before submitting.
        </Alert>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Box>
            {currentTab > 0 && (
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            {!isLastTab ? (
              <Button
                variant="contained"
                endIcon={<NavigateNextIcon />}
                onClick={handleNext}
                disabled={(currentTab === 0 && !tabsCompleted[0]) || isSavingDraft}
              >
                {currentTab === 6 && !savedOrganizationId && mode === 'create' ? 'Next (Auto-save)' : 'Next'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!tabsCompleted[0] || !tabsCompleted[7] || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (savedOrganizationId && mode === 'create' ? 'Update Organization' : 'Save Organization')}
              </Button>
            )}
          </Stack>
        </Stack>
        
        {/* Helper Text */}
        <Box sx={{ mt: 2 }}>
          {currentTab === 0 && !tabsCompleted[0] && (
            <Alert severity="warning">
              Please complete the required fields in Basic Info to proceed.
            </Alert>
          )}
          {currentTab === 7 && !tabsCompleted[7] && (
            <Alert severity="warning">
              Please review the KYC documents requirements. This tab is required.
            </Alert>
          )}
          {currentTab !== 0 && currentTab !== 7 && (
            <Alert severity="info" icon={false}>
              <Typography variant="body2">
                This tab is optional. Click <strong>Next</strong> to continue or use the tabs above to navigate.
              </Typography>
            </Alert>
          )}
          {isLastTab && (!tabsCompleted[0] || !tabsCompleted[7]) && (
            <Alert severity="warning">
              <Typography variant="body2">
                Please complete required tabs: Basic Info and KYC Documents before saving.
              </Typography>
            </Alert>
          )}
          {isLastTab && tabsCompleted[0] && tabsCompleted[7] && (
            <Alert severity="success">
              <Typography variant="body2">
                You're on the last tab! Review your information and click <strong>{savedOrganizationId && mode === 'create' ? 'Update Organization' : 'Save Organization'}</strong> when ready.
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OrganizationForm;
