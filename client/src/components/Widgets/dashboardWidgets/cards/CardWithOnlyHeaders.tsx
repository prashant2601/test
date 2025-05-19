import {
  Card,
  Text,
  Stack,
  Title,
  Box,
  Group,
  Popover,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

type DataItem = {
  label: string;
  value: number;
};

type CommissionCardProps = {
  mainLabel: string;
  header: string;
  data: DataItem[];
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  iconBgColor: string;
  labelMap: Record<string, string>;
};
const latestOrder = {
  orderId: 'ORD12345',
  orderType: 'DELIVERY',
  paymentType: 'CASH',
  orderValue: 1000,
  status: 'Completed',
  orderDate: '2025-03-01T10:00:00Z',
};

const latestOrderData: DataItem[] = [
  { label: 'Order ID', value: latestOrder.orderId },
  { label: 'Order Type', value: latestOrder.orderType },
  { label: 'Payment Type', value: latestOrder.paymentType },
  { label: 'Order Value', value: latestOrder.orderValue },
  { label: 'Status', value: latestOrder.status },
  {
    label: 'Order Date',
    value: new Date(latestOrder.orderDate)?.toLocaleDateString,
  },
  // { label: "Order Time", value: new Date(latestOrder.orderDate)?.toLocaleTimeString() },
];
const CardWithOnlyHeaders: React.FC<CommissionCardProps> = ({
  mainLabel,
  header,
  data,
  icon: IconComponent,
  bgColor,
  iconColor,
  iconBgColor,
  labelMap,
}) => {
  const [opened, { close, open }] = useDisclosure(false);
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="md"
      style={{ backgroundColor: bgColor }}
    >
      <Stack gap={10} align="center">
        <div
          style={{
            backgroundColor: iconBgColor,
            borderRadius: '50%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle, ${bgColor} 40%, ${iconBgColor} 100%)`,
          }}
        >
          <IconComponent size={24} color={iconColor} />
        </div>
        <Group>
          <Text fw={'bold'} c={iconColor}>
            {mainLabel}
          </Text>
          <Text fw={'bold'} c={iconColor}>
            {header}
          </Text>
        </Group>

        {/* <Stack> */}
        {data.map((item) => (
          <Group key={item.label}>
            <Text c={iconColor} size="md">
              {labelMap[item.label] || item.label}
            </Text>
            <Text c={iconColor} size="md">
              {item.value}
            </Text>
          </Group>
        ))}
        {/* <Popover width={200} position="bottom" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <Button onMouseEnter={open} onMouseLeave={close}>
          Hover to see Latest Order
        </Button>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <Text size="sm">This popover is shown when user hovers the target element</Text>
      </Popover.Dropdown>
    </Popover> */}
      </Stack>
      <Box mt={20}>
        <fieldset
          style={{
            border: `1px solid ${iconColor}`,
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <legend
            style={{ fontSize: '12px', fontWeight: 'bold', color: iconColor }}
          >
            {'Latest Order '}
          </legend>
          {latestOrderData.map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Text size="sm" c={iconColor}>
                {labelMap[item.label] || item.label}
              </Text>
              <Text size="sm" c={iconColor} fw={'bold'}>
                {item.value}
              </Text>
            </div>
          ))}
        </fieldset>
      </Box>
      {/* </Stack> */}
    </Card>
  );
};

export default CardWithOnlyHeaders;
