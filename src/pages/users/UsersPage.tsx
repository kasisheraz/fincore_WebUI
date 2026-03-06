import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserForm from '../../components/users/UserForm';
import StatusChip from '../../components/common/StatusChip';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';
import { PaginatedResponse, Status } from '../../types/common.types';
import userService from '../../services/userService';
import { usePagination } from '../../hooks/usePagination';
import { formatDate, formatPhoneNumber } from '../../utils/formatters';
import { GENDER_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const createFormDataRef = useRef<CreateUserDTO | null>(null);
  const editFormDataRef = useRef<UpdateUserDTO | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { page, rowsPerPage, setPage, setRowsPerPage, getPaginationParams } = usePagination();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...getPaginationParams(),
        sortBy,
        sortDirection,
      };

      let response: PaginatedResponse<User>;

      if (searchQuery) {
        // Use search endpoint
        response = await userService.search(
          {
            firstName: searchQuery,
            lastName: searchQuery,
            email: searchQuery,
            phoneNumber: searchQuery,
          },
          params
        );
      } else if (Object.keys(filters).length > 0) {
        // Use search with filters
        response = await userService.search(filters, params);
      } else {
        // Use getAll endpoint
        response = await userService.getAll(params);
      }

      setUsers(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch users',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [getPaginationParams, sortBy, sortDirection, searchQuery, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleCreateUser = () => {
    setFormMode('create');
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateUserDTO | UpdateUserDTO) => {
    setFormLoading(true);
    try {
      if (formMode === 'create') {
        await userService.create(data as CreateUserDTO);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      } else if (selectedUser) {
        await userService.update(selectedUser.id, data as UpdateUserDTO);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      }
      setFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to ${formMode} user`,
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await userService.delete(userToDelete.id);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete user',
        severity: 'error',
      });
    }
  };

  const columns: Column<User>[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
    },
    {
      id: 'firstName',
      label: 'First Name',
      minWidth: 120,
    },
    {
      id: 'lastName',
      label: 'Last Name',
      minWidth: 120,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      id: 'phoneNumber',
      label: 'Phone',
      minWidth: 140,
      format: (value) => formatPhoneNumber(value),
    },
    {
      id: 'gender',
      label: 'Gender',
      minWidth: 100,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusChip status={value as Status} />,
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 140,
      format: (value) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (_, row) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: GENDER_OPTIONS,
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'dateRange',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="User Management" />

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar
            placeholder="Search by name, email, or phone..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
            fullWidth={true}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <FilterPanel
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={users}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={handleSort}
        sortBy={sortBy}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No users found"
      />

      {/* Create/Edit User Dialog */}
      <FormDialog
        open={formOpen}
        title={formMode === 'create' ? 'Create New User' : 'Edit User'}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          const formData = formMode === 'create' ? createFormDataRef.current : editFormDataRef.current;
          if (formData) {
            handleFormSubmit(formData);
          }
        }}
        loading={formLoading}
        maxWidth="md"
        disableSubmit={!formValid}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          mode={formMode}
          onValidationChange={setFormValid}
          onDataChange={(data) => {
            if (formMode === 'create') {
              createFormDataRef.current = data as CreateUserDTO;
            } else {
              editFormDataRef.current = data as UpdateUserDTO;
            }
          }}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmText="Delete"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
