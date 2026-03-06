import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import kycVerificationService from '../../services/kycVerificationService';
import { KYCVerification, KYCVerificationFilters } from '../../types/kycVerification.types';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { VERIFICATION_STATUS_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const KYCVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<KYCVerificationFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCVerification>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDirection}`,
        ...filters
      };

      const response = await kycVerificationService.search(filters, params);
      setVerifications(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch verifications:', error);
      // Don't show error in mock mode - just keep empty state
      setVerifications([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, filters]);

  useEffect(() => {
    console.log('KYCVerificationPage mounted');
    fetchVerifications();
  }, [fetchVerifications]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<KYCVerification>[] = [
    { id: 'id', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'userId', label: 'User ID', sortable: true, minWidth: 100 },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'riskLevel',
      label: 'Risk Level',
      sortable: true,
      minWidth: 100,
      format: (value) => value ? (
        <Tooltip title="Risk Assessment">
          <Typography variant="body2" color={value === 'HIGH' ? 'error' : value === 'MEDIUM' ? 'warning.main' : 'success.main'}>
            {value}
          </Typography>
        </Tooltip>
      ) : '-'
    },
    {
      id: 'documentsVerified',
      label: 'Documents Progress',
      sortable: false,
      minWidth: 200,
      format: (value, row) => {
        const percentage = row.totalDocuments > 0 ? (row.documentsVerified / row.totalDocuments) * 100 : 0;
        return (
          <Box>
            <Typography variant="caption">{row.documentsVerified} / {row.totalDocuments}</Typography>
            <LinearProgress variant="determinate" value={percentage} sx={{ mt: 0.5 }} />
          </Box>
        );
      }
    },
    {
      id: 'verificationDate',
      label: 'Verification Date',
      sortable: true,
      minWidth: 120,
      format: (value) => value ? formatDate(value as string) : '-'
    },
    {
      id: 'createdAt',
      label: 'Created',
      sortable: true,
      minWidth: 120,
      format: (value) => formatDate(value as string)
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 150,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary" onClick={() => handleView(row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(row.status === 'PENDING' || row.status === 'IN_REVIEW') && (
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
      )
    }
  ];

  const filterFields: FilterField[] = [
    { name: 'userId', label: 'User ID', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: VERIFICATION_STATUS_OPTIONS },
    { name: 'riskLevel', label: 'Risk Level', type: 'select', options: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }
    ]},
    { name: 'dateFrom', label: 'Date From', type: 'date' },
    { name: 'dateTo', label: 'Date To', type: 'date' }
  ];

  const handleView = (verification: KYCVerification) => {
    showSnackbar('View details not implemented yet', 'info');
  };

  const handleApprove = async (verification: KYCVerification) => {
    try {
      await kycVerificationService.approve(verification.id, { riskLevel: 'LOW', notes: 'Approved by reviewer' });
      showSnackbar('Verification approved successfully', 'success');
      fetchVerifications();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to approve verification', 'error');
    }
  };

  const handleReject = async (verification: KYCVerification) => {
    try {
      await kycVerificationService.reject(verification.id, { rejectionReason: 'Documents incomplete', notes: 'Rejected by reviewer' });
      showSnackbar('Verification rejected successfully', 'success');
      fetchVerifications();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to reject verification', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="KYC Verification Management" />
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar 
            placeholder="Search verifications..." 
            onSearch={setSearchQuery} 
            defaultValue={searchQuery}
            fullWidth={true}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
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
        getRowId={(row) => row.id}
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
