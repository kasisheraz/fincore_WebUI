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
import { PaginatedResponse } from '../../types/common.types';
import userService from '../../services/userService';
import { usePagination } from '../../hooks/usePagination';
import { formatDate, formatPhoneNumber } from '../../utils/formatters';
import { STATUS_OPTIONS, isProtectedRole, canManageUsers, canDeleteUsers } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
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
            fullName: searchQuery,
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

      // Filter out admin/protected users from the UI
      const filteredUsers = response.content.filter(user => !isProtectedRole(user.role));
      setUsers(filteredUsers);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      // Ensure users is set to empty array on error to prevent undefined crashes
      setUsers([]);
      setTotalElements(0);
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
      console.log(`${formMode} user with data:`, data);
      
      if (formMode === 'create') {
        const result = await userService.create(data as CreateUserDTO);
        console.log('User created:', result);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      } else if (selectedUser) {
        const result = await userService.update(selectedUser.id, data as UpdateUserDTO);
        console.log('User updated:', result);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      }
      setFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error(`Failed to ${formMode} user:`, error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || `Failed to ${formMode} user`;
      setSnackbar({
        open: true,
        message: errorMessage,
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
      id: 'fullName',
      label: 'Full Name',
      minWidth: 180,
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
      id: 'role',
      label: 'Role',
      minWidth: 100,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusChip status={value as any} />,
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
      format: (_, row) => {
        // Check if current user can manage this user
        const userCanEdit = canManageUsers(currentUser?.role);
        const userCanDelete = canDeleteUsers(currentUser?.role);
        
        return (
          <Box>
            <Tooltip title={userCanEdit ? "Edit" : "No permission"}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUser(row);
                  }}
                  disabled={!userCanEdit}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={userCanDelete ? "Delete" : "No permission"}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(row);
                  }}
                  disabled={!userCanDelete}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <Box sx={{ pt: 1, pr: 2, pb: 2, pl: 0 }}>
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
          {canManageUsers(currentUser?.role) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateUser}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Add User
            </Button>
          )}
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
        message={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
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
