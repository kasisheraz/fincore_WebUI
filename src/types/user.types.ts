// User Management Types

import { Status, Gender } from './common.types';

export interface User {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  statusDescription: Status; // Backend uses statusDescription, not status
  role?: string;
  residentialAddressIdentifier?: number;
  postalAddressIdentifier?: number;
  createdDatetime: string; // Backend uses createdDatetime, not createdAt
  lastModifiedDatetime: string; // Backend uses lastModifiedDatetime, not updatedAt
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
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  statusDescription?: Status; // Backend uses statusDescription
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
