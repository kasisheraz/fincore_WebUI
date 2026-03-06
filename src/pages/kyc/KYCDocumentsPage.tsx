import React, { useState, useEffect, useCallback } from 'react';
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
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import kycDocumentService from '../../services/kycDocumentService';
import { KYCDocument, KYCDocumentFilters } from '../../types/kycDocument.types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { DOCUMENT_TYPE_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const KYCDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<KYCDocumentFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCDocument>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDirection}`,
        ...filters
      };

      const response = await kycDocumentService.search(filters, params);
      setDocuments(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      // Don't show error in mock mode - just keep empty state
      setDocuments([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortDirection, filters]);

  useEffect(() => {
    console.log('KYCDocumentsPage mounted');
    fetchDocuments();
  }, [fetchDocuments]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<KYCDocument>[] = [
    { id: 'id', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'userId', label: 'User ID', sortable: true, minWidth: 100 },
    {
      id: 'documentType',
      label: 'Document Type',
      sortable: true,
      minWidth: 150,
      format: (value) => {
        const option = DOCUMENT_TYPE_OPTIONS.find(opt => opt.value === value);
        return option?.label || value;
      }
    },
    { id: 'documentNumber', label: 'Document #', sortable: false, minWidth: 130 },
    { id: 'fileName', label: 'File Name', sortable: false, minWidth: 180 },
    {
      id: 'fileSize',
      label: 'Size',
      sortable: false,
      minWidth: 100,
      format: (value) => formatFileSize(value as number)
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'uploadedAt',
      label: 'Uploaded',
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
          <Tooltip title="Download">
            <IconButton size="small" color="primary" onClick={() => handleDownload(row)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleApprove(row)}>
                  <ApproveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="warning" onClick={() => handleReject(row)}>
                  <RejectIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
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
    { name: 'userId', label: 'User ID', type: 'text' },
    { name: 'documentType', label: 'Document Type', type: 'select', options: DOCUMENT_TYPE_OPTIONS },
    { name: 'status', label: 'Status', type: 'select', options: VERIFICATION_STATUS_OPTIONS },
    { name: 'uploadDateFrom', label: 'Upload Date From', type: 'date' },
    { name: 'uploadDateTo', label: 'Upload Date To', type: 'date' }
  ];

  const handleDownload = async (document: KYCDocument) => {
    try {
      const blob = await kycDocumentService.download(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      showSnackbar('Document downloaded successfully', 'success');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to download document', 'error');
    }
  };

  const handleApprove = async (document: KYCDocument) => {
    try {
      await kycDocumentService.updateStatus(document.id, 'VERIFIED');
      showSnackbar('Document approved successfully', 'success');
      fetchDocuments();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to approve document', 'error');
    }
  };

  const handleReject = async (document: KYCDocument) => {
    try {
      await kycDocumentService.updateStatus(document.id, 'REJECTED', 'Document rejected by reviewer');
      showSnackbar('Document rejected successfully', 'success');
      fetchDocuments();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to reject document', 'error');
    }
  };

  const handleDeleteClick = (document: KYCDocument) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    try {
      await kycDocumentService.delete(selectedDocument.id);
      showSnackbar('Document deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete document', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="KYC Document Management" />
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <SearchBar 
            placeholder="Search documents..." 
            onSearch={setSearchQuery} 
            defaultValue={searchQuery}
            fullWidth={true}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Upload Document
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDocuments}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      <FilterPanel fields={filterFields} onFilter={(f) => setFilters(f as KYCDocumentFilters)} onClear={() => setFilters({})} />

      <DataTable
        columns={columns}
        data={documents}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={(column) => setSortBy(column as keyof KYCDocument)}
        sortBy={sortBy as string}
        sortDirection={sortDirection}
        loading={loading}
        emptyMessage="No documents found"
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Document"
        message={`Are you sure you want to delete ${selectedDocument?.fileName}?`}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setSelectedDocument(null); }}
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

export default KYCDocumentsPage;
