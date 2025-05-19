import { FC, useMemo } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { Box, Checkbox } from '@mantine/core';

interface FormikCheckboxFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  OnChangeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  RenderTextNodeforAlignment?: boolean;
}

const FormikCheckboxField: FC<FormikCheckboxFieldProps> = ({
  name,
  label,
  disabled,
  OnChangeHandler,
  RenderTextNodeforAlignment = true,
}) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<Record<string, any>>();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    if (OnChangeHandler) {
      OnChangeHandler(event);
      return;
    }
    setFieldValue(name, event.target.checked);
  };
  const checked = getIn(values, name);
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  const isDisabled = useMemo(
    () =>
      values?.isInHouseType && name === 'deliveryChargeApplicable'
        ? true
        : disabled,
    [values?.isInHouseType, name, disabled]
  );

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<'checkbox'> }) => (
        <Box>
          {RenderTextNodeforAlignment && (
            <label style={{ visibility: 'hidden' }}>{label}</label>
          )}
          <Box
            style={{
              border: '0.5px solid lightgrey',
              borderRadius: '0.3rem',
              padding: '8px',
            }}
          >
            <Checkbox
              {...field}
              label={label}
              checked={checked}
              error={
                isTouched && error && typeof error === 'string'
                  ? error
                  : undefined
              }
              disabled={isDisabled}
              onChange={(e) => handleChange(e, name)}
              styles={{ label: { fontWeight: '500', fontSize: 14 } }}
            />
          </Box>
        </Box>
      )}
    </Field>
  );
};

export default FormikCheckboxField;
