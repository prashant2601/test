import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps, getIn } from 'formik';
import { Group, Radio } from '@mantine/core';

export type AppFormikFormValues = Record<
  string,
  string | number | undefined | boolean | null
>;

interface RadioOption {
  label: string | null;
  value: string | boolean;
}

interface FormikRadioGroupProps {
  name: string;
  label: string | null;
  options: RadioOption[];
  disabled?: boolean;
  onChangeCallback?: (value: string) => void;
}

const FormikRadioGroupForBooleanValue: FC<FormikRadioGroupProps> = ({
  name,
  label,
  options,
  disabled,
  onChangeCallback,
}) => {
  const { values, setFieldValue } = useFormikContext<AppFormikFormValues>();

  const value = getIn(values, name) ?? String(values[name] || '');

  const handleChange = (value: string) => {
    setFieldValue(name, value === 'true');
    if (onChangeCallback) {
      onChangeCallback(value);
    }
  };

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <Radio.Group
          {...field}
          value={String(value)}
          onChange={handleChange}
          label={label}
          size="md"
          styles={{
            label: { fontWeight: '500', fontSize: 14 },
          }}
          readOnly={disabled}
        >
          <Group
            styles={{
              root: {
                border: '0.5px solid lightgrey',
                borderRadius: '0.3rem',
                padding: '8px 5px 5px 5px',
              },
            }}
          >
            {options.map((option) => (
              <Radio
                key={String(option.value)}
                value={String(option.value)}
                label={option.label}
              />
            ))}
          </Group>
        </Radio.Group>
      )}
    </Field>
  );
};

export default FormikRadioGroupForBooleanValue;
