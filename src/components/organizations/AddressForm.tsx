import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Alert,
  MenuItem,
} from '@mui/material';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../../types/organization.types';
import { isRequired } from '../../utils/validators';

interface AddressFormProps {
  address: Address | null;
  onSubmit: (data: CreateAddressDTO | UpdateAddressDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: CreateAddressDTO | UpdateAddressDTO) => void;
}

const ADDRESS_TYPE_OPTIONS = [
  { value: 1, label: 'Residential' },
  { value: 2, label: 'Business' },
  { value: 3, label: 'Registered' },
  { value: 4, label: 'Correspondence' },
  { value: 5, label: 'Postal' },
];

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  mode,
  onValidationChange,
  onDataChange,
}) => {
  const [formData, setFormData] = useState<CreateAddressDTO>({
    typeCode: 3,
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateCode: '',
    postalCode: '',
    country: 'GB',
    statusDescription: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && address) {
      setFormData({
        typeCode: address.typeCode || 3,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        stateCode: address.stateCode || '',
        postalCode: address.postalCode || '',
        country: address.country || 'GB',
        statusDescription: address.statusDescription || 'ACTIVE',
      });
    }
  }, [address, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.addressLine1)) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }
    if (!isRequired(formData.city)) {
      newErrors.city = 'City is required';
    }
    if (!isRequired(formData.postalCode)) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!isRequired(formData.country)) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (onValidationChange) onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    const isValid = validateForm();
    if (onDataChange) onDataChange(formData);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'typeCode' ? Number(event.target.value) : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Grid container spacing={2}>
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

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address Line 2 (Optional)"
          value={formData.addressLine2}
          onChange={handleChange('addressLine2')}
        />
      </Grid>

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

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State/County Code"
          value={formData.stateCode}
          onChange={handleChange('stateCode')}
          placeholder="e.g. ENG"
        />
      </Grid>

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
