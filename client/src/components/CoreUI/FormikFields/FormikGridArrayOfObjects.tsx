import { FC, useMemo } from 'react';
import { useFormikContext, Field, getIn } from 'formik';
import {
  Table,
  ActionIcon,
  TextInput,
  NumberInput,
  Fieldset,
  Group,
  Tooltip,
  Center,
  Checkbox,
  Text,
  Select,
  Radio,
} from '@mantine/core';
import { IconSquareRoundedPlus, IconTrash } from '@tabler/icons-react';
import { DateInput, DateTimePicker } from '@mantine/dates';
import ExpenseCategoryTypeInput from '../../ExpenseCategoryTypeInput';
import {
  flattenObject,
  unflattenObject,
} from '../../../utility/helperFuntions';

interface FormikGridProps {
  name: string;
  columns: string[];
  columnsHeader: string[];
  columnWidths: string[];
  fieldTypes: Record<
    string,
    | 'text'
    | 'number'
    | 'date'
    | 'VAT_Checkbox'
    | 'ExpenseCategoryType'
    | 'select'
    | 'selectNumber'
    | 'date-time'
    | 'RadioGroupBooleanValue'
  >;
  FieldsetHeader: string;
  selectOptions?: {
    columnName: string;
    options: { label: string; value: string | number }[];
  }[];
  newRowDefaulValues?: Record<string, any>;
  disableColumns?: string[];
}

const getSelectOptions = (
  options: { value: string | number; label: string }[] = []
) =>
  options.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

const YesNoOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const FormikGrid: FC<FormikGridProps> = ({
  name,
  columns,
  fieldTypes,
  columnsHeader,
  FieldsetHeader,
  columnWidths,
  selectOptions,
  newRowDefaulValues = {},
  disableColumns = [],
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const rows = getIn(values, name) ?? [];
  const error = getIn(errors, name);
  const fieldTouched = getIn(touched, name);
  console.log(errors, 'errors');
  const selectOptionsMap = useMemo(() => {
    const map: Record<string, { label: string; value: string | number }[]> = {};
    selectOptions?.forEach(({ columnName, options }) => {
      map[columnName] = options;
    });
    return map;
  }, [selectOptions]);

  const handleAddRow = () => {
    const defaultFlat = flattenObject(newRowDefaulValues);
    const newRow = unflattenObject(defaultFlat); // Ensures deep defaults are supported
    setFieldValue(name, [...rows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setFieldValue(name, updatedRows);
  };

  const handleDeleteAll = () => {
    setFieldValue(name, []);
  };

  const renderCell = (
    rowIndex: number,
    column: string,
    fieldType: string,
    columnHeader: string
  ) => {
    const fieldName = `${name}[${rowIndex}].${column}`;
    return (
      <Field name={fieldName} key={fieldName}>
        {({ field }) => {
          const handleChange = (value: any) => {
            const flatRow = flattenObject(rows[rowIndex]);
            const updatedFlatRow = { ...flatRow, [column]: value };
            const updatedNestedRow = unflattenObject(updatedFlatRow);
            const updatedRows = [...rows];
            updatedRows[rowIndex] = updatedNestedRow;
            setFieldValue(name, updatedRows);
          };
          const isFieldDisabled =
            disableColumns.includes(column) ||
            (name === 'paymentDetails' &&
              rows[rowIndex]?.paymentType === 'CASH' &&
              (column === 'cardType' || column === 'paymentFrom.CARD')) ||
            (name === 'paymentDetails' &&
              rows[rowIndex]?.paymentType === 'CARD' &&
              column === 'paymentFrom.CASH');
          const isErrorInField =
            typeof fieldTouched === 'object' &&
            getIn(fieldTouched, `[${rowIndex}].${column}`)
              ? getIn(error, `[${rowIndex}].${column}`)
              : undefined;
          switch (fieldType) {
            case 'ExpenseCategoryType':
              return <ExpenseCategoryTypeInput name={fieldName} />;

            case 'number':
              return (
                <NumberInput
                  {...field}
                  value={field.value ?? ''}
                  onChange={handleChange}
                  placeholder={`Enter ${columnHeader}`}
                  prefix="£"
                  disabled={isFieldDisabled}
                  error={isErrorInField}
                />
              );

            case 'select':
              return (
                <Select
                  data={getSelectOptions(selectOptionsMap[column])}
                  value={field.value ?? ''}
                  onChange={handleChange}
                  placeholder={`Select ${columnHeader}`}
                  error={isErrorInField}
                />
              );

            case 'selectNumber':
              return (
                <Select
                  data={getSelectOptions(selectOptionsMap[column])}
                  value={field.value != null ? String(field.value) : ''}
                  onChange={(val) => handleChange(val ? Number(val) : null)}
                  placeholder={`Select ${columnHeader}`}
                  error={isErrorInField}
                />
              );

            case 'date':
              return (
                <DateInput
                  {...field}
                  value={field.value ? new Date(field.value) : null}
                  onChange={handleChange}
                  placeholder={`Enter ${columnHeader}`}
                />
              );
            case 'date-time':
              return (
                <DateTimePicker
                  {...field}
                  value={field.value ? new Date(field.value) : null}
                  onChange={handleChange}
                  placeholder={`Enter ${columnHeader}`}
                  error={isErrorInField}
                  valueFormat="DD MMM YYYY hh:mm A"
                />
              );

            case 'VAT_Checkbox':
              return (
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(event) => handleChange(event.target.checked)}
                />
              );
            case 'RadioGroupBooleanValue':
              return (
                <Radio.Group
                  {...field}
                  value={String(field?.value)}
                  onChange={handleChange}
                  size="md"
                  readOnly={isFieldDisabled}
                >
                  <Group
                    styles={{
                      root: {
                        border: '0.5px solid lightgrey',
                        borderRadius: '0.3rem',
                        padding: '8px 5px 5px 5px',
                      },
                    }}
                  >
                    {YesNoOptions.map((option) => (
                      <Radio
                        key={String(option.value)}
                        value={String(option.value)}
                        label={option.label}
                      />
                    ))}
                  </Group>
                </Radio.Group>
              );

            default:
              return (
                <TextInput
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) => handleChange(event.target.value)}
                  placeholder={`Enter ${columnHeader}`}
                  disabled={isFieldDisabled}
                  error={isErrorInField}
                />
              );
          }
        }}
      </Field>
    );
  };

  return (
    <Fieldset
      legend={FieldsetHeader}
      styles={{ legend: { fontWeight: '500', color: 'green' } }}
    >
      <Group>
        <ActionIcon onClick={handleAddRow} color="green" variant="subtle">
          <Tooltip label="Add row" position="top">
            <IconSquareRoundedPlus stroke={2} />
          </Tooltip>
        </ActionIcon>
        <ActionIcon
          onClick={handleDeleteAll}
          color="red"
          variant="subtle"
          disabled={!rows.length}
        >
          <Tooltip label="Delete All rows" position="top">
            <IconTrash />
          </Tooltip>
        </ActionIcon>
      </Group>

      {rows.length > 0 && (
        <Table.ScrollContainer minWidth={300} mah={400}>
          <Table withColumnBorders withRowBorders withTableBorder mt={10}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Center>Action</Center>
                </Table.Th>
                {columnsHeader.map((header, i) => (
                  <Table.Th key={i}>
                    <Center>{header}</Center>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {rows.map((row, rowIndex) => (
                <Table.Tr key={rowIndex}>
                  <Table.Td>
                    <Center>
                      <ActionIcon
                        onClick={() => handleDeleteRow(rowIndex)}
                        color="red"
                        variant="subtle"
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Center>
                  </Table.Td>

                  {columns.map((col, colIndex) => {
                    const fieldType = fieldTypes[col] ?? 'text';
                    const width = columnWidths[colIndex] ?? '100px';
                    return (
                      <Table.Td key={colIndex} miw={width}>
                        {renderCell(
                          rowIndex,
                          col,
                          fieldType,
                          columnsHeader[colIndex]
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
      {typeof error === 'string' && fieldTouched && (
        <Center mt={10}>
          <Text c="red">{error}</Text>
        </Center>
      )}
    </Fieldset>
  );
};

export default FormikGrid;
