import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { DateInput } from '@mantine/dates';

interface FormikDatePickerFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikDatePickerField: FC<FormikDatePickerFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const value = getIn(values, name);
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<Date> }) => (
        <DateInput
          {...field}
          label={label}
          value={value ? new Date(value) : null}
          error={isTouched && error ? error : undefined}
          onChange={(date) => setFieldValue(name, date)}
          disabled={disabled}
          valueFormat="DD MMM YYYY" // Format the date in the required format
        />
      )}
    </Field>
  );
};

export default FormikDatePickerField;
