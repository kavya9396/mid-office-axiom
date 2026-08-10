export interface InboxItem {
  id: string | number;
  [key: string]: unknown;
}

export interface MenuItem {
  label: string;
}

export interface RoleSection {
  key: string;
  label: string;
}

export type PoolData = Record<
  string,
  InboxItem[]
>;

export interface UserRecord {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface LeaveRecord {
  id: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
  status: string;
}

export interface AllocationRecord {
  id: string;
  employeeName: string;
  taskName: string;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  status: string;
}