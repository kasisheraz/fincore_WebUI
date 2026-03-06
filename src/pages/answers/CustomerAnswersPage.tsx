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
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Assessment as ProgressIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import customerAnswerService from '../../services/customerAnswerService';
import { CustomerAnswer, CustomerAnswerFilters } from '../../types/customerAnswer.types';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

const CustomerAnswersPage: React.FC = () => {
  const [answers, setAnswers] = useState<CustomerAnswer[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerAnswerFilters>({});
  const [sortBy, setSortBy] = useState<keyof CustomerAnswer>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<CustomerAnswer | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  const fetchAnswers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDirection}`,
        ...filters
      };

      const response = await customerAnswerService.search(filters, params);
      setAnswers(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch answers:', error);
      // Don't show error in mock mode - just keep empty state
      setAnswers([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, filters]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<CustomerAnswer>[] = [
    { id: 'id', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'userId', label: 'User ID', sortable: true, minWidth: 100 },
    { id: 'questionId', label: 'Question ID', sortable: true, minWidth: 120 },
    {
      id: 'questionText',
      label: 'Question',
      sortable: false,
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
          {value || '-'}
        </Typography>
      )
    },
    {
      id: 'answerText',
      label: 'Answer',
      sortable: false,
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
          {value || (
            <Typography variant="body2" color="text.secondary">File Upload</Typography>
          )}
        </Typography>
      )
    },
    {
      id: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      minWidth: 150,
      format: (value) => formatDateTime(value as string)
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

  const filterFields: FilterField[] = [
    { name: 'userId', label: 'User ID', type: 'text' },
    { name: 'questionId', label: 'Question ID', type: 'text' },
    { name: 'submittedDateFrom', label: 'Submitted From', type: 'date' },
    { name: 'submittedDateTo', label: 'Submitted To', type: 'date' }
  ];

  const handleEdit = (answer: CustomerAnswer) => {
    showSnackbar('Edit not implemented yet', 'info');
  };

  const handleDeleteClick = (answer: CustomerAnswer) => {
    setSelectedAnswer(answer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAnswer) return;
    try {
      await customerAnswerService.delete(selectedAnswer.id);
      showSnackbar('Answer deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedAnswer(null);
      fetchAnswers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete answer', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="Customer Answers Management" />
      
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar 
            placeholder="Search answers..." 
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
            Submit Answer
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAnswers}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      <FilterPanel fields={filterFields} onFilter={(f) => setFilters(f as CustomerAnswerFilters)} onClear={() => setFilters({})} />

      <DataTable
        columns={columns}
        data={answers}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={(column) => setSortBy(column as keyof CustomerAnswer)}
        sortBy={sortBy as string}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No answers found"
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Answer"
        message={`Are you sure you want to delete this answer? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setSelectedAnswer(null); }}
        severity="error"
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerAnswersPage;
