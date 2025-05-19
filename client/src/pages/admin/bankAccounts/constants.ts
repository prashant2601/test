export type AccountRolesTypes =
  | 'Partner Merchant'
  | 'Courier Customer'
  | 'Driver'
  | 'Affiliate';

interface AccountRole {
  label: string;
  value: AccountRolesTypes;
}

export const accountRoleOptions: AccountRole[] = [
  { label: 'Partner Merchant', value: 'Partner Merchant' },
  { label: 'Courier Customer', value: 'Courier Customer' },
  { label: 'Driver', value: 'Driver' },
  { label: 'Affiliate', value: 'Affiliate' },
];
