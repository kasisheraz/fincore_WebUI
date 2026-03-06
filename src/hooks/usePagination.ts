import { useState, useCallback } from 'react';

interface UsePaginationResult {
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  resetPagination: () => void;
  getPaginationParams: () => {
    page: number;
    size: number;
  };
}

export const usePagination = (
  initialPage: number = 0,
  initialRowsPerPage: number = 10
): UsePaginationResult => {
  const [page, setPageState] = useState(initialPage);
  const [rowsPerPage, setRowsPerPageState] = useState(initialRowsPerPage);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPageState(newRowsPerPage);
    setPageState(0); // Reset to first page when changing rows per page
  }, []);

  const resetPagination = useCallback(() => {
    setPageState(initialPage);
    setRowsPerPageState(initialRowsPerPage);
  }, [initialPage, initialRowsPerPage]);

  const getPaginationParams = useCallback(() => {
    return {
      page,
      size: rowsPerPage,
    };
  }, [page, rowsPerPage]);

  return {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    resetPagination,
    getPaginationParams,
  };
};
