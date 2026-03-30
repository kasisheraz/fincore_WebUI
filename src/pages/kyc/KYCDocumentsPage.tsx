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
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import kycDocumentService from '../../services/kycDocumentService';
import { KYCDocument, KYCDocumentFilters, DocumentStatus } from '../../types/kycDocument.types';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_STATUS_OPTIONS } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';

const KYCDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<KYCDocumentFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCDocument>('uploadedAt');
  const sortDirection = 'desc' as const;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: rowsPerPage };
      const response = await kycDocumentService.search(filters, params);
      setDocuments(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: Column<KYCDocument>[] = [
    { id: 'id', label: 'ID', sortable: true, minWidth: 80 },
    { id: 'organisationId', label: 'Organisation ID', sortable: true, minWidth: 120 },
    {
      id: 'documentType',
      label: 'Document Type',
      sortable: true,
      minWidth: 200,
      format: (value) => {
        const option = DOCUMENT_TYPE_OPTIONS.find(opt => opt.value === value);
        return option?.label || value;
      }
    },
    { id: 'documentNumber', label: 'Document #', sortable: false, minWidth: 130 },
    { id: 'issueDate', label: 'Issue Date', sortable: true, minWidth: 110, format: (v) => formatDate(v as string) },
    { id: 'expiryDate', label: 'Expiry Date', sortable: true, minWidth: 110, format: (v) => formatDate(v as string) },
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
          {row.status === 'PENDING' && (
            <>
              <Tooltip title="Verify">
                <IconButton size="small" color="success" onClick={() => handleVerify(row, 'VERIFIED')}>
                  <ApproveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="warning" onClick={() => handleVerify(row, 'REJECTED')}>
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
    { name: 'organisationId', label: 'Organisation ID', type: 'text' },
    { name: 'documentType', label: 'Document Type', type: 'select', options: DOCUMENT_TYPE_OPTIONS },
    { name: 'status', label: 'Status', type: 'select', options: DOCUMENT_STATUS_OPTIONS },
  ];

  const handleVerify = async (document: KYCDocument, status: DocumentStatus) => {
    try {
      await kycDocumentService.verify(document.id, 0, status);
      showSnackbar(`Document ${status.toLowerCase()} successfully`, 'success');
      fetchDocuments();
    } catch (error: any) {
      showSnackbar(error.message || `Failed to update document status`, 'error');
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            sx={{ whiteSpace: 'nowrap' }}
            disabled
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
        message={`Are you sure you want to delete document ${selectedDocument?.documentNumber}?`}
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
