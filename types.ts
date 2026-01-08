
export enum UserRole {
  DONOR = 'DONOR',
  RECEIVER = 'RECEIVER',
  ADMIN = 'ADMIN'
}

export enum DonationCategory {
  FOOD = 'Food',
  CLOTHES = 'Clothes',
  BOOKS = 'Books',
  MEDICINE = 'Medicine',
  OTHER = 'Other'
}

export enum DonationStatus {
  AVAILABLE = 'Available',
  REQUESTED = 'Requested',
  FULFILLED = 'Fulfilled',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  itemName: string;
  category: DonationCategory;
  quantity: string;
  location: string;
  expiryDate?: string;
  description: string;
  status: DonationStatus;
  createdAt: string;
  receiverId?: string;
  receiverName?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  donations: Donation[];
}
