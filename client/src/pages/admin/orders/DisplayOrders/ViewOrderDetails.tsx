import {
  Modal,
  Grid,
  Text,
  Title,
  Divider,
  Badge,
  Accordion,
  Card,
} from '@mantine/core';
import { Order } from '../hooks/useGetAllOrders';
import ClientSideAppGrid from '../../../../components/CoreUI/ClientSideAppGrid';
import { IconCheck, IconClipboardList, IconX } from '@tabler/icons-react';
import { MRT_Row } from 'material-react-table';

interface ViewOrderModalProps {
  opened: boolean;
  onClose: () => void;
  row: MRT_Row<Order>;
}
const BooleanBadge = ({ value }: { value: boolean }) => (
  <Badge
    variant="light"
    color={value ? 'green' : 'red'}
    leftSection={value ? <IconCheck size={14} /> : <IconX size={14} />}
    mt={10}
  >
    {value ? 'Yes' : 'No'}
  </Badge>
);

export const ViewOrderModal = ({
  opened,
  onClose,
  row,
}: ViewOrderModalProps) => {
  const order = row?.original;
  if (!order) return <></>;
  const VAT = (
    (Number(order?.netCommission) +
      Number(order?.netServiceFee) +
      Number(order?.netDeliveryCharge)) *
    0.2
  ).toFixed(2);
  const TotalCommision = (
    Number(order?.netCommission) +
    Number(order?.netServiceFee) +
    Number(order?.netDeliveryCharge) +
    Number(VAT)
  ).toFixed(2);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={5}>View Order</Title>}
      size="95%"
    >
      <Card
        p="md"
        radius="md"
        withBorder
        mah={400}
        styles={{ root: { overflowY: 'auto', scrollbarWidth: 'thin' } }}
      >
        <Grid align="flex-start">
          {/* Row 1 */}
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Merchant ID
            </Text>
            <Text fw={500}>{order?.merchantId ?? '-'}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Order ID
            </Text>
            <Text fw={500}>{order?.orderId}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Order Date
            </Text>
            <Text fw={500}>{new Date(order?.orderDate).toLocaleString()}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Customer ID
            </Text>
            <Text fw={500}>{order?.customerId}</Text>
          </Grid.Col>

          {/* Row 2 */}
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              First Name
            </Text>
            <Text fw={500}>{order?.customerFirstName}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Last Name
            </Text>
            <Text fw={500}>{order?.customerLastName}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Order Type
            </Text>
            <Text fw={500}>
              <Badge mt={8} color="blue" variant="light">
                {order?.orderType}
              </Badge>
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Payment Type
            </Text>
            <Text fw={500}>
              <Badge mt={8} color="green" variant="light">
                {order?.paymentType}
              </Badge>
            </Text>
          </Grid.Col>

          {/* Row 3 */}
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Payment Status
            </Text>
            <Text fw={500}>
              <Badge
                mt={8}
                color={order?.paymentStatus === 'PROCESSED' ? 'green' : 'red'}
                variant="light"
              >
                {order?.paymentStatus}
              </Badge>
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Confirmation Status
            </Text>
            <Badge
              mt={8}
              color={
                order?.confirmationStatus === 'COMPLETED' ? 'green' : 'red'
              }
              variant="light"
            >
              {order?.confirmationStatus}
            </Badge>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Promo Code
            </Text>
            <Text fw={500}>{order?.promoCode ?? '-'}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Branch Name
            </Text>
            <Text fw={500}>{order?.branchName}</Text>
          </Grid.Col>

          {/* Divider */}
          <Grid.Col span={12}>
            <Divider />
          </Grid.Col>
          {/* Row 4 - Financials */}
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Subtotal
            </Text>
            <Text fw={500}>£ {order?.subTotal}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Taxes
            </Text>
            <Text fw={500}>£ {order?.taxes}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Total
            </Text>
            <Text fw={700} c="blue">
              £ {order?.total}
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Order Discount
            </Text>
            <Text fw={500}>£ {order?.orderDiscount}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Order Value
            </Text>
            <Text fw={500}>£ {order?.newOrderValue}</Text>
          </Grid.Col>

          {/* Row 5 */}
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Driver Tip
            </Text>
            <Text fw={500}>£ {order?.driverTip}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Delivery Charge
            </Text>
            <Text fw={500}>£ {order?.deliveryCharge}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Service Fee
            </Text>
            <Text fw={500}>£ {order?.serviceFee}</Text>
          </Grid.Col>
          {/* Divider */}
          <Grid.Col span={12}>
            <Divider />
          </Grid.Col>
          {/* Row 6 */}

          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Merchant Type
            </Text>
            <Text fw={500}>
              {order?.merchantDetails?.isInHouseType ? 'In-house' : 'Outsource'}
            </Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Delivery Order Commission
            </Text>
            <Text fw={500}>
              {order?.merchantDetails?.deliveryOrdersComission ?? '--'}%
            </Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Collection Order Commission
            </Text>
            <Text fw={500}>
              {order?.merchantDetails?.collectionOrdersComission ?? '--'}%
            </Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Service Fee Applicable
            </Text>
            <BooleanBadge
              value={order?.merchantDetails?.serviceFeeApplicable}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Text size="sm" c="dimmed">
              Delivery Charge Applicable
            </Text>
            <BooleanBadge
              value={order?.merchantDetails?.deliveryChargeApplicable}
            />
          </Grid.Col>

          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Commission
            </Text>
            <Text fw={500}>£ {order?.netCommission}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Service Fee (Net)
            </Text>
            <Text fw={500}>£ {order?.netServiceFee}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Delivery Charge (Net)
            </Text>
            <Text fw={500}>£ {order?.netDeliveryCharge}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              VAT
            </Text>
            <Text fw={500}>£ {VAT}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" c="dimmed">
              Total Commision
            </Text>
            <Text fw={500}>£ {TotalCommision}</Text>
          </Grid.Col>
        </Grid>
      </Card>
      <Card withBorder shadow="sm" mt={20}>
        <Accordion variant="contained" bg={'white'}>
          <Accordion.Item value="photos">
            <Accordion.Control
              icon={
                <IconClipboardList
                  size={20}
                  color="var(--mantine-color-red-6)"
                />
              }
            >
              {`Order Items for Order ID: ${order?.orderId}`}
            </Accordion.Control>
            <Accordion.Panel>
              <ClientSideAppGrid
                data={order?.orderItems ?? []}
                columns={[
                  { header: 'Product', accessorKey: 'product' },
                  { header: 'Quantity', accessorKey: 'quantity' },
                ]}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Modal>
  );
};
