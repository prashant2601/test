import { useMemo } from 'react';
import { Combobox, useCombobox } from '@mantine/core';
import { Button } from '@mui/material';
import { IconChevronDown, IconDatabaseEdit } from '@tabler/icons-react';

interface DebouncedOptionSearchSelectProps<T> {
  disableButton: boolean;
  handleBulkUpdate: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  buttonLabel: string;
  dropdownPlaceholder: string;
  emptyMessage: string;
  optionLabel: (item: T) => string;
  optionValue: (item: T) => string;
  data: T[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  dropdownMaxHeight?: number;
  limit?: number;
}

function DebouncedOptionSearchSelect<T>({
  disableButton,
  handleBulkUpdate,
  search,
  setSearch,
  buttonLabel,
  dropdownPlaceholder,
  emptyMessage,
  optionLabel,
  data,
  isLoading,
  isError,
  isFetching,
  dropdownMaxHeight = 300,
  limit = 100,
  optionValue,
}: Readonly<DebouncedOptionSearchSelectProps<T>>) {
  const options = useMemo(
    () =>
      data?.map((item: any) => (
        <Combobox.Option value={optionValue(item)} key={item.id}>
          {optionLabel(item)}
        </Combobox.Option>
      )),
    [data, optionLabel]
  );

  const relevantText = useMemo(() => {
    if (isLoading || isFetching) return 'Loading...';
    if (isError) return emptyMessage || 'No results found';
    if (data?.length === 0) return 'No results found';
    return null;
  }, [isLoading, isFetching, isError, data, emptyMessage]);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch('');
    },
    onDropdownOpen: () => {
      if (!disableButton) {
        combobox.focusSearchInput();
      }
    },
  });

  return (
    <Combobox
      store={combobox}
      position="bottom-start"
      withArrow
      disabled={disableButton}
      onOptionSubmit={(val) => {
        handleBulkUpdate(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target withAriaAttributes={false}>
        <Button
          onClick={() => combobox.toggleDropdown()}
          size="small"
          disabled={disableButton}
          endIcon={<IconChevronDown />}
          variant="contained"
          color={'info'}
        >
          {buttonLabel} <IconDatabaseEdit stroke={2} size={16} />
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown
        mah={dropdownMaxHeight}
        style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}
      >
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder={dropdownPlaceholder}
        />
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

export default DebouncedOptionSearchSelect;
