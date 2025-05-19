import React from 'react';
import {
  IconCreditCardPay,
  IconCurrencyEuro,
  IconCurrencyPound,
  IconBriefcase,
  IconUser,
} from '@tabler/icons-react';
import { Badge, Group, Text } from '@mantine/core';
import { orderStatuses } from '../../../admin/orders/DisplayOrders/constants';

type MerchantOrderHistoryBadgeProps = {
  text: string; // this is the value, not the label
  PoundIcon?: boolean;
  PoundAsText?: boolean;
};

// Get label from value using orderStatuses
const getLabelFromValue = (value: string): string => {
  return orderStatuses.find((status) => status.value === value)?.label ?? value;
};

const getIcon = (value: string) => {
  switch (value.toUpperCase()) {
    case 'CASH':
      return <IconCurrencyEuro size={14} />;
    case 'CARD':
      return <IconCreditCardPay size={14} />;
    case 'DELIVERY':
      return <IconUser size={14} />;
    case 'COLLECTION':
      return <IconBriefcase size={14} />;
    default:
      return null;
  }
};

const getBadgeColor = (value: string): string => {
  switch (value.toUpperCase()) {
    case 'CASH':
      return 'green';
    case 'CARD':
      return 'blue';
    case 'DELIVERY':
      return 'orange';
    case 'COLLECTION':
      return 'grape';
    case 'DELIVERED':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'CANCELLED':
      return 'gray';
    default:
      return 'teal';
  }
};

const MerchantOrderHistoryBadge: React.FC<MerchantOrderHistoryBadgeProps> = ({
  text = 'NA',
  PoundIcon = false,
  PoundAsText = false,
}) => {
  const label = getLabelFromValue(text);

  return (
    <Badge
      variant="light"
      size="md"
      color={getBadgeColor(text)}
      leftSection={
        <Group>
          {getIcon(text)}
          {PoundIcon && <IconCurrencyPound size={12} />}
          {PoundAsText && <Text span>£</Text>}
        </Group>
      }
      styles={{ root: { textTransform: 'none' } }}
    >
      <Text size="xs" fw={500}>
        {label}
      </Text>
    </Badge>
  );
};

export default MerchantOrderHistoryBadge;
