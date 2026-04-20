import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import FileDropZone from '../common/FileDropZone';
import DataTable, { Column } from '../common/DataTable';
import ConfirmDialog from '../common/ConfirmDialog';
import kycDocumentService from '../../services/kycDocumentService';
import enumService, { EnumOption } from '../../services/enumService';
import { KYCDocument, DocumentType } from '../../types/kycDocument.types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import StatusChip from '../common/StatusChip';

interface KYCDocumentsUploadTabProps {
  organizationId: number | null;
  onDocumentsChange?: (count: number) => void;
  disabled?: boolean;
}

const KYCDocumentsUploadTab: React.FC<KYCDocumentsUploadTabProps> = ({
  organizationId,
  onDocumentsChange,
  disabled = false
}) => {
  // State
  const [uploadForm, setUploadForm] = useState<{
    documentType: DocumentType;
    file: File | null;
  }>({
    documentType: 'CERTIFICATE_OF_INCORPORATION',
    file: null
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<KYCDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Enum options
  const [documentTypeOptions, setDocumentTypeOptions] = useState<EnumOption[]>([]);

  // Fetch document types
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const types = await enumService.getDocumentType();
        setDocumentTypeOptions(types);
        
        // Set first option as default if available
        if (types.length > 0 && !uploadForm.documentType) {
          setUploadForm(prev => ({ ...prev, documentType: types[0].value as DocumentType }));
        }
      } catch (error) {
        console.error('Failed to fetch document types:', error);
      }
    };
    fetchDocumentTypes();
  }, []);

  // Fetch uploaded documents
  const fetchDocuments = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await kycDocumentService.getByOrganizationId(organizationId, { page: 0, size: 100 });
      setUploadedDocuments(response.content || []);
      
      // Notify parent component
      if (onDocumentsChange) {
        onDocumentsChange((response.content || []).length);
      }
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      setError(error.message || 'Failed to load documents');
      setUploadedDocuments([]);
      
      if (onDocumentsChange) {
        onDocumentsChange(0);
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId, onDocumentsChange]);

  // Load documents on mount and when organizationId changes
  useEffect(() => {
    if (organizationId) {
      fetchDocuments();
    } else {
      setUploadedDocuments([]);
      if (onDocumentsChange) {
        onDocumentsChange(0);
      }
    }
  }, [organizationId, fetchDocuments, onDocumentsChange]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File | null) => {
    setUploadForm(prev => ({ ...prev, file }));
    setError(null);
  }, []);

  // Handle document type change
  const handleDocumentTypeChange = useCallback((event: any) => {
    setUploadForm(prev => ({ ...prev, documentType: event.target.value as DocumentType }));
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!organizationId) {
      setError('Organization must be saved before uploading documents');
      return;
    }

    if (!uploadForm.file) {
      setError('Please select a file to upload');
      return;
    }

    if (!uploadForm.documentType) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await kycDocumentService.upload({
        organisationId: organizationId,
        documentType: uploadForm.documentType,
        file: uploadForm.file
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Refresh documents list
      await fetchDocuments();

      // Reset form
      setUploadForm({
        documentType: uploadForm.documentType, // Keep same doc type for convenience
        file: null
      });

      setSuccess(`Document "${result.fileName}" uploaded successfully`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (document: KYCDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await kycDocumentService.delete(documentToDelete.id);
      setSuccess(`Document "${documentToDelete.fileName}" deleted successfully`);
      
      // Refresh documents list
      await fetchDocuments();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Delete failed:', error);
      setError(error.message || 'Failed to delete document. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  // Handle download
  const handleDownload = async (document: KYCDocument) => {
    try {
      const blob = await kycDocumentService.download(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      setError(error.message || 'Failed to download document');
    }
  };

  // Table columns
  const columns: Column<KYCDocument>[] = [
    {
      id: 'documentType',
      label: 'Document Type',
      sortable: false,
      minWidth: 200,
      format: (value) => {
        const option = documentTypeOptions.find(opt => opt.value === value);
        return option?.label || value;
      }
    },
    {
      id: 'fileName',
      label: 'File Name',
      sortable: false,
      minWidth: 200
    },
    {
      id: 'fileSize',
      label: 'Size',
      sortable: false,
      minWidth: 100,
      format: (value) => value ? formatFileSize(value as number) : '-'
    },
    {
      id: 'status',
      label: 'Status',
      sortable: false,
      minWidth: 120,
      format: (value) => <StatusChip status={value as any} />
    },
    {
      id: 'uploadedAt',
      label: 'Uploaded',
      sortable: false,
      minWidth: 150,
      format: (value) => value ? formatDate(value as string) : '-'
    },
    {
      id: 'id',
      label: 'Actions',
      sortable: false,
      minWidth: 120,
      format: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleDownload(row)}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row)}
              disabled={row.status === 'VERIFIED' || row.status === 'UNDER_REVIEW'}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Required documents info
  const requiredDocuments = [
    'CERTIFICATE_OF_INCORPORATION',
    'PROOF_OF_ADDRESS',
    'DIRECTORS_REGISTER'
  ];

  const uploadedRequiredDocs = uploadedDocuments.filter(doc => 
    requiredDocuments.includes(doc.documentType)
  );

  const isComplete = uploadedRequiredDocs.length >= 3;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Upload Required Documents:</strong> At least 3 documents are required for organization approval
          (Certificate of Incorporation, Proof of Address, and Directors Register).
        </Typography>
      </Alert>

      {/* No Organization ID Warning */}
      {!organizationId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> The organization will be automatically saved when you navigate to this tab,
            enabling you to upload KYC documents immediately.
          </Typography>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon /> Upload Document
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {organizationId ? (
          <Box>
            {/* Organization ID Display */}
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Organization ID: {organizationId}</strong> - Ready to upload documents
              </Typography>
            </Alert>

            {/* Document Type Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="document-type-label">Document Type *</InputLabel>
              <Select
                labelId="document-type-label"
                value={uploadForm.documentType}
                label="Document Type *"
                onChange={handleDocumentTypeChange}
                disabled={disabled || uploading}
              >
                {documentTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                    {requiredDocuments.includes(option.value) && (
                      <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* File Drop Zone */}
            <Box sx={{ mb: 3 }}>
              <FileDropZone
                onFileSelect={handleFileSelect}
                currentFile={uploadForm.file}
                disabled={disabled || uploading}
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024}
              />
            </Box>

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                  size={40}
                  sx={{ display: 'block', mx: 'auto', mb: 2 }}
                />
              </Box>
            )}

            {/* Upload Button */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setUploadForm({ ...uploadForm, file: null })}
                disabled={!uploadForm.file || uploading || disabled}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                onClick={handleUpload}
                disabled={!uploadForm.file || !uploadForm.documentType || uploading || disabled}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Alert severity="warning">
            <Typography variant="body2">
              Please complete the Basic Information tab and navigate to this tab to enable document uploads.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Uploaded Documents List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Uploaded Documents ({uploadedDocuments.length})
            {isComplete && (
              <Chip
                icon={<SuccessIcon />}
                label="Complete"
                color="success"
                size="small"
              />
            )}
            {!isComplete && uploadedDocuments.length > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${uploadedRequiredDocs.length}/3 required`}
                color="warning"
                size="small"
              />
            )}
          </Typography>
          <Tooltip title="Refresh list">
            <IconButton onClick={fetchDocuments} disabled={loading || !organizationId}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : uploadedDocuments.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <DataTable
              columns={columns}
              data={uploadedDocuments}
              page={0}
              rowsPerPage={100}
              totalElements={uploadedDocuments.length}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              loading={loading}
              emptyMessage="No documents uploaded yet"
              getRowId={(row) => row.id}
            />
          </Box>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              No documents uploaded yet. Use the form above to upload your first document.
            </Typography>
          </Alert>
        )}

        {/* Required Documents Checklist */}
        {uploadedDocuments.length > 0 && !isComplete && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Missing Required Documents:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 3, mb: 0 }}>
              {requiredDocuments.map(docType => {
                const uploaded = uploadedDocuments.some(doc => doc.documentType === docType);
                const option = documentTypeOptions.find(opt => opt.value === docType);
                return (
                  <li key={docType}>
                    {uploaded ? '✓' : '✗'} {option?.label || docType}
                  </li>
                );
              })}
            </Box>
          </Alert>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.fileName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        }}
        confirmText="Delete"
      />
    </Box>
  );
};

export default KYCDocumentsUploadTab;
