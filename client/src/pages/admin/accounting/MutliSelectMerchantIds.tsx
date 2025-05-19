import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  PillsInput,
  Pill,
  Combobox,
  CheckIcon,
  Group,
  useCombobox,
  CloseButton,
  Text,
  TextInput,
} from '@mantine/core';
import {
  DebouncedSearchedMerchant,
  useGetMerchantIdAndName,
} from '../merchants/hooks/useGetMerchantIdAndName';
import { useFormikContext } from 'formik';
import { extractNumberInBrackets } from '../../../utility/helperFuntions';
import ApiHelpers from '../../../api/ApiHelpers';
import ApiConstants from '../../../api/ApiConstants';
import { AxiosResponse } from 'axios';
import { GetAllMerchantDetailsResponse } from '../merchants/hooks/useGetAllMerchantsDetails';

interface MultiSelectMerchants {
  name: string;
  multiSelect?: boolean;
  needLabel?: boolean;
  disabled?: boolean;
  onSingleMerchantSelect?: (merchant: DebouncedSearchedMerchant) => void;
  onRemoveSingleValueInSingleSelect?: () => void;
  singelSelectTextInputWidth?: number;
}

function MutliSelectMerchantIds({
  name,
  multiSelect = true,
  needLabel = false,
  disabled = false,
  onSingleMerchantSelect,
  singelSelectTextInputWidth,
  onRemoveSingleValueInSingleSelect,
}: MultiSelectMerchants) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const initialMerchantIdsMappingRef = useRef<Record<string, string>>({});

  const { values, setFieldValue, errors, touched, initialValues } =
    useFormikContext<any>();
  const [loadingInitialSelected, setLoadingInitialSelected] = useState(false);
  useEffect(() => {
    if (initialValues?.[name]?.toString()?.length > 0) {
      if (!multiSelect && initialValues?.merchantName) {
        initialMerchantIdsMappingRef.current[
          initialValues?.[name]?.toString()
        ] = initialValues?.merchantName;
        return;
      }
      setLoadingInitialSelected(true);
      ApiHelpers.GET(ApiConstants.GET_MERCHANT_DETAILS(), {
        params: {
          merchantId: multiSelect
            ? initialValues?.[name]?.toString()
            : initialValues?.[name],
          page: 1,
          limit: 100,
        },
      })
        .then((data: AxiosResponse<GetAllMerchantDetailsResponse>) => {
          initialMerchantIdsMappingRef.current = data.data?.merchant?.reduce(
            (acc: Record<string, string>, item) => {
              acc[item?.merchantId.toString()] =
                item?.merchantName + ' (' + item?.merchantId.toString() + ')';
              return acc;
            },
            {}
          );
        })
        .finally(() => {
          setLoadingInitialSelected(false);
        });
    }
  }, [initialValues?.[name], multiSelect]);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, isFetching } = useGetMerchantIdAndName(
    search,
    combobox.dropdownOpened,
    1,
    100
  );

  const meta = { touched: touched[name], error: errors[name] };
  const handleValueSelect = (val: string) => {
    const selectedMerchantId = extractNumberInBrackets(val)?.toString();
    if (!selectedMerchantId) return;
    initialMerchantIdsMappingRef.current[selectedMerchantId] = val;
    if (multiSelect) {
      const oldValue = values?.[name] || [];
      const finalValue = oldValue.includes(selectedMerchantId)
        ? oldValue.filter((v) => v !== selectedMerchantId)
        : [...oldValue, selectedMerchantId];
      setFieldValue(name, finalValue);
    } else {
      if (onSingleMerchantSelect) {
        const getSelectedMerchantAllDetails = data?.data?.merchants?.find(
          (merchant) => merchant?.merchantId?.toString() === selectedMerchantId
        );
        onSingleMerchantSelect(getSelectedMerchantAllDetails);
      }
      setFieldValue(name, selectedMerchantId);
      combobox.closeDropdown();
    }
    setSearch('');
  };

  const handleRemoveSingleValueInSingleSelect = () => {
    setFieldValue(name, '');
    if (onRemoveSingleValueInSingleSelect) {
      onRemoveSingleValueInSingleSelect();
    }
  };
  const handleClearAllMultiselect = useCallback(() => {
    setFieldValue(name, multiSelect ? [] : '');
  }, [multiSelect, name, setFieldValue]);
  const removeSingleValueInMultiselct = (removeId: string) => {
    const oldValue = values?.[name] || [];
    setFieldValue(
      name,
      oldValue?.filter((merchantId: string) => merchantId !== removeId)
    );
  };
  const options = data?.data?.merchants?.map((merchant) => {
    const merchantNameAndIdString =
      merchant?.merchantName +
      ' ' +
      '(' +
      merchant?.merchantId.toString() +
      ')';

    return (
      <Combobox.Option
        value={merchantNameAndIdString}
        key={merchantNameAndIdString}
      >
        <Group gap="sm">
          {multiSelect
            ? values?.[name]?.includes(merchantNameAndIdString) && (
                <CheckIcon size={12} />
              )
            : values?.[name] === merchantNameAndIdString && (
                <CheckIcon size={12} />
              )}
          <span>{merchantNameAndIdString}</span>
        </Group>
      </Combobox.Option>
    );
  });
  const relevantText = useMemo(() => {
    if (isLoading || isFetching) return 'Loading Merchants...';
    if (isError) return 'No Merchants Found';
    if (data?.data?.totalCount && data.data.totalCount > 100)
      return 'More than 100 Merchants found, Please refine your search';
    return null;
  }, [isLoading, isFetching, isError, data]);
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      disabled={disabled}
    >
      <Combobox.Header
        styles={{ header: { borderBottom: 0, paddingBottom: 0 } }}
      >
        {needLabel && multiSelect && (
          <Text size={'sm'} fw={500} p={0}>
            Select Merchant(s)
          </Text>
        )}
      </Combobox.Header>
      <Combobox.DropdownTarget>
        {multiSelect ? (
          <PillsInput
            onClick={() => combobox.openDropdown()}
            size="md"
            rightSection={
              values?.[name]?.length !== 0 && (
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClearAllMultiselect}
                  aria-label="Clear value"
                />
              )
            }
          >
            <Pill.Group>
              {values?.[name]?.map((item) => (
                <Pill
                  key={item}
                  withRemoveButton
                  onRemove={() => removeSingleValueInMultiselct(item)}
                  styles={{
                    root: {
                      backgroundColor: '#12b886',
                      color: 'white',
                      fontWeight: 'normal',
                    },
                  }}
                >
                  {loadingInitialSelected
                    ? 'Loading...'
                    : initialMerchantIdsMappingRef.current[item]}
                </Pill>
              ))}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  value={search}
                  placeholder="Search Merchants"
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  disabled={disabled}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        ) : (
          <TextInput
            label={needLabel ? 'Select Merchant' : null}
            placeholder="Start Typing ..."
            styles={{
              root: { width: singelSelectTextInputWidth ? '300px' : 'auto' },
            }}
            value={
              values[name]
                ? initialMerchantIdsMappingRef.current[values[name]]
                : search
            }
            onChange={(event) => {
              setSearch(event.target.value);
              combobox.openDropdown();
            }}
            disabled={disabled}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSection={
              values[name] && (
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleRemoveSingleValueInSingleSelect}
                  aria-label="Clear value"
                />
              )
            }
          />
        )}
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options mah={300} style={{ overflowY: 'auto' }}>
          {options && options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>{relevantText}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>

      {meta.error && typeof meta.error === 'string' && (
        <Combobox.Footer styles={{ footer: { borderTop: 0 } }}>
          <Text c="red" size="xs">
            {meta.error}
          </Text>
        </Combobox.Footer>
      )}
    </Combobox>
  );
}

export default MutliSelectMerchantIds;
