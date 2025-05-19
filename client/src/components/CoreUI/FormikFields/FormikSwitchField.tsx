import { FC, useCallback } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { Switch } from '@mantine/core';

export type AppFormikFormValues = Record<
  string,
  string | number | readonly string[] | undefined
>;

interface FormikSwitchFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  handleExternally?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormikSwitchField: FC<FormikSwitchFieldProps> = ({
  name,
  label,
  disabled,
  handleExternally = false,
  onChange,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();
  const value = getIn(values, name) ?? false; // Ensure a boolean value
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  const handleChange = useCallback(
    (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
      if (handleExternally) {
        onChange(event);
        return;
      }
      setFieldValue(name, event.currentTarget.checked);
    },
    [handleExternally, onChange]
  );

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<boolean> }) => (
        <Switch
          name={name}
          label={label}
          checked={value}
          disabled={disabled}
          error={isTouched && error ? error : undefined}
          onChange={(event) => handleChange(name, event)}
        />
      )}
    </Field>
  );
};

export default FormikSwitchField;
