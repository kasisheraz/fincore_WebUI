import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disableSubmit?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  maxWidth = 'sm',
  loading = false,
  disableSubmit = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: (e: React.FormEvent) => {
          e.preventDefault();
          onSubmit();
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || disableSubmit}
        >
          {loading ? 'Saving...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
