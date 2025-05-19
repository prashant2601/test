import { Badge, Container, Flex, Group, Switch, Text } from '@mantine/core';
import { useGetMerchantDetailsbyId } from '../../admin/merchants/hooks/useGetMerchantDetailsbyId';
import useGetRelevantMerchantID from '../hooks/useGetRelevantMerchantID';
import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

export function DisplayMerchatHeaderWidget() {
  const [checked, setChecked] = useState(false);
  const merchantId = useGetRelevantMerchantID();
  const { data } = useGetMerchantDetailsbyId(merchantId);

  if (!merchantId) {
    return (
      <Container size="lg" mt={30} className="fallback-ui">
        <Text size="md">Merchant ID is not provided</Text>
      </Container>
    );
  }

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      w="100%"
      gap="sm"
      px={20}
    >
      {/* Left side group */}
      <Group wrap="wrap" gap="sm">
        <Badge
          size="lg"
          variant="dot"
          styles={{ root: { textTransform: 'none', fontWeight: '600' } }}
        >
          Merchant Id : {merchantId}
        </Badge>
        <Badge
          size="lg"
          variant="dot"
          styles={{ root: { textTransform: 'none', fontWeight: '600' } }}
        >
          {data?.data?.merchant?.merchantName}
        </Badge>
        {/* <MerchantPerformanceScore score={90} />
        <MerchantRatingWidget /> */}
      </Group>

      {/* Right-aligned Switch */}
      <Switch
        size="lg"
        onLabel="Active"
        offLabel="In Active"
        thumbIcon={
          checked ? (
            <IconCheck
              size={12}
              color="var(--mantine-color-teal-6)"
              stroke={3}
            />
          ) : (
            <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
          )
        }
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
    </Flex>
  );
}
