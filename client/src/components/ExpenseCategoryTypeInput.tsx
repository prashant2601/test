import { useCallback, useMemo, useState } from 'react';
import DebouncedAutoCompleteTextInput from './AppAutoCompletes/DebouncedAutoCompleteTextInput';
import { useGetExpenseCategory } from '../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/expenseCategoryHooks';
import { getIn, useFormikContext } from 'formik';
import { useDebouncedValue } from '@mantine/hooks';
const getOptionValue = (option: { label: string; value: string }) =>
  option?.value;
const getOptionLabel = (option: { label: string; value: string }) =>
  option?.label;
const ExpenseCategoryTypeInput = ({ name }: { name: string }) => {
  const { setFieldValue, values, errors, touched } = useFormikContext();
  const value = getIn(values, name) ?? ''; // Access nested value
  const error = getIn(errors, name);
  const [enableQuery, setEnableQuery] = useState(false);
  const isTouched = getIn(touched, name);
  const [debouncedValue] = useDebouncedValue(value, 200);
  const { data, isLoading, isFetching, isError } = useGetExpenseCategory({
    limit: 100,
    pageNo: 1,
    query: debouncedValue,
    enabled: enableQuery,
  });
  const dataForAutoCompleteInput = useMemo(
    () =>
      data?.category?.map((item) => ({
        label: item.categoryName,
        value: item.categoryName,
      })),
    [data?.category]
  );
  const onOptionSelect = useCallback(
    (val: string) => {
      const selectedOption = data?.category?.find(
        (item) => item.categoryName === val
      );
      if (selectedOption) {
        setFieldValue(name, selectedOption?.categoryName);
      }
    },
    [data?.category, setFieldValue]
  );
  return (
    <DebouncedAutoCompleteTextInput
      data={dataForAutoCompleteInput ?? []}
      disable={false}
      isError={isError}
      isFetching={isFetching}
      TextInputLabel="Select Category"
      optionValue={getOptionValue}
      isLoading={isLoading}
      optionLabel={getOptionLabel}
      dropdownMaxHeight={300}
      setSearch={(search: string) => {
        setFieldValue(name, search);
      }}
      search={value}
      noOptionFound="No Category Found"
      onOptionSelect={onOptionSelect}
      needLabel={false}
      width="300px"
      validationError={isTouched && error}
      setEnableQuery={setEnableQuery}
    />
  );
};

export default ExpenseCategoryTypeInput;
