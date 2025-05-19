import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowRight,
  IconCalculator,
  IconReceipt2,
} from '@tabler/icons-react';
import { useFormikContext } from 'formik';
import { useRecalculateOrderCommission } from '../../pages/admin/orders/hooks/useRecalculateOrderCommision';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
const SummaryRow = ({
  label,
  value,
  fieldKey,
  highlightedFields,
}: {
  label: string;
  value: string | number | undefined;
  fieldKey?: string;
  highlightedFields?: string[];
}) => {
  const isHighlighted = fieldKey && highlightedFields?.includes(fieldKey);

  return (
    <Group
      gap="apart"
      style={{
        backgroundColor: isHighlighted ? '#fff3cd' : undefined,
        transition: 'background-color 0.3s ease',
        borderRadius: 4,
        padding: '2px 4px',
      }}
    >
      <Text c="dimmed">{label}</Text>
      <Text fw={500}>£ {value ?? '-'}</Text>
    </Group>
  );
};

const AdditionalRenderInFieldSection = () => {
  const { mutateAsync: RecalculateOrderCommision, isPending } =
    useRecalculateOrderCommission();
  const { values, setFieldValue } = useFormikContext<any>();

  const VAT = useMemo(() => {
    return (
      (Number(values.netCommission ?? 0) +
        Number(values.netServiceFee ?? 0) +
        Number(values.netDeliveryCharge ?? 0)) *
      0.2
    ).toFixed(2);
  }, [values]);

  const TotalCommission = useMemo(() => {
    return (
      Number(values.netCommission ?? 0) +
      Number(values.netServiceFee ?? 0) +
      Number(values.netDeliveryCharge ?? 0) +
      Number(VAT)
    ).toFixed(2);
  }, [values, VAT]);

  // State to track which fields were updated
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const previousValues = useRef({
    netCommission: values.netCommission,
    netServiceFee: values.netServiceFee,
    netDeliveryCharge: values.netDeliveryCharge,
  });
  const queryClient = useQueryClient();
  const handleRecalculate = useCallback(() => {
    const { orderId, merchantDetails } = values;
    RecalculateOrderCommision({ orderId, merchantDetails })
      .then((response) => {
        if (response.data.success) {
          const order = response.data.order;

          const changed: string[] = [];

          if (order.netCommission !== previousValues.current.netCommission) {
            changed.push('netCommission');
          }
          if (order.netServiceFee !== previousValues.current.netServiceFee) {
            changed.push('netServiceFee');
          }
          if (
            order.netDeliveryCharge !== previousValues.current.netDeliveryCharge
          ) {
            changed.push('netDeliveryCharge');
          }

          setHighlightedFields(changed);

          previousValues.current = {
            netCommission: order.netCommission,
            netServiceFee: order.netServiceFee,
            netDeliveryCharge: order.netDeliveryCharge,
          };

          setFieldValue('netCommission', order.netCommission);
          setFieldValue('netServiceFee', order.netServiceFee);
          setFieldValue('netDeliveryCharge', order.netDeliveryCharge);
          queryClient.invalidateQueries({ queryKey: ['Orders-Grid-data'] });
        }
      })
      .catch((error) => {
        console.error('Error recalculating commission:', error);
      });
  }, [RecalculateOrderCommision, setFieldValue, values]);

  return (
    <Card radius="md" withBorder p="lg" mt="md">
      <Divider
        label="Commission Summary"
        mb="xl"
        styles={{ label: { fontWeight: 500 } }}
      />
      <Flex justify="space-around" align="flex-start" wrap={'wrap'}>
        <Button
          onClick={handleRecalculate}
          disabled={isPending}
          mb="lg"
          variant="outline"
          leftSection={isPending ? <Loader size={'xs'} /> : <IconCalculator />}
          rightSection={<IconArrowRight />}
        >
          Recalculate
        </Button>
        <SummaryRow
          label="Commission (Net):"
          value={values.netCommission}
          fieldKey="netCommission"
          highlightedFields={highlightedFields}
        />

        <SummaryRow
          label="Service Fee (Net):"
          value={values.netServiceFee}
          fieldKey="netServiceFee"
          highlightedFields={highlightedFields}
        />

        <SummaryRow
          label="Delivery (Net):"
          value={values.netDeliveryCharge}
          fieldKey="netDeliveryCharge"
          highlightedFields={highlightedFields}
        />

        <SummaryRow label="VAT (20%):" value={VAT} />
      </Flex>
      <Divider my="sm" />

      <Flex justify={'flex-end'} px={30}>
        <Group>
          <ThemeIcon variant="light" radius="xl" c="teal" size="sm">
            <IconReceipt2 size={16} />
          </ThemeIcon>
          <Text fw={600}>{`Total Commission: `}&nbsp;</Text>
        </Group>
        <Text fw={700} c="teal">
          £ {TotalCommission}
        </Text>
      </Flex>
    </Card>
  );
};

export default AdditionalRenderInFieldSection;
