import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActivateIcon,
  Block as DeactivateIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import questionnaireService from '../../services/questionnaireService';
import { Question, QuestionFilters, QuestionType } from '../../types/questionnaire.types';
import { usePagination } from '../../hooks/usePagination';
import { QUESTION_TYPE_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const QuestionnairePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [sortBy, setSortBy] = useState<keyof Question>('orderIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState<{
    questionText: string;
    questionType: QuestionType;
    options: string[];
    isRequired: boolean;
    orderIndex: number;
    category: string;
    description: string;
  }>({
    questionText: '',
    questionType: 'TEXT',
    options: [],
    isRequired: false,
    orderIndex: 0,
    category: '',
    description: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDirection}`,
        ...filters
      };

      const response = await questionnaireService.search(filters, params);
      setQuestions(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      // Don't show error in mock mode - just keep empty state
      setQuestions([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, filters]);

  useEffect(() => {
    console.log('QuestionnairePage mounted');
    fetchQuestions();
  }, [fetchQuestions]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<Question>[] = [
    { id: 'orderIndex', label: 'Order', sortable: true, minWidth: 80 },
    { id: 'questionText', label: 'Question', sortable: true, minWidth: 300 },
    {
      id: 'questionType',
      label: 'Type',
      sortable: true,
      minWidth: 150,
      format: (value) => {
        const option = QUESTION_TYPE_OPTIONS.find(opt => opt.value === value);
        return option?.label || value;
      }
    },
    {
      id: 'isRequired',
      label: 'Required',
      sortable: true,
      minWidth: 100,
      format: (value) => (
        <Chip label={value ? 'Yes' : 'No'} color={value ? 'primary' : 'default'} size="small" />
      )
    },
    { id: 'category', label: 'Category', sortable: true, minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      minWidth: 200,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'ACTIVE' ? (
            <Tooltip title="Deactivate">
              <IconButton size="small" color="warning" onClick={() => handleDeactivate(row)}>
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
      )
    }
  ];

  const filterFields: FilterField[] = [
    { name: 'questionType', label: 'Type', type: 'select', options: QUESTION_TYPE_OPTIONS },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'DRAFT', label: 'Draft' }
    ]},
    { name: 'category', label: 'Category', type: 'text' }
  ];

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [],
      isRequired: question.isRequired,
      orderIndex: question.orderIndex,
      category: question.category || '',
      description: question.description || ''
    });
    setEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setQuestionForm({
      questionText: '',
      questionType: 'TEXT',
      options: [],
      isRequired: false,
      orderIndex: questions.length,
      category: '',
      description: ''
    });
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!questionForm.questionText) {
      showSnackbar('Please enter a question text', 'error');
      return;
    }
    
    try {
      await questionnaireService.create(questionForm);
      showSnackbar('Question created successfully', 'success');
      setCreateDialogOpen(false);
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to create question', 'error');
    }
  };

  const handleEditSave = async () => {
    if (!selectedQuestion || !questionForm.questionText) {
      showSnackbar('Please enter a question text', 'error');
      return;
    }
    
    try {
      await questionnaireService.update(selectedQuestion.id, questionForm);
      showSnackbar('Question updated successfully', 'success');
      setEditDialogOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update question', 'error');
    }
  };

  const handleActivate = async (question: Question) => {
    try {
      await questionnaireService.activate(question.id);
      showSnackbar('Question activated successfully', 'success');
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to activate question', 'error');
    }
  };

  const handleDeactivate = async (question: Question) => {
    try {
      await questionnaireService.deactivate(question.id);
      showSnackbar('Question deactivated successfully', 'success');
      fetchQuestions();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to deactivate question', 'error');
    }
  };

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;
    try {
      await questionnaireService.delete(selectedQuestion.id);
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
      <Box sx={{ px: 1, py: 1.5 }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar 
            placeholder="Search questions..." 
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
        getRowId={(row) => row.id}
      />

      {/* Create Question Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Question Text"
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
              required
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={questionForm.questionType}
                label="Question Type"
                onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value as any })}
              >
                {QUESTION_TYPE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {(questionForm.questionType === 'MULTIPLE_CHOICE') && (
              <TextField
                fullWidth
                label="Options (one per line)"
                multiline
                rows={4}
                value={questionForm.options.join('\n')}
                onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value.split('\n').filter(o => o.trim()) })}
                helperText="Enter each option on a new line"
              />
            )}
            <TextField
              fullWidth
              label="Category"
              value={questionForm.category}
              onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={questionForm.description}
              onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Order Index"
              type="number"
              value={questionForm.orderIndex}
              onChange={(e) => setQuestionForm({ ...questionForm, orderIndex: parseInt(e.target.value) || 0 })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={questionForm.isRequired}
                  onChange={(e) => setQuestionForm({ ...questionForm, isRequired: e.target.checked })}
                />
              }
              label="Required Question"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Question</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setSelectedQuestion(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Question Text"
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
              required
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={questionForm.questionType}
                label="Question Type"
                onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value as any })}
              >
                {QUESTION_TYPE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {(questionForm.questionType === 'MULTIPLE_CHOICE') && (
              <TextField
                fullWidth
                label="Options (one per line)"
                multiline
                rows={4}
                value={questionForm.options.join('\n')}
                onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value.split('\n').filter(o => o.trim()) })}
                helperText="Enter each option on a new line"
              />
            )}
            <TextField
              fullWidth
              label="Category"
              value={questionForm.category}
              onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={questionForm.description}
              onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Order Index"
              type="number"
              value={questionForm.orderIndex}
              onChange={(e) => setQuestionForm({ ...questionForm, orderIndex: parseInt(e.target.value) || 0 })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={questionForm.isRequired}
                  onChange={(e) => setQuestionForm({ ...questionForm, isRequired: e.target.checked })}
                />
              }
              label="Required Question"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); setSelectedQuestion(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This action cannot be undone.`}
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
    </Box>
  );
};

export default QuestionnairePage;
