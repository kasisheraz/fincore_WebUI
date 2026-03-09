import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormHelperText,
  Alert
} from '@mui/material';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO, OrganizationStatus, OrganizationType } from '../../types/organization.types';
import { isValidEmail, isValidPhoneNumber, isRequired, isValidURL } from '../../utils/validators';
import { ORGANIZATION_TYPE_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';
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
  onDataChange
}) => {
  const { user } = useAuth(); // Get current user for ownerId
  const [formData, setFormData] = useState({
    legalName: '',
    organisationType: '' as OrganizationType | '',
    registrationNumber: '',
    taxId: '',
    email: '',
    phoneNumber: '',
    website: '',
    description: '',
    statusDescription: 'ACTIVE' as OrganizationStatus,
    ownerId: user?.id || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with organization data in edit mode
  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        legalName: organization.legalName || '',
        organisationType: organization.organisationType || '',
        registrationNumber: organization.registrationNumber || '',
        taxId: organization.taxId || '',
        email: organization.email || '',
        phoneNumber: organization.phoneNumber || '',
        website: organization.website || '',
        description: organization.description || '',
        statusDescription: organization.statusDescription || 'ACTIVE',
        ownerId: organization.ownerId || user?.id || 0
      });
    } else if (user) {
      // Set ownerId for create mode
      setFormData(prev => ({ ...prev, ownerId: user.id }));
    }
  }, [organization, mode, user]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!isRequired(formData.legalName)) {
      newErrors.legalName = 'Organization name is required';
    }

    // Type validation
    if (!isRequired(formData.organisationType)) {
      newErrors.organisationType = 'Organization type is required';
    }

    // Owner ID validation
    if (!formData.ownerId || formData.ownerId === 0) {
      newErrors.ownerId = 'Owner ID is required. Please ensure you are logged in.';
    }

    // Registration number validation
    if (!isRequired(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    // Tax ID validation (optional)
    // if (!isRequired(formData.taxId)) {
    //   newErrors.taxId = 'Tax ID is required';
    // }

    // Email validation
    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!isRequired(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Website validation (optional)
    if (formData.website && !isValidURL(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-validate on form data change
  useEffect(() => {
    const isValid = validateForm();
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    if (onDataChange) {
      onDataChange(formData as any);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Grid container spacing={2}>
      {/* Organization Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Organization Name"
          value={formData.legalName}
          onChange={handleChange('legalName')}
          error={!!errors.legalName}
          helperText={errors.legalName}
          required
        />
      </Grid>

      {/* Organization Type */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Organization Type"
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

      {/* Registration Number */}
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

      {/* Tax ID */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Tax ID"
          value={formData.taxId}
          onChange={handleChange('taxId')}
          error={!!errors.taxId}
          helperText={errors.taxId}
          required
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
      </Grid>

      {/* Phone Number */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange('phoneNumber')}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || 'Enter 10-digit phone number'}
          required
        />
      </Grid>

      {/* Website */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Website"
          value={formData.website}
          onChange={handleChange('website')}
          error={!!errors.website}
          helperText={errors.website || 'Optional'}
        />
      </Grid>

      {/* Status (only in edit mode) */}
      {mode === 'edit' && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.statusDescription}
            onChange={handleChange('statusDescription')}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* Description */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          multiline
          rows={3}
          helperText="Optional"
        />
      </Grid>

      {/* Error Summary */}
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
