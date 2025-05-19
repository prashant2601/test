import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { TextInput } from '@mantine/core';

export type AppFormikFormValues = Record<
  string,
  string | number | undefined | boolean | null
>;
interface FormikInputFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikInputField: FC<FormikInputFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const value = getIn(values, name) ?? String(values[name] || ''); // Access nested value
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <TextInput
          {...field}
          label={label}
          value={value}
          error={isTouched && error ? error : undefined}
          disabled={disabled}
          onChange={(event) => setFieldValue(name, event.target.value)}
        />
      )}
    </Field>
  );
};

export default FormikInputField;
