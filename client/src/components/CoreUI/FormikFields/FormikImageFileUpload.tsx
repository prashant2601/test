import { FC } from 'react';
import { useFormikContext, Field, FieldInputProps } from 'formik';
import {
  FileInput,
  Image,
  Notification,
  ActionIcon,
  Popover,
  CloseButton,
  Flex,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { getFileSrc } from '../../../utility/helperFuntions';

interface FormikImageFileInputFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  initialImage?: string; // Optional prop for the initial image
}
export type AppFormikFileUplaod = Record<string, string | File>;
const FormikImageFileInputField: FC<FormikImageFileInputFieldProps> = ({
  name,
  label,
  disabled,
  accept = 'image/*',
  maxSize = 5,
}) => {
  const { values, errors, touched, setFieldValue, setFieldError } =
    useFormikContext<AppFormikFileUplaod>();
  const meta = { touched: touched[name], error: errors[name] };
  const [opened, { close, open }] = useDisclosure(false);
  const handleFileChange = (file: File | null) => {
    if (file) {
      const fileSizeInMB = file.size / 1024 / 1024;
      if (fileSizeInMB > maxSize) {
        setFieldError(name, 'File Size more than 2 MB not allowed');
        setFieldValue(name, null); // Clear file if it exceeds max size
        return;
      }
      setFieldValue(name, file); // Update Formik field value with selected file
    }
  };

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<AppFormikFileUplaod> }) => (
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            overflow: 'visible',
          }}
        >
          <FileInput
            {...field}
            label={label}
            accept={accept}
            multiple={false}
            value={values[name] || null}
            error={meta.touched && meta.error ? meta.error : undefined}
            disabled={disabled}
            onChange={handleFileChange}
            style={{ width: '100%' }}
            rightSectionProps={{
              style: { justifyContent: 'flex-end' },
            }}
            rightSection={
              <Flex mr={2}>
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setFieldValue(name, null);
                  }}
                  aria-label="Clear value"
                />
                <Popover position="top" withArrow shadow="md" opened={opened}>
                  <Popover.Target>
                    <ActionIcon
                      onMouseEnter={open}
                      onMouseLeave={close}
                      variant="outline"
                    >
                      <IconEye />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                    <Image
                      src={getFileSrc(values[name])}
                      alt={
                        getFileSrc(values[name]) === undefined
                          ? 'No Image'
                          : 'Uploaded Image'
                      }
                      style={{ maxWidth: '150px', maxHeight: '150px' }}
                    />
                  </Popover.Dropdown>
                </Popover>
              </Flex>
            }
          />

          {meta.touched && meta.error && (
            <Notification color="red" title="Error" onClose={() => {}}>
              {meta.error}
            </Notification>
          )}
        </div>
      )}
    </Field>
  );
};

export default FormikImageFileInputField;
