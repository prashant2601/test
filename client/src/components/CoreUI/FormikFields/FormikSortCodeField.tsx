import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { TextInput } from '@mantine/core';
import { AppFormikFormValues } from './FormikInputField';

interface FormikSortCodeFieldProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export const formatSortCode = (value: number | string) => {
  const stringValue = String(value);
  return stringValue
    .replace(/\D/g, '') // Remove non-numeric characters
    .slice(0, 6) // Limit to 6 digits
    .replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3'); // Format as XX-XX-XX
};

const unformatSortCode = (value: string) => {
  return Number(value.replace(/\D/g, '').slice(0, 6)); // Remove dashes and keep only digits
};

const FormikSortCodeField: FC<FormikSortCodeFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const value = getIn(values, name) || '';
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <TextInput
          {...field}
          label={label}
          value={formatSortCode(value)}
          error={isTouched && error ? error : undefined}
          onChange={(event) =>
            setFieldValue(name, unformatSortCode(event.currentTarget.value))
          }
          disabled={disabled}
          maxLength={8} // Allow space for dashes
        />
      )}
    </Field>
  );
};

export default FormikSortCodeField;
