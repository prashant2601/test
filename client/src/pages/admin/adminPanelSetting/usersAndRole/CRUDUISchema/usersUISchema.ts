import { UISCHEMA } from '../../../customers/CRUDUISchema/customersUISchema';
import { userRoles, userStatusOptions } from '../constants';

const allRolesExcludingSuperAdmin = userRoles?.filter(
  (role) => role.value !== 'superAdmin'
);

export const usersBaseSchema: UISCHEMA[] = [
  {
    key: 'firstName',
    name: 'firstName',
    fieldType: 'Text',
    label: 'First Name',
  },
  {
    key: 'lastName',
    name: 'lastName',
    fieldType: 'Text',
    label: 'Last Name',
  },
  {
    key: 'userName',
    name: 'userName',
    fieldType: 'Text',
    label: 'Username',
    disabled: { disableFieldForEdit: true },
  },
  {
    key: 'email',
    name: 'email',
    fieldType: 'Text',
    label: 'Email',
    disabled: { disableFieldForEdit: true },
  },
  {
    key: 'role',
    name: 'role',
    fieldType: 'Select',
    label: 'Role',
    meta: { options: allRolesExcludingSuperAdmin },
    disabled: {
      disabledFieldForNew: true,
      disableFieldForEdit: true,
    },
  },
  {
    key: 'status',
    name: 'status',
    fieldType: 'Select',
    label: 'Status',
    hidden: { hideFieldForNEW: true },
    meta: { options: userStatusOptions },
  },
];

export const usersUISchemaByRole: Record<string, UISCHEMA[]> = {
  merchant: [
    ...usersBaseSchema,
    {
      key: 'merchantIds',
      name: 'merchantIds',
      fieldType: 'MerchantIDs',
      label: 'Select Merchant ID(s)',
      meta: {
        conditionallyRender: true,
      },
    },
  ],
  affiliate: [
    ...usersBaseSchema,
    {
      key: 'affiliateId',
      name: 'affiliateId',
      fieldType: 'Text',
      label: 'Affiliate ID',
    },
  ],
  admin: [...usersBaseSchema],
  staff: [...usersBaseSchema],
  support: [
    ...usersBaseSchema,
    {
      key: 'supportLevel',
      name: 'supportLevel',
      fieldType: 'Select',
      label: 'Support Level',
      meta: {
        options: [
          { label: 'L1', value: 'L1' },
          { label: 'L2', value: 'L2' },
        ],
      },
    },
  ],
  driver: [
    ...usersBaseSchema,
    {
      key: 'licenseNumber',
      name: 'licenseNumber',
      fieldType: 'Text',
      label: 'Driver License Number',
    },
    {
      key: 'vehicleType',
      name: 'vehicleType',
      fieldType: 'Select',
      label: 'Vehicle Type',
      meta: {
        options: [
          { label: 'Car', value: 'car' },
          { label: 'Bike', value: 'bike' },
        ],
      },
    },
  ],
};
