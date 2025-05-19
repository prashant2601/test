import { Box, Button } from '@mui/material';
import { useEffect } from 'react';
import { useDeleteUsers } from '../../../../pages/admin/adminPanelSetting/usersAndRole/hooks/useDeleteUsers';
import { useUpdateUser } from '../../../../pages/admin/adminPanelSetting/usersAndRole/hooks/useUpdateUser';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import { IconUserFilled } from '@tabler/icons-react';
import DeleteActionInGrid from './components/DeleteActionInGrid';
const UsersGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;
  const {
    mutateAsync: deleteUsersMutateAsync,
    isSuccess: isSucceesIndeletingIds,
  } = useDeleteUsers();
  const { isSuccess: iSSuccessInUpdating } = useUpdateUser();
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
        Add User &nbsp; <IconUserFilled stroke={2} size={16} />
      </Button>
      <DeleteActionInGrid
        table={table}
        confirmationText={'users(s)'}
        onDeleteConfirm={deleteUsersMutateAsync}
        uniqueIDinRow="userId"
      />
    </Box>
  );
};

export default UsersGridTopToolBar;
