import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Alert
} from '@mui/material';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../../types/organization.types';
import { isRequired, isValidPostalCode } from '../../utils/validators';

interface AddressFormProps {
  address: Address | null;
  organizationId?: number;
  onSubmit: (data: CreateAddressDTO | UpdateAddressDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  organizationId,
  onSubmit,
  mode,
  onValidationChange
}) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with address data in edit mode
  useEffect(() => {
    if (mode === 'edit' && address) {
      setFormData({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'USA'
      });
    }
  }, [address, mode]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Street validation
    if (!isRequired(formData.street)) {
      newErrors.street = 'Street address is required';
    }

    // City validation
    if (!isRequired(formData.city)) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!isRequired(formData.state)) {
      newErrors.state = 'State is required';
    }

    // Postal code validation
    if (!isRequired(formData.postalCode)) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!isValidPostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid postal code';
    }

    // Country validation
    if (!isRequired(formData.country)) {
      newErrors.country = 'Country is required';
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
  }, [formData, onValidationChange]);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Grid container spacing={2}>
      {/* Street */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          value={formData.street}
          onChange={handleChange('street')}
          error={!!errors.street}
          helperText={errors.street}
          required
        />
      </Grid>

      {/* City */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={handleChange('city')}
          error={!!errors.city}
          helperText={errors.city}
          required
        />
      </Grid>

      {/* State */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State"
          value={formData.state}
          onChange={handleChange('state')}
          error={!!errors.state}
          helperText={errors.state}
          required
        />
      </Grid>

      {/* Postal Code */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postal Code"
          value={formData.postalCode}
          onChange={handleChange('postalCode')}
          error={!!errors.postalCode}
          helperText={errors.postalCode}
          required
        />
      </Grid>

      {/* Country */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={formData.country}
          onChange={handleChange('country')}
          error={!!errors.country}
          helperText={errors.country}
          required
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

export default AddressForm;
