import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { STATUS_COLORS } from '../../utils/constants';
import { formatStatus } from '../../utils/formatters';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: keyof typeof STATUS_COLORS;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const color = STATUS_COLORS[status] || 'default';
  const label = formatStatus(status);

  return (
    <Chip
      label={label}
      color={color as any}
      size="small"
      {...props}
    />
  );
};

export default StatusChip;
