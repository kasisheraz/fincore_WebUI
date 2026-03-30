import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO, OrganizationStatus, OrganizationType } from '../../types/organization.types';
import { isRequired } from '../../utils/validators';
import { ORGANIZATION_TYPE_OPTIONS, ORGANIZATION_STATUS_OPTIONS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

interface OrganizationFormProps {
  organization: Organization | null;
  onSubmit: (data: CreateOrganizationDTO | UpdateOrganizationDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: CreateOrganizationDTO | UpdateOrganizationDTO) => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  onSubmit,
  mode,
  onValidationChange,
  onDataChange,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ownerId: user?.id || 0,
    legalName: '',
    businessName: '',
    registrationNumber: '',
    companyNumber: '',
    organisationType: '' as OrganizationType | '',
    sicCode: '',
    incorporationDate: '',
    countryOfIncorporation: 'GB',
    status: 'PENDING' as OrganizationStatus,
    businessDescription: '',
    websiteAddress: '',
    fcaNumber: '',
    hmrcMlrNumber: '',
    numberOfBranches: '' as number | '',
    numberOfAgents: '' as number | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        ownerId: user?.id || 0,
        legalName: organization.legalName || '',
        businessName: organization.businessName || '',
        registrationNumber: organization.registrationNumber || '',
        companyNumber: organization.companyNumber || '',
        organisationType: organization.organisationType || '',
        sicCode: organization.sicCode || '',
        incorporationDate: organization.incorporationDate || '',
        countryOfIncorporation: organization.countryOfIncorporation || 'GB',
        status: organization.status || 'PENDING',
        businessDescription: organization.businessDescription || '',
        websiteAddress: organization.websiteAddress || '',
        fcaNumber: organization.fcaNumber || '',
        hmrcMlrNumber: organization.hmrcMlrNumber || '',
        numberOfBranches: organization.numberOfBranches ?? '',
        numberOfAgents: organization.numberOfAgents ?? '',
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, ownerId: user.id }));
    }
  }, [organization, mode, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.legalName)) {
      newErrors.legalName = 'Legal name is required';
    }
    if (!isRequired(formData.organisationType)) {
      newErrors.organisationType = 'Organisation type is required';
    }
    if (!isRequired(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!isRequired(formData.incorporationDate)) {
      newErrors.incorporationDate = 'Incorporation date is required';
    }
    if (!isRequired(formData.countryOfIncorporation)) {
      newErrors.countryOfIncorporation = 'Country of incorporation is required';
    }
    if (!formData.ownerId || formData.ownerId === 0) {
      newErrors.ownerId = 'Owner ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const isValid = validateForm();
    if (onValidationChange) onValidationChange(isValid);
    if (onDataChange) onDataChange(formData as any);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Legal Name"
          value={formData.legalName}
          onChange={handleChange('legalName')}
          error={!!errors.legalName}
          helperText={errors.legalName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Business Name"
          value={formData.businessName}
          onChange={handleChange('businessName')}
          helperText="Trading name (optional)"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Organisation Type"
          value={formData.organisationType}
          onChange={handleChange('organisationType')}
          error={!!errors.organisationType}
          helperText={errors.organisationType}
          required
        >
          {ORGANIZATION_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Registration Number"
          value={formData.registrationNumber}
          onChange={handleChange('registrationNumber')}
          error={!!errors.registrationNumber}
          helperText={errors.registrationNumber}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Company Number"
          value={formData.companyNumber}
          onChange={handleChange('companyNumber')}
          helperText="Companies House number (optional)"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="SIC Code"
          value={formData.sicCode}
          onChange={handleChange('sicCode')}
          helperText="Standard Industrial Classification (optional)"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Incorporation Date"
          type="date"
          value={formData.incorporationDate}
          onChange={handleChange('incorporationDate')}
          error={!!errors.incorporationDate}
          helperText={errors.incorporationDate}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country of Incorporation"
          value={formData.countryOfIncorporation}
          onChange={handleChange('countryOfIncorporation')}
          error={!!errors.countryOfIncorporation}
          helperText={errors.countryOfIncorporation}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="FCA Number"
          value={formData.fcaNumber}
          onChange={handleChange('fcaNumber')}
          helperText="Optional"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="HMRC MLR Number"
          value={formData.hmrcMlrNumber}
          onChange={handleChange('hmrcMlrNumber')}
          helperText="Optional"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Number of Branches"
          type="number"
          value={formData.numberOfBranches}
          onChange={handleChange('numberOfBranches')}
          inputProps={{ min: 0 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Number of Agents"
          type="number"
          value={formData.numberOfAgents}
          onChange={handleChange('numberOfAgents')}
          inputProps={{ min: 0 }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Website"
          value={formData.websiteAddress}
          onChange={handleChange('websiteAddress')}
          placeholder="https://www.example.com"
          helperText="Optional"
        />
      </Grid>

      {mode === 'edit' && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={handleChange('status')}
          >
            {ORGANIZATION_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Business Description"
          value={formData.businessDescription}
          onChange={handleChange('businessDescription')}
          multiline
          rows={3}
          helperText="Optional"
        />
      </Grid>

      {hasErrors && (
        <Grid item xs={12}>
          <Alert severity="error">
            Please fix the errors above before submitting.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default OrganizationForm;
