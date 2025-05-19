import { FC } from 'react';
import { useFormikContext, Field, getIn } from 'formik';
import { DateTimePicker } from '@mantine/dates';
import { AppFormikFormValues } from './FormikInputField';

interface FormikDateTimeFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikDateTimeField: FC<FormikDateTimeFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const value = getIn(values, name);
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  return (
    <Field name={name}>
      {() => (
        <DateTimePicker
          label={label}
          value={value ? new Date(value) : null}
          onChange={(date) => setFieldValue(name, date)}
          error={isTouched && error ? error : undefined}
          disabled={disabled}
          valueFormat="DD MMM YYYY hh:mm A"
        />
      )}
    </Field>
  );
};

export default FormikDateTimeField;
