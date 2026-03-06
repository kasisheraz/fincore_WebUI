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
  const [formData, setFormData] = useState({
    name: '',
    type: '' as OrganizationType | '',
    registrationNumber: '',
    taxId: '',
    email: '',
    phoneNumber: '',
    website: '',
    description: '',
    status: 'ACTIVE' as OrganizationStatus
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with organization data in edit mode
  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        name: organization.name || '',
        type: organization.type || '',
        registrationNumber: organization.registrationNumber || '',
        taxId: organization.taxId || '',
        email: organization.email || '',
        phoneNumber: organization.phoneNumber || '',
        website: organization.website || '',
        description: organization.description || '',
        status: organization.status || 'ACTIVE'
      });
    }
  }, [organization, mode]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!isRequired(formData.name)) {
      newErrors.name = 'Organization name is required';
    }

    // Type validation
    if (!isRequired(formData.type)) {
      newErrors.type = 'Organization type is required';
    }

    // Registration number validation
    if (!isRequired(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    // Tax ID validation
    if (!isRequired(formData.taxId)) {
      newErrors.taxId = 'Tax ID is required';
    }

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
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          required
        />
      </Grid>

      {/* Organization Type */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Organization Type"
          value={formData.type}
          onChange={handleChange('type')}
          error={!!errors.type}
          helperText={errors.type}
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
            value={formData.status}
            onChange={handleChange('status')}
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
