import {
  Card,
  Text,
  Group,
  Title,
  Grid,
  Stack,
  Select,
  Box,
  Skeleton,
  Flex,
} from '@mantine/core';

import AreaGraphForMerchant from './AreaGraphForMerchant';

import { useState } from 'react';

import UserInfoCard from './cards/UserInfoCard';
import {
  CustomerWithMaximumOrderCount,
  CustomerWithMaximumOrderValue,
  TopOrderedItem,
  useGetTopOrderSummary,
  useOrderSummaryChartData,
} from '../../../hooks/dashboard/dashboardhooks';
import useGetRelevantMerchantID from '../../../pages/merchant/hooks/useGetRelevantMerchantID';
import {
  DashboardComparisonRange,
  MerchantGraphDataFrequency,
  MerchantOrderSummaryOrderType,
} from '../../../enums';

interface TopOrderMerchantCardProps {
  stat: {
    title: string;
    value: string;
    number2: string;
  };
  isLoadingData: boolean;
}

const TopOrderMerchantCard = (props: TopOrderMerchantCardProps) => {
  const { stat, isLoadingData } = props;
  if (!props?.stat?.title) {
    return (
      <Card
        shadow="xs"
        padding="xs"
        radius="md"
        withBorder
        key={stat?.title}
        mb={10}
      >
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Text c="gray" fw={500} fz="lg" tt="capitalize">
            No data available
          </Text>
        </Flex>
      </Card>
    );
  }
  return (
    <Card
      shadow="xs"
      padding="xs"
      radius="md"
      withBorder
      key={stat?.title}
      mb={10}
    >
      <Group justify="space-between">
        {isLoadingData ? (
          <Skeleton w={80} h={16} />
        ) : (
          <Text
            size="xs"
            c="dimmed"
            style={{ fontWeight: 700, textTransform: 'uppercase' }}
            truncate="end"
          >
            {stat?.title}
          </Text>
        )}
      </Group>

      <Stack gap={'xs'} pr={20}>
        <Group justify="space-between">
          <Text fz="md" c="dimmed" mt={7}>
            Total Quantities
          </Text>
          {isLoadingData ? (
            <Skeleton w={50} h={16} />
          ) : (
            <Text>{stat?.value}</Text>
          )}
        </Group>

        <Group justify="space-between">
          <Text fz="md" c="dimmed">
            Number of Orders
          </Text>
          {isLoadingData ? (
            <Skeleton w={50} h={16} />
          ) : (
            <Text>{stat?.number2}</Text>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

interface ConvertedItem {
  title: string;
  icon: string;
  value: string;
  number2: string;
}

function formatTopOrderItems(
  topOrderedItems: TopOrderedItem[]
): ConvertedItem[] {
  return topOrderedItems?.map((item) => ({
    title: item.productName || '',
    icon: 'receipt',
    value: item.totalQuantity.toLocaleString(),
    number2: item.numberOfOrders.toLocaleString(),
  }));
}

const TopOrders = () => {
  const merchantId = useGetRelevantMerchantID();
  const [selectedFrequency, setSelectedFrequency] =
    useState<DashboardComparisonRange>(DashboardComparisonRange.AllTime);
  const { data, isLoading } = useGetTopOrderSummary(
    selectedFrequency,
    merchantId
  );

  const topOrderItems =
    (data?.data?.data?.topOrderedItems ?? []).length > 0
      ? formatTopOrderItems(data?.data?.data?.topOrderedItems ?? [])
      : formatTopOrderItems([
          { productName: '', totalQuantity: 0, numberOfOrders: 0 },
        ]);
  const renderUserInfoCard = <
    K extends
      | keyof CustomerWithMaximumOrderCount
      | keyof CustomerWithMaximumOrderValue,
  >(
    label: string,
    customerData:
      | CustomerWithMaximumOrderCount
      | CustomerWithMaximumOrderValue
      | undefined,
    valueLabel: string,
    valueKey: K
  ) => (
    <UserInfoCard
      cardLabel={label}
      Id={{ label: 'Customer Id', value: customerData?.customerId ?? '' }}
      Name={customerData?.customerName}
      totalNumber={
        customerData
          ? customerData[valueKey as keyof typeof customerData]
          : undefined
      }
      totalNumberLabel={valueLabel}
      profileImg={customerData?.profileImg}
      isLoadingData={isLoading}
      noDataAvailable={!customerData?.customerId}
    />
  );
  return (
    <Card withBorder>
      <Group align="center" justify="space-between">
        <Title order={5} c="grey" mb={10} style={{ textAlign: 'center' }}>
          Top Orders
        </Title>
        <Select
          maw={120}
          placeholder="Select Frequency"
          data={topOrderOptions}
          value={selectedFrequency}
          onChange={(value) =>
            setSelectedFrequency(value as DashboardComparisonRange)
          }
          size="xs"
        />
      </Group>

      <Box
        mah={500}
        style={{ overflow: 'auto', scrollbarWidth: 'thin' }}
        mt={'md'}
        pr={10}
      >
        <Stack gap={'sm'}>
          {topOrderItems?.map((stat, index) => (
            <TopOrderMerchantCard
              isLoadingData={isLoading}
              stat={stat}
              key={stat?.title ?? index}
            />
          ))}

          {renderUserInfoCard(
            'Top Customer with Maximum Orders',
            data?.data?.data?.customerWithMaximumOrderCount ?? undefined,
            'Total Orders',
            'totalOrders'
          )}

          {renderUserInfoCard(
            'Top Customer with Maximum Order Value',
            data?.data?.data?.customerWithMaximumOrderValue ?? undefined,
            'Total Order Value',
            'totalOrderValue'
          )}
        </Stack>
      </Box>
    </Card>
  );
};

type FrequencyOption = {
  label: string;
  value: MerchantGraphDataFrequency;
};

type OrderTypeOption = {
  label: string;
  value: MerchantOrderSummaryOrderType;
};
const frequencyOptions: FrequencyOption[] = [
  { label: 'Daily', value: MerchantGraphDataFrequency.Daily },
  { label: 'Weekly', value: MerchantGraphDataFrequency.Weekly },
  { label: 'Monthly', value: MerchantGraphDataFrequency.Monthly },
];
type TopOrdersOptions = {
  label: string;
  value: DashboardComparisonRange;
};
const topOrderOptions: TopOrdersOptions[] = [
  { label: 'All Time', value: DashboardComparisonRange.AllTime },
  { label: 'Last 24 Hours', value: DashboardComparisonRange.Last24Hours },
  { label: 'Last 7 Days', value: DashboardComparisonRange.Last7Days },
  { label: 'Last 30 Days', value: DashboardComparisonRange.Last30Days },
];

const orderTypeOptions: OrderTypeOption[] = [
  { label: 'Total Orders', value: MerchantOrderSummaryOrderType.TotalOrders },
  {
    label: 'Cancelled Orders',
    value: MerchantOrderSummaryOrderType.CancelledOrders,
  },
  {
    label: 'Rejected Orders',
    value: MerchantOrderSummaryOrderType.RejectedOrders,
  },
  { label: 'Delivery', value: MerchantOrderSummaryOrderType.DeliveryOrders },
  {
    label: 'Collection',
    value: MerchantOrderSummaryOrderType.CollectionOrders,
  },
  { label: 'Cash', value: MerchantOrderSummaryOrderType.CashOrders },
  { label: 'Card', value: MerchantOrderSummaryOrderType.CardOrders },
  { label: 'Refund Order', value: MerchantOrderSummaryOrderType.RefundOrders },
];

const OrderSummary = () => {
  const merchantId = useGetRelevantMerchantID();
  const [selectedFrequency, setSelectedFrequency] =
    useState<MerchantGraphDataFrequency>(MerchantGraphDataFrequency.Monthly);
  const [selectedOrderType, setSelectedOrderType] =
    useState<MerchantOrderSummaryOrderType>(
      MerchantOrderSummaryOrderType.TotalOrders
    );
  const { data: graphAPIDATA, isLoading } = useOrderSummaryChartData(
    selectedFrequency,
    selectedOrderType,
    merchantId
  );

  const summaryData = graphAPIDATA?.data?.data?.summary;
  return (
    <Grid>
      <Grid.Col span={{ sm: 12, md: 12, lg: 9 }}>
        <Card withBorder>
          <Stack>
            <Group align="center" justify="space-between">
              <Text
                size="md"
                c="dimmed"
                ml={'md'}
                style={{ fontWeight: 700, textTransform: 'uppercase' }}
              >
                Order Summary
              </Text>
              <Group>
                <Select
                  placeholder="Frequency"
                  data={frequencyOptions}
                  value={selectedFrequency}
                  onChange={(value) =>
                    setSelectedFrequency(value as MerchantGraphDataFrequency)
                  }
                  maw={120}
                  size="xs"
                />
                <Select
                  placeholder="Order Type"
                  data={orderTypeOptions}
                  value={selectedOrderType}
                  onChange={(value) =>
                    setSelectedOrderType(value as MerchantOrderSummaryOrderType)
                  }
                  maw={140}
                  size="xs"
                />
              </Group>
            </Group>

            {!isLoading && !summaryData ? null : (
              <Stack gap="xs" px={30}>
                <Group>
                  <Text fz="md" c="dimmed">
                    Total Order Value:
                  </Text>
                  {isLoading ? (
                    <Skeleton height={20} width={80} />
                  ) : (
                    <Text>{summaryData?.totalOrderValue ?? '-'}</Text>
                  )}
                </Group>
                <Group>
                  <Text fz="md" c="dimmed">
                    Total Count:
                  </Text>
                  {isLoading ? (
                    <Skeleton height={20} width={80} />
                  ) : (
                    <Text>{summaryData?.totalCount ?? '-'}</Text>
                  )}
                </Group>
                <Group>
                  {/* Total Average Value */}
                  <Text fz="md" c="dimmed">
                    Total Average Value:
                  </Text>
                  {isLoading ? (
                    <Skeleton height={20} width={80} />
                  ) : (
                    <Text>£ {summaryData?.totalAverageValue ?? '-'}</Text>
                  )}
                </Group>
              </Stack>
            )}

            {isLoading ? (
              <Skeleton height={400} />
            ) : (
              <AreaGraphForMerchant
                graphData={graphAPIDATA?.data?.data?.graphData}
              />
            )}
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 12, lg: 3 }}>
        <TopOrders />
      </Grid.Col>
    </Grid>
  );
};

export default OrderSummary;
