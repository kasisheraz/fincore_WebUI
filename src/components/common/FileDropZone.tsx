import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AttachFile as FileIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { formatFileSize } from '../../utils/formatters';

interface FileDropZoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string; // e.g., ".pdf,.jpg,.jpeg,.png"
  maxSize?: number; // in bytes
  disabled?: boolean;
  currentFile?: File | null;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  currentFile = null
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported. Please upload: ${accept}`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setError(null);
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClearFile = useCallback(() => {
    handleFileSelect(null);
  }, [handleFileSelect]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={isDragOver ? 8 : 2}
        sx={{
          p: 4,
          border: 2,
          borderColor: error 
            ? 'error.main' 
            : isDragOver 
              ? 'primary.main' 
              : currentFile 
                ? 'success.main'
                : 'divider',
          borderStyle: 'dashed',
          backgroundColor: disabled 
            ? 'action.disabledBackground' 
            : isDragOver 
              ? 'action.hover' 
              : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          '&:hover': disabled ? {} : {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {currentFile ? (
          <Box>
            <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              File Selected
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <FileIcon color="action" />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {currentFile.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formatFileSize(currentFile.size)}
            </Typography>
            <Chip
              label="Click to change file"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 64, color: isDragOver ? 'primary.main' : 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragOver ? 'Drop file here' : 'Drag and drop your file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
              Supported: {accept.replace(/\./g, '').toUpperCase().split(',').join(', ')} (max {formatFileSize(maxSize)})
            </Typography>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FileDropZone;
