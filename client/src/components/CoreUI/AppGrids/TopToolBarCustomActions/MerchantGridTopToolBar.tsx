import { Box, Button } from '@mui/material';
import { useEffect } from 'react';
import { useDeleteMerchantbyIDs } from '../../../../pages/admin/merchants/hooks/useDeleteMerchantbyIDs';
import { useUpdateMerchantDetailsbyId } from '../../../../pages/admin/merchants/hooks/useUpdateMerchantDetailsbyId';
import { IconToolsKitchen2 } from '@tabler/icons-react';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import DeleteActionInGrid from './components/DeleteActionInGrid';

const MerchantGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;
  const {
    mutateAsync: deleteMerchantsMutateAsync,
    isSuccess: isSucceesIndeletingIds,
  } = useDeleteMerchantbyIDs();
  const { isSuccess: iSSuccessInUpdating } = useUpdateMerchantDetailsbyId();

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
        Add Merchant &nbsp; <IconToolsKitchen2 stroke={2} size={16} />
      </Button>
      <DeleteActionInGrid
        confirmationText={'merchant(s)'}
        table={table}
        onDeleteConfirm={deleteMerchantsMutateAsync}
        uniqueIDinRow={'merchantId'}
      />
    </Box>
  );
};

export default MerchantGridTopToolBar;
