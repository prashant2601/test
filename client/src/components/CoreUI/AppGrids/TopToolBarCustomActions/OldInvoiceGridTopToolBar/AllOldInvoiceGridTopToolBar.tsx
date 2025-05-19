import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { modals } from '@mantine/modals';
import { Text as MantineText, Modal } from '@mantine/core';
import { useEffect } from 'react';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useDeleteInvoiceIds } from '../../../../../pages/admin/accounting/hooks/useDeleteInvoicesIds';
import { GridCustomToolbarProps } from '../ToolBarCustomAction';
import { useDisclosure } from '@mantine/hooks';
import UploadOldInvoicePdfModal from './UploadOldInvoicePdfModal';

const AllOldInvoiceGridTopToolBar = ({ table }: GridCustomToolbarProps) => {
  const {
    mutateAsync: deleteInvoiceIdsMutateAsync,
    isSuccess: isSuccessInDeletingIds,
  } = useDeleteInvoiceIds();
  const [opened, { open, close }] = useDisclosure(false);

  const { flatRows } = table.getSelectedRowModel();
  const selectedInvoiceIds =
    flatRows?.map((row) => row.original.invoiceId) || [];

  const handleOperationConfirmation = (operationName: string) => {
    const message = 'Success';
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
          //   sendInvoicesToSelectedMerchants(selectedInvoiceIds);
        }
      },
    });
  };

  const handleDelete = () => handleOperationConfirmation('deleteInvoices');
  useEffect(() => {
    if (isSuccessInDeletingIds) {
      table.resetRowSelection();
    }
  }, [isSuccessInDeletingIds, table]);

  const isRowSelected =
    table.getIsSomeRowsSelected() || table.getIsAllPageRowsSelected();

  return (
    <>
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
            onClick={() => open()}
            size="small"
            color="success"
          >
            Upload Invoice
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
        </Box>
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        title={'Upload Old Invoices'}
        centered
        transitionProps={{ transition: 'fade', duration: 200 }}
        style={{ borderRadius: '15px' }}
        size={'lg'}
      >
        <UploadOldInvoicePdfModal closeModal={close} />
      </Modal>
    </>
  );
};

export default AllOldInvoiceGridTopToolBar;
