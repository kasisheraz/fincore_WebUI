import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Send as SendIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OrganizationForm from '../../components/organizations/OrganizationForm';
import { OrganizationRejectDialog } from '../../components/organizations/OrganizationRejectDialog';
import organizationService from '../../services/organizationService';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO, OrganizationFilters, OrganizationRejectionRequest } from '../../types/organization.types';
import { formatDate, formatPhoneNumber } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import StatusChip from '../../components/common/StatusChip';
import enumService, { EnumOption } from '../../services/enumService';
import { useAuth } from '../../context/AuthContext';

const OrganizationsPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMINISTRATOR';

  // State management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OrganizationFilters>({});
  const [sortBy, setSortBy] = useState<keyof Organization>('createdDatetime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userHasOrganization, setUserHasOrganization] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const createFormDataRef = useRef<any>(null);
  const editFormDataRef = useRef<any>(null);

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

  // Pagination
  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  // Enum options
  const [organizationTypeOptions, setOrganizationTypeOptions] = useState<EnumOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<EnumOption[]>([]);

  // Fetch organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDirection}`,
        ...filters
      };

      const response = searchQuery
        ? await organizationService.search({ legalName: searchQuery, ...filters }, params)
        : await organizationService.getAll(params);

      setOrganizations(response.content);
      setTotalElements(response.totalElements);
      
      // Check if current user already has an organization (for non-admins)
      if (!isAdmin && user?.id) {
        const userOrg = response.content.find(org => org.ownerId === user.id);
        setUserHasOrganization(!!userOrg);
        
        // Debug logging for approve button issue
        if (isAdmin) {
          response.content.forEach(org => {
            console.log(`Organization ${org.legalName}:`, {
              id: org.id,
              statusDescription: org.statusDescription,
              isUnderReview: org.statusDescription === 'UNDER_REVIEW',
              willShowApproveButton: org.statusDescription === 'UNDER_REVIEW'
            });
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);
      // Don't show error in mock mode - just keep empty state
      setOrganizations([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, searchQuery, filters, isAdmin, user]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    console.log('OrganizationsPage mounted');
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Fetch enum options on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [orgTypes, statuses] = await Promise.all([
          enumService.getOrganizationType(),
          enumService.getOrganizationStatus()
        ]);
        setOrganizationTypeOptions(orgTypes);
        setStatusOptions(statuses);
      } catch (error) {
        console.error('Failed to fetch enum options:', error);
      }
    };
    fetchEnums();
  }, []);

  // Snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Table columns
  const columns: Column<Organization>[] = [
    {
      id: 'legalName',
      label: 'Organization Name',
      sortable: true,
      minWidth: 200
    },
    {
      id: 'organisationType',
      label: 'Type',
      sortable: true,
      minWidth: 120,
      format: (value) => {
        const option = organizationTypeOptions.find(opt => opt.value === value);
        return option?.label || value;
      }
    },
    {
      id: 'registrationNumber',
      label: 'Registration Number',
      sortable: false,
      minWidth: 150
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 200
    },
    {
      id: 'phoneNumber',
      label: 'Phone',
      sortable: false,
      minWidth: 130,
      format: (value) => formatPhoneNumber(value as string)
    },
    {
      id: 'statusDescription',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'createdDatetime',
      label: 'Created At',
      sortable: true,
      minWidth: 120,
      format: (value) => formatDate(value as string)
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 150,
      format: (_, row) => {
        // Debug logging for approve button visibility
        const shouldShowApprove = isAdmin && row.statusDescription === 'UNDER_REVIEW';
        console.log(`Actions for ${row.legalName}:`, {
          isAdmin,
          statusDescription: row.statusDescription,
          shouldShowApprove,
          fullRow: row
        });
        
        return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {shouldShowApprove && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleApprove(row)}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleReject(row)}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {!isAdmin && (row.statusDescription === 'PENDING' || row.statusDescription === 'REQUIRES_RESUBMISSION') && (
            <Tooltip title="Submit for Review">
              <IconButton size="small" color="info" onClick={() => handleSubmit(row)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleEdit(row)}
              disabled={row.statusDescription === 'UNDER_REVIEW' || row.statusDescription === 'ACTIVE'}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
      }
    }
  ];

  // Filter fields
  const filterFields: FilterField[] = [
    {
      name: 'organisationType',
      label: 'Type',
      type: 'select',
      options: organizationTypeOptions
    },
    {
      name: 'statusDescription',
      label: 'Status',
      type: 'select',
      options: statusOptions
    },
    {
      name: 'registrationDateFrom',
      label: 'Registration Date From',
      type: 'date'
    },
    {
      name: 'registrationDateTo',
      label: 'Registration Date To',
      type: 'date'
    }
  ];

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters as OrganizationFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleSort = (columnId: keyof Organization) => {
    if (sortBy === columnId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setDeleteDialogOpen(true);
  };

  // Create organization
  const handleCreate = async (data: CreateOrganizationDTO | UpdateOrganizationDTO) => {
    try {
      await organizationService.create(data as CreateOrganizationDTO);
      showSnackbar('Organization created successfully', 'success');
      setCreateDialogOpen(false);
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to create organization', 'error');
    }
  };

  // Update organization
  const handleUpdate = async (data: CreateOrganizationDTO | UpdateOrganizationDTO) => {
    if (!selectedOrganization) return;

    try {
      await organizationService.update(selectedOrganization.id, data as UpdateOrganizationDTO);
      showSnackbar('Organization updated successfully', 'success');
      setEditDialogOpen(false);
      setSelectedOrganization(null);
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update organization', 'error');
    }
  };

  // Delete organization
  const handleDelete = async () => {
    if (!selectedOrganization) return;

    try {
      await organizationService.delete(selectedOrganization.id);
      showSnackbar('Organization deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedOrganization(null);
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete organization', 'error');
    }
  };

  // Approve organization (Admin only)
  const handleApprove = async (organization: Organization) => {
    try {
      await organizationService.approve(organization.id);
      showSnackbar('Organization approved successfully', 'success');
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to approve organization', 'error');
    }
  };

  // Reject organization (Admin only)
  const handleReject = (organization: Organization) => {
    setSelectedOrganization(organization);
    setRejectDialogOpen(true);
  };

  // Handle rejection submission
  const handleRejectSubmit = async (rejections: OrganizationRejectionRequest) => {
    if (!selectedOrganization) return;

    try {
      await organizationService.reject(selectedOrganization.id, rejections);
      showSnackbar('Organization rejected successfully', 'success');
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to reject organization', 'error');
      throw error; // Re-throw to let dialog handle it
    }
  };

  // Submit organization for review (Organization owner)
  const handleSubmit = async (organization: Organization) => {
    try {
      await organizationService.submitForReview(organization.id);
      showSnackbar('Organization submitted for review successfully', 'success');
      fetchOrganizations();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to submit organization for review', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="Organization Management" />
      <Box sx={{ px: 1.5, py: 1 }}>

      {/* Rejection Feedback Alert */}
      {organizations.some(org => org.statusDescription === 'REQUIRES_RESUBMISSION' && org.reasonDescription) && !isAdmin && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Some organizations were rejected and require resubmission:
          </Typography>
          {organizations
            .filter(org => org.statusDescription === 'REQUIRES_RESUBMISSION' && org.reasonDescription)
            .map(org => (
              <Typography key={org.id} variant="body2" sx={{ ml: 2 }}>
                • <strong>{org.legalName}:</strong> {org.reasonDescription}
              </Typography>
            ))}
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Please review the detailed feedback in the KYC Documents section, fix the issues, and submit for review again.
          </Typography>
        </Alert>
      )}
      
      {/* One Organization Per User Alert */}
      {!isAdmin && userHasOrganization && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            You already have an organization. Each user can only create one organization.
          </Typography>
        </Alert>
      )}

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar
            placeholder="Search organizations by name, email..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
            fullWidth={true}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip 
            title={!isAdmin && userHasOrganization ? "You can only create one organization" : ""}
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                disabled={!isAdmin && userHasOrganization}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add Organization
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchOrganizations}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <FilterPanel
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={organizations}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={(column) => handleSort(column as keyof Organization)}
        sortBy={sortBy as string}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No organizations found"
        getRowId={(row) => row.id}
      />

      {/* Create Dialog */}
      <FormDialog
        open={createDialogOpen}
        title="Create Organization"
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        hideActions={true}
      >
        <OrganizationForm
          organization={null}
          onSubmit={handleCreate}
          mode="create"
          onValidationChange={setIsFormValid}
          onDataChange={(data) => { createFormDataRef.current = data; }}
          onClose={() => setCreateDialogOpen(false)}
        />
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog
        open={editDialogOpen}
        title="Edit Organization"
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedOrganization(null);
        }}
        maxWidth="md"
        hideActions={true}
      >
        <OrganizationForm
          organization={selectedOrganization}
          onSubmit={handleUpdate}
          mode="edit"
          onValidationChange={setIsFormValid}
          onDataChange={(data) => { editFormDataRef.current = data; }}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedOrganization(null);
          }}
        />
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Organization"
        message={`Are you sure you want to delete ${selectedOrganization?.legalName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedOrganization(null);
        }}
        severity="error"
      />

      {/* Reject Organization Dialog */}
      <OrganizationRejectDialog
        open={rejectDialogOpen}
        organizationId={selectedOrganization?.id || null}
        organizationName={selectedOrganization?.legalName}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedOrganization(null);
        }}
        onReject={handleRejectSubmit}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default OrganizationsPage;
