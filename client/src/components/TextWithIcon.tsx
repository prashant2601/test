import { Collections } from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import {
  IconCreditCardPay,
  IconCurrencyEuro,
  IconCurrencyPound,
  IconTruckDelivery,
} from '@tabler/icons-react';

const TextWithIcon = ({
  renderedCellValue,
  PoundIcon = false,
  PoundAsText = false,
}: {
  renderedCellValue: React.ReactNode;
  PoundIcon?: boolean;
  PoundAsText?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {renderedCellValue === 'CASH' && <IconCurrencyEuro />}
      {renderedCellValue === 'CARD' && <IconCreditCardPay />}
      {renderedCellValue === 'DELIVERY' && <IconTruckDelivery />}
      {renderedCellValue === 'COLLECTION' && <Collections />}
      {PoundIcon && <IconCurrencyPound size={16} />}
      {PoundAsText && <span>£</span>}
      <span>{renderedCellValue}</span>
    </Box>
  );
};

export default TextWithIcon;
