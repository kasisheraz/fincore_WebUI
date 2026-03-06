// Common Types

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
