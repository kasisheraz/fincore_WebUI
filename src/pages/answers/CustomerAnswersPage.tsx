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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import customerAnswerService from '../../services/customerAnswerService';
import { CustomerAnswer, CustomerAnswerFilters } from '../../types/customerAnswer.types';
import { formatDateTime } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

const CustomerAnswersPage: React.FC = () => {
  const [answers, setAnswers] = useState<CustomerAnswer[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CustomerAnswerFilters>({});
  const [sortBy, setSortBy] = useState<keyof CustomerAnswer>('answeredAt');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<CustomerAnswer | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();

  const fetchAnswers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: rowsPerPage };
      const response = await customerAnswerService.search(filters, params);
      setAnswers(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch answers:', error);
      setAnswers([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<CustomerAnswer>[] = [
    { id: 'answerId', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'userId', label: 'User ID', sortable: true, minWidth: 100 },
    { id: 'questionId', label: 'Question ID', sortable: true, minWidth: 120 },
    {
      id: 'answerText',
      label: 'Answer',
      sortable: false,
      minWidth: 300,
      format: (value) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
          {(value as string) || '-'}
        </Typography>
      ),
    },
    {
      id: 'answeredAt',
      label: 'Answered',
      sortable: true,
      minWidth: 150,
      format: (value) => formatDateTime(value as string),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 120,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => showSnackbar('Edit not implemented', 'info')}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    { name: 'userId', label: 'User ID', type: 'text' },
    { name: 'questionId', label: 'Question ID', type: 'text' },
  ];

  const handleDeleteClick = (answer: CustomerAnswer) => {
    setSelectedAnswer(answer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAnswer) return;
    try {
      await customerAnswerService.delete(selectedAnswer.answerId);
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

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap' }} disabled>
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
        sortDirection="desc"
        loading={loading}
        emptyMessage="No answers found"
        getRowId={(row) => row.answerId}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
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
