import { UISCHEMA } from '../../customers/CRUDUISchema/customersUISchema';
import { accountRoleOptions } from '../constants';

export const bankAccountsUISchemaArray: UISCHEMA[] = [
  {
    key: 'accId',
    name: 'accId',
    fieldType: 'Number',
    label: 'Account ID',
    disabled: {
      disabledFieldForNew: true,
      disableFieldForEdit: true,
    },
    hidden: {
      hideFieldForNEW: true,
    },
  },

  {
    key: 'accountHolderName',
    name: 'accountHolderName',
    fieldType: 'Text',
    label: 'Account Holder Name',
  },
  {
    key: 'bankName',
    name: 'bankName',
    fieldType: 'Text',
    label: 'Bank Name',
  },
  {
    key: 'accountNumber',
    name: 'accountNumber',
    fieldType: 'Number',
    label: 'Account Number',
  },
  {
    key: 'sortCode',
    name: 'sortCode',
    fieldType: 'SortCode',
    label: 'Sort Code',
  },
  {
    key: 'accountHolderId',
    name: 'accountHolderId',
    fieldType: 'Number',
    label: 'Account Holder ID',
    disabled: {
      disabledFieldForNew: true,
      disableFieldForEdit: true,
    },
    hidden: {
      hideFieldForNEW: true,
    },
  },
  {
    key: 'accountRole',
    name: 'accountRole',
    fieldType: 'Select',
    label: 'Account Role',
    meta: {
      options: accountRoleOptions,
    },
  },
  {
    key: 'merchant Id',
    name: 'merchantId',
    fieldType: 'MerchantIDs',
    label: 'Merchant',
    meta: {
      multiSelect: false,
      conditionallyRender: true,
    },
  },
];
