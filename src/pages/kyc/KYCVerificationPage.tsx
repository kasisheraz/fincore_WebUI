import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
import StatusChip from '../../components/common/StatusChip';
import enumService, { EnumOption } from '../../services/enumService';

const KYCVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<KYCVerificationFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCVerification>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [createForm, setCreateForm] = useState({
    userId: 0,
    notes: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  // Enum options
  const [verificationStatusOptions, setVerificationStatusOptions] = useState<EnumOption[]>([]);

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

  // Fetch enum options on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const statuses = await enumService.getVerificationStatus();
        setVerificationStatusOptions(statuses);
      } catch (error) {
        console.error('Failed to fetch enum options:', error);
      }
    };
    fetchEnums();
  }, []);

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
    { name: 'status', label: 'Status', type: 'select', options: verificationStatusOptions },
    { name: 'riskLevel', label: 'Risk Level', type: 'select', options: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' }
    ]},
    { name: 'dateFrom', label: 'Date From', type: 'date' },
    { name: 'dateTo', label: 'Date To', type: 'date' }
  ];

  const handleView = (verification: KYCVerification) => {
    setSelectedVerification(verification);
    setViewDialogOpen(true);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    setCreateForm({ userId: 0, notes: '' });
  };

  const handleCreate = async () => {
    if (!createForm.userId) {
      showSnackbar('Please enter a User ID', 'error');
      return;
    }
    
    try {
      await kycVerificationService.create(createForm);
      showSnackbar('Verification created successfully', 'success');
      setCreateDialogOpen(false);
      setCreateForm({ userId: 0, notes: '' });
      fetchVerifications();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to create verification', 'error');
    }
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
      <Box sx={{ px: '2px', py: 1 }}>
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
            onClick={handleCreateClick}
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

      {/* Create Verification Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Verification</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              type="number"
              value={createForm.userId || ''}
              onChange={(e) => setCreateForm({ ...createForm, userId: parseInt(e.target.value) || 0 })}
              required
              helperText="Enter the user ID to verify"
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Add any notes about this verification..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Verification</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default KYCVerificationPage;
