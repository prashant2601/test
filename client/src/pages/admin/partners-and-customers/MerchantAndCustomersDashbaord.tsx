import { Divider, Space, Stack } from '@mantine/core';

import '@mantine/charts/styles.css';
import CommissionStatsCards from '../../../components/Widgets/dashboardWidgets/CommissionStatsCards';
import { ComparativeOrderAnalysis } from '../../../components/Widgets/dashboardWidgets/ComparativeOrderAnalysis';
import OrderSummary from '../../../components/Widgets/dashboardWidgets/OrderSummary';

const MerchantAndCustomersDashbaord = () => {
  return (
    <Stack gap={'md'}>
      <CommissionStatsCards />
      <ComparativeOrderAnalysis />
      <Space h={25} />
      <OrderSummary />
      <Divider />
    </Stack>
  );
};

export default MerchantAndCustomersDashbaord;
