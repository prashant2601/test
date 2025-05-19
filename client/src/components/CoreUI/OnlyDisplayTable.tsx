import { Table, Text } from '@mantine/core';
import AppChipComponent from '../AppChipComponent';

interface InvoicesTableProps<T extends Record<string, any>> {
  data: T[];
  uniqueKeyInRows?: keyof T;
  headers: string[]; // Array of column headers to display
  columnsMapping: Record<string, keyof T>; // Map of column names to the properties of the data
}

export function OnlyDisplayTable<T extends Record<string, any>>({
  data,
  headers,
  columnsMapping,
  uniqueKeyInRows,
}: Readonly<InvoicesTableProps<T>>) {
  const renderRows = data?.map((obj, index) => (
    <Table.Tr
      key={
        uniqueKeyInRows && uniqueKeyInRows in obj ? obj[uniqueKeyInRows] : index
      }
    >
      {headers.map((header) => (
        <Table.Td key={header} styles={{ td: { textAlign: 'center' } }}>
          {header === 'Status' ? (
            // If the column is "Status", render a link
            <AppChipComponent value={obj[columnsMapping[header]] ?? ''} />
          ) : (
            <Text>{obj[columnsMapping[header]] ?? ''}</Text>
          )}
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <Table verticalSpacing="sm" stickyHeader>
      <Table.Thead>
        <Table.Tr>
          {headers.map((header) => (
            <Table.Th key={header} styles={{ th: { textAlign: 'center' } }}>
              {header}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderRows}</Table.Tbody>
    </Table>
  );
}
