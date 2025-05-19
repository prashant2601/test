import { FC } from 'react';
import { useFormikContext, Field, FieldProps } from 'formik';
import { Select } from '@mantine/core';
import { AppFormikFormValues } from './FormikInputField';

interface FormikSelectFieldProps {
  name: string;
  label: string;
  data: { value: string | number; label: string }[];
  disabled?: boolean;
  valueAsNumber?: boolean; // NEW prop to convert string to number
}

const FormikSelectField: FC<FormikSelectFieldProps> = ({
  name,
  label,
  data,
  disabled,
  valueAsNumber = false,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const meta = { touched: touched[name], error: errors[name] };

  return (
    <Field name={name}>
      {({ field }: FieldProps) => (
        <Select
          {...field}
          label={label}
          value={
            values[name] !== undefined && values[name] !== null
              ? String(values[name])
              : null
          }
          data={data.map((item) => ({
            value: String(item.value),
            label: item.label,
          }))}
          clearable
          onChange={(value) =>
            setFieldValue(name, valueAsNumber ? Number(value) : value)
          }
          error={meta.touched && meta.error ? meta.error : undefined}
          disabled={disabled}
          comboboxProps={{ name }}
        />
      )}
    </Field>
  );
};

export default FormikSelectField;
