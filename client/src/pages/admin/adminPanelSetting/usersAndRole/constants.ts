export type UserRoleTypes =
  | 'superAdmin'
  | 'merchant'
  | 'affiliate'
  | 'admin'
  | 'staff'
  | 'support'
  | 'driver';

interface UserRole {
  label: string;
  value: UserRoleTypes;
}
export type AllUserRoleTypesExcludingSuperAdmin = Exclude<
  UserRoleTypes,
  'superAdmin'
>;

export const userRoles: UserRole[] = [
  { label: 'Super Admin', value: 'superAdmin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Support', value: 'support' },
  { label: 'Merchant', value: 'merchant' },
  { label: 'Driver', value: 'driver' },
  { label: 'Affiliate', value: 'affiliate' },
];

export type UserStatusTypes = 'active' | 'suspended' | 'inactive';

interface UserStatus {
  label: string;
  value: UserStatusTypes;
}

export const userStatusOptions: UserStatus[] = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive', value: 'inactive' },
];

export const roleColors: Record<UserRoleTypes, string> = {
  superAdmin: 'red',
  merchant: 'green',
  affiliate: 'purple',
  admin: 'blue',
  staff: 'orange',
  support: 'cyan',
  driver: 'cyan',
};

export const userStatusColors: Record<UserStatusTypes, string> = {
  active: 'green',
  suspended: 'orange',
  inactive: 'grey',
};

export const getRoleColor = (role: UserRoleTypes): string => {
  return roleColors[role] || 'grey';
};

export const getUserStatusColor = (status: UserStatusTypes): string => {
  return userStatusColors[status] || 'grey';
};
