import {
  Card,
  Group,
  Text,
  Stack,
  Divider,
  Box,
  Button,
  Container,
  Title,
  Loader,
  Center,
  Flex,
  Alert,
  Tooltip,
  ActionIcon,
  TagsInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconSearch,
  IconFilter,
  IconPackageOff,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  MerchantOrder,
  useGetMerchantOrderHistory,
} from './hooks/useGetMerchantOrderHistory';
import { useEffect, useState } from 'react';

import { useMediaQuery } from '@mantine/hooks';
import { useInView } from 'react-intersection-observer';
import { convertIntoDate } from '../../../utility/helperFuntions';
import MerchantOrderHistoryBadge from './utility/MerchantOrderHistoryBadge';
import { useQueryClient } from '@tanstack/react-query';
import useGetRelevantMerchantID from '../hooks/useGetRelevantMerchantID';
import { CalendarIcon, ClearIcon } from '@mui/x-date-pickers';

interface OrderCardProps {
  order: MerchantOrder;
}
const OrderCard = ({ order }: OrderCardProps) => (
  <Card
    shadow="xs"
    radius="md"
    withBorder
    p="md"
    mb="sm"
    styles={{ root: { borderLeft: '6px solid green' } }}
  >
    <Group wrap="wrap" gap="xl" align="center" justify="space-between">
      <Text size="sm" c="dimmed">
        {order?.orderTime}
      </Text>
      <Text size="sm" fw={500} c="blue">
        #{order.orderId}
      </Text>
      <MerchantOrderHistoryBadge text={order?.paymentType} />
      <MerchantOrderHistoryBadge text={order?.orderType} />
      <MerchantOrderHistoryBadge text={order?.status} />
      <Text size="sm">£{order.deliveryCharge} delivery fees</Text>
      <Text fw={600}>£{order.total}</Text>
    </Group>
  </Card>
);

const NoOrderHistory = () => (
  <Center h={'50vh'} px="md">
    <Stack align="center" gap="sm">
      <Box
        p="md"
        style={{
          backgroundColor: '#f1f3f5',
          borderRadius: '100%',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconPackageOff size={40} stroke={1.5} color="#868E96" />
      </Box>
      <Title order={3}>No Order History</Title>
      <Text c="dimmed" ta="center" maw={300}>
        Looks like there are no orders in this date range or order ID.
      </Text>
    </Stack>
  </Center>
);

const OrderHistory = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const merchantId = useGetRelevantMerchantID();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError,
  } = useGetMerchantOrderHistory({
    dateRange,
    orderId: orderIds?.join(', '),
    EnableQuery: true,
  });

  const { ref: loadMoreRef, inView } = useInView({ threshold: 1 });
  const isMobile = useMediaQuery('(max-width: 992px)');
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    refetch();
  }, [orderIds, dateRange, refetch]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: ['merchant-order-history', orderIds, dateRange, merchantId],
      });
    };
  }, [orderIds, dateRange, merchantId, queryClient]);

  const totalFiltersApplied =
    Number(Boolean(orderIds?.length)) +
    Number(Boolean(dateRange[0] && dateRange[1]));

  const summaryCard = !!data?.pages?.[0]?.totalOrderSum && (
    <Box
      style={{
        width: '100%',
        maxWidth: !isMobile ? 280 : '100%',
        position: !isMobile ? 'sticky' : 'static',
        top: 100,
        alignSelf: 'flex-start',
        marginLeft: !isMobile ? 'auto' : undefined,
        marginTop: !isMobile ? '25px' : '0',
      }}
      mt={{ base: 'md', md: 0 }}
    >
      <Card
        withBorder
        radius="md"
        padding="md"
        shadow="sm"
        styles={{
          root: {
            background: 'linear-gradient(135deg, #f0f4ff, #e6f7ff)',
          },
        }}
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Total
          </Text>
          <Text size="xl" fw={700}>
            £{data?.pages?.[0]?.totalOrderSum.toFixed(2)}
          </Text>
          <Text size="xs" c="dimmed">
            Includes charges / fees
          </Text>
          <Group gap="sm">
            <Button size="xs" variant="default" radius="xl">
              + Service
            </Button>
            <Button size="xs" variant="default" radius="xl">
              + Delivery
            </Button>
          </Group>
          <Text size="md" c="dimmed">
            {data?.pages?.[0]?.totalCount} orders
          </Text>
          {data.pages?.[0]?.fromDate && data.pages?.[0]?.toDate && (
            <Text size="xs" c="dimmed">
              {convertIntoDate(data.pages?.[0]?.fromDate)} -{' '}
              {convertIntoDate(data.pages?.[0]?.toDate)}
            </Text>
          )}
        </Stack>
      </Card>
    </Box>
  );

  if (isError && !data) {
    return (
      <Center mt={30}>
        <Stack align="center" gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Error loading orders"
            color="red"
            radius="md"
          >
            {'Unable to fetch orders. Please try again.'}
          </Alert>
          <Button variant="light" color="red" onClick={() => refetch()}>
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Container size="100%" px="sm">
      <Box>
        <Title fw={600} size="lg">
          Orders & Sales History
        </Title>
      </Box>
      <Divider my={5} />

      <Flex
  direction={{ base: 'column', sm: 'row' }}
  gap="sm"
  justify={{ base: 'flex-start', sm: 'flex-end' }}
  align="stretch"
  wrap="wrap"
  mt="md"
>
  <DatePickerInput
    allowSingleDateInRange={false}
    type="range"
    placeholder="Select Date Range"
    valueFormat="DD MMM YYYY"
    value={dateRange}
    onChange={setDateRange}
    clearable
    w={{ base: '100%', sm: 250 }}
    leftSection={<CalendarIcon />}
    maxDate={new Date()}
  />

  <Group gap="xs" p={0}
  >
    <TagsInput
      value={orderIds}
      onChange={setOrderIds}
      leftSection={<IconSearch size={16} />}
      placeholder="Search Order IDs"
      clearable
      allowDuplicates={false}
    />

    <Tooltip label="Clear All Filters">
      <ActionIcon
        onClick={() => {
          setDateRange([null, null]);
          setOrderIds([]);
        }}
        size="small"
        variant="subtle"
      >
        <ClearIcon />
      </ActionIcon>
    </Tooltip>

    <Button variant="default" leftSection={<IconFilter size={16} />}>
      Filters ({totalFiltersApplied})
    </Button>
  </Group>
</Flex>


      {isLoading && (
        <Center style={{ minHeight: isMobile ? '30vh' : '50vh' }}>
          <Stack align="center" gap="xs">
            <Loader color="blue" size="lg" />
            <Text size="sm" c="dimmed">
              Fetching your orders...
            </Text>
          </Stack>
        </Center>
      )}

      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap="md"
        align="flex-start"
        mt="md"
        wrap="wrap"
      >
        {isMobile && summaryCard}

        <Box style={{ flex: 1, minWidth: 0 }}>
          {data?.pages?.length &&
          data.pages.some((order) => order?.orders?.length) ? (
            <Stack gap="sm">
              {data?.pages?.map((order) =>
                order?.orders?.map((perDaySet) => (
                  <div key={perDaySet.date}>
                    <Text fw={600}>{perDaySet.date}</Text>
                    {perDaySet?.orders?.map((individualOrder) => (
                      <OrderCard
                        order={individualOrder}
                        key={individualOrder?.orderId}
                      />
                    ))}
                    <Divider my="md" />
                  </div>
                ))
              )}
              {hasNextPage && (
                <Center ref={loadMoreRef} py="lg">
                  <Loader size="sm" />
                </Center>
              )}
            </Stack>
          ) : (
            !isLoading && <NoOrderHistory />
          )}
        </Box>

        {!isMobile && summaryCard}
      </Flex>
    </Container>
  );
};

export default OrderHistory;
