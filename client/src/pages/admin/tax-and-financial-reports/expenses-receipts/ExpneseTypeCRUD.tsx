import { MRT_ColumnDef } from 'material-react-table';
import {
  useGetExpenseTypes,
  useAddExpenseType,
  useEditExpenseType,
  useDeleteExpenseType,
  ExpenseType,
} from './hooks/expenseTypesHooks';
import GenericCRUDTable from '../../../../components/CoreUI/GenericCRUDTable';
import { useMemo, useState } from 'react';

const validateExpenseType = (values: Partial<ExpenseType>) => {
  const errors: Record<string, string | undefined> = {};
  if (!values.expenseTypeName) {
    errors.expenseTypeName = 'Expense Type Name is required';
  }
  return errors;
};

const ExpenseTypeCRUD = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const expenseTypeColumns = useMemo<MRT_ColumnDef<ExpenseType>[]>(
    () => [
      {
        accessorKey: 'expenseTypeId',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'expenseTypeName',
        header: 'Expense Type Name',
        size: 240,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.expenseTypeName,
          helperText: validationErrors?.expenseTypeName,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              expenseTypeName: undefined,
            })),
        },
      },
    ],
    [validationErrors]
  );

  return (
    <GenericCRUDTable<ExpenseType>
      title="Expense Type"
      columns={expenseTypeColumns}
      validateFn={validateExpenseType}
      useGetHook={useGetExpenseTypes}
      useAddHook={useAddExpenseType}
      useEditHook={useEditExpenseType}
      useDeleteHook={useDeleteExpenseType}
      getRowId={(row) => row.expenseTypeId?.toString()}
      dataMappingKey="expenseType"
      setValidationErrors={setValidationErrors}
    />
  );
};

export default ExpenseTypeCRUD;
