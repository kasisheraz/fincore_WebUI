// User Management Types

import { Status, Gender } from './common.types';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  status?: Status;
}

export interface UserSearchParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: Status;
  gender?: Gender;
}

export interface UserFilters {
  status?: Status;
  gender?: Gender;
  dateFrom?: string;
  dateTo?: string;
}
