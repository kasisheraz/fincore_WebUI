import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AddressForm from '../../components/common/AddressForm';
import beneficiaryService from '../../services/beneficiaryService';
import addressService from '../../services/addressService';
import { Beneficiary, CreateBeneficiaryDTO, UpdateBeneficiaryDTO } from '../../types/beneficiary.types';
import { Address, CreateAddressDTO } from '../../types/organization.types';

/**
 * Beneficiary Form - Create or Edit a beneficiary.
 * 
 * Features:
 * - Create new beneficiary
 * - Edit existing beneficiary (if PENDING status)
 * - C2C validation (Collector Contact Number required if C2C enabled)
 * - Address management
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
const BeneficiaryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<CreateBeneficiaryDTO>({
    beneficiaryName: '',
    nickName: '',
    businessName: '',
    country: '',
    registeredAddressId: 0,
    isCounterOverCounter: false,
    collectorContactNumber: ''
  });

  const [addressData, setAddressData] = useState<CreateAddressDTO>({
    typeCode: 1, // Registered Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateCode: '',
    postalCode: '',
    country: ''
  });

  const [existingBeneficiary, setExistingBeneficiary] = useState<Beneficiary | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressSaved, setAddressSaved] = useState(false);

  // Load existing beneficiary (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      loadBeneficiary(parseInt(id));
    }
  }, [id, isEditMode]);

  const loadBeneficiary = async (beneficiaryId: number) => {
    try {
      setIsPageLoading(true);
      const data = await beneficiaryService.getById(beneficiaryId);
      setExistingBeneficiary(data);

      // Populate form
      setFormData({
        beneficiaryName: data.beneficiaryName,
        nickName: data.nickName || '',
        businessName: data.businessName || '',
        country: data.country,
        registeredAddressId: data.registeredAddress?.id || 0,
        isCounterOverCounter: data.isCounterOverCounter,
        collectorContactNumber: data.collectorContactNumber || ''
      });

      // Populate address if exists
      if (data.registeredAddress) {
        setAddressData({
          typeCode: data.registeredAddress.typeCode,
          addressLine1: data.registeredAddress.addressLine1,
          addressLine2: data.registeredAddress.addressLine2 || '',
          city: data.registeredAddress.city || '',
          stateCode: data.registeredAddress.stateCode || '',
          postalCode: data.registeredAddress.postalCode || '',
          country: data.registeredAddress.country
        });
        setAddressSaved(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load beneficiary');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleAddressDataChange = useCallback((data: CreateAddressDTO) => {
    setAddressData((prev) => {
      const hasChanged =
        prev.typeCode !== data.typeCode ||
        prev.addressLine1 !== data.addressLine1 ||
        prev.addressLine2 !== data.addressLine2 ||
        prev.city !== data.city ||
        prev.stateCode !== data.stateCode ||
        prev.postalCode !== data.postalCode ||
        prev.country !== data.country;

      if (!hasChanged) {
        return prev;
      }

      setAddressSaved(false);
      return data;
    });
  }, []);

  // Handle form field changes
  const handleChange = (field: keyof CreateBeneficiaryDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Handle address save
  const handleSaveAddress = async () => {
    try {
      setIsAddressSaving(true);
      let savedAddress: Address;

      if (isEditMode && existingBeneficiary?.registeredAddress?.id) {
        // Update existing address
        savedAddress = await addressService.update(existingBeneficiary.registeredAddress.id, addressData);
      } else {
        // Create new address (userIdentifier taken from security context on backend)
        savedAddress = await addressService.create(addressData);
      }

      setFormData(prev => ({ ...prev, registeredAddressId: savedAddress.id }));
      setAddressSaved(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsAddressSaving(false);
    }
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.beneficiaryName.trim()) {
      return 'Beneficiary name is required';
    }
    if (!formData.country.trim()) {
      return 'Country is required';
    }
    if (!addressSaved || formData.registeredAddressId === 0) {
      return 'Please save the address before submitting';
    }
    if (formData.isCounterOverCounter && !formData.collectorContactNumber?.trim()) {
      return 'Collector Contact Number is required when Counter Over Counter is enabled';
    }
    return null;
  };

  // Handle submit
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && id) {
        await beneficiaryService.update(parseInt(id), formData as UpdateBeneficiaryDTO);
      } else {
        await beneficiaryService.create(formData);
      }
      navigate('/beneficiaries');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save beneficiary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isPageLoading || isAddressSaving || isSubmitting;

  return (
    <Box>
      <PageHeader
        title={isEditMode ? 'Edit Beneficiary' : 'Create Beneficiary'}
        showButton={true}
        buttonText="Back to List"
        onButtonClick={() => navigate('/beneficiaries')}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Beneficiary Name"
              value={formData.beneficiaryName}
              onChange={(e) => handleChange('beneficiaryName', e.target.value)}
              helperText="Full legal name of the beneficiary institution"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nick Name"
              value={formData.nickName}
              onChange={(e) => handleChange('nickName', e.target.value)}
              helperText="Friendly/short name for easy identification"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              helperText="Business trading name (if different)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              helperText="Beneficiary's country of operation"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Counter Over Counter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Collection Method
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isCounterOverCounter}
                  onChange={(e) => handleChange('isCounterOverCounter', e.target.checked)}
                />
              }
              label="Counter Over Counter (C2C) Collection"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Enable if this beneficiary requires physical collection of funds
            </Typography>
          </Grid>

          {formData.isCounterOverCounter && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Collector Contact Number"
                value={formData.collectorContactNumber}
                onChange={(e) => handleChange('collectorContactNumber', e.target.value)}
                helperText="Phone number for the collector (required for C2C)"
                placeholder="+44 20 1234 5678"
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Registered Address */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Registered Address
          </Typography>
          {addressSaved && (
            <Typography variant="body2" color="success.main">
              ✓ Address Saved
            </Typography>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />

        <AddressForm
          address={addressData}
          onDataChange={(data) => handleAddressDataChange(data)}
          typeCode={1}
          required={true}
        />

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleSaveAddress}
            disabled={isBusy}
          >
            {isAddressSaving ? 'Saving Address...' : addressSaved ? 'Update Address' : 'Save Address'}
          </Button>
        </Box>
      </Paper>

      {/* Form Actions */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/beneficiaries')}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={isBusy || !addressSaved}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Beneficiary' : 'Create Beneficiary'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BeneficiaryForm;
