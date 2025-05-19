import { Divider, Space, Stack } from '@mantine/core';

import '@mantine/charts/styles.css';
import { useAppAbility } from '../../../abilityContext/AbilityContext';
import CommissionStatsCards from '../../../components/Widgets/dashboardWidgets/CommissionStatsCards';
import { ComparativeOrderAnalysis } from '../../../components/Widgets/dashboardWidgets/ComparativeOrderAnalysis';
import OrderSummary from '../../../components/Widgets/dashboardWidgets/OrderSummary';

const MerchantDashbaord = () => {
  const { ability } = useAppAbility();

  return (
    <Stack gap={'md'}>
      {ability.can('access', `merchantComissionReport`) && (
        <CommissionStatsCards />
      )}

      <ComparativeOrderAnalysis />
      <Space h={25} />

      <OrderSummary />
      <Divider />
    </Stack>
  );
};

export default MerchantDashbaord;
