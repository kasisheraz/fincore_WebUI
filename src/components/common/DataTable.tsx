import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
  Checkbox,
  Typography,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSort?: (column: keyof T | string) => void;
  sortBy?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortBy,
  sortDirection = 'asc',
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => row.id,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const handleSort = (column: keyof T | string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (event.target.checked) {
        onSelectionChange(data);
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (row: T) => {
    if (onSelectionChange) {
      const isSelected = selectedRows.some((r) => getRowId(r) === getRowId(row));
      if (isSelected) {
        onSelectionChange(selectedRows.filter((r) => getRowId(r) !== getRowId(row)));
      } else {
        onSelectionChange([...selectedRows, row]);
      }
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some((r) => getRowId(r) === getRowId(row));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < data.length
                    }
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isSelected = isRowSelected(row);
                return (
                  <TableRow
                    hover
                    key={getRowId(row)}
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected ? 'action.selected' : 'inherit',
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id as keyof T];
                      return (
                        <TableCell key={String(column.id)} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(parseInt(event.target.value, 10))
        }
      />
    </Paper>
  );
}

export default DataTable;
