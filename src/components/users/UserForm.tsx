import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';
import { STATUS_OPTIONS, CREATABLE_ROLES, USER_ROLES } from '../../utils/constants';
import { isValidEmail, isValidPhoneNumber, isRequired } from '../../utils/validators';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserDTO | UpdateUserDTO) => Promise<void>;
  mode: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: CreateUserDTO | UpdateUserDTO) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, mode, onValidationChange, onDataChange }) => {
  const [formData, setFormData] = useState<CreateUserDTO | UpdateUserDTO>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    ...(mode === 'create' ? { role: USER_ROLES.USER } : {}),
    ...(mode === 'edit' && user ? { status: user.status } : {}),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        ...(mode === 'create' ? { role: USER_ROLES.USER } : {}),
        ...(mode === 'edit' ? { status: user.status } : {}),
      });
    }
  }, [user, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired((formData as any).fullName)) {
      newErrors.fullName = 'Full name is required';
    }

    if (!isRequired((formData as any).email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail((formData as any).email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isRequired((formData as any).phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber((formData as any).phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10 digits required)';
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
      const updated = { ...prev, [field]: value };
      if (onDataChange) {
        onDataChange(updated);
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    validateForm();
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Full Name"
          value={(formData as any).fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={!!errors.fullName}
          helperText={errors.fullName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={(formData as any).email || ''}
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
          value={(formData as any).phoneNumber || ''}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          placeholder="+441234567890"
          required
        />
      </Grid>

      {mode === 'create' && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Role"
            value={(formData as CreateUserDTO).role || USER_ROLES.USER}
            onChange={(e) => handleChange('role', e.target.value)}
            helperText="User role determines access permissions"
            required
          >
            {CREATABLE_ROLES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

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
