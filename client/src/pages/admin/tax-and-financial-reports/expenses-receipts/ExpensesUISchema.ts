import { UISCHEMA } from '../../customers/CRUDUISchema/customersUISchema';
import { PaymentTypeEnum, SpentByEnum } from './hooks/useGetExpenseData';

export const expensesUISchemaArray: UISCHEMA[] = [
  {
    key: 'receiptDate',
    name: 'receiptDate',
    fieldType: 'DateTimeRange',
    label: 'Receipt Date',
  },
  {
    key: 'storeName',
    name: 'storeName',
    fieldType: 'ExpenseStoreNameInput',
    label: 'Store Name',
  },
  {
    key: 'expenseType',
    name: 'expenseType',
    fieldType: 'ExpenseTypeInput',
    label: 'Expense Type',
  },
  {
    key: 'spentBy',
    name: 'spentBy',
    fieldType: 'Select',
    label: 'Spent By',
    meta: {
      options: Object.values(SpentByEnum).map((type) => ({
        label: type,
        value: type,
      })),
    },
  },
  {
    key: 'claimableVAT',
    name: 'claimableVAT',
    fieldType: 'Number',
    label: 'Claimable VAT',
  },
  {
    key: 'totalAmount',
    name: 'totalAmount',
    fieldType: 'Number',
    label: 'Total Amount',
  },

  {
    key: 'paidStatus',
    name: 'paidStatus',
    fieldType: 'Select',
    label: 'Paid Status',
    meta: {
      options: [
        { label: 'Paid', value: 'PAID' },
        { label: 'Unpaid', value: 'UNPAID' },
      ],
    },
  },
];
