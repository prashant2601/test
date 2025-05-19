import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useUpdateUser } from '../../../../pages/admin/adminPanelSetting/usersAndRole/hooks/useUpdateUser';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import DeleteActionInGrid from './components/DeleteActionInGrid';
import { useDeleteExpenseData } from '../../../../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/useDeleletExpenseData';
import { ActionIcon, Button, Group, Tooltip } from '@mantine/core';
import ExpenseCategoryCRUD from '../../../../pages/admin/tax-and-financial-reports/expenses-receipts/ExpenseCategoryCRUD';
import { modals } from '@mantine/modals';
import ExpenseTypeCRUD from '../../../../pages/admin/tax-and-financial-reports/expenses-receipts/ExpneseTypeCRUD';
import ExpenseStoreTable from '../../../../pages/admin/tax-and-financial-reports/expenses-receipts/ExpenseStoreCRUD';
import {
  IconBuildingStore,
  IconCategory,
  IconReceipt,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
const ExpensesGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;
  const {
    mutateAsync: deleteExpenseDataAsync,
    isSuccess: isSucceesIndeletingIds,
  } = useDeleteExpenseData();
  const { isSuccess: iSSuccessInUpdating } = useUpdateUser();
  useEffect(() => {
    if (isSucceesIndeletingIds || iSSuccessInUpdating) {
      table.resetRowSelection();
    }
  }, [isSucceesIndeletingIds, iSSuccessInUpdating]);
  const isMobile = useMediaQuery('(max-width: 768px)');
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
      <Group>
        <Button
          variant="contained"
          onClick={() => handleNewIconClicked()}
          color="success"
          size={'xs'}
        >
          {isMobile ? 'Upload' : 'Upload Receipts'}
        </Button>
        <Tooltip label="Manage Expense Category">
          <ActionIcon
            size="small"
            variant="transparent"
            onClick={() =>
              modals.open({
                title: 'Manage Expense Category',
                children: <ExpenseCategoryCRUD />,
                size: 'auto',
              })
            }
          >
            <IconCategory />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Manage Expense Stores">
          <ActionIcon
            size="small"
            variant="transparent"
            onClick={() =>
              modals.open({
                title: 'Manage Expense Stores',
                children: <ExpenseStoreTable />,
                size: 'auto',
              })
            }
          >
            <IconBuildingStore />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Manage Expense Type">
          <ActionIcon
            size="small"
            variant="transparent"
            onClick={() =>
              modals.open({
                title: 'Manage Expense Type',
                children: <ExpenseTypeCRUD />,
                size: 'auto',
              })
            }
          >
            <IconReceipt />
          </ActionIcon>
        </Tooltip>
      </Group>
      <DeleteActionInGrid
        table={table}
        confirmationText={'receipts(s)'}
        onDeleteConfirm={deleteExpenseDataAsync}
        uniqueIDinRow="receiptId"
      />
    </Box>
  );
};

export default ExpensesGridTopToolBar;
