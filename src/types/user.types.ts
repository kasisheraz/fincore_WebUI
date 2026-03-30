// User Management Types

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface UpdateUserDTO {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
}

export interface UserSearchParams {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  role?: string;
}

export interface UserFilters {
  status?: string;
  role?: string;
}
