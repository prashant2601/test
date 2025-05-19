import { Box, IconButton, Tooltip } from '@mui/material';
import { modals } from '@mantine/modals';
import { Text as MantineText } from '@mantine/core';
import { useEffect } from 'react';
import { MRT_TableInstance } from 'material-react-table';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useDeleteInvoiceIds } from '../../../../pages/admin/accounting/hooks/useDeleteInvoicesIds';
import { useSendInvoicesToMerchants } from '../../../../pages/admin/accounting/hooks/useSendInvoicesToMerchants';
import { IconSend } from '@tabler/icons-react';

export interface ALLInvoicesGridCustomToolbarProps {
  table: MRT_TableInstance<any>;
}

export const InvoiceOperationHelperText = new Map<string, string>([
  ['deleteInvoices', 'This action will delete the selected Invoice(s).'],
  [
    'send_to_merchants',
    'This action will send the Invoice(s) to Selected Merchant(s)',
  ],
]);

const AllInvoicesGridTopToolbar = ({
  table,
}: ALLInvoicesGridCustomToolbarProps) => {
  const {
    mutateAsync: deleteInvoiceIdsMutateAsync,
    isSuccess: isSuccessInDeletingIds,
  } = useDeleteInvoiceIds();

  const {
    mutateAsync: sendInvoicesToSelectedMerchants,
    isPending: isSendingInvoicesToMerchants,
    isSuccess: isSuccessInSendingInvoicesToMerchants,
  } = useSendInvoicesToMerchants({ gridName: 'AllInvoicesDisplay' });

  const { flatRows } = table.getSelectedRowModel();
  const selectedInvoiceIds =
    flatRows?.map((row) => row.original.invoiceId) || [];

  const handleOperationConfirmation = (operationName: string) => {
    const message = InvoiceOperationHelperText.get(operationName) ?? 'Success';

    modals.openConfirmModal({
      title: (
        <MantineText size="md" style={{ fontWeight: '600' }}>
          Are you sure you want to proceed?
        </MantineText>
      ),
      children: <MantineText size="sm">{message}</MantineText>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => console.log('Operation cancelled'),
      onConfirm: () => {
        if (operationName === 'deleteInvoices') {
          deleteInvoiceIdsMutateAsync(selectedInvoiceIds.join(','));
        } else if (operationName === 'send_to_merchants') {
          sendInvoicesToSelectedMerchants(selectedInvoiceIds);
        }
      },
    });
  };

  const handleDelete = () => handleOperationConfirmation('deleteInvoices');
  const handleSendToMerchants = () =>
    handleOperationConfirmation('send_to_merchants');

  useEffect(() => {
    if (isSuccessInDeletingIds || isSuccessInSendingInvoicesToMerchants) {
      table.resetRowSelection();
    }
  }, [isSuccessInDeletingIds, isSuccessInSendingInvoicesToMerchants, table]);

  const isRowSelected =
    table.getIsSomeRowsSelected() || table.getIsAllPageRowsSelected();

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Box>
        <Tooltip title="Delete selected rows" placement="top">
          <span>
            <IconButton
              color="error"
              disabled={!isRowSelected}
              onClick={handleDelete}
            >
              <DeleteForeverRounded />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Send to Merchant" placement="top">
          <span>
            <IconButton
              color="info"
              disabled={!isRowSelected || isSendingInvoicesToMerchants}
              onClick={handleSendToMerchants}
            >
              <IconSend stroke={2} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AllInvoicesGridTopToolbar;
