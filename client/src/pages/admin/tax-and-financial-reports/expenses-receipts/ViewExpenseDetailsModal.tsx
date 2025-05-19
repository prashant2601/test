import {
  Modal,
  Grid,
  Text,
  Title,
  Divider,
  Badge,
  Card,
  Anchor,
  List,
  Accordion,
  Group,
} from '@mantine/core';
import { MRT_ColumnDef, MRT_Row } from 'material-react-table';
import { IconClipboardList } from '@tabler/icons-react';
import ClientSideAppGrid from '../../../../components/CoreUI/ClientSideAppGrid';
import { convertIntoDateTime } from '../../../../utility/helperFuntions';
import { Expense } from './hooks/useGetExpenseData';
import { useMediaQuery } from '@mantine/hooks';

interface ViewExpenseDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  row: MRT_Row<Expense>;
}
const ReceiptItemsColumns: MRT_ColumnDef<any>[] = [
  { header: 'Category', accessorKey: 'category' },
  { header: 'Item Name', accessorKey: 'itemName' },
  {
    header: 'Amount',
    accessorKey: 'amount',
    Cell: ({ renderedCellValue }) =>
      typeof renderedCellValue === 'number' ? `£ ${renderedCellValue}` : '',
  },
  {
    header: 'VAT Amount',
    accessorKey: 'vatAmount',
    Cell: ({ renderedCellValue }) =>
      typeof renderedCellValue === 'number' ? `£ ${renderedCellValue}` : '',
  },
  {
    header: 'Total',
    accessorKey: 'total',
    Cell: ({ renderedCellValue }) =>
      typeof renderedCellValue === 'number' ? `£ ${renderedCellValue}` : '',
  },
];
export const ViewExpenseDetailsModal = ({
  opened,
  onClose,
  row,
}: ViewExpenseDetailsModalProps) => {
  const expense = row?.original;
  if (!expense) return <></>;

  const formatCurrency = (amount: number | undefined) =>
    `£${amount?.toFixed(2)}`;
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>📄 Expense Details</Title>}
      size={isMobile ? 'auto' : '80%'}
    >
      <Card
        p="lg"
        radius="lg"
        withBorder
        shadow="sm"
        styles={{ root: { overflowY: 'auto', scrollbarWidth: 'thin' } }}
      >
        <Grid gutter="md">
          {/* Section: Basic Info */}
          <Grid.Col span={12}>
            <Title order={6} c="gray">
              🧾 Basic Information
            </Title>
            <Divider my="xs" />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Receipt ID
            </Text>
            <Text fw={500} size={'sm'}>
              {expense.receiptId}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Store Name
            </Text>
            <Text fw={500} size={'sm'}>
              {expense.storeName}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Spent By
            </Text>
            <Text fw={500} size="sm">
              {expense.spentBy}
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Expense Type
            </Text>
            <Badge color="blue" variant="light">
              {expense.expenseType || 'Unknown'}
            </Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Receipt Date
            </Text>
            <Text fw={500} size="sm">
              {convertIntoDateTime(expense.receiptDate)}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Paid Status
            </Text>
            <Badge
              color={expense.paidStatus === 'PAID' ? 'green' : 'red'}
              variant="light"
            >
              {expense.paidStatus}
            </Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Total Amount
            </Text>
            <Text fw={700} c="blue">
              {formatCurrency(expense.totalAmount)}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Text size="sm" c="dimmed">
              Claimable VAT
            </Text>
            <Text fw={500} size={'sm'}>
              {formatCurrency(expense.claimableVAT)}
            </Text>
          </Grid.Col>

          {/* Section: Payment Details */}
          <Grid.Col span={12}>
            <Title order={5} c="gray" mt="md">
              💳 Payment Details
            </Title>
            <Divider my="xs" />
          </Grid.Col>

          {expense?.paymentDetails?.length ? (
            expense.paymentDetails.map((payment, index) => (
              <Grid.Col span={12} key={index}>
                <Card
                  shadow="xs"
                  radius="md"
                  p={isMobile ? 'xs' : 'md'}
                  withBorder
                >
                  <Group mb="sm" wrap="nowrap">
                    <Text fw={600} size="sm">
                      Payment #{index + 1}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {convertIntoDateTime(payment?.paymentDate) || 'N/A'}
                    </Text>
                  </Group>

                  <Grid gutter="xs">
                    <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                      <Text size="sm" c="dimmed">
                        Payment Type
                      </Text>
                      <Text fw={500} size={'sm'}>
                        {payment?.paymentType || 'N/A'}
                      </Text>
                    </Grid.Col>

                    {['CARD', 'BOTH'].includes(payment?.paymentType) && (
                      <>
                        <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                          <Text size="sm" c="dimmed">
                            Card Type
                          </Text>
                          <Text fw={500} size="sm">
                            {payment?.cardType || 'N/A'}
                          </Text>
                        </Grid.Col>

                        <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                          <Text size="sm" c="dimmed">
                            Card Payment
                          </Text>
                          <Text fw={500} size={'sm'}>
                            {formatCurrency(payment?.paymentFrom?.CARD) ??
                              'N/A'}
                          </Text>
                        </Grid.Col>
                      </>
                    )}

                    {['CASH', 'BOTH'].includes(payment?.paymentType) && (
                      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                        <Text size="sm" c="dimmed">
                          Cash Payment
                        </Text>
                        <Text fw={500} size={'sm'}>
                          {formatCurrency(payment?.paymentFrom?.CASH) ?? 'N/A'}
                        </Text>
                      </Grid.Col>
                    )}
                  </Grid>
                </Card>
              </Grid.Col>
            ))
          ) : (
            <Grid.Col span={12}>
              <Text c="dimmed">No payment details available.</Text>
            </Grid.Col>
          )}

          {/* Section: Receipt Links */}
          <Grid.Col span={12}>
            <Title order={6} c="gray" mt="md">
              🔗 Receipt Links
            </Title>
            <Divider my="xs" />
            {expense.receiptLink?.length ? (
              <List spacing="xs" size="sm" withPadding>
                {expense.receiptLink.map((url, idx) => (
                  <List.Item key={url}>
                    <Anchor
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="always"
                    >
                      View Receipt {idx + 1}
                    </Anchor>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text c="dimmed" fs="italic">
                No receipt links
              </Text>
            )}
          </Grid.Col>
        </Grid>
        {/* <Title order={6} c="gray" mt="lg">
          🔗 Receipt Items
        </Title>
        <Divider mt={10} /> */}

        {/* Accordion*/}
        <Accordion
          variant="contained"
          bg="white"
          mt={'lg'}
          styles={{ content: { padding: 0 } }}
        >
          <Accordion.Item value="receiptItems" p={0}>
            <Accordion.Control
              icon={
                <IconClipboardList
                  size={20}
                  color="var(--mantine-color-red-6)"
                />
              }
            >
              {expense?.receiptItems?.length ? (
                <Text size="sm">
                  Receipt Items for Receipt ID: ${expense.receiptId}
                </Text>
              ) : (
                <Text size="sm">No receipt Items</Text>
              )}
            </Accordion.Control>
            <Accordion.Panel>
              <ClientSideAppGrid
                data={expense?.receiptItems ?? []}
                density="comfortable"
                columns={ReceiptItemsColumns}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Modal>
  );
};
