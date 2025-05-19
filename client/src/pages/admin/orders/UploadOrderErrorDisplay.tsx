import React from 'react';
import {
  Alert,
  Card,
  Table,
  Text,
  Title,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { UploadOrderAxiosResponseError } from '../../../hooks/useUploadOrdersFiles';

export const UploadOrderErrorDisplay: React.FC<{
  response:
    | UploadOrderAxiosResponseError
    | undefined
    | { error: string; errors: { fileName: string; Error: string }[] };
}> = ({ response }) => {
  const theme = useMantineTheme();

  if (!response) {
    return null;
  }
  return (
    <Card padding="lg" radius="md" withBorder>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        radius="md"
        variant="outline"
        mb="lg"
        p="sm"
      >
        {response.error}
      </Alert>
      <ScrollArea>
        <Title
          order={5}
          mb="md"
          styles={{ root: { color: theme.colors.gray[7] } }}
        >
          Details:
        </Title>
        <Table withRowBorders withTableBorder withColumnBorders striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th styles={{ th: { color: theme.colors.gray[7] } }}>
                File Name
              </Table.Th>
              <Table.Th styles={{ th: { color: theme.colors.gray[7] } }}>
                Error
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {response.errors.map((err, index) => (
              <Table.Tr key={err.fileName + index}>
                <Table.Td>
                  <Text>{err.fileName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={{ color: 'red' }}>{err.Error}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
