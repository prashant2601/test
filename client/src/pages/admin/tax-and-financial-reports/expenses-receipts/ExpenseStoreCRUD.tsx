import { MRT_ColumnDef } from 'material-react-table';
import {
  useAddExpenseStore,
  useGetExpenseStore,
  useEditExpenseStore,
  useDeleteExpenseStore,
  ExpenseStore,
  StoreAddress,
} from './hooks/expenseStoreHooks';
import GenericCRUDTable from '../../../../components/CoreUI/GenericCRUDTable';
import { useMemo, useState } from 'react';

const validateExpenseStore = (values: Partial<ExpenseStore>) => {
  const errors: Record<string, string | Object> = {};
  // Validate storeName
  if (!values.storeName) {
    errors.storeName = 'Store Name is required';
  }
  // if (!values?.storeAddress.line1) {
  //   errors.storeAddress =
  //     typeof errors.storeAddress === 'object' ? errors.storeAddress : {};
  //   errors.storeAddress = {
  //     ...errors.storeAddress,
  //     line1: 'Address Line 1 is required',
  //   };
  // }
  // if (!values.storeAddress?.city) {
  //   errors.storeAddress = {
  //     ...(typeof errors.storeAddress === 'object' ? errors.storeAddress : {}),
  //     city: 'City is required',
  //   };
  // }
  return errors;
};

const ExpenseStoreTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | StoreAddress[keyof StoreAddress]>
  >({});

  const expenseStoreColumns = useMemo<MRT_ColumnDef<ExpenseStore>[]>(
    () => [
      {
        accessorKey: 'storeId',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'storeName',
        header: 'Store Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.storeName,
          helperText: validationErrors?.storeName,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeName: undefined,
            })),
        },
      },
      {
        accessorKey: 'storeAddress.line1', // Nested accessor for line1
        header: 'Address Line 1',
        accessorFn: (row) => row?.storeAddress?.line1,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.storeAddress?.line1,
          helperText: validationErrors?.storeAddress?.line1,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress, line1: undefined },
            })),
        },
      },
      {
        accessorKey: 'storeAddress.line2', // Nested accessor for line2
        accessorFn: (row) => row?.storeAddress?.line2,
        header: 'Address Line 2',
        muiEditTextFieldProps: {
          error: !!validationErrors?.storeAddress?.line2,
          helperText: validationErrors?.storeAddress?.line2,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress?.line2, line2: undefined },
            })),
        },
      },
      {
        accessorKey: 'storeAddress.area', // Nested accessor for area
        accessorFn: (row) => row?.storeAddress?.area,
        header: 'Area',
        muiEditTextFieldProps: {
          error: !!validationErrors?.storeAddress?.area,
          helperText: validationErrors?.storeAddress?.area,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress, area: undefined },
            })),
        },
      },
      {
        accessorKey: 'storeAddress.city', // Nested accessor for city
        accessorFn: (row) => row?.storeAddress?.city,
        header: 'City',
        muiEditTextFieldProps: {
          required: false,
          error: !!validationErrors?.storeAddress?.city,
          helperText: validationErrors?.storeAddress?.city,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress, city: undefined },
            })),
        },
      },
      {
        accessorKey: 'storeAddress.post',
        accessorFn: (row) => row?.storeAddress?.post,
        header: 'POST',
        muiEditTextFieldProps: {
          required: false,
          error: !!validationErrors?.storeAddress?.post,
          helperText: validationErrors?.storeAddress?.post,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress, post: undefined },
            })),
        },
      },
      {
        accessorKey: 'storeAddress.country', // Nested accessor for country
        accessorFn: (row) => row?.storeAddress?.country,
        header: 'Country',
        muiEditTextFieldProps: {
          error: !!validationErrors?.storeAddress?.country,
          helperText: validationErrors?.storeAddress?.country,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              storeAddress: { ...prev.storeAddress, country: undefined },
            })),
        },
      },
      // {
      //   accessorKey: 'storeProfileImg',
      //   header: 'Store Profile Image',
      // },
    ],
    [validationErrors]
  );

  return (
    <GenericCRUDTable<ExpenseStore>
      title="Expense Store"
      columns={expenseStoreColumns}
      validateFn={validateExpenseStore}
      useGetHook={useGetExpenseStore}
      useAddHook={useAddExpenseStore}
      useEditHook={useEditExpenseStore}
      useDeleteHook={useDeleteExpenseStore}
      getRowId={(row) => row.storeId?.toString()}
      dataMappingKey="expenseStore"
      setValidationErrors={setValidationErrors}
    />
  );
};

export default ExpenseStoreTable;
