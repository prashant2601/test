import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import {
  Box,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Text,
  ThemeIcon,
} from '@mantine/core';

import { useState } from 'react';
import { MerchantComparativeAnalysis } from '../../../enums';
import useGetRelevantMerchantID from '../../../pages/merchant/hooks/useGetRelevantMerchantID';
import StateManagedTabs from '../../CoreUI/tabs/StateManagedTabs';
import { useGetComparativeOrderAnalysis } from '../../../hooks/dashboard/dashboardhooks';
const orderAnalysisPeriods: {
  label: string;
  value: MerchantComparativeAnalysis;
}[] = [
  { label: 'Today', value: MerchantComparativeAnalysis.Today },
  { label: 'This Week', value: MerchantComparativeAnalysis.ThisWeek },
  { label: 'This Month', value: MerchantComparativeAnalysis.ThisMonth },
  { label: 'This Year', value: MerchantComparativeAnalysis.ThisYear },
];
const MerchantComparativeAnalysisWithLastMapping: Record<
  MerchantComparativeAnalysis,
  string
> = {
  today: 'yesterday',
  thisWeek: 'last week',
  thisMonth: 'last month',
  thisYear: 'last year',
};

export function ComparativeOrderAnalysis() {
  const [activeTab, setActiveTab] = useState<MerchantComparativeAnalysis>(
    orderAnalysisPeriods[0].value
  );

  const handleTabChange = (value: MerchantComparativeAnalysis) => {
    setActiveTab(value);
  };

  const merchantId = useGetRelevantMerchantID();
  const { data: MerchantComparativeAnalysisData, isLoading } =
    useGetComparativeOrderAnalysis(activeTab, merchantId);

  const finalDatatoRender =
    MerchantComparativeAnalysisData?.data?.data.metrics ??
    Array(5).fill(undefined);
  const stats = finalDatatoRender?.map((stat, index) => {
    const DiffIcon =
      stat?.trend === 'positive' ? IconArrowUpRight : IconArrowDownRight;
    console.log(
      orderAnalysisPeriods.find((tab) => tab.value === activeTab)?.value
    );
    const activeTabLabel =
      MerchantComparativeAnalysisWithLastMapping[
        orderAnalysisPeriods.find((tab) => tab.value === activeTab)
          ?.value as MerchantComparativeAnalysis
      ];

    return (
      <Card
        withBorder
        p="md"
        radius="md"
        key={stat?.key ?? index}
        shadow="sm"
        style={{
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.01)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }}
      >
        <Group justify="apart">
          <Box>
            {isLoading ? (
              <Skeleton height={24} width={100} mb={8} />
            ) : (
              <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                {stat?.label}
              </Text>
            )}

            {isLoading ? (
              <Skeleton height={28} width={100} />
            ) : (
              <Text fw={700} fz="xl">
                {stat?.type === 'amount'
                  ? `£${stat?.current?.toLocaleString()}`
                  : stat?.current}
              </Text>
            )}
          </Box>

          {isLoading ? (
            <Skeleton height={38} width={38} radius="md" />
          ) : (
            <ThemeIcon
              color="gray"
              variant="light"
              style={{
                color:
                  stat?.trend === 'positive'
                    ? 'var(--mantine-color-teal-6)'
                    : 'var(--mantine-color-red-6)',
              }}
              size={38}
              radius="md"
            >
              <DiffIcon size={28} stroke={1.5} />
            </ThemeIcon>
          )}
        </Group>

        {isLoading ? (
          <Skeleton height={24} width={180} mt={16} />
        ) : (
          <Text c="dimmed" fz="sm" mt="xs">
            <Text
              component="span"
              c={stat?.trend === 'positive' ? 'teal' : 'red'}
              fw={700}
            >
              {stat?.percentageChange}%
            </Text>
            {` ${stat?.trend === 'positive' ? 'increase' : 'decrease'} compared to ${activeTabLabel}`}
          </Text>
        )}
        {isLoading ? (
          <Skeleton height={24} width={180} mt={16} />
        ) : (
          <Group justify="space-between" w={'100%'} mt={'xs'}>
            <Text size="sm" c="dimmed">
              Previous: {stat?.previous}
            </Text>
            <Text size="sm" c="dimmed">
              Current: {stat?.current}
            </Text>
          </Group>
        )}
      </Card>
    );
  });

  return (
    <div>
      <StateManagedTabs
        tabs={orderAnalysisPeriods}
        activeTab={activeTab}
        onTabChange={(value: string) =>
          handleTabChange(value as MerchantComparativeAnalysis)
        }
      />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 4, xl: 5 }}>
        {stats}
      </SimpleGrid>
    </div>
  );
}
