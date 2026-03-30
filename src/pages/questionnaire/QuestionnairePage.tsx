import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActivateIcon,
  Block as DeactivateIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import questionnaireService from '../../services/questionnaireService';
import { Question, QuestionFilters } from '../../types/questionnaire.types';
import { usePagination } from '../../hooks/usePagination';
import { QUESTION_CATEGORY_OPTIONS, QUESTION_STATUS_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const QuestionnairePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [sortBy, setSortBy] = useState<keyof Question>('displayOrder');
  const sortDirection = 'asc' as const;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: rowsPerPage };
      const response = await questionnaireService.search(filters, params);
      setQuestions(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<Question>[] = [
    { id: 'displayOrder', label: 'Order', sortable: true, minWidth: 80 },
    { id: 'questionText', label: 'Question', sortable: true, minWidth: 300 },
    {
      id: 'questionCategory',
      label: 'Category',
      sortable: true,
      minWidth: 150,
      format: (value) => {
        const option = QUESTION_CATEGORY_OPTIONS.find(opt => opt.value === value);
        return option?.label || (value as string);
      },
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      format: (value) => <StatusChip status={value as any} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 200,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => showSnackbar('Edit not implemented', 'info')}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'ACTIVE' ? (
            <Tooltip title="Inactivate">
              <IconButton size="small" color="warning" onClick={() => handleInactivate(row)}>
                <DeactivateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activate">
              <IconButton size="small" color="success" onClick={() => handleActivate(row)}>
                <ActivateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
    { name: 'questionCategory', label: 'Category', type: 'select', options: QUESTION_CATEGORY_OPTIONS },
    { name: 'status', label: 'Status', type: 'select', options: QUESTION_STATUS_OPTIONS },
  ];

  const handleActivate = async (question: Question) => {
    try {
      await questionnaireService.activate(question.questionId);
      showSnackbar('Question activated successfully', 'success');
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to activate question', 'error');
    }
  };

  const handleInactivate = async (question: Question) => {
    try {
      await questionnaireService.inactivate(question.questionId);
      showSnackbar('Question inactivated successfully', 'success');
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to inactivate question', 'error');
    }
  };

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;
    try {
      await questionnaireService.delete(selectedQuestion.questionId);
      showSnackbar('Question deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete question', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="Questionnaire Management" />
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap' }} disabled>
            Add Question
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchQuestions}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      <FilterPanel fields={filterFields} onFilter={(f) => setFilters(f as QuestionFilters)} onClear={() => setFilters({})} />

      <DataTable
        columns={columns}
        data={questions}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={(column) => setSortBy(column as keyof Question)}
        sortBy={sortBy as string}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No questions found"
        getRowId={(row) => row.questionId}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setSelectedQuestion(null); }}
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

export default QuestionnairePage;
