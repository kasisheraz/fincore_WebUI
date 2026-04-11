// User Management Types

import { Status } from './common.types';

export interface Address {
  id?: number;
  addressType?: string;
  typeCode: number;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  country: string;
  statusDescription?: string;
  createdDatetime?: string;
}

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
  residentialAddress?: Address;
  postalAddress?: Address;
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
  residentialAddress?: Address;
  postalAddress?: Address;
}

export interface UpdateUserDTO {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  statusDescription?: Status; // Backend uses statusDescription
  residentialAddress?: Address;
  postalAddress?: Address;
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
