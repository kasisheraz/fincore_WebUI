import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusChip from '../../components/common/StatusChip';
import beneficiaryService from '../../services/beneficiaryService';
import { Beneficiary, BeneficiaryStatus } from '../../types/beneficiary.types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

/**
 * Beneficiaries Page - Main list view for managing beneficiaries.
 * 
 * Features:
 * - Create/Edit/Delete beneficiaries
 * - Search and filter by status/country
 * - Submit for admin review
 * - Admin approval/rejection workflow
 * - 20-beneficiary limit display
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
const BeneficiariesPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'COMPLIANCE_OFFICER';

  // State management
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BeneficiaryStatus | ''>('');
  const [countInfo, setCountInfo] = useState({ count: 0, limit: 20, remaining: 20, canCreateMore: true });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectAction, setRejectAction] = useState<'reject' | 'suspend'>('reject');

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch beneficiaries
  const fetchBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);
      
      let data: Beneficiary[];
      if (searchQuery) {
        data = isAdmin 
          ? await beneficiaryService.adminSearch(searchQuery)
          : await beneficiaryService.search(searchQuery);
      } else if (statusFilter) {
        data = await beneficiaryService.getAll(statusFilter as BeneficiaryStatus);
      } else {
        data = isAdmin 
          ? await beneficiaryService.getAllAdmin()
          : await beneficiaryService.getAll();
      }
      
      setBeneficiaries(data);
    } catch (error: any) {
      console.error('Failed to fetch beneficiaries:', error);
      showSnackbar(error.response?.data?.message || 'Failed to load beneficiaries', 'error');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, isAdmin]);

  // Fetch count info (for business users)
  const fetchCountInfo = useCallback(async () => {
    if (!isAdmin) {
      try {
        const info = await beneficiaryService.getCount();
        setCountInfo(info);
      } catch (error) {
        console.error('Failed to fetch count info:', error);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchBeneficiaries();
    fetchCountInfo();
  }, [fetchBeneficiaries, fetchCountInfo]);

  // Snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle create
  const handleCreate = () => {
    if (!countInfo.canCreateMore && !isAdmin) {
      showSnackbar(`Maximum beneficiary limit reached (${countInfo.limit}). Please delete existing beneficiaries to add more.`, 'warning');
      return;
    }
    navigate('/beneficiaries/create');
  };

  // Handle edit
  const handleEdit = (beneficiary: Beneficiary) => {
    if (!beneficiary.canBeEdited && !isAdmin) {
      showSnackbar('Cannot edit beneficiary. Only beneficiaries with PENDING status can be edited.', 'warning');
      return;
    }
    navigate(`/beneficiaries/edit/${beneficiary.id}`);
  };

  // Handle delete
  const handleDelete = (beneficiary: Beneficiary) => {
    if (!beneficiary.canBeEdited) {
      showSnackbar('Cannot delete beneficiary. Only beneficiaries with PENDING status can be deleted.', 'warning');
      return;
    }
    setSelectedBeneficiary(beneficiary);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBeneficiary) return;

    try {
      await beneficiaryService.delete(selectedBeneficiary.id);
      showSnackbar('Beneficiary deleted successfully', 'success');
      fetchBeneficiaries();
      fetchCountInfo();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete beneficiary', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBeneficiary(null);
    }
  };

  // Handle submit for review
  const handleSubmit = async (beneficiary: Beneficiary) => {
    if (!beneficiary.canBeSubmitted) {
      showSnackbar('Cannot submit beneficiary. Please ensure all required documents are uploaded.', 'warning');
      return;
    }

    try {
      await beneficiaryService.submitForReview(beneficiary.id);
      showSnackbar('Beneficiary submitted for review successfully', 'success');
      fetchBeneficiaries();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to submit beneficiary', 'error');
    }
  };

  // Handle approve (admin)
  const handleApprove = async (beneficiary: Beneficiary) => {
    try {
      await beneficiaryService.approve(beneficiary.id);
      showSnackbar('Beneficiary approved successfully', 'success');
      fetchBeneficiaries();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to approve beneficiary', 'error');
    }
  };

  // Handle reject/suspend (admin)
  const handleReject = (beneficiary: Beneficiary, action: 'reject' | 'suspend') => {
    setSelectedBeneficiary(beneficiary);
    setRejectAction(action);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedBeneficiary || !rejectReason.trim()) {
      showSnackbar('Please provide a reason', 'warning');
      return;
    }

    try {
      if (rejectAction === 'reject') {
        await beneficiaryService.reject(selectedBeneficiary.id, { reason: rejectReason });
        showSnackbar('Beneficiary rejected successfully', 'success');
      } else {
        await beneficiaryService.suspend(selectedBeneficiary.id, { reason: rejectReason });
        showSnackbar('Beneficiary suspended successfully', 'success');
      }
      fetchBeneficiaries();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || `Failed to ${rejectAction} beneficiary`, 'error');
    } finally {
      setRejectDialogOpen(false);
      setSelectedBeneficiary(null);
      setRejectReason('');
    }
  };

  // Handle reactivate (admin)
  const handleReactivate = async (beneficiary: Beneficiary) => {
    try {
      await beneficiaryService.reactivate(beneficiary.id);
      showSnackbar('Beneficiary reactivated successfully', 'success');
      fetchBeneficiaries();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to reactivate beneficiary', 'error');
    }
  };

  // Handle view details
  const handleViewDetails = (beneficiary: Beneficiary) => {
    navigate(`/beneficiaries/${beneficiary.id}`);
  };

  // Table columns
  const columns: Column<Beneficiary>[] = [
    {
      id: 'beneficiaryName',
      label: 'Beneficiary Name',
      minWidth: 200,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.beneficiaryName}
          </Typography>
          {row.nickName && (
            <Typography variant="caption" color="text.secondary">
              ({row.nickName})
            </Typography>
          )}
        </Box>
      )
    },
    {
      id: 'businessName',
      label: 'Business Name',
      minWidth: 150,
      render: (row) => row.businessName || '-'
    },
    {
      id: 'country',
      label: 'Country',
      minWidth: 120,
      render: (row) => (
        <Chip
          icon={<LocationOnIcon />}
          label={row.country}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'isCounterOverCounter',
      label: 'C2C',
      minWidth: 80,
      align: 'center',
      render: (row) => row.isCounterOverCounter ? (
        <Chip
          icon={<AttachMoneyIcon />}
          label="C2C"
          size="small"
          color="primary"
        />
      ) : (
        <Typography variant="caption" color="text.secondary">-</Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      render: (row) => <StatusChip status={row.status} />
    },
    ...(isAdmin ? [{
      id: 'ownerName' as keyof Beneficiary,
      label: 'Owner',
      minWidth: 150,
      render: (row: Beneficiary) => row.ownerName || '-'
    }] : []),
    {
      id: 'createdDatetime',
      label: 'Created',
      minWidth: 130,
      render: (row) => formatDate(row.createdDatetime)
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      align: 'center',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          {/* Business User Actions */}
          {!isAdmin && (
            <>
              {row.canBeEdited && (
                <>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(row)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {row.status === 'PENDING' && row.canBeSubmitted && (
                <Tooltip title="Submit for Review">
                  <IconButton size="small" onClick={() => handleSubmit(row)} color="success">
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <>
              {row.status === 'UNDER_REVIEW' && (
                <>
                  <Tooltip title="Approve">
                    <IconButton size="small" onClick={() => handleApprove(row)} color="success">
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton size="small" onClick={() => handleReject(row, 'reject')} color="error">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {row.status === 'ACTIVE' && (
                <Tooltip title="Suspend">
                  <IconButton size="small" onClick={() => handleReject(row, 'suspend')} color="warning">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'SUSPENDED' && (
                <Tooltip title="Reactivate">
                  <IconButton size="small" onClick={() => handleReactivate(row)} color="success">
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      )
    }
  ];

  // Filter fields
  const filterFields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'SUSPENDED', label: 'Suspended' }
      ]
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Beneficiaries"
        subtitle={
          !isAdmin 
            ? `Manage your payout beneficiaries (${countInfo.count} of ${countInfo.limit})`
            : 'Manage all beneficiaries across the system'
        }
        actions={
          <>
            {!isAdmin && (
              <Typography variant="body2" color={countInfo.remaining <= 5 ? 'error' : 'text.secondary'} sx={{ mr: 2 }}>
                {countInfo.remaining} remaining
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={() => { fetchBeneficiaries(); fetchCountInfo(); }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={!countInfo.canCreateMore && !isAdmin}
            >
              Add Beneficiary
            </Button>
          </>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name..."
          onClear={() => setSearchQuery('')}
        />
        <FilterPanel
          fields={filterFields}
          values={{ status: statusFilter }}
          onChange={(values) => setStatusFilter(values.status as BeneficiaryStatus | '')}
        />
      </Box>

      <DataTable
        columns={columns}
        data={beneficiaries}
        loading={loading}
        onRowClick={handleViewDetails}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Beneficiary"
        message={`Are you sure you want to delete "${selectedBeneficiary?.beneficiaryName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedBeneficiary(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      {/* Reject/Suspend Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {rejectAction === 'reject' ? 'Reject Beneficiary' : 'Suspend Beneficiary'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for {rejectAction === 'reject' ? 'rejecting' : 'suspending'} "{selectedBeneficiary?.beneficiaryName}":
          </Typography>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason (minimum 10 characters)..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '8px',
              fontFamily: 'inherit',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmReject} 
            color="error" 
            variant="contained"
            disabled={rejectReason.trim().length < 10}
          >
            {rejectAction === 'reject' ? 'Reject' : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BeneficiariesPage;
