import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import { CreateAddressDTO } from '../../types/organization.types';
import { isRequired } from '../../utils/validators';

interface AddressFormProps {
  address?: CreateAddressDTO | null;
  onDataChange?: (data: CreateAddressDTO, isValid: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  typeCode?: number; // Optional: pre-set address type
  title?: string; // Optional: section title
  required?: boolean; // Whether address is required
}

const ADDRESS_TYPE_OPTIONS = [
  { label: 'Registered Address', value: 1 },
  { label: 'Business Address', value: 2 },
  { label: 'Correspondence Address', value: 3 },
  { label: 'Residential Address', value: 4 },
  { label: 'Postal Address', value: 5 },
];

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onDataChange,
  onValidationChange,
  typeCode,
  title,
  required = false,
}) => {
  const [formData, setFormData] = useState<CreateAddressDTO>({
    typeCode: typeCode || address?.typeCode || 1,
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    stateCode: address?.stateCode || '',
    postalCode: address?.postalCode || '',
    country: address?.country || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        typeCode: typeCode || address.typeCode || 1,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        stateCode: address.stateCode || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
      });
    }
  }, [address, typeCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // If not required and all fields are empty, consider it valid
    if (!required && !formData.addressLine1 && !formData.country) {
      setErrors(newErrors);
      return true;
    }

    // If any field is filled or form is required, validate required fields
    if (required || formData.addressLine1 || formData.country) {
      if (!isRequired(formData.addressLine1)) {
        newErrors.addressLine1 = 'Address line 1 is required';
      }

      if (!isRequired(formData.country)) {
        newErrors.country = 'Country is required';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (onValidationChange) {
      onValidationChange(isValid);
    }

    return isValid;
  };

  const handleChange = (field: keyof CreateAddressDTO, value: any) => {
    const updated = {
      ...formData,
      [field]: value,
    };
    setFormData(updated);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }

    // Notify parent of changes
    if (onDataChange) {
      const isValid = validateForm();
      onDataChange(updated, isValid);
    }
  };

  // Automatically validate when form data changes
  useEffect(() => {
    validateForm();
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {title && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {title}
          </Typography>
        </Grid>
      )}

      {!typeCode && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Address Type"
            value={formData.typeCode}
            onChange={(e) => handleChange('typeCode', Number(e.target.value))}
            required={required}
          >
            {ADDRESS_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      <Grid item xs={12} sm={typeCode ? 12 : 6}>
        <TextField
          fullWidth
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          error={!!errors.addressLine1}
          helperText={errors.addressLine1}
          required={required}
          placeholder="Street address, P.O. box, company name"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address Line 2"
          value={formData.addressLine2}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State/Province Code"
          value={formData.stateCode}
          onChange={(e) => handleChange('stateCode', e.target.value)}
          placeholder="e.g., CA, NY, TX"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postal Code"
          value={formData.postalCode}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          placeholder="ZIP or postal code"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          error={!!errors.country}
          helperText={errors.country}
          required={required}
          placeholder="e.g., United States, Canada, UK"
        />
      </Grid>
    </>
  );
};

export default AddressForm;
