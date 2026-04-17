import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Input,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterField } from '../../components/common/FilterPanel';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import kycDocumentService from '../../services/kycDocumentService';
import userService from '../../services/userService';
import organizationService from '../../services/organizationService';
import { KYCDocument, KYCDocumentFilters } from '../../types/kycDocument.types';
import { User } from '../../types/user.types';
import { Organization } from '../../types/organization.types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import StatusChip from '../../components/common/StatusChip';
import enumService, { EnumOption } from '../../services/enumService';

const KYCDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<KYCDocumentFilters>({});
  const [sortBy, setSortBy] = useState<keyof KYCDocument>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  
  // Lists for dropdowns
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [uploadForm, setUploadForm] = useState({
    organisationId: 0,
    documentType: 'PASSPORT' as const,
    file: undefined as File | undefined,
    verificationIdentifier: undefined as number | undefined,
    sumsubDocumentIdentifier: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const pagination = usePagination();
  const { page, rowsPerPage, setPage, setRowsPerPage } = pagination;

  // Enum options
  const [documentTypeOptions, setDocumentTypeOptions] = useState<EnumOption[]>([]);
  const [verificationStatusOptions, setVerificationStatusOptions] = useState<EnumOption[]>([]);

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

  // Fetch enum options on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [docTypes, verStatuses] = await Promise.all([
          enumService.getDocumentType(),
          enumService.getVerificationStatus()
        ]);
        setDocumentTypeOptions(docTypes);
        setVerificationStatusOptions(verStatuses);
      } catch (error) {
        console.error('Failed to fetch enum options:', error);
      }
    };
    fetchEnums();
  }, []);

  // Fetch organizations and users for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [orgsResponse, usersResponse] = await Promise.all([
          organizationService.getAll({ page: 0, size: 1000 }),
          userService.getAll({ page: 0, size: 1000 })
        ]);
        setOrganizations(orgsResponse.content);
        setUsers(usersResponse.content);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

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
        const option = documentTypeOptions.find(opt => opt.value === value);
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
    { name: 'documentType', label: 'Document Type', type: 'select', options: documentTypeOptions },
    { name: 'status', label: 'Status', type: 'select', options: verificationStatusOptions },
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

  const handleUploadClick = () => {
    console.log('🔵 BUTTON CLICKED: Upload Document button clicked!');
    setUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
    setUploadForm({
      organisationId: 0,
      documentType: 'PASSPORT',
      fileName: '',
      file: undefined,
      verificationIdentifier: undefined,
      sumsubDocumentIdentifier: ''
    });
  };

  const handleUpload = async () => {
    if (!uploadForm.organisationId || !uploadForm.documentType) {
      showSnackbar('Please select an organization and document type', 'error');
      return;
    }
    
    if (!uploadForm.file) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }
    
    try {
      await kycDocumentService.upload(uploadForm);
      showSnackbar('Document uploaded successfully', 'success');
      setUploadDialogOpen(false);
      setUploadForm({
        organisationId: 0,
        documentType: 'PASSPORT',
        file: undefinednIdentifier: undefined,
        sumsubDocumentIdentifier: ''
      });
      fetchDocuments();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to upload document', 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="KYC Document Management" />
      <Box sx={{ px: 2, py: 2 }}>
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
            onClick={handleUploadClick}
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

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload KYC Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete • ${option.status}`}
              value={organizations.find(o => o.id === uploadForm.organisationId) || null}
              onChange={(_, newValue) => setUploadForm({ 
                ...uploadForm, 
                organisationId: newValue?.id || 0 
              })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Organisation *" 
                  required
                  helperText="Select the organization for this KYC document"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={uploadForm.documentType}
                label="Document Type"
                onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value as any })}
              >
                {documentTypeOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AttachFileIcon />}
                sx={{ 
                  py: 2, 
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': { borderStyle: 'dashed', borderWidth: 2 }
                }}
              >
                {uploadForm.file ? uploadForm.file.name : 'Choose File to Upload *'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadForm({ ...uploadForm, file });
                    }
                  }}
                />
              </Button>
              {uploadForm.file && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Size: {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>
            
            <TextField
              fullWidth
              label="Verification Identifier"
              type="number"
              value={uploadForm.verificationIdentifier || ''}
              onChange={(e) => setUploadForm({ 
                ...uploadForm, 
                verificationIdentifier: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              helperText="Optional: Link to verification record"
            />
            
            <TextField
              fullWidth
              label="Sumsub Document Identifier"
              value={uploadForm.sumsubDocumentIdentifier}
              onChange={(e) => setUploadForm({ ...uploadForm, sumsubDocumentIdentifier: e.target.value })}
              helperText="Optional: External Sumsub identifier"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={!uploadForm.organisationId || !uploadForm.file}
          >
            Upload
          
          <Button onClick={handleUploadClose}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload}>Upload</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default KYCDocumentsPage;
