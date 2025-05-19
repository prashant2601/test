import { MRT_ColumnDef } from 'material-react-table';
import {
  useGetExpenseCategory,
  useAddExpenseCategory,
  useEditExpenseCategory,
  useDeleteExpenseCategory,
  ExpenseCategory,
} from './hooks/expenseCategoryHooks';
import GenericCRUDTable from '../../../../components/CoreUI/GenericCRUDTable';
import { useMemo, useState } from 'react';

const validateExpenseCategory = (values: Partial<ExpenseCategory>) => {
  const errors: Record<string, string | undefined> = {};
  if (!values.categoryName) {
    errors.categoryName = 'Category Name is required';
  }
  return errors;
};

const ExpenseCategoryCRUD = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const expenseCategoryColumns = useMemo<MRT_ColumnDef<ExpenseCategory>[]>(
    () => [
      {
        accessorKey: 'categoryId',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'categoryName',
        header: 'Category Name',
        size: 240,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.categoryName,
          helperText: validationErrors?.categoryName,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              categoryName: undefined,
            })),
        },
      },
    ],
    [validationErrors]
  );

  return (
    <GenericCRUDTable<ExpenseCategory>
      title="Expense Category"
      columns={expenseCategoryColumns}
      validateFn={validateExpenseCategory}
      useGetHook={useGetExpenseCategory}
      useAddHook={useAddExpenseCategory}
      useEditHook={useEditExpenseCategory}
      useDeleteHook={useDeleteExpenseCategory}
      getRowId={(row) => row.categoryId?.toString()}
      dataMappingKey="category"
      setValidationErrors={setValidationErrors}
    />
  );
};

export default ExpenseCategoryCRUD;
