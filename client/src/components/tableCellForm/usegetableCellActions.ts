import { useUpdateCustomerDetailsbyId } from '../../pages/admin/customers/hooks/useUpdateCustomerDetailsbyId';
import { useCreateOrder } from '../../pages/admin/orders/hooks/useCreateOrder';
import { useUpdateOrders } from '../../pages/admin/orders/hooks/useUpdateOrders';
import { useAddCustomer } from '../../pages/admin/customers/hooks/useAddCustomerDetails';
import { useUpdateMerchantDetailsbyId } from '../../pages/admin/merchants/hooks/useUpdateMerchantDetailsbyId';
import { useAddMerchant } from '../../pages/admin/merchants/hooks/useAddMerchantDetails';
import { useCreateUser } from '../../pages/admin/adminPanelSetting/usersAndRole/hooks/useCreateUser';
import { useUpdateUser } from '../../pages/admin/adminPanelSetting/usersAndRole/hooks/useUpdateUser';
import { useCreateBankAccount } from '../../pages/admin/bankAccounts/hooks/useCreateBankAccounts';
import { useUpdateBankAccount } from '../../pages/admin/bankAccounts/hooks/useUpdateBankAccount';
import { useAddSwishrCourierCustomerDetails } from '../../pages/admin/swishrCourier/customers/hooks/useAddSwishrCourierCustomerDetails';
import { useUpdateSwishrCourierCustomerDetailsbyId } from '../../pages/admin/swishrCourier/customers/hooks/useUpdateSwishrCourierCustomerDetailsbyId';
import { useUpdateOldInvoice } from '../../pages/admin/accounting/hooks/useUpdateOldInvoice';
import { useUploadOldInvoicePDF } from '../../pages/admin/accounting/hooks/useUploadOldInvoicePDF';

import { TableNames } from '../../enums';
import { useUploadExpenseData } from '../../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/useUploadExpenseData';
import { useEditExpenseData } from '../../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/useEditExpenseData';

const useGetTableCellActions = (tableName: Partial<TableNames> | undefined) => {
  const actionHooks = {
    [TableNames.OrdersDisplay]: {
      create: useCreateOrder(),
      update: useUpdateOrders(),
    },
    [TableNames.CustomersDisplay]: {
      create: useAddCustomer(),
      update: useUpdateCustomerDetailsbyId(),
    },
    [TableNames.MerchantsDisplay]: {
      create: useAddMerchant(),
      update: useUpdateMerchantDetailsbyId(),
    },
    [TableNames.UsersDisplay]: {
      create: useCreateUser(),
      update: useUpdateUser(),
    },
    [TableNames.BankAccountDisplay]: {
      create: useCreateBankAccount(),
      update: useUpdateBankAccount(),
    },
    [TableNames.SwishrCourierCustomersDisplay]: {
      create: useAddSwishrCourierCustomerDetails(),
      update: useUpdateSwishrCourierCustomerDetailsbyId(),
    },
    [TableNames.AllOldInvoicesDisplay]: {
      create: useUploadOldInvoicePDF(),
      update: useUpdateOldInvoice(),
    },
    [TableNames.ExpensesDisplay]: {
      create: useUploadExpenseData(),
      update: useEditExpenseData(),
    },
  };

  const hooks =
    tableName && tableName in actionHooks
      ? actionHooks[tableName as keyof typeof actionHooks]
      : undefined;

  if (!hooks || !tableName) {
    return {
      New: {
        CreateNewRecord: undefined,
        IsCreatingNewCrecord: false,
        IsSuccessInCreatingNewRecord: false,
        isErrorInCreatingNewRecord: false,
        ErrorObjectinCreatingNewRecord: undefined,
        ResetNewRecordMutation: undefined,
      },
      Edit: {
        EditRecord: undefined,
        isPendingEdit: false,
        isSuccessInEditing: false,
        isErrorinUpdating: false,
        ResetEditRecordMutation: undefined,
      },
    };
  }

  const { create, update } = hooks;

  return {
    New: {
      CreateNewRecord: create.mutateAsync,
      IsCreatingNewCrecord: create.isPending,
      IsSuccessInCreatingNewRecord: create.isSuccess,
      isErrorInCreatingNewRecord: create.isError,
      ErrorObjectinCreatingNewRecord: create.error,
      ResetNewRecordMutation: create.reset,
    },
    Edit: {
      EditRecord: update.mutateAsync,
      isPendingEdit: update.isPending,
      isSuccessInEditing: update.isSuccess,
      isErrorinUpdating: update.isError,
      ResetEditRecordMutation: update.reset,
    },
  };
};
export default useGetTableCellActions;
