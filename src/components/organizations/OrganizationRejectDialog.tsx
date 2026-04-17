import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { OrganizationRejectionRequest } from '../../types/organization.types';
import organizationService from '../../services/organizationService';

interface OrganizationRejectDialogProps {
  open: boolean;
  organizationId: number | null;
  organizationName?: string;
  onClose: () => void;
  onReject: (rejections: OrganizationRejectionRequest) => Promise<void>;
}

interface DocumentRejectionState {
  documentId: number;
  documentName: string;
  selected: boolean;
  rejectionReason: string;
}

export const OrganizationRejectDialog: React.FC<OrganizationRejectDialogProps> = ({
  open,
  organizationId,
  organizationName,
  onClose,
  onReject
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentRejectionState[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const kycDocs = await organizationService.getKycDocuments(organizationId);
      
      if (kycDocs.length === 0) {
        setError('No KYC documents found for this organization.');
        setDocuments([]);
      } else {
        setDocuments(
          kycDocs.map(doc => ({
            documentId: doc.id,
            documentName: doc.documentType || 'Document',
            selected: false,
            rejectionReason: ''
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load KYC documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Fetch KYC documents when dialog opens
  useEffect(() => {
    if (open && organizationId) {
      fetchDocuments();
    }
  }, [open, organizationId, fetchDocuments]);

  const handleDocumentToggle = (documentId: number) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.documentId === documentId
          ? { ...doc, selected: !doc.selected }
          : doc
      )
    );
  };

  const handleReasonChange = (documentId: number, reason: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.documentId === documentId
          ? { ...doc, rejectionReason: reason }
          : doc
      )
    );
  };

  const handleSubmit = async () => {
    const selectedDocs = documents.filter(doc => doc.selected);

    // Validation: At least one document must be selected
    if (selectedDocs.length === 0) {
      setError('Please select at least one document to reject.');
      return;
    }

    // Validation: All selected documents must have rejection reasons
    const missingReasons = selectedDocs.filter(doc => !doc.rejectionReason.trim());
    if (missingReasons.length > 0) {
      setError('Please provide rejection reasons for all selected documents.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const rejectionRequest: OrganizationRejectionRequest = {
        documentRejections: selectedDocs.map(doc => ({
          documentId: doc.documentId,
          rejectionReason: doc.rejectionReason.trim()
        }))
      };

      await onReject(rejectionRequest);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setDocuments([]);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    onClose();
  };

  const selectedCount = documents.filter(doc => doc.selected).length;
  const isValid = selectedCount > 0 && documents.filter(doc => doc.selected).every(doc => doc.rejectionReason.trim());

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Reject Organization{organizationName ? `: ${organizationName}` : ''}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {documents.length === 0 && !error ? (
              <Typography color="text.secondary">
                No KYC documents available to review.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the documents that need to be rejected and provide detailed feedback for each.
                  Non-selected documents will be automatically verified.
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  {selectedCount === 0 
                    ? 'No documents selected. Please select at least one document to reject.'
                    : `${selectedCount} document${selectedCount !== 1 ? 's' : ''} selected for rejection`}
                </Alert>

                {documents.map((doc, index) => (
                  <Box key={doc.documentId} sx={{ mb: 2 }}>
                    {index > 0 && <Divider sx={{ mb: 2 }} />}
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={doc.selected}
                          onChange={() => handleDocumentToggle(doc.documentId)}
                          disabled={submitting}
                        />
                      }
                      label={
                        <Typography variant="subtitle1" fontWeight={doc.selected ? 600 : 400}>
                          {doc.documentName} (ID: {doc.documentId})
                        </Typography>
                      }
                    />

                    {doc.selected && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        placeholder="Provide detailed feedback on why this document is being rejected..."
                        value={doc.rejectionReason}
                        onChange={(e) => handleReasonChange(doc.documentId, e.target.value)}
                        disabled={submitting}
                        required
                        error={doc.selected && !doc.rejectionReason.trim()}
                        helperText={
                          doc.selected && !doc.rejectionReason.trim()
                            ? 'Rejection reason is required'
                            : 'This feedback will be visible to the organization owner'
                        }
                        sx={{ mt: 1, ml: 4 }}
                      />
                    )}
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!isValid || submitting || documents.length === 0}
        >
          {submitting ? 'Rejecting...' : 'Reject Organization'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
