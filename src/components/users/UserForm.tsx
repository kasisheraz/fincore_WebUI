import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Box,
} from '@mui/material';
import { User, CreateUserDTO, UpdateUserDTO, Address } from '../../types/user.types';
import { STATUS_OPTIONS, CREATABLE_ROLES, USER_ROLES } from '../../utils/constants';
import { isValidEmail, isValidPhoneNumber, isRequired, isValidAge } from '../../utils/validators';
import AddressForm from '../common/AddressForm';

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
    middleName: user?.middleName || '',
    lastName: user?.lastName ||'',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    residentialAddress: user?.residentialAddress,
    postalAddress: user?.postalAddress,
    ...(mode === 'create' ? { role: user?.role || '' } : {}), // Role must be selected
    ...(mode === 'edit' && user ? { statusDescription: user.statusDescription } : {}),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sameAsResidential, setSameAsResidential] = useState(false);
  const [addressValidation, setAddressValidation] = useState({
    residential: true,
    postal: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        residentialAddress: user.residentialAddress,
        postalAddress: user.postalAddress,
        ...(mode === 'create' ? { role: user.role || '' } : {}),
        ...(mode === 'edit' ? { statusDescription: user.statusDescription } : {}),
      });
      
      // Check if addresses are the same
      if (user.residentialAddress && user.postalAddress) {
        const isSame = 
          user.residentialAddress.addressLine1 === user.postalAddress.addressLine1 &&
          user.residentialAddress.city === user.postalAddress.city &&
          user.residentialAddress.country === user.postalAddress.country;
        setSameAsResidential(isSame);
      }
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

    // Validate role is selected (only for create mode)
    if (mode === 'create' && !isRequired((formData as CreateUserDTO).role)) {
      newErrors.role = 'Role is required';
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
  
  const handleAddressChange = (addressType: 'residential' | 'postal') => 
    (addressData: Address, isValid: boolean) => {
      setFormData(prev => ({
        ...prev,
        [`${addressType}Address`]: addressData
      }));
      setAddressValidation(prev => ({
        ...prev,
        [addressType]: isValid
      }));
      
      // If residential address changed and "same as" is checked, copy to postal
      if (addressType === 'residential' && sameAsResidential) {
        setFormData(prev => ({
          ...prev,
          postalAddress: { ...addressData, typeCode: 5 } // Postal type code
        }));
      }
    };
  
  const handleSameAsResidential = (checked: boolean) => {
    setSameAsResidential(checked);
    if (checked && formData.residentialAddress) {
      // Copy residential to postal with postal type code
      setFormData(prev => ({
        ...prev,
        postalAddress: { ...prev.residentialAddress!, typeCode: 5 }
      }));
    }
  };

  // Automatically validate when form data changes
  useEffect(() => {
    if (Object.keys(formData).some(key => formData[key as keyof typeof formData])) {
      const basicFormValid = validateForm();
      // Addresses are optional, so only validate if they exist
      const addressesValid = 
        (!formData.residentialAddress || addressValidation.residential) &&
        (!formData.postalAddress || addressValidation.postal);
      
      const isFormValid = basicFormValid && addressesValid;
      if (onValidationChange) {
        onValidationChange(isFormValid);
      }
    }
  }, [formData, addressValidation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={3}>
      {/* Row 1: Basic Name Information */}
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

      {/* Row 2: Middle Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Middle Name"
          value={formData.middleName || ''}
          onChange={(e) => handleChange('middleName', e.target.value)}
          helperText="Optional (max 100 chars)"
          inputProps={{ maxLength: 100 }}
        />
      </Grid>

      {/* Row 3: Contact Information */}
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

      {/* Row 4: Date of Birth and Role/Status */}
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
            value={(formData as UpdateUserDTO).statusDescription || 'ACTIVE'}
            onChange={(e) => handleChange('statusDescription', e.target.value)}
            helperText="Current user status"
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* Row 5: Residential Address */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Residential Address
        </Typography>
      </Grid>
      
      <AddressForm
        address={formData.residentialAddress}
        typeCode={1} // Residential
        onDataChange={(data, valid) => handleAddressChange('residential')(data, valid)}
        required={false}
      />

      {/* Row 6: Postal Address */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Postal Address
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={sameAsResidential}
                onChange={(e) => handleSameAsResidential(e.target.checked)}
              />
            }
            label="Same as residential address"
          />
        </Box>
      </Grid>
      
      {!sameAsResidential && (
        <AddressForm
          address={formData.postalAddress}
          typeCode={5} // Postal
          onDataChange={(data, valid) => handleAddressChange('postal')(data, valid)}
          required={false}
        />
      )}

      {/* Validation Error Alert */}
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
