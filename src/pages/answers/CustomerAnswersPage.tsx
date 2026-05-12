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
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<CustomerAnswer | null>(null);
  const [answerForm, setAnswerForm] = useState({
    userId: 0,
    questionId: 0,
    answerText: ''
  });

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
    setSelectedAnswer(answer);
    setAnswerForm({
      userId: answer.userId,
      questionId: answer.questionId,
      answerText: answer.answerText || ''
    });
    setEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setAnswerForm({
      userId: 0,
      questionId: 0,
      answerText: ''
    });
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!answerForm.userId || !answerForm.questionId) {
      showSnackbar('Please enter User ID and Question ID', 'error');
      return;
    }
    
    try {
      await customerAnswerService.submit(answerForm);
      showSnackbar('Answer submitted successfully', 'success');
      setCreateDialogOpen(false);
      fetchAnswers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to submit answer', 'error');
    }
  };

  const handleEditSave = async () => {
    if (!selectedAnswer) {
      showSnackbar('No answer selected', 'error');
      return;
    }
    
    try {
      await customerAnswerService.update(selectedAnswer.id, { answerText: answerForm.answerText });
      showSnackbar('Answer updated successfully', 'success');
      setEditDialogOpen(false);
      setSelectedAnswer(null);
      fetchAnswers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update answer', 'error');
    }
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
      <Box sx={{ px: 1.5, py: 1 }}>
      
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
            onClick={handleCreateClick}
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

      {/* Create Answer Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Answer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              type="number"
              value={answerForm.userId || ''}
              onChange={(e) => setAnswerForm({ ...answerForm, userId: parseInt(e.target.value) || 0 })}
              required
            />
            <TextField
              fullWidth
              label="Question ID"
              type="number"
              value={answerForm.questionId || ''}
              onChange={(e) => setAnswerForm({ ...answerForm, questionId: parseInt(e.target.value) || 0 })}
              required
            />
            <TextField
              fullWidth
              label="Answer Text"
              multiline
              rows={6}
              value={answerForm.answerText}
              onChange={(e) => setAnswerForm({ ...answerForm, answerText: e.target.value })}
              placeholder="Enter your answer..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Submit Answer</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Answer Dialog */}
      <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setSelectedAnswer(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Answer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              type="number"
              value={answerForm.userId}
              disabled
              helperText="Cannot change user"
            />
            <TextField
              fullWidth
              label="Question ID"
              type="number"
              value={answerForm.questionId}
              disabled
              helperText="Cannot change question"
            />
            <TextField
              fullWidth
              label="Answer Text"
              multiline
              rows={6}
              value={answerForm.answerText}
              onChange={(e) => setAnswerForm({ ...answerForm, answerText: e.target.value })}
              placeholder="Enter your answer..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); setSelectedAnswer(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default CustomerAnswersPage;
