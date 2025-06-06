import { Box, Button } from '@mui/material';
import { useEffect } from 'react';
import { useUpdateCustomerDetailsbyId } from '../../../../pages/admin/customers/hooks/useUpdateCustomerDetailsbyId';
import { IconUserPlus } from '@tabler/icons-react';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import DeleteActionInGrid from './components/DeleteActionInGrid';
import { useDeleteSwishrCourierCustomerbyIDs } from '../../../../pages/admin/swishrCourier/customers/hooks/useDeleteSwishrCourierCustomerbyIDs';

const SwishrCourierCustomerGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;
  const {
    mutateAsync: deleteCustomersMutateAsync,
    isSuccess: isSucceesIndeletingIds,
  } = useDeleteSwishrCourierCustomerbyIDs();
  const { isSuccess: iSSuccessInUpdating } = useUpdateCustomerDetailsbyId();

  useEffect(() => {
    if (isSucceesIndeletingIds || iSSuccessInUpdating) {
      table.resetRowSelection();
    }
  }, [isSucceesIndeletingIds, iSSuccessInUpdating]);

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
      <Button
        variant="contained"
        onClick={() => handleNewIconClicked()}
        size="small"
        color="success"
      >
        Add Customer &nbsp; <IconUserPlus stroke={2} size={16} />
      </Button>
      <DeleteActionInGrid
        table={table}
        confirmationText="customer(s)"
        onDeleteConfirm={deleteCustomersMutateAsync}
        uniqueIDinRow="customerId"
      />
    </Box>
  );
};

export default SwishrCourierCustomerGridTopToolBar;
