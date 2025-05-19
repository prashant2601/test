import { useCallback, useMemo, useState } from 'react';
import DebouncedAutoCompleteTextInput from './AppAutoCompletes/DebouncedAutoCompleteTextInput';
import { useGetExpenseTypes } from '../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/expenseTypesHooks';
import { getIn, useFormikContext } from 'formik';
import { useDebouncedValue } from '@mantine/hooks';

const getOptionValue = (option: { label: string; value: string }) =>
  option?.value;

const getOptionLabel = (option: { label: string; value: string }) =>
  option?.label;

const ExpenseTypeInput = ({ name }: { name: string }) => {
  const { setFieldValue, values, errors, touched } = useFormikContext();
  const value = getIn(values, name) ?? ''; // Access nested value
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  const [enableQuery, setEnableQuery] = useState(false);
  const [debouncedValue] = useDebouncedValue(value, 200);

  // Fetching Expense Types data
  const { data, isLoading, isFetching, isError } = useGetExpenseTypes({
    limit: 100,
    pageNo: 1,
    query: debouncedValue,
    enabled: enableQuery,
  });

  // Preparing the data for autocomplete input
  const dataForAutoCompleteInput = useMemo(
    () =>
      data?.expenseType?.map((item) => ({
        label: item.expenseTypeName, // Expense type name will be used as label
        value: item.expenseTypeName, // Expense type name will also be used as value
      })),
    [data?.expenseType]
  );

  // Handling the selection of an option
  const onOptionSelect = useCallback(
    (val: string) => {
      const selectedOption = data?.expenseType?.find(
        (item) => item.expenseTypeName === val
      );
      if (selectedOption) {
        setFieldValue(name, selectedOption?.expenseTypeName);
      }
    },
    [data?.expenseType, setFieldValue, name]
  );

  return (
    <DebouncedAutoCompleteTextInput
      data={dataForAutoCompleteInput ?? []}
      disable={false}
      isError={isError}
      isFetching={isFetching}
      TextInputLabel="Select Expense Type"
      optionValue={getOptionValue}
      isLoading={isLoading}
      optionLabel={getOptionLabel}
      dropdownMaxHeight={300}
      setSearch={(search: string) => {
        setFieldValue(name, search);
      }}
      search={value}
      noOptionFound="No Expense Type Found"
      onOptionSelect={onOptionSelect}
      needLabel={true}
      width="300px"
      validationError={isTouched && error}
      setEnableQuery={setEnableQuery}
    />
  );
};

export default ExpenseTypeInput;
