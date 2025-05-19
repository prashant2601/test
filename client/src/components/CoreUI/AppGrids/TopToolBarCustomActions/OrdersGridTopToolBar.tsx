import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Menu, Text as MantineText, Group } from '@mantine/core';
import {
  IconChevronDown,
  IconDatabaseEdit,
  IconDatabasePlus,
  IconMessageCircleShare,
} from '@tabler/icons-react';
import { orderStatuses } from '../../../../pages/admin/orders/DisplayOrders/constants';
import { useDeleteOrderByID } from '../../../../pages/admin/orders/hooks/useDeleteOrderByID';
import { useUpdateOrders } from '../../../../pages/admin/orders/hooks/useUpdateOrders';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { MRT_RowData } from 'material-react-table';
import { useSendCustomersOrderIDsFeedback } from '../../../../pages/admin/orders/hooks/useSendCustomersOrderFeedback';
import DebouncedOptionSearchSelect from '../../../AppAutoCompletes/DebouncedOptionSearchSelect';
import { useGetMerchantIdAndName } from '../../../../pages/admin/merchants/hooks/useGetMerchantIdAndName';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import DeleteActionInGrid from './components/DeleteActionInGrid';

const OrdersGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;

  const disableButton =
    !table.getIsAllPageRowsSelected() && !table.getIsSomeRowsSelected();
  const {
    mutateAsync: deleteOrdersMutateAsync,
    isSuccess: isSuccessInDeleting,
  } = useDeleteOrderByID();
  const {
    mutateAsync: updateOrdersMutateAsync,
    isSuccess: isSuccessInUpdating,
  } = useUpdateOrders();
  const {
    mutateAsync: sendFeedbackMutateAsync,
    isSuccess: isSuccessInSendingFeedback,
  } = useSendCustomersOrderIDsFeedback();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, isFetching } = useGetMerchantIdAndName(
    search,
    !disableButton,
    1,
    100
  );
  const getSelectedRows = table
    .getSelectedRowModel()
    ?.flatRows?.map((row) => row?.original);

  const handleSendFeedback = () => {
    modals.openConfirmModal({
      title: (
        <MantineText size="md" style={{ fontWeight: '600' }}>
          Are you sure you want to proceed?
        </MantineText>
      ),
      children: (
        <MantineText size="sm">
          This action will send a feedback mail to the customer of selected
          order IDs.
        </MantineText>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => {
        sendFeedbackMutateAsync(
          getSelectedRows?.map((row) => ({
            orderId: row?.orderId,
            customerId: row?.customerId,
          }))
        );
      },
    });
  };

  const handleBulkStatusUpdate = (
    orders: MRT_RowData[],
    buttonName: string
  ) => {
    const updatesPayload = orders?.map((item: any) => ({
      ...item,
      status: buttonName,
    }));
    updateOrdersMutateAsync({ updates: updatesPayload });
  };

  const handleBulkMerchantIDUpdate = (merchantId: string) => {
    const updatesPayload = getSelectedRows?.map((item: any) => ({
      ...item,
      merchantId,
    }));
    updateOrdersMutateAsync({ updates: updatesPayload });
  };

  useEffect(() => {
    if (
      isSuccessInDeleting ||
      isSuccessInUpdating ||
      isSuccessInSendingFeedback
    ) {
      table.resetRowSelection();
    }
  }, [
    isSuccessInDeleting,
    isSuccessInUpdating,
    isSuccessInSendingFeedback,
    table,
  ]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button variant="contained" onClick={handleNewIconClicked} size="small">
          Add Order &nbsp; <IconDatabasePlus stroke={2} size={16} />
        </Button>
        <Menu width={200} shadow="md">
          <Menu.Target>
            <Button
              variant="contained"
              endIcon={<IconChevronDown />}
              disabled={disableButton}
              size="small"
              color="info"
            >
              Update Status &nbsp; <IconDatabaseEdit stroke={2} size={16} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ maxHeight: 300, overflow: 'scroll' }}>
            <Menu.Label>Select Status of Order</Menu.Label>
            {orderStatuses.map((item) => (
              <Menu.Item
                key={item.value}
                component="button"
                name={item.value}
                onClick={(e) =>
                  handleBulkStatusUpdate(getSelectedRows, e.currentTarget.name)
                }
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
        <DebouncedOptionSearchSelect
          disableButton={disableButton}
          handleBulkUpdate={handleBulkMerchantIDUpdate}
          search={search}
          setSearch={setSearch}
          buttonLabel="Update Merchant"
          dropdownPlaceholder="Search Merchants"
          emptyMessage="No Merchants Found"
          optionLabel={(item: any) =>
            `${item.merchantName} (${item.merchantId})`
          }
          optionValue={(item: any) => `${item.merchantId?.toString()}`}
          data={data?.data?.merchants || []}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
        />
      </Box>
      <Group gap={'xs'}>
        <DeleteActionInGrid
          table={table}
          confirmationText="order(s)"
          onDeleteConfirm={deleteOrdersMutateAsync}
          uniqueIDinRow="orderId"
        />
        <Tooltip title="Send a feedback email" placement="top">
          <span>
            <IconButton
              color="primary"
              disabled={disableButton}
              onClick={handleSendFeedback}
            >
              <IconMessageCircleShare stroke={2} />
            </IconButton>
          </span>
        </Tooltip>
      </Group>
    </Box>
  );
};

export default OrdersGridTopToolBar;
