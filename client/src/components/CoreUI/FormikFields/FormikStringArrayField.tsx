import { FC } from 'react';
import { useFormikContext, getIn, FieldArray } from 'formik';
import {
  Button,
  Stack,
  Group,
  Text,
  ActionIcon,
  Anchor,
  TextInput,
  List,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { openModalConfirmation } from '../../Modals/openModalConfirmation';

interface FormikStringArrayFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  hideNewButton?: boolean;
  textAsLinks?: boolean;
  needLabel?: boolean;
}

const FormikStringArrayField: FC<FormikStringArrayFieldProps> = ({
  name,
  label,
  disabled,
  hideNewButton,
  textAsLinks = false,
  needLabel = true,
}) => {
  const { values, errors, touched, setFieldValue } = useFormikContext<any>();

  const items: string[] = getIn(values, name) ?? [];
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <Stack gap="xs">
          {needLabel && (
            <Text size="sm" fw={'500'}>
              {label}
            </Text>
          )}
          {!disabled && !hideNewButton && (
            <Button
              onClick={() => push('')}
              leftSection={<IconPlus size={18} />}
              variant="light"
              size="xs"
              mt="xs"
              w="fit-content"
            >
              Add Item
            </Button>
          )}
          {items.map((item, index) => (
            <Group key={index} wrap="nowrap" align="center" gap={'sm'}>
              {!textAsLinks ? (
                <TextInput
                  value={item}
                  onChange={(e) =>
                    setFieldValue(`${name}[${index}]`, e.currentTarget.value)
                  }
                  disabled={disabled}
                  style={{ flex: 1 }}
                />
              ) : (
                <List spacing="xs" size="sm">
                  <List.Item>
                    <Anchor
                      href={item}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="always"
                    >
                      View Receipt {index + 1}
                    </Anchor>
                  </List.Item>
                </List>
              )}

              {!disabled && (
                <ActionIcon
                  color="red"
                  onClick={async () => {
                    const confirmed = await openModalConfirmation({
                      title: 'Delete Item',
                      message: 'Are you sure you want to delete this item?',
                      confirmLabel: 'Yes, Delete',
                      cancelLabel: 'Cancel',
                    });

                    if (confirmed) {
                      remove(index);
                    }
                  }}
                  variant="light"
                  mt={!textAsLinks ? undefined : 6} // Aligns better with list layout
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Group>
          ))}

          {isTouched && error && typeof error === 'string' && (
            <Text c="red" size="xs">
              {error}
            </Text>
          )}
        </Stack>
      )}
    </FieldArray>
  );
};

export default FormikStringArrayField;
