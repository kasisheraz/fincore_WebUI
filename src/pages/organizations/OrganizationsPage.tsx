import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OrganizationForm from '../../components/organizations/OrganizationForm';
import organizationService from '../../services/organizationService';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO, OrganizationFilters } from '../../types/organization.types';
import { formatDate, formatPhoneNumber } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { ORGANIZATION_TYPE_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const OrganizationsPage: React.FC = () => {
  // State management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OrganizationFilters>({});
  const [sortBy, setSortBy] = useState<keyof Organization>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
        ? await organizationService.search({ name: searchQuery, ...filters }, params)
        : await organizationService.getAll(params);

      setOrganizations(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);
      // Don't show error in mock mode - just keep empty state
      setOrganizations([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, searchQuery, filters]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    console.log('OrganizationsPage mounted');
    fetchOrganizations();
  }, [fetchOrganizations]);

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
      id: 'name',
      label: 'Organization Name',
      sortable: true,
      minWidth: 200
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true,
      minWidth: 120,
      format: (value) => {
        const option = ORGANIZATION_TYPE_OPTIONS.find(opt => opt.value === value);
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
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'createdAt',
      label: 'Created At',
      sortable: true,
      minWidth: 120,
      format: (value) => formatDate(value as string)
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 120,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
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
  ];

  // Filter fields
  const filterFields: FilterField[] = [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: ORGANIZATION_TYPE_OPTIONS
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS
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

  return (
    <Box>
      <PageHeader title="Organization Management" />

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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Organization
          </Button>
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
        onSubmit={() => { if (createFormDataRef.current) handleCreate(createFormDataRef.current); }}
        maxWidth="md"
        disableSubmit={!isFormValid}
      >
        <OrganizationForm
          organization={null}
          onSubmit={handleCreate}
          mode="create"
          onValidationChange={setIsFormValid}
          onDataChange={(data) => { createFormDataRef.current = data; }}
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
        onSubmit={() => { if (editFormDataRef.current) handleUpdate(editFormDataRef.current); }}
        maxWidth="md"
        disableSubmit={!isFormValid}
      >
        <OrganizationForm
          organization={selectedOrganization}
          onSubmit={handleUpdate}
          mode="edit"
          onValidationChange={setIsFormValid}
          onDataChange={(data) => { editFormDataRef.current = data; }}
        />
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Organization"
        message={`Are you sure you want to delete ${selectedOrganization?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedOrganization(null);
        }}
        severity="error"
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
  );
};

export default OrganizationsPage;
