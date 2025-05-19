import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps } from 'formik';
import { Box, Rating } from '@mantine/core';

export type AppFormikFormValues = Record<
  string,
  string | number | undefined | boolean | null
>;

interface FormikRatingFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormikRatingField: FC<FormikRatingFieldProps> = ({
  name,
  label,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AppFormikFormValues>();

  const meta = { touched: touched[name], error: errors[name] };

  const value = typeof values[name] === 'number' ? values[name] : 0;

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<number> }) => (
        <Box>
          <label style={{ fontWeight: '500', fontSize: 14 }}>{label}</label>
          <Box
            style={{
              border: '0.5px solid lightgrey',
              borderRadius: '0.3rem',
              padding: '8px',
            }}
          >
            <Rating
              {...field}
              value={value}
              onChange={(newValue) =>
                !disabled && setFieldValue(name, newValue)
              }
              readOnly={disabled}
            />
            {meta.touched && meta.error && (
              <div style={{ color: 'red', marginTop: '4px' }}>{meta.error}</div>
            )}
          </Box>
        </Box>
      )}
    </Field>
  );
};

export default FormikRatingField;
