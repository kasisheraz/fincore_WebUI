import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Alert,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../../types/organization.types';
import { isRequired, isValidPostalCode } from '../../utils/validators';

interface AddressFormProps {
  address: Address | null;
  userId?: number;
  onSubmit: (data: CreateAddressDTO | UpdateAddressDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
}

const ADDRESS_TYPE_OPTIONS = [
  { value: 1, label: 'Home' },
  { value: 2, label: 'Work' },
  { value: 3, label: 'Billing' },
  { value: 4, label: 'Shipping' },
];

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  userId,
  onSubmit,
  mode,
  onValidationChange
}) => {
  const [formData, setFormData] = useState({
    userId: userId || 0,
    typeCode: 1,
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'USA',
    isPrimary: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with address data in edit mode
  useEffect(() => {
    if (mode === 'edit' && address) {
      setFormData({
        userId: address.userId || userId || 0,
        typeCode: address.typeCode || 1,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        stateProvince: address.stateProvince || '',
        postalCode: address.postalCode || '',
        country: address.country || 'USA',
        isPrimary: address.isPrimary || false
      });
    } else if (userId) {
      setFormData(prev => ({ ...prev, userId }));
    }
  }, [address, mode, userId]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Address Line 1 validation
    if (!isRequired(formData.addressLine1)) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    // City validation
    if (!isRequired(formData.city)) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!isRequired(formData.stateProvince)) {
      newErrors.stateProvince = 'State/Province is required';
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
    const value = field === 'typeCode' ? Number(event.target.value) : 
                   field === 'isPrimary' ? (event.target as HTMLInputElement).checked :
                   event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Grid container spacing={2}>
      {/* Address Type */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Address Type"
          value={formData.typeCode}
          onChange={handleChange('typeCode')}
          required
        >
          {ADDRESS_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Primary Address Checkbox */}
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isPrimary}
              onChange={handleChange('isPrimary')}
            />
          }
          label="Primary Address"
        />
      </Grid>

      {/* Address Line 1 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={handleChange('addressLine1')}
          error={!!errors.addressLine1}
          helperText={errors.addressLine1}
          required
        />
      </Grid>

      {/* Address Line 2 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address Line 2 (Optional)"
          value={formData.addressLine2}
          onChange={handleChange('addressLine2')}
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

      {/* State/Province */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State/Province"
          value={formData.stateProvince}
          onChange={handleChange('stateProvince')}
          error={!!errors.stateProvince}
          helperText={errors.stateProvince}
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
