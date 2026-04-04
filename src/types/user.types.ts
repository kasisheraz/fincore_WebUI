// User Management Types

import { Status } from './common.types';

export interface User {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  statusDescription: Status; // Backend uses statusDescription, not status
  role?: string;
  residentialAddressIdentifier?: number;
  postalAddressIdentifier?: number;
  createdDatetime: string; // Backend uses createdDatetime, not createdAt
  lastModifiedDatetime: string; // Backend uses lastModifiedDatetime, not updatedAt
}

export interface CreateUserDTO {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role?: string; // Backend requires role
  statusDescription?: Status;
  residentialAddressIdentifier?: number; // FK to Address table
  postalAddressIdentifier?: number; // FK to Address table
}

export interface UpdateUserDTO {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  statusDescription?: Status; // Backend uses statusDescription
  residentialAddressIdentifier?: number; // FK to Address table
  postalAddressIdentifier?: number; // FK to Address table
}

export interface UserSearchParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: Status;
}

export interface UserFilters {
  status?: Status;
  dateFrom?: string;
  dateTo?: string;
}
