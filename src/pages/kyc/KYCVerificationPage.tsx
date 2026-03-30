import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import kycVerificationService from '../../services/kycVerificationService';
import { KYCVerification, KYCVerificationFilters } from '../../types/kycVerification.types';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { VERIFICATION_STATUS_OPTIONS, VERIFICATION_LEVEL_OPTIONS, RISK_LEVEL_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const KYCVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<KYCVerificationFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCVerification>('submittedAt');
  const sortDirection = 'desc' as const;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: rowsPerPage };
      const response = await kycVerificationService.search(filters, params);
      setVerifications(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch verifications:', error);
      setVerifications([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<KYCVerification>[] = [
    { id: 'verificationId', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'userId', label: 'User ID', sortable: true, minWidth: 100 },
    {
      id: 'verificationLevel',
      label: 'Level',
      sortable: true,
      minWidth: 100,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value) => <StatusChip status={value as any} />,
    },
    {
      id: 'riskLevel',
      label: 'Risk Level',
      sortable: true,
      minWidth: 100,
      format: (value) => value ? (
        <Typography
          variant="body2"
          color={value === 'HIGH' ? 'error' : value === 'MEDIUM' ? 'warning.main' : 'success.main'}
        >
          {value as string}
        </Typography>
      ) : '-',
    },
    {
      id: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      minWidth: 120,
      format: (value) => formatDate(value as string),
    },
    {
      id: 'reviewedAt',
      label: 'Reviewed',
      sortable: true,
      minWidth: 120,
      format: (value) => value ? formatDate(value as string) : '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 150,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary" onClick={() => showSnackbar('View not implemented', 'info')}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleApprove(row)}>
                  <ApproveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleReject(row)}>
                  <RejectIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    { name: 'userId', label: 'User ID', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: VERIFICATION_STATUS_OPTIONS },
    { name: 'verificationLevel', label: 'Level', type: 'select', options: VERIFICATION_LEVEL_OPTIONS },
    { name: 'riskLevel', label: 'Risk Level', type: 'select', options: RISK_LEVEL_OPTIONS },
  ];

  const handleApprove = async (verification: KYCVerification) => {
    try {
      await kycVerificationService.approve(verification.verificationId, { riskLevel: 'LOW', approvalReason: 'Approved by reviewer' });
      showSnackbar('Verification approved successfully', 'success');
      fetchVerifications();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to approve verification', 'error');
    }
  };

  const handleReject = async (verification: KYCVerification) => {
    try {
      await kycVerificationService.reject(verification.verificationId, { reviewerComments: 'Documents incomplete' });
      showSnackbar('Verification rejected successfully', 'success');
      fetchVerifications();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to reject verification', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="KYC Verification Management" />
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap' }} disabled>
            New Verification
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchVerifications}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      <FilterPanel fields={filterFields} onFilter={(f) => setFilters(f as KYCVerificationFilters)} onClear={() => setFilters({})} />

      <DataTable
        columns={columns}
        data={verifications}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={(column) => setSortBy(column as keyof KYCVerification)}
        sortBy={sortBy as string}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No verifications found"
        getRowId={(row) => row.verificationId}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KYCVerificationPage;
