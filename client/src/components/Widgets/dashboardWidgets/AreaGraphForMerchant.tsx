import { Center, Text, ThemeIcon } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { AreaChart } from '@mantine/charts';

interface GraphDataItem {
  xAxis: string;
  OrderValue: number;
  OrderCount: number;
  AverageValue: number;
}

interface AreaGraphForMerchantProps {
  graphData?: GraphDataItem[];
}

const AreaGraphForMerchant: React.FC<AreaGraphForMerchantProps> = ({
  graphData,
}) => {
  if (!graphData || graphData.length === 0) {
    return (
      <Center h={500}>
        <ThemeIcon color="gray" size={80} radius="xl" variant="light">
          <IconMoodSad size={48} />
        </ThemeIcon>
        <Text size="lg" c="dimmed" ml="md">
          No data available
        </Text>
      </Center>
    );
  }

  return (
    <AreaChart
      h={400}
      data={graphData}
      dataKey="xAxis"
      series={[
        { name: 'OrderValue', color: 'indigo.6' },
        { name: 'OrderCount', color: 'blue.6' },
        { name: 'AverageValue', color: 'teal.6' },
      ]}
      curveType="linear"
      tooltipAnimationDuration={200}
    />
  );
};

export default AreaGraphForMerchant;
