import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps } from 'formik';
import { DatePickerInput } from '@mantine/dates';

interface FormikDateRangeProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikDateRange: FC<FormikDateRangeProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } = useFormikContext<any>();

  const meta = { touched: touched[name], error: errors[name] };

  const value = values[name] as [Date | null, Date | null];
  const displayErrorString =
    meta.touched && meta.error && typeof meta.error === 'string'
      ? meta.error
      : undefined;

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<[Date | null, Date | null]> }) => (
        <div>
          <DatePickerInput
            {...field}
            type="range"
            label={label}
            value={value}
            onChange={(range) => setFieldValue(name, range)}
            disabled={disabled}
            error={displayErrorString}
            placeholder="Pick dates range"
            valueFormat="DD MMM YYYY"
            maxDate={new Date()}
          />
        </div>
      )}
    </Field>
  );
};

export default FormikDateRange;
