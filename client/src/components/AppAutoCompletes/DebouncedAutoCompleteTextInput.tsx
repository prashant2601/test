import { useEffect, useMemo } from 'react';
import { Combobox, TextInput, useCombobox } from '@mantine/core';

interface DebouncedAutoCompleteTextInputProps<T> {
  disable: boolean;
  TextInputLabel: string;
  optionLabel: (item: T) => string;
  optionValue: (item: T) => string;
  data: { label: string; value: string }[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  dropdownMaxHeight?: number;
  setSearch: (search: string) => void;
  search: string;
  noOptionFound: string;
  onOptionSelect: (val: string) => void;
  needLabel: boolean;
  width?: string;
  validationError?: string;
  setEnableQuery?: React.Dispatch<React.SetStateAction<boolean>>;
}

function DebouncedAutoCompleteTextInput<T>({
  disable,
  TextInputLabel,
  optionLabel,
  data,
  isLoading,
  isError,
  isFetching,
  dropdownMaxHeight = 300,
  optionValue,
  search,
  setSearch,
  noOptionFound,
  onOptionSelect,
  needLabel = true,
  width,
  validationError,
  setEnableQuery,
}: Readonly<DebouncedAutoCompleteTextInputProps<T>>) {
  const options = useMemo(
    () =>
      data?.map((item: any) => (
        <Combobox.Option value={optionValue(item)} key={optionValue(item)}>
          {optionLabel(item)}
        </Combobox.Option>
      )),
    [data]
  );
  const relevantText = useMemo(() => {
    if (isLoading || isFetching) return 'Loading...';
    else if (data?.length === 0 && search?.length === 0)
      return 'Start Typing..';
    else if (data?.length === 0 && search?.length > 0) return noOptionFound;
    else if (isError) {
      return 'Error in loading the options..';
    }
  }, [isLoading, isFetching, isError, data, search]);
  const combobox = useCombobox();

  useEffect(() => {
    if (setEnableQuery) {
      if (combobox.dropdownOpened) {
        setEnableQuery(true);
      } else {
        setEnableQuery(false);
      }
    }
  }, [combobox.dropdownOpened]);
  return (
    <Combobox
      store={combobox}
      position="bottom-start"
      withArrow
      disabled={disable}
      onOptionSubmit={(val) => {
        combobox.closeDropdown();
        onOptionSelect(val);
      }}
    >
      <Combobox.Target withAriaAttributes={false}>
        <TextInput
          w={width ?? '200px'}
          label={needLabel ? TextInputLabel : undefined}
          placeholder="Start Typing.."
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          error={validationError}
        />
      </Combobox.Target>

      <Combobox.Dropdown
        mah={dropdownMaxHeight}
        style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}
      >
        <Combobox.Options>
          {options && options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>{relevantText}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default DebouncedAutoCompleteTextInput;
