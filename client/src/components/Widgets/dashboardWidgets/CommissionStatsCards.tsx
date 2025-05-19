import { Box, SimpleGrid } from '@mantine/core';
import {
  IconCash,
  IconTruckDelivery,
  IconClipboardList,
  IconTax,
} from '@tabler/icons-react';
import CardWithIconTitleInfo from './cards/CardWithIconTitleInfo';

import { useState } from 'react';
import { DashboardComparisonRange } from '../../../enums';
import useGetRelevantMerchantID from '../../../pages/merchant/hooks/useGetRelevantMerchantID';

import StateManagedTabs from '../../CoreUI/tabs/StateManagedTabs';
import { useGetOrderCommissionReport } from '../../../hooks/dashboard/dashboardhooks';

const labelMap: Record<string, string> = {
  totalNetCommission: 'Total Net Commission',
  deliveryOrderCommission: 'Delivery ',
  collectionOrderCommission: 'Collection ',
  totalServiceFeeCommission: 'Total Commission',
  deliveryOrderServiceFeeCommission: 'Delivery',
  collectionOrderServiceFeeCommission: 'Collection',
  totalDeliveryChargeCommission: 'Total  Commission',
  deliveryOrderDeliveryChargeCommission: 'Delivery',
  collectionOrderDeliveryChargeCommission: 'Collection',
  totalOrderCommission: 'Total Order',
  totalDeliveryOrderCommission: ' Delivery',
  totalCollectionOrderCommission: ' Collection ',
  netCommission: 'Commission',
  netServiceFeeCommission: 'Service Fee',
  netDeliveryChargeCommission: 'Delivery Charge',
  totalCommission: 'Total',
  netVATCommission: 'VAT',
  totalVATCommission: 'Total Commission',
  deliveryOrderVATCommission: 'Delivery',
  collectionOrderVATCommission: 'Collection',
};

const emptyObjectMapping = {
  netCommission: {
    deliveryOrderCommission: '',
    collectionOrderCommission: '',
    totalNetCommission: '',
  },
  netServiceFeeCommission: {
    deliveryOrderServiceFeeCommission: '',
    collectionOrderServiceFeeCommission: '',
    totalServiceFeeCommission: '',
  },
  netDeliveryChargeCommission: {
    deliveryOrderDeliveryChargeCommission: '',
    collectionOrderDeliveryChargeCommission: '',
    totalDeliveryChargeCommission: '',
  },
  netVATCommission: {
    deliveryOrderVATCommission: '',
    collectionOrderVATCommission: '',
    totalVATCommission: '',
  },
  totalCommission: {
    totalDeliveryOrderCommission: '',
    totalCollectionOrderCommission: '',
    totalOrderCommission: '',
  },
};
function rearrangeNestedKeys(obj: Record<string, any>) {
  const sortedObj: Record<string, any> = {};

  for (const mainKey in obj) {
    if (obj.hasOwnProperty(mainKey)) {
      const nested = obj[mainKey];

      // Sort keys: delivery first, then collection, then total
      const sortedKeys = Object.keys(nested).sort((a, b) => {
        const order = (key: string) => {
          if (key.toLowerCase().includes('delivery')) return 0;
          if (key.toLowerCase().includes('collection')) return 1;
          if (key.toLowerCase().includes('total')) return 2;
          return 3;
        };
        return order(a) - order(b);
      });

      // Build new nested object with sorted keys
      sortedObj[mainKey] = {};
      sortedKeys.forEach((key) => {
        sortedObj[mainKey][key] = nested[key];
      });
    }
  }

  return sortedObj;
}

const icons = [IconCash, IconTruckDelivery, IconClipboardList, IconTax];
const cardColors = ['#D9F7BE', '#B5E4FF', '#FFD6E7', '#FFF4BF', '#E6E6FA'];
const iconColors = ['#52C41A', '#1890FF', '#EB2F96', '#FAAD14', '#9370DB'];
const iconBackground = ['#A7D7A3', '#7EC7E8', '#F5A4C1', '#FCD684', '#BBA0E0'];

const comparisonRanges: { label: string; value: DashboardComparisonRange }[] = [
  { label: 'Last 7 Days', value: DashboardComparisonRange.Last7Days },
  { label: 'Last 30 Days', value: DashboardComparisonRange.Last30Days },
  { label: 'Last 24 Hours', value: DashboardComparisonRange.Last24Hours },
  { label: 'All Time', value: DashboardComparisonRange.AllTime },
];
export function CommissionStatsCards() {
  const [activeTab, setActiveTab] = useState<DashboardComparisonRange>(
    comparisonRanges[0].value
  );

  const handleTabChange = (value: DashboardComparisonRange) => {
    setActiveTab(value);
  };

  const merchantId = useGetRelevantMerchantID();
  const { data: OrderCommisionData, isLoading } = useGetOrderCommissionReport(
    activeTab,
    merchantId
  );

  const displayData = OrderCommisionData
    ? rearrangeNestedKeys(OrderCommisionData?.data)
    : emptyObjectMapping;
  return (
    <Box mb={20}>
      <StateManagedTabs
        tabs={comparisonRanges}
        activeTab={activeTab}
        onTabChange={(value: string) =>
          handleTabChange(value as DashboardComparisonRange)
        }
      />

      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3, lg: 5 }}>
        {Object.entries(displayData).map(([label, values], index) => {
          const formattedData = Object.entries(values).map(([key, value]) => ({
            label: key,
            value,
          }));

          return (
            <CardWithIconTitleInfo
              key={label}
              mainLabel={labelMap[label]?.toUpperCase() || label}
              data={formattedData}
              icon={icons[index % icons.length]}
              bgColor={cardColors[index % cardColors.length]}
              iconColor={iconColors[index % iconColors.length]}
              iconBgColor={iconBackground[index % iconBackground.length]}
              labelMap={labelMap}
              loadingData={isLoading}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

export default CommissionStatsCards;
