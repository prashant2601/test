import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { modals } from '@mantine/modals';
import { Text as MantineText } from '@mantine/core';
import { useEffect } from 'react';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useDeleteInvoiceIds } from '../../../../pages/admin/accounting/hooks/useDeleteInvoicesIds';
import { useSendInvoicesToMerchants } from '../../../../pages/admin/accounting/hooks/useSendInvoicesToMerchants';
import { IconSend } from '@tabler/icons-react';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import { InvoiceOperationHelperText } from './AllInvoicesGridTopToolBar';

const AllInvoicesGridTopToolbar = ({
  table,
  handleNewIconClicked,
}: GridCustomToolbarProps) => {
  const {
    mutateAsync: deleteInvoiceIdsMutateAsync,
    isSuccess: isSuccessInDeletingIds,
  } = useDeleteInvoiceIds();

  const {
    mutateAsync: sendInvoicesToSelectedMerchants,
    isPending: isSendingInvoicesToMerchants,
    isSuccess: isSuccessInSendingInvoicesToMerchants,
  } = useSendInvoicesToMerchants({ gridName: 'AllManualInvoicesDisplay' });
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
      <Box sx={{ flexGrow: 1 }}>
        <Button
          variant="contained"
          onClick={() => handleNewIconClicked()}
          size="small"
          color="success"
        >
          Create Invoice
        </Button>
      </Box>
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
