// Pagination utility functions

import { PaginatedResponse } from '../types/common.types';

/**
 * Convert a flat array response to a proper paginated response
 * Handles backend inconsistencies where some endpoints return flat arrays
 */
export function normalizePaginatedResponse<T>(data: any): PaginatedResponse<T> {
  // If it's already a paginated response, return it
  if (data && !Array.isArray(data) && data.content !== undefined) {
    return data;
  }

  // If it's a flat array, convert it to paginated format
  const content = Array.isArray(data) ? data : [];
  
  return {
    content,
    pageable: {
      pageNumber: 0,
      pageSize: content.length,
      sort: {
        sorted: false,
        empty: true,
        unsorted: true
      },
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalPages: content.length > 0 ? 1 : 0,
    totalElements: content.length,
    last: true,
    size: content.length,
    number: 0,
    sort: {
      sorted: false,
      empty: true,
      unsorted: true
    },
    numberOfElements: content.length,
    first: true,
    empty: content.length === 0
  };
}
