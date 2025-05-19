import { useCallback, useMemo, useState } from 'react';
import DebouncedAutoCompleteTextInput from './AppAutoCompletes/DebouncedAutoCompleteTextInput';
import { useGetExpenseStore } from '../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/expenseStoreHooks';
import { getIn, useFormikContext } from 'formik';
import { useDebouncedValue } from '@mantine/hooks';

const getOptionValue = (option: { label: string; value: string }) =>
  option?.value;

const getOptionLabel = (option: { label: string; value: string }) =>
  option?.label;

const ExpenseStoreNameInput = ({ name }: { name: string }) => {
  const { setFieldValue, values, errors, touched } = useFormikContext();
  const value = getIn(values, name) ?? ''; // Access nested value
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  const [debouncedValue] = useDebouncedValue(value, 200);
  const [enableQuery, setEnableQuery] = useState(false);
  // Fetching Expense Store data
  const { data, isLoading, isFetching, isError } = useGetExpenseStore({
    limit: 100,
    pageNo: 1,
    query: debouncedValue,
    enabled: enableQuery,
  });

  // Preparing the data for autocomplete input
  const dataForAutoCompleteInput = useMemo(
    () =>
      data?.expenseStore?.map((item) => ({
        label: item.storeName, // Store name will be used as label
        value: item.storeName, // Store name will also be used as value
      })),
    [data?.expenseStore]
  );

  // Handling the selection of an option
  const onOptionSelect = useCallback(
    (val: string) => {
      const selectedOption = data?.expenseStore?.find(
        (item) => item.storeName === val
      );
      if (selectedOption) {
        setFieldValue(name, selectedOption?.storeName);
      }
    },
    [data?.expenseStore, name]
  );

  return (
    <DebouncedAutoCompleteTextInput
      data={dataForAutoCompleteInput ?? []}
      disable={false}
      isError={isError}
      isFetching={isFetching}
      TextInputLabel="Select Store"
      optionValue={getOptionValue}
      isLoading={isLoading}
      optionLabel={getOptionLabel}
      dropdownMaxHeight={300}
      setSearch={(search: string) => {
        setFieldValue(name, search);
      }}
      search={value}
      noOptionFound="No Store Found"
      onOptionSelect={onOptionSelect}
      needLabel={true}
      width="300px"
      validationError={isTouched && error}
      setEnableQuery={setEnableQuery}
    />
  );
};

export default ExpenseStoreNameInput;
