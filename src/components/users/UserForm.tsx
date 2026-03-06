import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';
import { GENDER_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';
import { isValidEmail, isValidPhoneNumber, isRequired, isValidAge } from '../../utils/validators';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserDTO | UpdateUserDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: CreateUserDTO | UpdateUserDTO) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, mode, onValidationChange, onDataChange }) => {
  const [formData, setFormData] = useState<CreateUserDTO | UpdateUserDTO>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'MALE',
    ...(mode === 'edit' && user ? { status: user.status } : {}),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        ...(mode === 'edit' ? { status: user.status } : {}),
      });
    }
  }, [user, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }

    if (!isRequired(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }

    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email!)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isRequired(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber!)) {
      newErrors.phoneNumber = 'Invalid phone number (10 digits required)';
    }

    if (!isRequired(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!isValidAge(formData.dateOfBirth!, 18)) {
      newErrors.dateOfBirth = 'User must be at least 18 years old';
    }

    if (!isRequired(formData.gender)) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      // Notify parent of data changes
      if (onDataChange) {
        onDataChange(updated);
      }
      return updated;
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Automatically validate when form data changes
  useEffect(() => {
    if (Object.keys(formData).some(key => formData[key as keyof typeof formData])) {
      validateForm();
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={!!errors.firstName}
          helperText={errors.firstName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={!!errors.lastName}
          helperText={errors.lastName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          placeholder="1234567890"
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Gender"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          error={!!errors.gender}
          helperText={errors.gender}
          required
        >
          {GENDER_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {mode === 'edit' && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            value={(formData as UpdateUserDTO).status || 'ACTIVE'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {Object.keys(errors).length > 0 && (
        <Grid item xs={12}>
          <Alert severity="error">
            Please fix the errors above before submitting.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default UserForm;
