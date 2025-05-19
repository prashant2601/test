import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { PasswordInput } from '@mantine/core';

export type AppFormikFormValues = Record<
  string,
  string | number | undefined | boolean | null
>;

interface FormikPasswordFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikPasswordField: FC<FormikPasswordFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const value = getIn(values, name) ?? String(values[name] || '');
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <PasswordInput
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

export default FormikPasswordField;
