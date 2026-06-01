import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import KYCDocumentsUploadTab from '../../components/organizations/KYCDocumentsUploadTab';
import beneficiaryService from '../../services/beneficiaryService';
import { Beneficiary } from '../../types/beneficiary.types';
import { Status } from '../../types/common.types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

/**
 * Beneficiary Details Page - View and manage a specific beneficiary.
 * 
 * Features:
 * - View beneficiary details
 * - Upload/manage KYC documents
 * - Submit for review (when all documents uploaded)
 * - Edit beneficiary (if PENDING status)
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
const BeneficiaryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'COMPLIANCE_OFFICER';

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadBeneficiary(parseInt(id));
    }
  }, [id]);

  const loadBeneficiary = async (beneficiaryId: number) => {
    try {
      setLoading(true);
      const data = await beneficiaryService.getById(beneficiaryId);
      setBeneficiary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (beneficiary && beneficiary.canBeEdited) {
      navigate(`/beneficiaries/edit/${beneficiary.id}`);
    }
  };

  const handleSubmit = async () => {
    if (!beneficiary) return;

    try {
      setSubmitting(true);
      await beneficiaryService.submitForReview(beneficiary.id);
      // Reload to get updated status
      await loadBeneficiary(beneficiary.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit beneficiary for review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !beneficiary) {
    return (
      <Box>
        <PageHeader 
          title="Beneficiary Details" 
          showButton={true}
          buttonText="Back to List"
          onButtonClick={() => navigate('/beneficiaries')}
        />
        <Alert severity="error">{error || 'Beneficiary not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4">{beneficiary.beneficiaryName}</Typography>
          {beneficiary.nickName && (
            <Typography variant="body2" color="text.secondary">({beneficiary.nickName})</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/beneficiaries')}>
            Back to List
          </Button>
          {beneficiary.canBeEdited && !isAdmin && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {beneficiary.status === 'PENDING' && beneficiary.canBeSubmitted && !isAdmin && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Banner */}
      {beneficiary.status !== 'ACTIVE' && (
        <Alert
          severity={
            beneficiary.status === 'PENDING' ? 'info' :
            beneficiary.status === 'UNDER_REVIEW' ? 'warning' :
            beneficiary.status === 'REJECTED' ? 'error' : 'warning'
          }
          sx={{ mb: 3 }}
        >
          {beneficiary.status === 'PENDING' && 'Complete the KYC document upload and submit for review'}
          {beneficiary.status === 'UNDER_REVIEW' && 'Your beneficiary is under admin review. You will be notified once approved.'}
          {beneficiary.status === 'REJECTED' && `Rejected: ${beneficiary.reasonDescription || 'No reason provided'}`}
          {beneficiary.status === 'SUSPENDED' && `Suspended: ${beneficiary.reasonDescription || 'No reason provided'}`}
        </Alert>
      )}

      {/* Basic Information Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Beneficiary Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {beneficiary.beneficiaryName}
                  </Typography>
                </Grid>

                {beneficiary.nickName && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Nick Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {beneficiary.nickName}
                    </Typography>
                  </Grid>
                )}

                {beneficiary.businessName && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Business Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {beneficiary.businessName}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Country
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={<LocationOnIcon />}
                      label={beneficiary.country}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={beneficiary.status as Status} />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Collection Method
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {beneficiary.isCounterOverCounter ? (
                      <Chip
                        icon={<AttachMoneyIcon />}
                        label="Counter Over Counter"
                        size="small"
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2">Standard Transfer</Typography>
                    )}
                  </Box>
                </Grid>

                {beneficiary.isCounterOverCounter && beneficiary.collectorContactNumber && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Collector Contact Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {beneficiary.collectorContactNumber}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registered Address
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {beneficiary.registeredAddress ? (
                <Box>
                  <Typography variant="body2">
                    {beneficiary.registeredAddress.addressLine1}
                  </Typography>
                  {beneficiary.registeredAddress.addressLine2 && (
                    <Typography variant="body2">
                      {beneficiary.registeredAddress.addressLine2}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {[
                      beneficiary.registeredAddress.city,
                      beneficiary.registeredAddress.stateCode,
                      beneficiary.registeredAddress.postalCode
                    ].filter(Boolean).join(', ')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {beneficiary.registeredAddress.country}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No address available
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Audit Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(beneficiary.createdDatetime)}
                  </Typography>
                  {beneficiary.createdByName && (
                    <Typography variant="caption" color="text.secondary">
                      by {beneficiary.createdByName}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(beneficiary.lastModifiedDatetime)}
                  </Typography>
                  {beneficiary.lastModifiedByName && (
                    <Typography variant="caption" color="text.secondary">
                      by {beneficiary.lastModifiedByName}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KYC Documents Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          KYC Documents
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Required Documents:</strong>
          </Typography>
          <ul style={{ marginTop: '8px', marginBottom: 0 }}>
            <li>Client Authorisation Letter</li>
            <li>Beneficiary Company KYC</li>
            <li>Beneficiary Agreement</li>
            {beneficiary.isCounterOverCounter && <li>Collector Identification (Required for C2C)</li>}
            <li>Optional Documentation (Optional)</li>
          </ul>
        </Alert>

        {/* Reuse the KYC Documents Upload component with beneficiary context */}
        <KYCDocumentsUploadTab
          referenceId={beneficiary.id}
          referenceType="BENEFICIARY"
          onDocumentsChange={() => loadBeneficiary(beneficiary.id)}
          readonly={beneficiary.status !== 'PENDING' && !isAdmin}
        />
      </Paper>
    </Box>
  );
};

export default BeneficiaryDetailsPage;
